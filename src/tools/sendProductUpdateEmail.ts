import mail from "../api/smtp";
import { pool } from "../api/dbconfig";
import { getProductUpdateRecipientsQuery, User } from "../api/queries/users";
import {
  addEmailCampaignSendQuery,
  getSentUserIdsForCampaignQuery,
} from "../api/queries/emailCampaignSends";
import {
  getLatestProductUpdateCampaign,
  getProductUpdateCampaignBySlug,
  getProductUpdateCampaigns,
  renderProductUpdateMessage,
} from "../lib/productUpdateCampaigns";
import { getEmailPreferenceLinks } from "../lib/emailPreferences";

const SUPPORT_EMAIL = "farreachco@gmail.com";
const BATCH_SIZE = 20;
const BATCH_DELAY_MS = 1000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseFlagValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function buildFooter(userId: string | number): string {
  const { managePreferencesUrl, unsubscribeUrl } = getEmailPreferenceLinks(userId);
  return /*html*/ `
    <p>
      Manage your email settings:
      <a href="${managePreferencesUrl}">Preferences</a><br />
      Unsubscribe from non-essential emails:
      <a href="${unsubscribeUrl}">Unsubscribe</a><br />
      Need help? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
    </p>
  `;
}

function buildHeaders(userId: string | number): Record<string, string> {
  const { unsubscribeUrl } = getEmailPreferenceLinks(userId);
  return {
    "List-Unsubscribe":
      `<mailto:${SUPPORT_EMAIL}?subject=unsubscribe>, <${unsubscribeUrl}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

async function sendCampaign(campaignSlug?: string) {
  const dryRun = hasFlag("--dry-run");
  const listOnly = hasFlag("--list");
  const limitArg = parseFlagValue("--limit");
  const limit = typeof limitArg === "string" ? Number(limitArg) : undefined;

  if (listOnly) {
    const slugs = getProductUpdateCampaigns().map((campaign) => campaign.slug);
    console.log("Available campaigns:");
    for (const slug of slugs) {
      console.log(`- ${slug}`);
    }
    return;
  }

  const campaign = campaignSlug
    ? getProductUpdateCampaignBySlug(campaignSlug)
    : getLatestProductUpdateCampaign();

  if (!campaign) {
    console.error(`No campaign found for slug: ${campaignSlug}`);
    process.exitCode = 1;
    return;
  }

  const recipientsData = await getProductUpdateRecipientsQuery(
    typeof limit === "number" && !Number.isNaN(limit) ? { limit } : undefined,
  );
  const recipients = recipientsData.rows.filter((user) => Boolean(user.email));

  const sentUserIdsData = await getSentUserIdsForCampaignQuery(
    campaign.slug,
    recipients.map((user) => user.id),
  );
  const alreadySentUserIds = new Set(
    sentUserIdsData.rows.map((row) => Number(row.user_id)),
  );
  const pendingRecipients = recipients.filter(
    (user) => !alreadySentUserIds.has(Number(user.id)),
  );

  console.log(
    `Campaign: ${campaign.slug}\nSubject: ${campaign.subject}\nRecipients eligible: ${recipients.length}\nAlready sent: ${alreadySentUserIds.size}\nPending: ${pendingRecipients.length}\nDry run: ${dryRun ? "yes" : "no"}`,
  );

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

  const message = renderProductUpdateMessage(campaign);
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < pendingRecipients.length; i += BATCH_SIZE) {
    const batch = pendingRecipients.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map(async (user: User) => {
        await mail.sendMessage({
          user,
          title: campaign.subject,
          message,
          footerHtml: buildFooter(user.id),
          headers: buildHeaders(user.id),
        });
        await addEmailCampaignSendQuery({
          campaign_slug: campaign.slug,
          user_id: user.id,
          email: user.email,
        });
      }),
    );

    for (let j = 0; j < batchResults.length; j++) {
      const result = batchResults[j];
      const user = batch[j];
      if (result.status === "fulfilled") {
        sent += 1;
      } else {
        failed += 1;
        console.error(
          `Failed for ${user.email}: ${
            result.reason instanceof Error ? result.reason.message : String(result.reason)
          }`,
        );
      }
    }

    if (i + BATCH_SIZE < pendingRecipients.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  console.log(`Done. Sent: ${sent}, Failed: ${failed}`);
  if (failed > 0) process.exitCode = 1;
}

const campaignArg = parseFlagValue("--campaign");
sendCampaign(campaignArg)
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
