import { Router, Request, Response, NextFunction } from "express";
import { getTableViewsByProjectQuery } from "../api/queries/tableViews";
import {
  getProjectUsersByProjectQuery,
  getProjectUsersQuery,
  getProjectUserByUserAndProjectQuery,
} from "../api/queries/projectUsers";
import { getProjectsQuery, getProjectQuery } from "../api/queries/projects";
import { getProjectPlayersByProjectQuery } from "../api/queries/projectPlayers";
import { getProjectInviteByProjectQuery } from "../api/queries/projectInvites";
import {
  get5eCharGeneralQuery,
  get5eCharNamesQuery,
  get5eCharsGeneralByUserQuery,
} from "../api/queries/5eCharGeneral";
import { getCalendarsQuery } from "../api/queries/calendars";
import { getRecordsByProjectQuery, getRecordQuery } from "../api/queries/record";
import { getUserByIdQuery, getUsersByIdsQuery, User } from "../api/queries/users";
import { getProjectLogEventsQuery } from "../api/queries/logEvents";
import { humanFileSize } from "../lib/utils";
import { getWyrldDataUsageLimitBytes } from "../lib/subscription";
import { getTableImageCountByProjectQuery } from "../api/queries/tableImages";
import { getImageQuery, getImagesQuery } from "../api/queries/images";
import { getSignedUrls } from "../api/controllers/s3";
import { getRecordImagesByRecordQuery } from "../api/queries/recordImage";
import {
  requireProjectEditorOrRedirect,
  requireProjectMemberOrRedirect,
  requireUserOrRedirect,
} from "../lib/authz";
import { upsertRecentlyViewed, getRecentlyViewedByUserForIds } from "../api/queries/recentlyViewed";
import {
  getPendingProjectJoinRequestByProjectAndUserQuery,
  getPendingProjectJoinRequestsByProjectQuery,
  getPendingProjectJoinRequestsByRequesterQuery,
} from "../api/queries/projectJoinRequests";
import { getPublicWyrldDirectoryQuery } from "../api/queries/publicWyrlds";
import {
  getProjectDiscussionPostsByThreadQuery,
  getProjectDiscussionThreadWithUserQuery,
  getProjectDiscussionThreadsByProjectQuery,
} from "../api/queries/projectDiscussion";

const router = Router();

const RECENT_LIMIT = 5;

function toPublicWyrldSlug(rawTitle: unknown) {
  const title = String(rawTitle || "")
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!title) return "wyrld";
  return title.slice(0, 80);
}

function getPublicWyrldPath(projectId: number | string, title: unknown) {
  const slug = toPublicWyrldSlug(title);
  return `/wyrlds/public/${projectId}/${slug}`;
}

function getRequestOrigin(req: Request) {
  const forwardedProto = req.get("x-forwarded-proto");
  const protocol = forwardedProto ? forwardedProto.split(",")[0].trim() : req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

function normalizeMetaDescription(value: unknown, maxLength: number) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

function isMissingProjectJoinRequestTableError(err: unknown) {
  const pgErr = err as { code?: string; message?: string };
  if (pgErr?.code !== "42P01") return false;
  return String(pgErr?.message || "").includes("ProjectJoinRequest");
}

const sortByDateDesc = <T>(
  items: T[],
  getDate: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTime = getDate(a) ? new Date(getDate(a) as string).getTime() : 0;
    const bTime = getDate(b) ? new Date(getDate(b) as string).getTime() : 0;
    return bTime - aTime;
  });
};

const sortByTitle = <T>(
  items: T[],
  getTitle: (item: T) => string | undefined,
) => {
  return [...items].sort((a, b) => {
    const aTitle = (getTitle(a) ?? "").toLowerCase();
    const bTitle = (getTitle(b) ?? "").toLowerCase();
    return aTitle.localeCompare(bTitle);
  });
};

