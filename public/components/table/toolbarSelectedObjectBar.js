import createElement from "../createElement.js";
import socketIntegration from "./socketIntegration.js";
import truncateString from "../../lib/truncateString.js";
import { ICONS } from "./toolbarConfig.js";

export function renderAuraColorPicker(toolbar, obj) {
  const setAura = (color) => {
    obj.set({
      shadow: color ? { color, blur: 30, offsetX: 0, offsetY: 0 } : null,
    });
    toolbar.tableApp.canvasRenderAll();
    socketIntegration.imageMoved(obj);
  };

  return createElement(
    "div",
    {
      class: "d-flex flex-row align-items-center",
      style: "gap: var(--space-sm);",
    },
    [
      createElement(
        "input",
        {
          type: "color",
          value: obj.shadow?.color ?? null,
          style:
            "cursor: pointer; height: 26px; width: 32px; border: none; border-radius: var(--border-radius); padding: 0;",
        },
        null,
        { type: "input", event: (e) => setAura(e.target.value) },
      ),
      createElement(
        "small",
        {
          style:
            "cursor: pointer; color: var(--main-gray); font-weight: normal; text-decoration: underline; text-underline-offset: 2px;",
        },
        "Clear",
        { type: "click", event: () => setAura(null) },
      ),
    ],
  );
}

function renderSelectedLocationPinBar(toolbar, obj, pin) {
  const iconElem = pin.image_src
    ? createElement("img", {
        class: "location-pin-icon location-pin-icon-img",
        src: pin.image_src,
        alt: pin.title || "Location pin image",
        loading: "lazy",
      })
    : createElement("div", { class: "location-pin-icon" }, ICONS.pin);

  const infoChildren = [
    createElement(
      "small",
      { class: "location-pin-id" },
      `PIN-${pin.id ?? "new"}`,
    ),
    createElement(
      "h3",
      { class: "location-pin-title" },
      pin.title || "Location pin",
    ),
    createElement(
      "p",
      { class: "location-pin-description" },
      pin.description || "No description",
    ),
    ...toolbar.renderObjectLockControls(obj, { includeButton: false }),
  ];

  if (toolbar.can("canManagePins")) {
    infoChildren.push(
      createElement("div", { class: "location-pin-actions" }, [
        createElement(
          "button",
          { class: "location-pin-edit-btn", type: "button" },
          "Edit pin",
          {
            type: "click",
            event: () => toolbar.tableApp.openLocationPinModal(obj),
          },
        ),
        createElement(
          "button",
          { class: "location-pin-delete-btn", type: "button" },
          "Delete",
          {
            type: "click",
            event: () => toolbar.tableApp.deleteLocationPin(obj),
          },
        ),
        ...toolbar.renderObjectLockControls(obj, { includeStatus: false }),
      ]),
    );
  }

  const infoBlock = createElement("div", { class: "location-pin-info" }, infoChildren);
  const headerRowChildren = [iconElem, infoBlock];

  const attachments = pin.attachments || [];
  const attachmentsContent =
    attachments.length > 0
      ? attachments.map((target) => {
          const label = target.title || target.uuid;
          if (toolbar.can("canManagePins") && toolbar.can("canUsePinPortals")) {
            return createElement(
              "button",
              {
                class: "location-pin-attachment-link",
                type: "button",
                title: `Open ${label}`,
              },
              label,
              {
                type: "click",
                event: () => toolbar.tableApp.handleLocationPinPortal(target),
              },
            );
          }
          return createElement(
            "div",
            { class: "location-pin-attachment" },
            createElement("span", { class: "location-pin-attachment-title" }, label),
          );
        })
      : [
          createElement(
            "span",
            { class: "location-pin-attachment-note" },
            "No portals mapped to this location yet.",
          ),
        ];

  const attachmentsBlockChildren = [
    createElement("h3", { class: "location-pin-attachments-heading" }, "Portals"),
    createElement("div", { class: "location-pin-attachments" }, attachmentsContent),
  ];
  if (!toolbar.can("canManagePins")) {
    attachmentsBlockChildren.push(
      createElement(
        "small",
        { class: "location-pin-attachment-note" },
        "Portals are manager-only controls.",
      ),
    );
  }
  const attachmentsBlock = createElement(
    "div",
    { class: "location-pin-attachments-block" },
    attachmentsBlockChildren,
  );

  return createElement("div", { class: "vtt-draw-bar location-pin-draw-bar" }, [
    createElement("div", { class: "location-pin-selected-row" }, headerRowChildren),
    attachmentsBlock,
  ]);
}

export async function renderSelectedObjectBar(toolbar) {
  const obj = toolbar.tableApp.getCurrentSelectedObject();
  if (!obj) return toolbar.hiddenElement();

  if (obj.isLocationPin) {
    const pin = toolbar.tableApp.locationPinsByObjectId.get(obj.id);
    if (!pin) return toolbar.hiddenElement();
    return renderSelectedLocationPinBar(toolbar, obj, pin);
  }

  const { idPrefix, displayName, imageSrc, recordTitle, recordHref } =
    await toolbar.getSelectedObjectInfo(obj);

  const thumbnailElem =
    obj.type === "image"
      ? createElement("img", {
          src: imageSrc,
          width: 24,
          height: 24,
          style: "border-radius: var(--border-radius);",
        })
      : toolbar.hiddenElement();

  const nameElem = recordTitle
    ? createElement(
        "small",
        {},
        createElement(
          "a",
          { href: recordHref, rel: "noopener noreferrer", target: "_blank" },
          recordTitle,
        ),
      )
    : createElement("small", {}, `"${displayName}"`);

  return createElement("div", { class: "vtt-draw-bar" }, [
    thumbnailElem,
    createElement(
      "small",
      { style: "color: var(--light-gray); font-weight: normal;" },
      `${idPrefix}-${truncateString(obj.id, 8, "")}`,
    ),
    nameElem,
    createElement("div", { class: "vtt-toolbar-sep" }),
    createElement("small", {}, "Aura"),
    renderAuraColorPicker(toolbar, obj),
    ...toolbar.renderObjectVisibilityControls(obj, { withSeparator: true }),
    ...toolbar.renderObjectLockControls(obj, { withSeparator: true }),
  ]);
}
