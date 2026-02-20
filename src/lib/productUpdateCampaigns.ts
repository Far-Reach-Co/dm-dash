export interface ProductUpdateCampaignSection {
  title: string;
  body: string;
  linkText?: string;
  linkUrl?: string;
}

export interface ProductUpdateCampaign {
  slug: string;
  subject: string;
  intro: string;
  recent: ProductUpdateCampaignSection[];
  upcoming: string[];
  ctaText: string;
  ctaUrl: string;
}

const campaigns: ProductUpdateCampaign[] = [
  {
    slug: "2026-02-feature-roundup",
    subject: "New in Far Reach Co: pins, library upgrades, and AI SRD search",
    intro:
      "Here is a quick update on features that recently shipped and what we are actively improving next.",
    recent: [
      {
        title: "Location Pins + Portals in VTT (Feb 11-12, 2026)",
        body:
          "Pins can mark points of interest with title/description, and can link portal destinations to move connected users between tables in real time. A pin manager also helps locate, restore, or clean up pins.",
        linkText: "View pin guide",
        linkUrl: "https://farreachco.com/vtt-guide#pins",
      },
      {
        title: "Image Library improvements (Feb 10, 2026)",
        body:
          "Library browsing now supports server-side search, sorting, and folder-aware filtering to keep larger asset collections manageable for both user and wyrld libraries.",
        linkText: "Open library",
        linkUrl: "https://farreachco.com/library",
      },
      {
        title: "Character equipment description quality updates (Jan 29 + Feb 7, 2026)",
        body:
          "Equipment entries now support richer descriptions, including generated weapon/armor details and SRD-linked item details where available.",
        linkText: "Open your dashboard",
        linkUrl: "https://farreachco.com/dash",
      },
      {
        title: "Ask the Archives: AI-powered 5E SRD search (Feb 8-9, 2026)",
        body:
          "The SRD now includes an AI search assistant for rules lookup, backed by Mistral, with caching and link-sanitized responses to valid SRD detail pages.",
        linkText: "Try SRD search",
        linkUrl: "https://farreachco.com/dnd/5e/srd/contents",
      },
    ],
    upcoming: [
      "Further usability polish for location pins and portal workflows.",
      "Continued image library quality-of-life improvements for larger campaigns.",
      "Ongoing SRD search tuning for better answer quality and consistency.",
    ],
    ctaText: "Go to Dashboard",
    ctaUrl: "https://farreachco.com/dash",
  },
  {
    slug: "2026-02-public-wyrlds-community",
    subject: "New in Far Reach Co: Public Wyrlds, community discussion, and Far Reach Radio",
    intro:
      "This release is focused on campaign discovery, onboarding, in-wyrld communication, and campaign atmosphere, with new Pro presentation controls for campaign owners.",
    recent: [
      {
        title: "Public Wyrlds Directory + Shareable Wyrld Pages (Feb 18-19, 2026)",
        body:
          "Wyrlds can now appear in a public directory with their own shareable page. Guests and logged-in users can browse listings, and logged-in users can request to join when enabled.",
        linkText: "Browse Public Wyrlds",
        linkUrl: "https://farreachco.com/wyrlds/public",
      },
      {
        title: "Featured onboarding record for public discovery (Feb 19, 2026)",
        body:
          "Wyrld owners can select one featured record that is visible in public discovery flows, making it easier to set expectations, tone, and onboarding details.",
        linkText: "Read the player guide",
        linkUrl: "https://farreachco.com/public-wyrlds-guide",
      },
      {
        title: "Wyrld community discussion board (Feb 19, 2026)",
        body:
          "Each wyrld now has a Community section with thread-based discussion and replies. Managers can lock threads, and users can moderate their own posts.",
        linkText: "Open Dashboard",
        linkUrl: "https://farreachco.com/dash",
      },
      {
        title: "Pro Wyrld banner and dashboard presentation upgrades (Feb 18-19, 2026)",
        body:
          "Pro wyrlds can now set a banner image to personalize the dashboard and public wyrld presence.",
        linkText: "View admin setup guide",
        linkUrl: "https://farreachco.com/public-wyrlds-admin-guide",
      },
      {
        title: "Far Reach Radio spotlight (Feb 2026)",
        body:
          "Use Far Reach Radio for campaign-ready ambient audio and music while you run sessions on the tabletop.",
        linkText: "Open Far Reach Radio",
        linkUrl: "https://farreachco.com/radio",
      },
    ],
    upcoming: [
      "Community discussion quality-of-life improvements and moderation polish.",
      "Additional public wyrld discovery enhancements and onboarding guidance.",
      "Permission documentation and user-facing clarity updates across wyrld settings.",
    ],
    ctaText: "Explore Public Wyrlds",
    ctaUrl: "https://farreachco.com/wyrlds/public",
  },
];

export function getProductUpdateCampaigns(): ProductUpdateCampaign[] {
  return campaigns;
}

export function getProductUpdateCampaignBySlug(
  slug: string,
): ProductUpdateCampaign | undefined {
  return campaigns.find((campaign) => campaign.slug === slug);
}

export function getLatestProductUpdateCampaign(): ProductUpdateCampaign {
  return campaigns[campaigns.length - 1];
}

export function renderProductUpdateMessage(campaign: ProductUpdateCampaign): string {
  const recentHtml = campaign.recent
    .map((section) => {
      const linkHtml =
        section.linkText && section.linkUrl
          ? `<p><a href="${section.linkUrl}">${section.linkText}</a></p>`
          : "";
      return /*html*/ `
        <li>
          <strong>${section.title}</strong>
          <p>${section.body}</p>
          ${linkHtml}
        </li>
      `;
    })
    .join("");

  const upcomingHtml = campaign.upcoming
    .map((item) => `<li>${item}</li>`)
    .join("");

  return /*html*/ `
    <p>${campaign.intro}</p>

    <h3>Recent Updates</h3>
    <ul>
      ${recentHtml}
    </ul>

    <h3>Upcoming Focus</h3>
    <ul>
      ${upcomingHtml}
    </ul>

    <p><a href="${campaign.ctaUrl}">${campaign.ctaText}</a></p>
  `;
}