function buildRecents<T>(
  items: T[],
  viewedIds: number[],
  getId: (item: T) => number,
  getDate: (item: T) => string | undefined,
  limit: number,
): T[] {
  const itemMap = new Map(items.map((item) => [getId(item), item]));
  const recent: T[] = [];
  for (const id of viewedIds) {
    const item = itemMap.get(id);
    if (item) recent.push(item);
  }
  if (recent.length < limit) {
    const recentIds = new Set(recent.map(getId));
    const fallback = sortByDateDesc(items, getDate);
    for (const item of fallback) {
      if (recent.length >= limit) break;
      if (!recentIds.has(getId(item))) recent.push(item);
    }
  }
  return recent;
}

interface WyrldActivityEvent {
  id: number;
  created_at: string;
  event_type: string;
  actor_username: string;
  summary: string;
  outcome: string;
  reason: string | null;
}

function toNumericId(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

function toEventData(value: unknown): Record<string, any> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, any>;
}

function readEventString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function summarizeWyrldActivityEvent(params: {
  eventType: string;
  actorUsername: string;
  eventData: Record<string, any>;
  usernamesById: Map<number, string>;
  characterNamesById: Map<number, string>;
}): string | null {
  const { eventType, actorUsername, eventData, usernamesById, characterNamesById } = params;
  const requesterUserId = toNumericId(eventData.requesterUserId);
  const joiningUserId = toNumericId(eventData.joiningUserId ?? eventData.userId);
  const removedUserId = toNumericId(eventData.removedUserId);
  const targetUserId = toNumericId(eventData.targetUserId);
  const explicitRequesterUsername = readEventString(eventData.requesterUsername);
  const explicitJoiningUsername = readEventString(eventData.joiningUsername);
  const explicitRemovedUsername = readEventString(eventData.removedUsername);
  const explicitTargetUsername = readEventString(eventData.targetUsername);
  const requesterUsername = requesterUserId
    ? usernamesById.get(requesterUserId) || explicitRequesterUsername || "A user"
    : explicitRequesterUsername || "A user";
  const joiningUsername = explicitJoiningUsername ||
    (joiningUserId
      ? usernamesById.get(joiningUserId) || actorUsername
      : actorUsername);
  const removedUsername = explicitRemovedUsername ||
    (removedUserId
      ? usernamesById.get(removedUserId) || actorUsername
      : actorUsername);
  const targetUsername = explicitTargetUsername ||
    (targetUserId ? usernamesById.get(targetUserId) || "A user" : "A user");

  switch (eventType) {
    case "project_join_request.created":
      return `${requesterUsername} requested to join this wyrld.`;
    case "project_join_request.cancelled":
      return `${actorUsername} cancelled their join request.`;
    case "project_join_request.approved":
      return `${actorUsername} approved ${requesterUsername}'s join request.`;
    case "project_join_request.rejected":
      return `${actorUsername} rejected ${requesterUsername}'s join request.`;
    case "project_join_request.denied":
      return `${actorUsername} could not submit a join request (${eventData.reason || "denied"}).`;
    case "project_user.created":
      return `${joiningUsername} joined the wyrld.`;
    case "project_user.removed":
      if (eventData.source === "self_leave") {
        return `${removedUsername} left the wyrld.`;
      }
      return `${removedUsername} was removed from the wyrld by ${actorUsername}.`;
    case "project_user.role_changed": {
      const nextRole = readEventString(eventData.nextRole) || "member";
      return `${actorUsername} changed ${targetUsername}'s role to ${nextRole}.`;
    }
    case "project_invite.created":
      return `${actorUsername} created an invite link.`;
    case "project_invite.revoked":
      return `${actorUsername} revoked an invite link.`;
    case "project_invite.used":
      return `${joiningUsername} joined the wyrld via invite link.`;
    case "project_player.created": {
      const playerId = toNumericId(eventData.playerId);
      const characterName =
        readEventString(eventData.characterName) ||
        (playerId ? characterNamesById.get(playerId) || null : null);
      const characterLabel = characterName ? `"${characterName}"` : null;
      if (!characterLabel) return null;
      return `${actorUsername} connected character ${characterLabel} to the wyrld.`;
    }
    case "project_player.removed": {
      const playerId = toNumericId(eventData.playerId);
      const characterName =
        readEventString(eventData.characterName) ||
        (playerId ? characterNamesById.get(playerId) || null : null);
      const characterLabel = characterName ? `"${characterName}"` : null;
      if (!characterLabel) return null;
      return `${actorUsername} disconnected character ${characterLabel} from the wyrld.`;
    }
    case "table.created": {
      const tableTitle =
        readEventString(eventData.title) ||
        readEventString(eventData.tableTitle) ||
        null;
      if (!tableTitle) return null;
      return `${actorUsername} created table "${tableTitle}".`;
    }
    default:
      return `${actorUsername} triggered ${eventType}.`;
  }
}

