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
const smtp_1 = __importDefault(require("../api/smtp"));
const dbconfig_1 = require("../api/dbconfig");
const users_1 = require("../api/queries/users");
const emailCampaignSends_1 = require("../api/queries/emailCampaignSends");
const productUpdateCampaigns_1 = require("../lib/productUpdateCampaigns");
const emailPreferences_1 = require("../lib/emailPreferences");
const SUPPORT_EMAIL = "farreachco@gmail.com";
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1000;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function parseFlagValue(flag) {
    const idx = process.argv.indexOf(flag);
    if (idx === -1)
        return undefined;
    return process.argv[idx + 1];
}
function hasFlag(flag) {
    return process.argv.includes(flag);
}
function buildFooter(userId) {
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
function buildHeaders(userId) {
    const { unsubscribeUrl } = (0, emailPreferences_1.getEmailPreferenceLinks)(userId);
    return {
        "List-Unsubscribe": `<mailto:${SUPPORT_EMAIL}?subject=unsubscribe>, <${unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    };
}
function sendCampaign(campaignSlug) {
    return __awaiter(this, void 0, void 0, function* () {
        const dryRun = hasFlag("--dry-run");
        const listOnly = hasFlag("--list");
        const limitArg = parseFlagValue("--limit");
        const limit = typeof limitArg === "string" ? Number(limitArg) : undefined;
        if (listOnly) {
            const slugs = (0, productUpdateCampaigns_1.getProductUpdateCampaigns)().map((campaign) => campaign.slug);
            console.log("Available campaigns:");
            for (const slug of slugs) {
                console.log(`- ${slug}`);
            }
            return;
        }
        const campaign = campaignSlug
            ? (0, productUpdateCampaigns_1.getProductUpdateCampaignBySlug)(campaignSlug)
            : (0, productUpdateCampaigns_1.getLatestProductUpdateCampaign)();
        if (!campaign) {
            console.error(`No campaign found for slug: ${campaignSlug}`);
            process.exitCode = 1;
            return;
        }
        const recipientsData = yield (0, users_1.getProductUpdateRecipientsQuery)(typeof limit === "number" && !Number.isNaN(limit) ? { limit } : undefined);
        const recipients = recipientsData.rows.filter((user) => Boolean(user.email));
        const sentUserIdsData = yield (0, emailCampaignSends_1.getSentUserIdsForCampaignQuery)(campaign.slug, recipients.map((user) => user.id));
        const alreadySentUserIds = new Set(sentUserIdsData.rows.map((row) => Number(row.user_id)));
        const pendingRecipients = recipients.filter((user) => !alreadySentUserIds.has(Number(user.id)));
        console.log(`Campaign: ${campaign.slug}\nSubject: ${campaign.subject}\nRecipients eligible: ${recipients.length}\nAlready sent: ${alreadySentUserIds.size}\nPending: ${pendingRecipients.length}\nDry run: ${dryRun ? "yes" : "no"}`);
        if (dryRun) {
            console.log("Sample recipients:");
            for (const user of pendingRecipients.slice(0, 10)) {
                console.log(`- ${user.email}`);
            }
            return;
        }
        if (!pendingRecipients.length) {
            console.log("No pending recipients found.");
            return;
        }
        const message = (0, productUpdateCampaigns_1.renderProductUpdateMessage)(campaign);
        let sent = 0;
        let failed = 0;
        for (let i = 0; i < pendingRecipients.length; i += BATCH_SIZE) {
            const batch = pendingRecipients.slice(i, i + BATCH_SIZE);
            const batchResults = yield Promise.allSettled(batch.map((user) => __awaiter(this, void 0, void 0, function* () {
                yield smtp_1.default.sendMessage({
                    user,
                    title: campaign.subject,
                    message,
                    footerHtml: buildFooter(user.id),
                    headers: buildHeaders(user.id),
                });
                yield (0, emailCampaignSends_1.addEmailCampaignSendQuery)({
                    campaign_slug: campaign.slug,
                    user_id: user.id,
                    email: user.email,
                });
            })));
            for (let j = 0; j < batchResults.length; j++) {
                const result = batchResults[j];
                const user = batch[j];
                if (result.status === "fulfilled") {
                    sent += 1;
                }
                else {
                    failed += 1;
                    console.error(`Failed for ${user.email}: ${result.reason instanceof Error ? result.reason.message : String(result.reason)}`);
                }
            }
            if (i + BATCH_SIZE < pendingRecipients.length) {
                yield sleep(BATCH_DELAY_MS);
            }
        }
        console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
        if (failed > 0)
            process.exitCode = 1;
    });
}
const campaignArg = parseFlagValue("--campaign");
sendCampaign(campaignArg)
    .catch((err) => {
    console.error(err);
    process.exitCode = 1;
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield dbconfig_1.pool.end();
}));
