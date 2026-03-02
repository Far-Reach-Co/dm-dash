import createElement from "../../lib/salt-lib/createElement.js";

export function renderLibraryPackList(grid) {
  const q = grid.packLibraryQuery.trim().toLowerCase();
  const basePacks =
    grid.viewMode === "packs" ? grid.getPacksForCurrentFilter() : grid.getEditablePacks();
  const filteredPacks = grid.useMemo(
    "library-pack-list-filtered-packs",
    () =>
      q
        ? basePacks.filter((pack) => {
            const title = String(pack.title || "").toLowerCase();
            const desc = String(pack.description || "").toLowerCase();
            return title.includes(q) || desc.includes(q);
          })
        : basePacks,
    () => [basePacks, q],
  );
  const visiblePacks = grid.useMemo(
    "library-pack-list-visible-packs",
    () => (grid.viewMode === "packs" ? filteredPacks : filteredPacks.slice(0, 6)),
    () => [filteredPacks, grid.viewMode],
  );
  const countLabel =
    grid.viewMode === "packs"
      ? `${filteredPacks.length} pack${filteredPacks.length === 1 ? "" : "s"}`
      : `${grid.packs.length} pack${grid.packs.length === 1 ? "" : "s"}`;
  const cards = grid.useMemo(
    "library-pack-list-card-nodes",
    () =>
      visiblePacks.length > 0
        ? visiblePacks.map((pack) =>
            createElement(
              "div",
              { class: "library-pack-card" },
              [
                createElement(
                  "div",
                  { class: "library-pack-card-title" },
                  pack.title || "Untitled",
                ),
                createElement(
                  "div",
                  { class: "library-pack-card-meta" },
                  `${grid.getPackVisibilityLabel(pack)} • ${pack.image_count || 0} images`,
                ),
                createElement(
                  "small",
                  { class: "library-pack-tags" },
                  `Tags: ${grid.formatPackTags(grid.getPackTags(pack))}`,
                ),
                createElement("div", { class: "library-pack-card-badges" }, [
                  ...(grid.isPackEditable(pack)
                    ? [createElement("span", { class: "library-pack-pill owned" }, "Owned")]
                    : []),
                  ...(grid.isPackLockedForScope(pack)
                    ? [
                        createElement(
                          "span",
                          { class: "library-pack-pill locked" },
                          grid.getPackLockLabel(pack),
                        ),
                      ]
                    : []),
                  ...(grid.isPackInstalled(pack)
                    ? [
                        createElement(
                          "span",
                          { class: "library-pack-pill installed" },
                          "Installed",
                        ),
                      ]
                    : [createElement("span", { class: "library-pack-pill shared" }, "Shared")]),
                ]),
              ],
              {
                type: "click",
                event: () => grid.renderPackImagesModal(pack),
              },
            ),
          )
        : [
            createElement(
              "div",
              { class: "library-pack-empty" },
              grid.viewMode === "packs"
                ? "No packs for this filter yet. Create or discover packs."
                : "No packs yet. Create your first pack.",
            ),
          ],
    () => [visiblePacks, grid.viewMode, grid.installedPacks, grid.projectId],
  );

  return createElement("div", { class: "library-pack-section" }, [
    createElement("div", { class: "library-pack-section-header" }, [
      createElement("div", { class: "library-pack-section-title" }, "Library Packs"),
      createElement("div", { class: "library-pack-section-count" }, countLabel),
    ]),
    createElement("div", { class: "library-pack-explainer" }, [
      createElement(
        "p",
        { class: "library-pack-explainer-line" },
        "Packs are installable image bundles designed for publishing and sharing reusable resources.",
      ),
      createElement("p", { class: "library-pack-explainer-line" }, [
        "Use ",
        createElement("strong", {}, "Discover"),
        " to browse community-shared published packs, then preview and install them into this library.",
      ]),
    ]),
    ...(grid.viewMode === "packs"
      ? [
          createElement("div", { class: "library-pack-filters" }, [
            createElement(
              "button",
              {
                class: `library-pack-action-btn${grid.packViewFilter === "all" ? " active" : ""}`,
                type: "button",
              },
              "All",
              { type: "click", event: () => grid.setPackViewFilter("all") },
            ),
            createElement(
              "button",
              {
                class: `library-pack-action-btn${grid.packViewFilter === "owned" ? " active" : ""}`,
                type: "button",
              },
              "Owned",
              { type: "click", event: () => grid.setPackViewFilter("owned") },
            ),
            createElement(
              "button",
              {
                class: `library-pack-action-btn${grid.packViewFilter === "installed" ? " active" : ""}`,
                type: "button",
              },
              "Installed",
              { type: "click", event: () => grid.setPackViewFilter("installed") },
            ),
          ]),
        ]
      : []),
    createElement("div", { class: "library-pack-actions" }, [
      createElement(
        "button",
        { class: "library-pack-action-btn", type: "button" },
        "Create Pack",
        { type: "click", event: () => grid.renderCreatePackModal() },
      ),
      createElement(
        "button",
        { class: "library-pack-action-btn", type: "button" },
        "Discover",
        { type: "click", event: () => grid.renderDiscoverPacksModal() },
      ),
      createElement(
        "a",
        {
          class: "library-pack-action-btn library-pack-action-link",
          href: "/library-guide",
          target: "_blank",
          rel: "noopener noreferrer",
        },
        "Guide",
      ),
    ]),
    createElement("div", { class: "library-pack-cards" }, cards),
  ]);
}
