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
        body: "Pins can mark points of interest with title/description, and can link portal destinations to move connected users between tables in real time. A pin manager also helps locate, restore, or clean up pins.",
        linkText: "View pin guide",
        linkUrl: "https://farreachco.com/vtt-guide#pins",
      },
      {
        title: "Image Library improvements (Feb 10, 2026)",
        body: "Library browsing now supports server-side search, sorting, and folder-aware filtering to keep larger asset collections manageable for both user and wyrld libraries.",
        linkText: "Open library",
        linkUrl: "https://farreachco.com/library",
      },
      {
        title:
          "Character equipment description quality updates (Jan 29 + Feb 7, 2026)",
        body: "Equipment entries now support richer descriptions, including generated weapon/armor details and SRD-linked item details where available.",
        linkText: "Open your dashboard",
        linkUrl: "https://farreachco.com/dash",
      },
      {
        title: "Ask the Archives: AI-powered 5E SRD search (Feb 8-9, 2026)",
        body: "The SRD now includes an AI search assistant for rules lookup, backed by Mistral, with caching and link-sanitized responses to valid SRD detail pages.",
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
    subject:
      "Set the scene: Far Reach Radio, VTT Sandbox mode, and new ways to adventure",
    intro:
      "This update is all about helping your table jump into the story faster: richer atmosphere with Far Reach Radio, easier first sessions with Sandbox mode, and better ways to discover and join new campaigns.",
    recent: [
      {
        title: "Far Reach Radio: soundtrack your sessions (Feb 2026)",
        body: "Bring your world to life with music built for tabletop moments. Set the tone for tavern chatter, dungeon tension, or boss-fight chaos, then share one listener link so your whole party hears it together.",
        linkText: "Open Far Reach Radio",
        linkUrl: "https://farreachco.com/radio",
      },
      {
        title: "VTT Sandbox mode: start a table in moments (Feb 2026)",
        body: "Want to test the tabletop quickly before committing to a full setup? Launch Sandbox mode and start exploring right away. It is a fast on-ramp for new players and quick one-shot prep.",
        linkText: "Try VTT Sandbox",
        linkUrl: "https://farreachco.com/vtt/guest/start",
      },
      {
        title: "Public Wyrlds: discover new worlds and crews (Feb 18-19, 2026)",
        body: "Campaigns can now appear in a public directory with shareable pages. Players can browse, get a feel for each world, and request to join where available.",
        linkText: "Browse Public Wyrlds",
        linkUrl: "https://farreachco.com/wyrlds/public",
      },
      {
        title: "Onboarding pages that set the story tone (Feb 19, 2026)",
        body: "Campaign owners can highlight a featured onboarding record so new players know the vibe, the expectations, and where the adventure begins before they ever step into session one.",
        linkText: "Read the player guide",
        linkUrl: "https://farreachco.com/public-wyrlds-guide",
      },
      {
        title:
          "Wyrld Community: keep party chatter in one place (Feb 19+, 2026)",
        body: "Each wyrld now has a dedicated community space for threads and replies, so planning, lore discussion, and between-session updates stay close to the campaign itself.",
        linkText: "Open Dashboard",
        linkUrl: "https://farreachco.com/dash",
      },
      {
        title: "Character sheet exports for your table kit (Feb 2026)",
        body: "You can now export character sheets as PDF or JSON, making it easier to share, archive, print, or carry your party’s details between sessions.",
        linkText: "Open character sheet",
        linkUrl: "https://farreachco.com/5eplayer",
      },
      {
        title: "SRD page polish for faster in-session lookup (Feb 2026)",
        body: "SRD pages have been polished for clearer reading and quicker scanning, so your table spends less time hunting and more time adventuring.",
        linkText: "Open SRD Contents",
        linkUrl: "https://farreachco.com/dnd/5e/srd/contents",
      },
    ],
    upcoming: [
      "More atmosphere tools and playlist expansion for session storytelling.",
      "Further Sandbox and onboarding polish so new groups can start playing even faster.",
      "Continued quality-of-life updates across campaign communication and player guides.",
    ],
    ctaText: "Start In Sandbox Mode",
    ctaUrl: "https://farreachco.com/vtt/guest/start",
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

export function renderProductUpdateMessage(
  campaign: ProductUpdateCampaign,
): string {
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
