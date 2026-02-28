import createElement from "../createElement.js";
import modal from "../modal.js";
import { getThings, postThing } from "../../lib/apiUtils.js";
import detectMob from "../../lib/detectMobile.js";
import {
  formatPackTags,
  getPackLockLabel,
  getPackLockMessage,
  getPackVisibilityLabel,
  isPackLockedForScope,
  isPackOwnedByScope,
} from "../shared/libraryPackUtils.js";

export default class TableSidebarPackPanel {
  constructor(props) {
    this.getProjectId = props.getProjectId;
    this.getIsSandboxMode = props.getIsSandboxMode;
    this.can = props.can;
    this.canUseLibraryPacks = props.canUseLibraryPacks;
    this.tableSidebarImageComponent = props.tableSidebarImageComponent;

    this.mode = "use";
    this.searchQuery = "";
    this.loading = false;
    this.ownedPacks = [];
    this.installedPacks = [];
    this.discoveredPacks = [];
    this.imageCache = {};
    this.imageLoading = {};
    this.expandedInstalledPackId = null;
    this.panelElem = null;
    this.searchDebounce = null;
  }

  get projectId() {
    return this.getProjectId?.() || null;
  }

  get isSandboxMode() {
    return !!this.getIsSandboxMode?.();
  }

  canManageInstalls = () => {
    return this.can?.("canManageLibraryPackInstalls") || this.can?.("canManageImageAssets");
  };

  canDiscover = () => {
    return this.can?.("canDiscoverLibraryPacks") || this.canUseLibraryPacks?.();
  };

  destroy = () => {
    if (this.searchDebounce) {
      clearTimeout(this.searchDebounce);
      this.searchDebounce = null;
    }
    this.panelElem = null;
  };

  setMode = (mode) => {
    if (mode === "discover" && (this.isSandboxMode || !this.canDiscover())) {
      this.mode = "use";
      return;
    }
    this.mode = mode === "discover" ? "discover" : "use";
  };

  setSearchQuery = (value) => {
    this.searchQuery = String(value || "");
  };

  scheduleSearch = () => {
    if (this.searchDebounce) clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(async () => {
      this.loading = true;
      this.render();
      this.discoveredPacks = await this.fetchDiscoverPacks(this.searchQuery);
      this.loading = false;
      this.render();
    }, 250);
  };

  getPackImagesEndpoint = (packId) => {
    const params = new URLSearchParams();
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    return `/api/get_library_pack_images/${packId}${
      params.toString() ? `?${params.toString()}` : ""
    }`;
  };

  isOwnedPack = (pack) => {
    return isPackOwnedByScope(pack, { projectId: this.projectId });
  };

  mount = (elem) => {
    this.panelElem = elem;
    this.panelElem.className = "table-sidebar-pack-panel";
  };

  refreshData = async ({ includeDiscover = false } = {}) => {
    if (!this.canUseLibraryPacks()) {
      this.ownedPacks = [];
      this.installedPacks = [];
      this.discoveredPacks = [];
      this.render();
      return;
    }

    const allowDiscover = includeDiscover && !this.isSandboxMode && this.canDiscover();
    this.loading = true;
    this.render();

    const installedEndpoint = this.projectId
      ? `/api/get_installed_library_packs_by_project/${this.projectId}`
      : "/api/get_installed_library_packs_by_user";
    const ownedEndpoint = this.projectId
      ? `/api/get_owned_library_packs_by_project/${this.projectId}`
      : "/api/get_owned_library_packs_by_user";
    const [owned, installed, discovered] = await Promise.all([
      getThings(ownedEndpoint),
      getThings(installedEndpoint),
      allowDiscover ? this.fetchDiscoverPacks(this.searchQuery) : Promise.resolve(null),
    ]);

    this.ownedPacks = Array.isArray(owned) ? owned : [];
    this.installedPacks = Array.isArray(installed) ? installed : [];
    this.discoveredPacks = allowDiscover && Array.isArray(discovered) ? discovered : [];
    this.loading = false;
    this.render();
  };

  getUseModePacks = () => {
    const merged = [...this.ownedPacks, ...this.installedPacks];
    const byId = new Map();
    for (const pack of merged) {
      const key = String(pack.id);
      if (!byId.has(key)) {
        byId.set(key, pack);
      }
    }
    return Array.from(byId.values());
  };

