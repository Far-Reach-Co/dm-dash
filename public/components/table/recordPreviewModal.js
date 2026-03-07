import createElement from "../../lib/salt-lib/createElement.js";
import modal from "../modal.js";
import parseUrlTextContent from "../parseUrlTextContent.js";

const RECORD_STYLESHEET_ID = "vtt-record-modal-record-css";
let latestPreviewRequest = 0;
const RECORD_PREVIEW_MAX_AGE_MS = 5 * 60 * 1000;
const recordPreviewCache = new Map();
const recordPreviewInFlight = new Map();

function ensureRecordStyles() {
  if (document.getElementById(RECORD_STYLESHEET_ID)) return;
  const link = createElement("link", {
    id: RECORD_STYLESHEET_ID,
    rel: "stylesheet",
    href: "/css/features/record.css",
  });
  document.head.appendChild(link);
}

function renderLoadingState(title) {
  return createElement("div", { class: "help-content vtt-record-modal" }, [
    createElement("h2", {}, title || "Record"),
    createElement("small", { class: "vtt-record-modal-status" }, "Loading record..."),
  ]);
}

function renderErrorState(title, recordHref) {
  return createElement("div", { class: "help-content vtt-record-modal" }, [
    createElement("h2", {}, title || "Record"),
    createElement(
      "small",
      { class: "vtt-record-modal-status" },
      "Unable to load this record preview right now.",
    ),
    createElement("a", { href: recordHref, target: "_blank", rel: "noopener noreferrer" }, "Open full record page"),
  ]);
}

function parseRecordDocument(doc) {
  const title = doc.querySelector(".record-header h1")?.textContent?.trim() || "Record";
  const badges = Array.from(doc.querySelectorAll(".record-meta .record-badge"))
    .map((badge) => ({
      className: badge.getAttribute("class") || "record-badge",
      label: badge.textContent?.trim() || "",
    }))
    .filter((badge) => badge.label.length);

  let description = "";
  const descriptionData = doc.getElementById("description-data")?.textContent;
  if (descriptionData) {
    try {
      const parsed = JSON.parse(descriptionData);
      description = typeof parsed === "string" ? parsed : "";
    } catch {
      description = "";
    }
  }

  const imageUrls = Array.from(doc.querySelectorAll(".record-image-thumb"))
    .map((img) => img.getAttribute("data-lightbox") || img.getAttribute("src") || "")
    .filter(Boolean);

  return {
    title,
    badges,
    description,
    imageUrls,
  };
}

function getCachedRecordPreview(recordHref, { allowStale = false } = {}) {
  const cached = recordPreviewCache.get(recordHref);
  if (!cached?.preview) return null;
  const isFresh = Date.now() - cached.updatedAt <= RECORD_PREVIEW_MAX_AGE_MS;
  if (!allowStale && !isFresh) return null;
  return {
    preview: cached.preview,
    isFresh,
  };
}

function setCachedRecordPreview(recordHref, preview) {
  if (!recordHref || !preview) return;
  recordPreviewCache.set(recordHref, {
    preview,
    updatedAt: Date.now(),
  });
  if (recordPreviewCache.size > 100) {
    const oldestKey = recordPreviewCache.keys().next().value;
    if (oldestKey) recordPreviewCache.delete(oldestKey);
  }
}

async function fetchRecordPreview(recordHref) {
  if (recordPreviewInFlight.has(recordHref)) {
    return await recordPreviewInFlight.get(recordHref);
  }

  const request = (async () => {
    const response = await fetch(recordHref, {
      method: "GET",
      credentials: "same-origin",
    });
    const html = await response.text();
    if (!response.ok) {
      throw new Error(`Record preview request failed: ${response.status}`);
    }

    const parsed = new DOMParser().parseFromString(html, "text/html");
    if (!parsed.querySelector(".record-page")) {
      throw new Error("Record page not available");
    }

    const recordPreview = parseRecordDocument(parsed);
    setCachedRecordPreview(recordHref, recordPreview);
    return recordPreview;
  })().finally(() => {
    recordPreviewInFlight.delete(recordHref);
  });

  recordPreviewInFlight.set(recordHref, request);
  return await request;
}

async function refreshRecordPreviewInBackground(recordHref, requestId) {
  try {
    const freshPreview = await fetchRecordPreview(recordHref);
    if (requestId !== latestPreviewRequest) return;
    modal.show(renderRecordPreview(freshPreview));
  } catch {
    // Keep existing rendered state when background refresh fails.
  }
}

function renderRecordPreview({ title, badges, description, imageUrls }) {
  const descriptionElem = createElement("div", { class: "record-body" });
  const parsedDescription = parseUrlTextContent(String(description || ""));
  if (parsedDescription.length) {
    descriptionElem.append(...parsedDescription);
  } else {
    descriptionElem.textContent = "No description";
  }

  const lightboxImage = createElement("img", {
    class: "vtt-record-lightbox-image",
    src: "",
    alt: "Record image preview",
  });

  const lightbox = createElement(
    "div",
    { class: "vtt-record-lightbox", "aria-hidden": "true" },
    [
      createElement(
        "button",
        {
          type: "button",
          class: "vtt-record-lightbox-close",
          "aria-label": "Close image preview",
        },
        "x",
      ),
      createElement("div", { class: "vtt-record-lightbox-inner" }, [lightboxImage]),
    ],
  );

  const closeLightbox = () => {
    lightbox.classList.remove("visible");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImage.setAttribute("src", "");
  };

  const openLightbox = (src) => {
    lightboxImage.setAttribute("src", src);
    lightbox.classList.add("visible");
    lightbox.setAttribute("aria-hidden", "false");
  };

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  const closeButton = lightbox.querySelector(".vtt-record-lightbox-close");
  if (closeButton) {
    closeButton.addEventListener("click", closeLightbox);
  }

  const imageGrid =
    imageUrls.length > 0
      ? createElement(
          "div",
          { class: "record-images" },
          imageUrls.map((src, index) =>
            createElement(
              "img",
              {
                class: "record-image-thumb",
                src,
                alt: `Record image ${index + 1}`,
              },
              null,
              {
                type: "click",
                event: () => openLightbox(src),
              },
            ),
          ),
        )
      : null;

  const headerChildren = [
    createElement("h1", {}, title || "Record"),
    createElement(
      "div",
      { class: "record-meta" },
      badges.map((badge) =>
        createElement("span", { class: badge.className }, badge.label),
      ),
    ),
  ];

  return createElement("div", { class: "help-content vtt-record-modal" }, [
    createElement("div", { class: "record-page vtt-record-page" }, [
      createElement("div", { class: "record-header" }, headerChildren),
      descriptionElem,
      imageGrid || createElement("small", { class: "vtt-record-modal-status" }, "No images"),
    ]),
    lightbox,
  ]);
}

export default async function showRecordPreviewModal({ recordHref, recordTitle }) {
  if (!recordHref) return;
  ensureRecordStyles();

  const requestId = ++latestPreviewRequest;
  const cached = getCachedRecordPreview(recordHref, { allowStale: true });
  if (cached?.preview) {
    modal.show(renderRecordPreview(cached.preview));
    if (!cached.isFresh) {
      void refreshRecordPreviewInBackground(recordHref, requestId);
    }
    return;
  }

  modal.show(renderLoadingState(recordTitle));

  try {
    const recordPreview = await fetchRecordPreview(recordHref);
    if (requestId !== latestPreviewRequest) return;
    modal.show(renderRecordPreview(recordPreview));
  } catch {
    if (requestId !== latestPreviewRequest) return;
    modal.show(renderErrorState(recordTitle, recordHref));
  }
}
