"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyWyrldJoinAsync = notifyWyrldJoinAsync;
exports.notifySheetLinkedAsync = notifySheetLinkedAsync;
const smtp_1 = __importDefault(require("../api/smtp"));
const _5eCharGeneral_1 = require("../api/queries/5eCharGeneral");
const projectUsers_1 = require("../api/queries/projectUsers");
const projects_1 = require("../api/queries/projects");
const users_1 = require("../api/queries/users");
const logger_1 = __importDefault(require("./logger"));
const emailPreferences_1 = require("./emailPreferences");
const SUPPORT_EMAIL = "farreachco@gmail.com";
function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function shouldReceiveNotification(user, preferenceKey) {
    if (!user.email)
        return false;
    if (user.email_unsubscribed_all)
        return false;
    return Boolean(user[preferenceKey]);
}
function buildNotificationFooter(userId) {
    const { managePreferencesUrl, unsubscribeUrl } = (0, emailPreferences_1.getEmailPreferenceLinks)(userId);
    return `
    <p>
      Manage your email settings:
      <a href="${managePreferencesUrl}">Preferences</a><br />
      Unsubscribe from non-essential emails:
      <a href="${unsubscribeUrl}">Unsubscribe</a><br />
      Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </p>
  `;
}
function sendNotificationEmail(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { recipient, subject, message } = params;
        const { unsubscribeUrl } = (0, emailPreferences_1.getEmailPreferenceLinks)(recipient.id);
        yield smtp_1.default.sendMessage({
            user: recipient,
            title: subject,
            message,
            footerHtml: buildNotificationFooter(recipient.id),
            headers: {
                "List-Unsubscribe": `<mailto:${SUPPORT_EMAIL}?subject=unsubscribe>, <${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
        });
    });
}
function getUsersByIds(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ids.length)
            return [];
        const usersData = yield (0, users_1.getUsersByIdsQuery)(ids);
        return usersData.rows;
    });
}
function notifyWyrldJoin(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { projectId, joiningUserId } = params;
        const joiningUserIdNum = Number(joiningUserId);
        const [projectData, projectUsersData] = yield Promise.all([
            (0, projects_1.getProjectQuery)(projectId),
            (0, projectUsers_1.getProjectUsersByProjectQuery)(projectId),
        ]);
        const project = projectData.rows[0];
        if (!project)
            return;
        const recipientIds = new Set([Number(project.user_id)]);
        for (const projectUser of projectUsersData.rows) {
            if (projectUser.is_editor) {
                recipientIds.add(Number(projectUser.user_id));
            }
        }
        recipientIds.delete(joiningUserIdNum);
        const allUserIds = new Set([...recipientIds, joiningUserIdNum]);
        const users = yield getUsersByIds([...allUserIds]);
        if (!users.length)
            return;
        const usersById = new Map(users.map((user) => [Number(user.id), user]));
        const joiningUser = usersById.get(joiningUserIdNum);
        const joiningUsername = (joiningUser === null || joiningUser === void 0 ? void 0 : joiningUser.username) || "A user";
        const projectTitle = project.title || `Wyrld #${project.id}`;
        const wyrldUrl = `${(0, emailPreferences_1.getPublicAppUrl)()}/wyrld?id=${project.id}`;
        const recipients = [...recipientIds]
            .map((id) => usersById.get(id))
            .filter((user) => Boolean(user))
            .filter((user) => shouldReceiveNotification(user, "notify_wyrld_join"));
        if (!recipients.length)
            return;
        yield Promise.all(recipients.map((recipient) => sendNotificationEmail({
            recipient,
            subject: `${joiningUsername} joined ${projectTitle}`,
            message: `
          <p>
            <strong>${escapeHtml(joiningUsername)}</strong> just joined
            <strong>${escapeHtml(projectTitle)}</strong>.
          </p>
          <p><a href="${wyrldUrl}">Open this Wyrld</a></p>
        `,
        })));
    });
}
function notifySheetLinked(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { actorUserId, projectId, playerId } = params;
        const actorUserIdNum = Number(actorUserId);
        const [projectData, projectUsersData, sheetData] = yield Promise.all([
            (0, projects_1.getProjectQuery)(projectId),
            (0, projectUsers_1.getProjectUsersByProjectQuery)(projectId),
            (0, _5eCharGeneral_1.get5eCharGeneralQuery)(playerId),
        ]);
        const project = projectData.rows[0];
        const sheet = sheetData.rows[0];
        if (!project || !sheet)
            return;
        const recipientIds = new Set([Number(project.user_id), Number(sheet.user_id)]);
        for (const projectUser of projectUsersData.rows) {
            if (projectUser.is_editor) {
                recipientIds.add(Number(projectUser.user_id));
            }
        }
        recipientIds.delete(actorUserIdNum);
        const allUserIds = new Set([
            ...recipientIds,
            actorUserIdNum,
            Number(sheet.user_id),
        ]);
        const users = yield getUsersByIds([...allUserIds]);
        if (!users.length)
            return;
        const usersById = new Map(users.map((user) => [Number(user.id), user]));
        const actorUser = usersById.get(actorUserIdNum);
        const actorUsername = (actorUser === null || actorUser === void 0 ? void 0 : actorUser.username) || "A user";
        const sheetOwner = usersById.get(Number(sheet.user_id));
        const sheetOwnerUsername = (sheetOwner === null || sheetOwner === void 0 ? void 0 : sheetOwner.username) || "Unknown user";
        const sheetName = sheet.name || `Sheet #${sheet.id}`;
        const projectTitle = project.title || `Wyrld #${project.id}`;
        const wyrldUrl = `${(0, emailPreferences_1.getPublicAppUrl)()}/wyrld?id=${project.id}`;
        const recipients = [...recipientIds]
            .map((id) => usersById.get(id))
            .filter((user) => Boolean(user))
            .filter((user) => shouldReceiveNotification(user, "notify_sheet_link"));
        if (!recipients.length)
            return;
        yield Promise.all(recipients.map((recipient) => sendNotificationEmail({
            recipient,
            subject: `Character linked in ${projectTitle}`,
            message: `
          <p>
            <strong>${escapeHtml(actorUsername)}</strong> linked
            <strong>${escapeHtml(sheetName)}</strong> in
            <strong>${escapeHtml(projectTitle)}</strong>.
          </p>
          <p>Sheet owner: <strong>${escapeHtml(sheetOwnerUsername)}</strong></p>
          <p><a href="${wyrldUrl}">Open this Wyrld</a></p>
        `,
        })));
    });
}
function notifyWyrldJoinAsync(params) {
    notifyWyrldJoin(params).catch((err) => {
        logger_1.default.error({ err, params }, "Failed to send wyrld join email notifications");
    });
}
function notifySheetLinkedAsync(params) {
    notifySheetLinked(params).catch((err) => {
        logger_1.default.error({ err, params }, "Failed to send sheet linked email notifications");
    });
}