interface GetProjectUsersByProjectReturnUser extends User {
  project_user_id: number;
  is_editor: boolean;
}

interface WyrldMemberRole {
  user_id: number;
  username: string;
  role: "Owner" | "Manager" | "Member";
  is_owner: boolean;
  is_editor: boolean;
  project_user_id: number | null;
}

async function loadWyrldData(
  req: Request,
  res: Response,
  userId: string | number,
  projectId: string,
  section = "overview",
) {
  const project = await requireProjectMemberOrRedirect(
    req,
    res,
    projectId,
    "/forbidden",
  );
  if (!project) return null;

  let projectBannerSrc: string | null = null;
  let projectBannerName: string | null = null;
  if (project.is_pro && project.image_id) {
    const imageData = await getImageQuery(project.image_id);
    const image = imageData.rows[0];
    if (image) {
      const signedUrls = await getSignedUrls([image]);
      projectBannerSrc = signedUrls[image.id] || null;
      projectBannerName = image.original_name || null;
    }
  }

  let projectAuth = true;
  if (userId != project.user_id) {
    const projectUserData = await getProjectUserByUserAndProjectQuery(
      userId,
      projectId,
    );
    const projectUser = projectUserData.rows[0];
    projectAuth = projectUser?.is_editor ?? false;
  }

  // get table views by project
  const tableData = await getTableViewsByProjectQuery(projectId);
  // get all character sheets by project
  const players: Array<{ id: number; name?: string; created_at?: string }> = [];
  const projectPlayers = await getProjectPlayersByProjectQuery(projectId);
  for (const player of projectPlayers.rows) {
    const charData = await get5eCharGeneralQuery(player.player_id);
    if (charData.rows[0]) players.push(charData.rows[0]);
  }
  const ownedSheetsData = await get5eCharsGeneralByUserQuery(userId);

  // calendars
  const calendars = await getCalendarsQuery(projectId);

  // records
  const recordsData = await getRecordsByProjectQuery(project.id);

  // image count
  const imageCountData = await getTableImageCountByProjectQuery(project.id);
  const imageCount = parseInt(imageCountData.rows[0].count);

  // calculate used data formatted
  const usedDataFormatted = humanFileSize(project.used_data_in_bytes);
  const projectDataLimitFormatted = humanFileSize(
    getWyrldDataUsageLimitBytes(Boolean(project.is_pro)),
  );

  // get invite link if exists (only needed for owners/managers)
  let inviteLink = null;
  let inviteId = null;
  if (projectAuth) {
    const inviteData = await getProjectInviteByProjectQuery(projectId);
    if (inviteData.rows.length > 0) {
      const invite = inviteData.rows[0];
      inviteId = invite.id;
      inviteLink = `${req.protocol}://${req.get("host")}/invite?invite=${invite.uuid}`;
    }
  }

  const projectUsersData = await getProjectUsersByProjectQuery(project.id);
  const projectUsers = projectUsersData.rows;
  const allMemberUserIds = [
    Number(project.user_id),
    ...projectUsers.map((projectUser) => Number(projectUser.user_id)),
  ];
  const uniqueMemberUserIds = [...new Set(allMemberUserIds)];
  const memberUsersData = await getUsersByIdsQuery(uniqueMemberUserIds);
  const memberUsersById = new Map<number, User>(
    memberUsersData.rows.map((user) => [Number(user.id), user]),
  );
  const ownerUsername =
    memberUsersById.get(Number(project.user_id))?.username || `User #${project.user_id}`;

  const wyrldMembersUnsorted: WyrldMemberRole[] = [
    {
      user_id: Number(project.user_id),
      username: ownerUsername,
      role: "Owner" as const,
      is_owner: true,
      is_editor: true,
      project_user_id: null,
    },
    ...projectUsers.map((projectUser) => {
      const userId = Number(projectUser.user_id);
      const username = memberUsersById.get(userId)?.username || `User #${userId}`;
      return {
        user_id: userId,
        username,
        role: (projectUser.is_editor ? "Manager" : "Member") as
          | "Manager"
          | "Member",
        is_owner: false,
        is_editor: Boolean(projectUser.is_editor),
        project_user_id: Number(projectUser.id),
      };
    }),
  ];
  const roleOrder: Record<WyrldMemberRole["role"], number> = {
    Owner: 0,
    Manager: 1,
    Member: 2,
  };
  const wyrldMembers: WyrldMemberRole[] = [...wyrldMembersUnsorted].sort((a, b) => {
    const roleDelta = roleOrder[a.role] - roleOrder[b.role];
    if (roleDelta !== 0) return roleDelta;
    return a.username.toLowerCase().localeCompare(b.username.toLowerCase());
  });

  // load project users for settings (owner only)
  let settingsUsers: GetProjectUsersByProjectReturnUser[] = [];
  let pendingJoinRequests: Array<{
    id: number;
    requester_user_id: number;
    requester_username: string;
    message: string;
    created_at: string;
  }> = [];
  if (userId == project.user_id) {
    let joinRequestsRows: Array<{
      id: number;
      requester_user_id: number;
      requester_username: string;
      message: string;
      created_at: string;
    }> = [];
    try {
      const joinRequestsData = await getPendingProjectJoinRequestsByProjectQuery(
        project.id,
      );
      joinRequestsRows = joinRequestsData.rows;
    } catch (err) {
      if (!isMissingProjectJoinRequestTableError(err)) throw err;
    }

    for (const projectUser of projectUsers) {
      const user = memberUsersById.get(Number(projectUser.user_id));
      if (!user) continue;
      const settingsUser = {
        ...user,
        project_user_id: Number(projectUser.id),
        is_editor: Boolean(projectUser.is_editor),
      } as GetProjectUsersByProjectReturnUser;
      settingsUsers.push(settingsUser);
    }
    pendingJoinRequests = joinRequestsRows.map((row) => ({
      id: row.id,
      requester_user_id: row.requester_user_id,
      requester_username: row.requester_username,
      message: row.message,
      created_at: row.created_at,
    }));
  }

  const tables = tableData.rows;
  const records = recordsData.rows;
  const sheets = players.filter(Boolean);
  const linkedSheetIds = new Set(sheets.map((sheet) => Number((sheet as any).id)));
  const unlinkedOwnedSheets = ownedSheetsData.rows.filter(
    (sheet) => !linkedSheetIds.has(Number(sheet.id)),
  );
  const calendarsList = calendars.rows;

  // query recently viewed entity_ids scoped to this project's items
  const tableIds = tables.map((t: any) => t.id);
  const recordIds = records.map((r: any) => r.id);
  const sheetIds = sheets.map((s: any) => s.id);

  const [rvTables, rvRecords, rvSheets] = await Promise.all([
    tableIds.length ? getRecentlyViewedByUserForIds(userId, "table", tableIds, RECENT_LIMIT) : { rows: [] },
    recordIds.length ? getRecentlyViewedByUserForIds(userId, "record", recordIds, RECENT_LIMIT) : { rows: [] },
    sheetIds.length ? getRecentlyViewedByUserForIds(userId, "sheet", sheetIds, RECENT_LIMIT) : { rows: [] },
  ]);

  const recentTables = buildRecents(tables, rvTables.rows.map((r: any) => r.entity_id), (t: any) => t.id, (t: any) => t.date_created, RECENT_LIMIT);
  const recentRecords = buildRecents(records, rvRecords.rows.map((r: any) => r.entity_id), (r: any) => r.id, (r: any) => r.created_at, RECENT_LIMIT);
  const recentSheets = buildRecents(sheets, rvSheets.rows.map((r: any) => r.entity_id), (s: any) => s.id, (s: any) => s.created_at, RECENT_LIMIT);
  // calendars have no dedicated page route — keep creation-date sorting
  const recentCalendars = sortByDateDesc(
    calendarsList,
    (calendar) => (calendar as any).created_at,
  ).slice(0, RECENT_LIMIT);

  let activityEvents: WyrldActivityEvent[] = [];
  if (section === "activity") {
    const activityData = await getProjectLogEventsQuery(project.id, { limit: 120 });
    const allowedProjectPlayerEvents = new Set([
      "project_player.created",
      "project_player.removed",
    ]);
    const excludedEventPrefixes = ["image."];
    const visibleRows = activityData.rows.filter((row) =>
      !excludedEventPrefixes.some((prefix) => row.event_type.startsWith(prefix)) &&
      (!row.event_type.startsWith("project_player.") ||
        allowedProjectPlayerEvents.has(row.event_type)),
    );
    const userIds = new Set<number>();
    const playerIds = new Set<number>();

    for (const row of visibleRows) {
      if (row.user_id) userIds.add(Number(row.user_id));
      const eventData = toEventData(row.event_data);
      const relatedUserIds = [
        toNumericId(eventData.userId),
        toNumericId(eventData.requesterUserId),
        toNumericId(eventData.joiningUserId),
        toNumericId(eventData.removedUserId),
        toNumericId(eventData.removedByUserId),
        toNumericId(eventData.targetUserId),
      ].filter((id): id is number => Boolean(id));
      for (const id of relatedUserIds) userIds.add(id);
      const playerId = toNumericId(eventData.playerId);
      if (playerId) playerIds.add(playerId);
    }

    let usernamesById = new Map<number, string>();
    if (userIds.size) {
      const usersData = await getUsersByIdsQuery([...userIds]);
      usernamesById = new Map<number, string>(
        usersData.rows.map((user) => [Number(user.id), user.username]),
      );
    }
    let characterNamesById = new Map<number, string>();
    if (playerIds.size) {
      const charsData = await get5eCharNamesQuery([...playerIds]);
      characterNamesById = new Map<number, string>(
        charsData.rows
          .filter((row) => typeof row.name === "string" && row.name.trim().length > 0)
          .map((row) => [Number(row.id), row.name.trim()]),
      );
    }

    activityEvents = visibleRows.map((row) => {
      const eventData = toEventData(row.event_data);
      const actorUsername =
        row.actor_username ||
        (row.user_id ? usernamesById.get(Number(row.user_id)) : null) ||
        "System";
      const outcome =
        typeof eventData.outcome === "string" && eventData.outcome.trim()
          ? eventData.outcome.trim()
          : "success";
      const reason =
        typeof eventData.reason === "string" && eventData.reason.trim()
          ? eventData.reason.trim()
          : null;

      const summary = summarizeWyrldActivityEvent({
        eventType: row.event_type,
        actorUsername,
        eventData,
        usernamesById,
        characterNamesById,
      });
      if (!summary) return null;

      return {
        id: Number(row.id),
        created_at: row.created_at,
        event_type: row.event_type,
        actor_username: actorUsername,
        summary,
        outcome,
        reason,
      };
    }).filter((row): row is WyrldActivityEvent => Boolean(row));
  }

  let discussionThreads: Array<{
    id: number;
    project_id: number;
    creator_user_id: number;
    title: string;
    body: string;
    is_locked: boolean;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    creator_username: string;
    reply_count: number;
    latest_reply_at: string | null;
    last_activity_at: string;
  }> = [];
  let selectedDiscussionThread: {
    id: number;
    project_id: number;
    creator_user_id: number;
    title: string;
    body: string;
    is_locked: boolean;
    is_pinned: boolean;
    created_at: string;
    updated_at: string;
    creator_username: string;
    reply_count: number;
    latest_reply_at: string | null;
    last_activity_at: string;
  } | null = null;
  let selectedDiscussionPosts: Array<{
    id: number;
    thread_id: number;
    project_id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    username: string;
  }> = [];

  if (section === "community") {
    const threadsData = await getProjectDiscussionThreadsByProjectQuery(project.id);
    discussionThreads = threadsData.rows;

    const selectedThreadRaw = Number(req.query.thread);
    const selectedThreadId =
      Number.isInteger(selectedThreadRaw) && selectedThreadRaw > 0
        ? selectedThreadRaw
        : null;

    if (selectedThreadId) {
      const selectedThreadData = await getProjectDiscussionThreadWithUserQuery(
        selectedThreadId,
      );
      const foundThread = selectedThreadData.rows[0];
      if (
        foundThread &&
        String(foundThread.project_id) === String(project.id)
      ) {
        selectedDiscussionThread = foundThread;
      }
    }

    if (!selectedDiscussionThread && discussionThreads.length) {
      selectedDiscussionThread = discussionThreads[0];
    }

    if (selectedDiscussionThread) {
      const postsData = await getProjectDiscussionPostsByThreadQuery(
        selectedDiscussionThread.id,
      );
      selectedDiscussionPosts = postsData.rows;
    }
  }

  return {
    projectAuth,
    isOwner: userId == project.user_id,
    project,
    settingsUsers,
    tables,
    sheets,
    unlinkedOwnedSheets,
    calendars: calendarsList,
    records,
    imageCount,
    usedDataFormatted,
    projectDataLimitFormatted,
    inviteLink,
    inviteId,
    projectBannerSrc,
    projectBannerName,
    wyrldMembers,
    pendingJoinRequests,
    memberCount: wyrldMembers.length,
    recentTables,
    recentRecords,
    recentSheets,
    recentCalendars,
    discussionThreads,
    selectedDiscussionThread,
    selectedDiscussionPosts,
    activityEvents,
    tablesSorted: sortByTitle(tables, (table) => (table as any).title),
    recordsSorted: sortByTitle(records, (record) => (record as any).title),
    sheetsSorted: sortByTitle(sheets, (sheet) => (sheet as any).name),
    calendarsSorted: sortByTitle(calendarsList, (calendar) => (calendar as any).title),
  };
}

