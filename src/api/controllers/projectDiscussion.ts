import { NextFunction, Request, Response } from "express";
import {
  addProjectDiscussionPostQuery,
  addProjectDiscussionThreadQuery,
  editProjectDiscussionThreadQuery,
  getProjectDiscussionPostQuery,
  getProjectDiscussionPostsByThreadQuery,
  getProjectDiscussionThreadQuery,
  getProjectDiscussionThreadWithUserQuery,
  getProjectDiscussionThreadsByProjectQuery,
  removeProjectDiscussionPostQuery,
  removeProjectDiscussionThreadQuery,
} from "../queries/projectDiscussion.js";
import {
  requireApiUser,
  requireProjectEditorAccess,
  requireProjectMemberAccess,
} from "./accessControl";
import { getUserByIdQuery } from "../queries/users.js";
import {
  notifyMentionsInProjectDiscussion,
  notifySilently,
  notifyThreadCreatorOnReply,
} from "../../lib/notifications";

const DISCUSSION_TITLE_MAX_LENGTH = 140;
const DISCUSSION_THREAD_BODY_MAX_LENGTH = 5000;
const DISCUSSION_POST_MAX_LENGTH = 4000;

function readTrimmedString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function getProjectDiscussionThreads(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const role = await requireProjectMemberAccess(req, req.params.project_id);
    const data = await getProjectDiscussionThreadsByProjectQuery(role.project.id);
    res.status(200).send({ threads: data.rows });
  } catch (err) {
    next(err);
  }
}

async function getProjectDiscussionThreadWithPosts(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const threadData = await getProjectDiscussionThreadWithUserQuery(req.params.thread_id);
    const thread = threadData.rows[0];
    if (!thread) throw { status: 404, message: "Discussion thread not found" };

    await requireProjectMemberAccess(req, thread.project_id);
    const postsData = await getProjectDiscussionPostsByThreadQuery(thread.id);

    res.status(200).send({
      thread,
      posts: postsData.rows,
    });
  } catch (err) {
    next(err);
  }
}

async function addProjectDiscussionThread(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const role = await requireProjectMemberAccess(req, req.params.project_id);

    const title = readTrimmedString(req.body?.title);
    const body = readTrimmedString(req.body?.body);

    if (!title) throw { status: 400, message: "Thread title is required" };
    if (title.length > DISCUSSION_TITLE_MAX_LENGTH) {
      throw {
        status: 400,
        message: `Thread title must be ${DISCUSSION_TITLE_MAX_LENGTH} characters or fewer`,
      };
    }

    if (!body) throw { status: 400, message: "Thread body is required" };
    if (body.length > DISCUSSION_THREAD_BODY_MAX_LENGTH) {
      throw {
        status: 400,
        message: `Thread body must be ${DISCUSSION_THREAD_BODY_MAX_LENGTH} characters or fewer`,
      };
    }

    const data = await addProjectDiscussionThreadQuery({
      project_id: role.project.id,
      creator_user_id: role.userId,
      title,
      body,
    });

    const thread = data.rows[0];
    const actorUser = (await getUserByIdQuery(role.userId)).rows[0];
    const actorName = actorUser?.username || "A user";
    notifySilently(
      notifyMentionsInProjectDiscussion({
        actorUserId: role.userId,
        projectId: role.project.id,
        threadId: thread.id,
        content: `${title}\n${body}`,
        notificationType: "discussion.mention",
        title: `${actorName} mentioned you in a new thread`,
        body: title,
      }),
      "Failed to notify mentions for new discussion thread",
      { projectId: role.project.id, threadId: thread.id, actorUserId: role.userId },
    );
    res.status(201).send({
      thread,
      redirect: `/wyrld/community?id=${thread.project_id}&thread=${thread.id}`,
    });
  } catch (err) {
    next(err);
  }
}

async function addProjectDiscussionPost(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = requireApiUser(req);
    const threadData = await getProjectDiscussionThreadQuery(req.params.thread_id);
    const thread = threadData.rows[0];
    if (!thread) throw { status: 404, message: "Discussion thread not found" };

    const role = await requireProjectMemberAccess(req, thread.project_id);
    if (thread.is_locked && !role.isEditor) {
      throw { status: 403, message: "Thread is locked" };
    }

    const content = readTrimmedString(req.body?.content);
    if (!content) throw { status: 400, message: "Reply content is required" };
    if (content.length > DISCUSSION_POST_MAX_LENGTH) {
      throw {
        status: 400,
        message: `Reply must be ${DISCUSSION_POST_MAX_LENGTH} characters or fewer`,
      };
    }

    const data = await addProjectDiscussionPostQuery({
      thread_id: thread.id,
      project_id: thread.project_id,
      user_id: userId,
      content,
    });

    await editProjectDiscussionThreadQuery(thread.id, {
      updated_at: new Date().toISOString(),
    });

    const actorUser = (await getUserByIdQuery(userId)).rows[0];
    const actorName = actorUser?.username || "A user";
    notifySilently(
      Promise.all([
        notifyThreadCreatorOnReply({
          actorUserId: userId,
          threadId: thread.id,
          body: `${actorName}: ${content}`,
        }),
        notifyMentionsInProjectDiscussion({
          actorUserId: userId,
          projectId: thread.project_id,
          threadId: thread.id,
          content,
          notificationType: "discussion.mention",
          title: `${actorName} mentioned you in "${thread.title}"`,
          body: content,
          excludeUserIds: [thread.creator_user_id],
        }),
      ]),
      "Failed to notify discussion reply recipients",
      { projectId: thread.project_id, threadId: thread.id, actorUserId: userId },
    );

    res.status(201).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function toggleProjectDiscussionThreadLock(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const threadData = await getProjectDiscussionThreadQuery(req.params.thread_id);
    const thread = threadData.rows[0];
    if (!thread) throw { status: 404, message: "Discussion thread not found" };

    await requireProjectEditorAccess(req, thread.project_id);

    const updatedData = await editProjectDiscussionThreadQuery(thread.id, {
      is_locked: !thread.is_locked,
      updated_at: new Date().toISOString(),
    });

    res.status(200).send(updatedData.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeProjectDiscussionThread(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const threadData = await getProjectDiscussionThreadQuery(req.params.thread_id);
    const thread = threadData.rows[0];
    if (!thread) throw { status: 404, message: "Discussion thread not found" };

    const role = await requireProjectMemberAccess(req, thread.project_id);
    const isCreator = String(thread.creator_user_id) === String(role.userId);
    if (!role.isEditor && !isCreator) {
      throw { status: 403, message: "Only managers or thread creator can delete thread" };
    }

    const data = await removeProjectDiscussionThreadQuery(thread.id);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeProjectDiscussionPost(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const postData = await getProjectDiscussionPostQuery(req.params.post_id);
    const post = postData.rows[0];
    if (!post) throw { status: 404, message: "Discussion post not found" };

    const role = await requireProjectMemberAccess(req, post.project_id);
    const isAuthor = String(post.user_id) === String(role.userId);
    if (!role.isEditor && !isAuthor) {
      throw { status: 403, message: "Only managers or post author can delete reply" };
    }

    const data = await removeProjectDiscussionPostQuery(post.id);
    res.status(200).send(data.rows[0]);
  } catch (err) {
    next(err);
  }
}

export {
  getProjectDiscussionThreads,
  getProjectDiscussionThreadWithPosts,
  addProjectDiscussionThread,
  addProjectDiscussionPost,
  toggleProjectDiscussionThreadLock,
  removeProjectDiscussionThread,
  removeProjectDiscussionPost,
};