  fetchDiscoverPacks = async (query = "") => {
    if (this.isSandboxMode || !this.canDiscover()) return [];

    const q = String(query || "").trim();
    const params = new URLSearchParams();
    params.set("limit", "100");
    params.set("offset", "0");
    params.set("published", "true");
    if (this.projectId) {
      params.set("project_id", String(this.projectId));
    }
    if (q) {
      params.set("q", q);
    }
    const endpoint = `/api/discover_library_packs?${params.toString()}`;
    const data = await getThings(endpoint);
    return Array.isArray(data) ? data : [];
  };

  installPackForScope = async (packId, { includeDiscover = false } = {}) => {
    if (this.isSandboxMode) return;
    if (!this.canManageInstalls()) return;

    const endpoint = this.projectId
      ? `/api/install_library_pack_by_project/${this.projectId}/${packId}`
      : `/api/install_library_pack_by_user/${packId}`;
    const res = await postThing(endpoint, {});
    if (!res) return;
    await this.refreshData({ includeDiscover });
  };

  removePackForScope = async (packId, { includeDiscover = false } = {}) => {
    if (this.isSandboxMode) return;
    if (!this.canManageInstalls()) return;

    try {
      const endpoint = this.projectId
        ? `/api/uninstall_library_pack_by_project/${this.projectId}/${packId}`
        : `/api/uninstall_library_pack_by_user/${packId}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      if (res.status !== 200) throw new Error(`uninstall failed: ${res.status}`);
      const key = String(packId);
      delete this.imageCache[key];
      delete this.imageLoading[key];
      if (this.expandedInstalledPackId === key) {
        this.expandedInstalledPackId = null;
      }
      await this.refreshData({ includeDiscover });
    } catch (err) {
      console.log(err);
      window.customAlertError("Could not uninstall pack");
    }
  };

  toggleInstalledPack = async (packId) => {
    const key = String(packId);
    const pack = this.installedPacks.find((item) => String(item.id) === key);
    if (pack && isPackLockedForScope(pack)) {
      this.expandedInstalledPackId = null;
      this.render();
      return;
    }
    if (this.expandedInstalledPackId === key) {
      this.expandedInstalledPackId = null;
      this.render();
      return;
    }

    this.expandedInstalledPackId = key;
    if (!Array.isArray(this.imageCache[key])) {
      this.imageLoading[key] = true;
      this.render();
      const images = await getThings(this.getPackImagesEndpoint(packId));
      this.imageCache[key] = Array.isArray(images)
        ? images.map((image) => ({
            ...image,
            id: image.image_id ?? image.id,
          }))
        : [];
      this.imageLoading[key] = false;
    }
    this.render();
  };

  renderPackBadges = (pack, { installed = false } = {}) => {
    const badges = [];
    if (this.isOwnedPack(pack)) {
      badges.push(createElement("span", { class: "sidebar-pack-pill owned" }, "Owned"));
    } else {
      badges.push(createElement("span", { class: "sidebar-pack-pill shared" }, "Shared"));
    }
    if (installed) {
      badges.push(createElement("span", { class: "sidebar-pack-pill installed" }, "Installed"));
    }
    if (isPackLockedForScope(pack)) {
      badges.push(
        createElement("span", { class: "sidebar-pack-pill locked" }, getPackLockLabel(pack)),
      );
    }
    return createElement("div", { class: "sidebar-pack-badges" }, badges);
  };

  renderPackImageRow = (image) => {
    const placeBtn = this.can("canPlaceImagesFromSidebar")
      ? createElement(
          "button",
          {
            class: "sidebar-image-place-btn",
            title: "Add image to table center",
            type: "button",
          },
          "+",
          {
            type: "click",
            event: (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.tableSidebarImageComponent.placeImageOnTable(image);
            },
          },
        )
      : createElement("div");

    const settingsBtn = createElement(
      "img",
      {
        class: "icon gear",
        src: "/assets/gears.svg",
        title: "Open Image Settings",
      },
      null,
      {
        type: "click",
        event: async (e) => {
          e.preventDefault();
          e.stopPropagation();
          modal.show(
            await this.tableSidebarImageComponent.renderPackImageSettings(
              image,
              () => this.render(),
            ),
          );
        },
      },
    );

    return createElement("div", { class: "sidebar-image-item" }, [
      createElement(
        "div",
        { class: "d-flex align-items-center cursor-pointer flex-1 sidebar-pack-image-main" },
        [
          createElement(
            "div",
            {
              class: "sidebar-image-container",
              title: "Click to place on table",
              tabindex: "0",
              role: "button",
              "aria-label": `Place image ${image.original_name || image.id} on table`,
            },
            createElement("img", {
              src: image.src || "",
              height: "38px",
              draggable: "false",
              style: `${detectMob() ? "" : "pointer-events: none;"} max-width: 38px;`,
            }),
            [
              {
                type: "click",
                event: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  this.tableSidebarImageComponent.placeImageOnTable(image);
                },
              },
              {
                type: "mousedown",
                event: (e) => {
                  e.preventDefault();
                  if (detectMob()) return;
                  this.tableSidebarImageComponent.startDesktopImageDrag(image);
                },
              },
              {
                type: "keydown",
                event: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    this.tableSidebarImageComponent.placeImageOnTable(image);
                  }
                },
              },
            ],
          ),
          createElement(
            "small",
            {
              class: "image-name image-name-readonly",
              title: image.original_name || "Untitled",
            },
            image.original_name || "Untitled",
          ),
        ],
      ),
      createElement("div", { class: "sidebar-image-actions" }, [placeBtn, settingsBtn]),
    ]);
  };

  renderInstalledPackImages = (pack) => {
    const key = String(pack.id);
    if (this.expandedInstalledPackId !== key) return null;

    if (isPackLockedForScope(pack)) {
      return createElement("small", { class: "sidebar-pack-empty" }, getPackLockMessage(pack));
    }

    if (this.imageLoading[key]) {
      return createElement("small", { class: "sidebar-pack-empty" }, "Loading images...");
    }

    const images = Array.isArray(this.imageCache[key]) ? this.imageCache[key] : [];
    if (!images.length) {
      return createElement("small", { class: "sidebar-pack-empty" }, "No images in this pack");
    }

    return createElement(
      "div",
      { class: "sidebar-pack-images-list" },
      images.map((image) => this.renderPackImageRow(image)),
    );
  };

  renderPackImagesModal = async (pack) => {
    const state = {
      loading: true,
      images: [],
    };
    const isLocked = isPackLockedForScope(pack);

    const renderModal = () => {
      const list = isLocked
        ? [createElement("small", {}, getPackLockMessage(pack))]
        : state.loading
          ? [createElement("small", {}, "Loading images...")]
          : state.images.length
            ? state.images.map((img) =>
                createElement("div", { class: "sidebar-pack-image-row" }, [
                  createElement("img", {
                    class: "sidebar-pack-image-thumb",
                    src: img.src || "",
                    alt: img.original_name || "Image",
                  }),
                  createElement(
                    "div",
                    { class: "sidebar-pack-image-title" },
                    img.original_name || "Untitled",
                  ),
                ]),
              )
            : [createElement("small", {}, "No images in this pack yet.")];

      modal.show(
        createElement("div", { class: "help-content" }, [
          createElement("h1", {}, pack.title || "Pack"),
          createElement(
            "small",
            { class: "modal-subtitle" },
            `${getPackVisibilityLabel(pack)} • ${pack.image_count || 0} images`,
          ),
          createElement(
            "p",
            { class: "sidebar-pack-description" },
            pack.description || "No description",
          ),
          createElement("small", { class: "sidebar-pack-tags" }, `Tags: ${formatPackTags(pack)}`),
          createElement("div", { class: "sidebar-pack-images-list" }, list),
        ]),
      );
    };

    renderModal();
    if (isLocked) {
      state.loading = false;
      renderModal();
      return;
    }
    const images = await getThings(this.getPackImagesEndpoint(pack.id));
    state.images = Array.isArray(images) ? images : [];
    state.loading = false;
    renderModal();
  };

  renderDiscoverSection = () => {
    if (this.isSandboxMode) {
      return createElement("div", { class: "sidebar-pack-section" }, [
        createElement("div", { class: "sidebar-header" }, "Discover Shared Packs"),
        createElement(
          "small",
          { class: "sidebar-pack-empty" },
          "Discovery is disabled in sandbox mode.",
        ),
      ]);
    }

    const installedIds = new Set(this.installedPacks.map((pack) => String(pack.id)));
    const items = this.discoveredPacks.length
      ? this.discoveredPacks.map((pack) => {
          const isInstalled = installedIds.has(String(pack.id));
          const isOwned = this.isOwnedPack(pack);
          const isLocked = isPackLockedForScope(pack);
          const canInstall = pack?.can_install !== false;
          return createElement("div", { class: "sidebar-pack-card" }, [
            createElement("div", { class: "sidebar-pack-card-head" }, [
              createElement("div", { class: "sidebar-pack-card-main" }, [
                createElement("div", { class: "sidebar-pack-card-title" }, pack.title || "Untitled"),
                createElement(
                  "div",
                  { class: "sidebar-pack-card-meta" },
                  `${getPackVisibilityLabel(pack)} • ${pack.image_count || 0} images`,
                ),
              ]),
              createElement("div", { class: "sidebar-pack-card-actions" }, [
                createElement(
                  "button",
                  {
                    class: "sidebar-pack-btn",
                    type: "button",
                    ...(isLocked ? { disabled: true } : {}),
                  },
                  "Preview",
                  {
                    type: "click",
                    event: () => this.renderPackImagesModal(pack),
                  },
                ),
                ...(!isOwned
                  ? [
                      createElement(
                        "button",
                        {
                          class: "sidebar-pack-btn",
                          type: "button",
                          ...((!this.canManageInstalls() || (!isInstalled && (isLocked || !canInstall)))
                            ? { disabled: true }
                            : {}),
                        },
                        isInstalled
                          ? "Remove"
                          : isLocked
                            ? getPackLockLabel(pack)
                            : !canInstall
                              ? "Unavailable"
                              : "Install",
                        {
                          type: "click",
                          event: () =>
                            isInstalled
                              ? this.removePackForScope(pack.id, { includeDiscover: true })
                              : this.installPackForScope(pack.id, { includeDiscover: true }),
                        },
                      ),
                    ]
                  : []),
              ]),
            ]),
            createElement(
              "div",
              { class: "sidebar-pack-description" },
              pack.description || "No description",
            ),
            createElement("small", { class: "sidebar-pack-tags" }, `Tags: ${formatPackTags(pack)}`),
            ...(isLocked
              ? [createElement("small", { class: "sidebar-pack-empty" }, getPackLockMessage(pack))]
              : []),
            this.renderPackBadges(pack, { installed: isInstalled }),
          ]);
        })
      : [createElement("small", { class: "sidebar-pack-empty" }, "No packs found")];

    return createElement("div", { class: "sidebar-pack-section" }, [
      createElement("div", { class: "sidebar-header" }, "Discover Shared Packs"),
      ...items,
    ]);
  };

  renderInstalledSection = () => {
    const availablePacks = this.getUseModePacks();
    const installedIds = new Set(this.installedPacks.map((pack) => String(pack.id)));

    const renderPackRow = (pack) => {
      const isExpanded = this.expandedInstalledPackId === String(pack.id);
      const isLocked = isPackLockedForScope(pack);
      const isInstalled = installedIds.has(String(pack.id));
      return createElement("div", { class: "sidebar-pack-item" }, [
        createElement("div", { class: "sidebar-pack-title" }, pack.title || "Untitled"),
        createElement(
          "div",
          { class: "sidebar-pack-meta" },
          `${getPackVisibilityLabel(pack)} • ${pack.image_count || 0} images`,
        ),
        createElement("small", { class: "sidebar-pack-tags" }, `Tags: ${formatPackTags(pack)}`),
        this.renderPackBadges(pack, { installed: isInstalled }),
        createElement("div", { class: "sidebar-pack-actions" }, [
          createElement(
            "button",
            {
              class: "sidebar-pack-btn",
              type: "button",
              ...(isLocked ? { disabled: true } : {}),
            },
            isLocked ? "Locked" : isExpanded ? "Collapse" : "Expand",
            {
              type: "click",
              event: (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isLocked) return;
                this.toggleInstalledPack(pack.id);
              },
            },
          ),
          ...(isInstalled && !this.isOwnedPack(pack) && !this.isSandboxMode
            ? [
                createElement(
                  "button",
                  {
                    class: "sidebar-pack-btn",
                    type: "button",
                    ...(!this.canManageInstalls() ? { disabled: true } : {}),
                  },
                  "Remove",
                  {
                    type: "click",
                    event: (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      this.removePackForScope(pack.id);
                    },
                  },
                ),
              ]
            : []),
        ]),
        ...(isLocked
          ? [createElement("small", { class: "sidebar-pack-empty" }, getPackLockMessage(pack))]
          : []),
        ...(isExpanded ? [this.renderInstalledPackImages(pack)] : []),
      ]);
    };

    return createElement("div", { class: "sidebar-pack-section" }, [
      createElement("div", { class: "sidebar-header" }, "Use Packs (Owned + Installed)"),
      ...(availablePacks.length
        ? availablePacks.map((pack) => renderPackRow(pack))
        : [createElement("small", { class: "sidebar-pack-empty" }, "No owned or installed packs")]),
    ]);
  };

  render = () => {
    if (!this.panelElem) return;
    this.panelElem.innerHTML = "";

    if (this.loading) {
      this.panelElem.append(createElement("small", {}, "Loading packs..."));
      return;
    }

    if (this.mode === "discover") {
      this.panelElem.append(this.renderDiscoverSection());
      return;
    }

    this.panelElem.append(this.renderInstalledSection());
  };
}
