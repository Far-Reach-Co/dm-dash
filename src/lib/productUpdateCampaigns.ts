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
