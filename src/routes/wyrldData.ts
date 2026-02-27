import { Request, Response } from "express";
import { getTableViewsByProjectQuery } from "../api/queries/tableViews";
import {
  getProjectUsersByProjectQuery,
  getProjectUserByUserAndProjectQuery,
} from "../api/queries/projectUsers";
import { getProjectPlayersByProjectQuery } from "../api/queries/projectPlayers";
import { getProjectInviteByProjectQuery } from "../api/queries/projectInvites";
import {
  get5eCharsGeneralByIdsQuery,
  get5eCharNamesQuery,
  get5eCharsGeneralByUserQuery,
} from "../api/queries/5eCharGeneral";
import { getCalendarsQuery } from "../api/queries/calendars";
import { getRecordsByProjectQuery } from "../api/queries/record";
import { getUsersByIdsQuery, User } from "../api/queries/users";
import { getProjectLogEventsQuery } from "../api/queries/logEvents";
import { humanFileSize } from "../lib/utils";
import { getWyrldDataUsageLimitBytes } from "../lib/subscription";
import { getTableImageCountByProjectQuery } from "../api/queries/tableImages";
import { getImageQuery } from "../api/queries/images";
import { getSignedUrls } from "../api/controllers/s3";
import { requireProjectMemberOrRedirect } from "../lib/authz";
import { getRecentlyViewedByUserForIds } from "../api/queries/recentlyViewed";
import { getPendingProjectJoinRequestsByProjectQuery } from "../api/queries/projectJoinRequests";
import {
  getProjectDiscussionPostsByThreadQuery,
  getProjectDiscussionThreadWithUserQuery,
  getProjectDiscussionThreadsByProjectQuery,
} from "../api/queries/projectDiscussion";
import {
  buildRecents,
  isMissingProjectJoinRequestTableError,
  sortByDateDesc,
  sortByTitle,
  summarizeWyrldActivityEvent,
  toEventData,
  toNumericId,
  WyrldActivityEvent,
} from "./wyrldHelpers";
import { expireStaleProJoinRequests } from "../lib/projectJoinRequestExpiry";

const RECENT_LIMIT = 5;

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

export async function loadWyrldData(
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

  const tableData = await getTableViewsByProjectQuery(projectId);
  const projectPlayers = await getProjectPlayersByProjectQuery(projectId);
  const projectPlayerIds = [
    ...new Set(
      projectPlayers.rows
        .map((player) => Number(player.player_id))
        .filter((playerId) => Number.isInteger(playerId) && playerId > 0),
    ),
  ];
  const playersData = projectPlayerIds.length
    ? await get5eCharsGeneralByIdsQuery(projectPlayerIds)
    : { rows: [] };
  const playersById = new Map(
    playersData.rows.map((player) => [Number(player.id), player]),
  );
  const players: Array<{ id: number; name?: string; created_at?: string }> = [];
  for (const projectPlayer of projectPlayers.rows) {
    const player = playersById.get(Number(projectPlayer.player_id));
    if (!player) continue;
    players.push({
      id: Number(player.id),
      name: player.name,
      created_at: player.created_at,
    });
  }
  const ownedSheetsData = await get5eCharsGeneralByUserQuery(userId);

  const calendars = await getCalendarsQuery(projectId);
  const recordsData = await getRecordsByProjectQuery(project.id);
  const imageCountData = await getTableImageCountByProjectQuery(project.id);
  const imageCount = parseInt(imageCountData.rows[0].count);
  const usedDataFormatted = humanFileSize(project.used_data_in_bytes);
  const projectDataLimitFormatted = humanFileSize(
    getWyrldDataUsageLimitBytes(Boolean(project.is_pro)),
  );

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
      const userIdVal = Number(projectUser.user_id);
      const username = memberUsersById.get(userIdVal)?.username || `User #${userIdVal}`;
      return {
        user_id: userIdVal,
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

  let settingsUsers: GetProjectUsersByProjectReturnUser[] = [];
  let pendingJoinRequests: Array<{
    id: number;
    requester_user_id: number;
    requester_username: string;
    message: string;
    created_at: string;
  }> = [];
  if (userId == project.user_id) {
    await expireStaleProJoinRequests({ req, projectId: project.id });
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
    const recordTitlesById = new Map<number, string>(
      records
        .filter((row) => typeof row.title === "string" && row.title.trim().length > 0)
        .map((row) => [Number(row.id), row.title.trim()]),
    );

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
        recordTitlesById,
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
