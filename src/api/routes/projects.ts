import { Router } from "express";
import {
  removeProjectUser,
  editProjectUserIsEditor,
  leaveProject,
} from "../controllers/projectUsers.js";
import {
  addProjectInvite,
  removeProjectInvite,
} from "../controllers/projectInvites.js";
import {
  getProject,
  getProjects,
  addProject,
  removeProject,
  editProjectTitle,
  editProjectDescription,
  editProjectBannerImage,
} from "../controllers/projects.js";
import {
  cancelProjectJoinRequest,
  editProjectPublicSettings,
  getProjectJoinRequestsByProject,
  getPublicWyrldDirectory,
  requestProjectJoin,
  respondProjectJoinRequest,
} from "../controllers/publicWyrlds.js";
import {
  addProjectDiscussionPost,
  addProjectDiscussionThread,
  getProjectDiscussionThreadWithPosts,
  getProjectDiscussionThreads,
  removeProjectDiscussionPost,
  removeProjectDiscussionThread,
  toggleProjectDiscussionThreadLock,
} from "../controllers/projectDiscussion.js";
import {
  getNotifications,
  getUnreadNotificationsCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notifications.js";
import { publicJoinRequestLimiter } from "../rateLimiters.js";

const router = Router();

router.delete("/remove_project_user/:id", removeProjectUser);
router.post("/edit_project_user_is_editor/:id", editProjectUserIsEditor);
router.post("/leave_project/:project_id", leaveProject);

router.post("/add_project_invite", addProjectInvite);
router.delete("/remove_project_invite/:id", removeProjectInvite);

router.get("/get_project/:id", getProject);
router.get("/get_projects", getProjects);
router.get("/get_public_wyrld_directory", getPublicWyrldDirectory);
router.post("/add_project", addProject);
router.delete("/remove_project/:id", removeProject);
router.post("/edit_project_title/:id", editProjectTitle);
router.post("/edit_project_description/:id", editProjectDescription);
router.post("/edit_project_banner_image/:id", editProjectBannerImage);
router.post("/edit_project_public_settings/:id", editProjectPublicSettings);
router.post(
  "/request_project_join/:project_id",
  publicJoinRequestLimiter,
  requestProjectJoin,
);
router.get(
  "/get_project_join_requests/:project_id",
  getProjectJoinRequestsByProject,
);
router.post("/respond_project_join_request/:id", respondProjectJoinRequest);
router.post("/cancel_project_join_request/:id", cancelProjectJoinRequest);

router.get(
  "/get_project_discussion_threads/:project_id",
  getProjectDiscussionThreads,
);
router.get(
  "/get_project_discussion_thread/:thread_id",
  getProjectDiscussionThreadWithPosts,
);
router.post(
  "/add_project_discussion_thread/:project_id",
  addProjectDiscussionThread,
);
router.post(
  "/add_project_discussion_post/:thread_id",
  addProjectDiscussionPost,
);
router.post(
  "/toggle_project_discussion_thread_lock/:thread_id",
  toggleProjectDiscussionThreadLock,
);
router.delete(
  "/remove_project_discussion_thread/:thread_id",
  removeProjectDiscussionThread,
);
router.delete(
  "/remove_project_discussion_post/:post_id",
  removeProjectDiscussionPost,
);

router.get("/notifications", getNotifications);
router.get("/notifications/unread-count", getUnreadNotificationsCount);
router.post("/notifications/:id/read", markNotificationAsRead);
router.post("/notifications/read-all", markAllNotificationsAsRead);

export default router;