router.get(
  "/wyrld",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;

      const data = await loadWyrldData(req, res, userId, projectId);
      if (!data) return;

      upsertRecentlyViewed(userId, "wyrld", projectId);

      res.render("wyrld", {
        auth: userId,
        section: "overview",
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  [
    "/wyrld/tables",
    "/wyrld/records",
    "/wyrld/sheets",
    "/wyrld/calendars",
    "/wyrld/community",
    "/wyrld/activity",
    "/wyrld/settings",
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/login");
      if (!userId) return;
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const section = req.path.split("/")[2];

      const data = await loadWyrldData(req, res, userId, projectId, section);
      if (!data) return;

      res.render("wyrld", {
        auth: userId,
        section,
        ...data,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/wyrldsettings", (req: Request, res: Response) => {
  const id = req.query.id;
  res.redirect(id ? `/wyrld/settings?id=${id}` : "/dash");
});

router.get("/sharedwyrldsettings", (req: Request, res: Response) => {
  const id = req.query.id;
  res.redirect(id ? `/wyrld/settings?id=${id}` : "/dash");
});

router.get(
  "/wyrlds/public",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.session?.user ?? null;
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
      const directoryData = await getPublicWyrldDirectoryQuery({
        search: query,
        limit: 120,
        offset: 0,
      });

      let ownedProjectIds = new Set<number>();
      let joinedProjectIds = new Set<number>();
      let pendingProjectIds = new Set<number>();
      let pendingRequestIdByProjectId = new Map<number, number>();

      if (userId) {
        const [ownedData, joinedData] = await Promise.all([
          getProjectsQuery(userId),
          getProjectUsersQuery(userId),
        ]);
        let pendingRows: Array<{ id: number; project_id: number }> = [];
        try {
          const pendingData = await getPendingProjectJoinRequestsByRequesterQuery(
            userId,
          );
          pendingRows = pendingData.rows.map((request) => ({
            id: Number(request.id),
            project_id: Number(request.project_id),
          }));
        } catch (err) {
          if (!isMissingProjectJoinRequestTableError(err)) throw err;
        }
        ownedProjectIds = new Set(
          ownedData.rows.map((project) => Number(project.id)),
        );
        joinedProjectIds = new Set(
          joinedData.rows.map((projectUser) => Number(projectUser.project_id)),
        );
        pendingProjectIds = new Set(
          pendingRows.map((request) => Number(request.project_id)),
        );
        pendingRequestIdByProjectId = new Map<number, number>(
          pendingRows.map((request) => [
            Number(request.project_id),
            Number(request.id),
          ]),
        );
      }

      const projects = directoryData.rows.map((row) => {
        const projectId = Number(row.id);
        const isOwner = ownedProjectIds.has(projectId);
        const isMember = isOwner || joinedProjectIds.has(projectId);
        const hasPendingRequest = pendingProjectIds.has(projectId);
        const capacity = row.public_join_capacity;
        const spotsRemaining =
          capacity === null ? null : Math.max(Number(capacity) - Number(row.member_count), 0);
        const isFull = spotsRemaining !== null && spotsRemaining <= 0;

        return {
          ...row,
          isOwner,
          isMember,
          hasPendingRequest,
          pendingRequestId: pendingRequestIdByProjectId.get(projectId) || null,
          spotsRemaining,
          isFull,
          publicPath: getPublicWyrldPath(projectId, row.title),
        };
      });

      const redirectTarget = req.originalUrl || "/wyrlds/public";
      const loginHref = `/login?redirect=${encodeURIComponent(redirectTarget)}`;

      res.render("publicwyrlds", {
        auth: userId || undefined,
        isAuthenticated: Boolean(userId),
        query,
        projects,
        loginHref,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/wyrlds/public/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.id);
      if (!Number.isInteger(projectId) || projectId <= 0) {
        return res.redirect("/404");
      }

      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];
      if (!project || !project.is_public_listed || !project.is_pro) {
        return res.redirect("/404");
      }

      const canonicalPath = getPublicWyrldPath(project.id, project.title);
      const queryIndex = req.originalUrl.indexOf("?");
      const querySuffix = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
      return res.redirect(302, `${canonicalPath}${querySuffix}`);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/wyrlds/public/:id/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projectId = Number(req.params.id);
      if (!Number.isInteger(projectId) || projectId <= 0) {
        return res.redirect("/404");
      }

      const projectData = await getProjectQuery(projectId);
      const project = projectData.rows[0];
      if (!project || !project.is_public_listed || !project.is_pro) {
        return res.redirect("/404");
      }
      const expectedSlug = toPublicWyrldSlug(project.title);
      if (req.params.slug !== expectedSlug) {
        const queryIndex = req.originalUrl.indexOf("?");
        const querySuffix = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
        return res.redirect(
          302,
          `/wyrlds/public/${project.id}/${expectedSlug}${querySuffix}`,
        );
      }

      const ownerData = await getUserByIdQuery(project.user_id);
      const ownerUsername = ownerData.rows[0]?.username || "Unknown";

      const projectUsersData = await getProjectUsersByProjectQuery(project.id);
      const memberCount = projectUsersData.rows.length + 1;

      let featuredRecord: {
        id: number;
        title: string;
        description: string;
      } | null = null;
      let featuredRecordImageUrls: Record<string, string> = {};
      let projectBannerSrc: string | null = null;
      let projectBannerName: string | null = null;

      if (project.image_id) {
        const bannerData = await getImageQuery(project.image_id);
        const bannerImage = bannerData.rows[0];
        if (bannerImage) {
          const signedUrls = await getSignedUrls([bannerImage]);
          projectBannerSrc = signedUrls[bannerImage.id] || null;
          projectBannerName = bannerImage.original_name || null;
        }
      }

      if (project.featured_record_id) {
        const featuredRecordData = await getRecordQuery(project.featured_record_id);
        const foundFeaturedRecord = featuredRecordData.rows[0];
        if (
          foundFeaturedRecord &&
          String(foundFeaturedRecord.project_id) === String(project.id)
        ) {
          featuredRecord = {
            id: foundFeaturedRecord.id,
            title: foundFeaturedRecord.title,
            description: foundFeaturedRecord.description,
          };

          const recordImageData = await getRecordImagesByRecordQuery(
            foundFeaturedRecord.id,
          );
          if (recordImageData.rows.length) {
            const imageIds = recordImageData.rows.map((row) => row.image_id);
            const imagesData = await getImagesQuery(imageIds);
            featuredRecordImageUrls = await getSignedUrls(imagesData.rows);
          }
        }
      }

      const userId = req.session?.user ?? null;
      let isOwner = false;
      let isMember = false;
      let hasPendingRequest = false;
      let pendingRequestId: number | null = null;

      if (userId) {
        isOwner = String(project.user_id) === String(userId);
        if (isOwner) {
          isMember = true;
        } else {
          const projectUserData = await getProjectUserByUserAndProjectQuery(
            userId,
            project.id,
          );
          isMember = Boolean(projectUserData.rows[0]);
        }

        if (!isMember) {
          try {
            const pendingData = await getPendingProjectJoinRequestByProjectAndUserQuery(
              project.id,
              userId,
            );
            const pendingRequest = pendingData.rows[0];
            if (pendingRequest) {
              hasPendingRequest = true;
              pendingRequestId = Number(pendingRequest.id);
            }
          } catch (err) {
            if (!isMissingProjectJoinRequestTableError(err)) throw err;
          }
        }
      }

      const capacity = project.public_join_capacity;
      const spotsRemaining =
        capacity === null ? null : Math.max(Number(capacity) - memberCount, 0);
      const isFull = spotsRemaining !== null && spotsRemaining <= 0;

      const redirectTarget = req.originalUrl || getPublicWyrldPath(project.id, project.title);
      const loginHref = `/login?redirect=${encodeURIComponent(redirectTarget)}`;
      const canonicalPath = getPublicWyrldPath(project.id, project.title);
      const canonicalUrl = `${getRequestOrigin(req)}${canonicalPath}`;
      const featuredImageValues = Object.values(featuredRecordImageUrls);
      const shareImage = projectBannerSrc || featuredImageValues[0] || null;
      const metaDescription =
        normalizeMetaDescription(project.description, 170) ||
        normalizeMetaDescription(featuredRecord?.description, 170) ||
        `Discover ${project.title} on Far Reach Co.`;

      res.render("publicwyrld", {
        auth: userId || undefined,
        isAuthenticated: Boolean(userId),
        project,
        ownerUsername,
        memberCount,
        featuredRecord,
        featuredRecordImageUrls,
        projectBannerSrc,
        projectBannerName,
        isOwner,
        isMember,
        hasPendingRequest,
        pendingRequestId,
        spotsRemaining,
        isFull,
        loginHref,
        canonicalPath,
        canonicalUrl,
        metaDescription,
        shareImage,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldtable",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/forbidden");
      if (!userId) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldtable", {
        auth: userId,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldcalendar",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/forbidden");
      if (!userId) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldcalendar", {
        auth: userId,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/newwyrldrecord",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = requireUserOrRedirect(req, res, "/forbidden");
      if (!userId) return;
      // get project id
      if (!req.query.id) return res.redirect("/dash");
      const projectId = req.query.id as string;
      const project = await requireProjectEditorOrRedirect(
        req,
        res,
        projectId,
        "/forbidden",
      );
      if (!project) return;
      res.render("newwyrldrecord", {
        auth: userId,
        projectId: project.id,
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/newwyrld", (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = requireUserOrRedirect(req, res, "/forbidden");
    if (!userId) return;
    res.render("newwyrld", { auth: userId });
  } catch (err) {
    next(err);
  }
});

export default router;
