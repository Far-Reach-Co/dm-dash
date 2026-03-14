/*
README
- `index.html` loads the static Monster Codex shell.
- `styles.css` contains the handheld scanner visuals, layout, and transitions.
- `data.js` bundles the normalized SRD monster data locally so the app works from `index.html`.
- `app.js` wires Salt components, nested child rendering, memoized derived data, persistence, and Web Audio effects.

localStorage keys:
- `monster-codex:favorites`
- `monster-codex:seen`
- `monster-codex:lastSelected`
- `monster-codex:soundEnabled`
*/

import createElement from "../lib/salt-lib/createElement.js";
import Component from "../lib/salt-lib/Component.js";
import {
  MONSTER_CODEX_META,
  MONSTER_DATA,
  MONSTER_DEFENSES,
  MONSTER_ENVIRONMENTS,
  MONSTER_TYPES,
} from "./data.js";

const STORAGE_KEYS = Object.freeze({
  favorites: "monster-codex:favorites",
  seen: "monster-codex:seen",
  lastSelected: "monster-codex:lastSelected",
  soundEnabled: "monster-codex:soundEnabled",
});

const DEFAULT_FILTERS = Object.freeze({
  search: "",
  type: "all",
  crBand: "all",
  environment: "all",
  sort: "name-asc",
});

const CR_BANDS = Object.freeze([
  { value: "all", label: "All threat bands", min: 0, max: Number.POSITIVE_INFINITY },
  { value: "0-1", label: "CR 0-1", min: 0, max: 1 },
  { value: "2-4", label: "CR 2-4", min: 2, max: 4 },
  { value: "5-10", label: "CR 5-10", min: 5, max: 10 },
  { value: "11+", label: "CR 11+", min: 11, max: Number.POSITIVE_INFINITY },
]);

const SORT_OPTIONS = Object.freeze([
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "cr-asc", label: "CR low-high" },
  { value: "cr-desc", label: "CR high-low" },
  { value: "seen-first", label: "Seen first" },
  { value: "favorite-first", label: "Favorite first" },
]);

const SRD_IMAGE_ORIGIN = "https://www.dnd5eapi.co";
const DETAIL_LOAD_MIN_MS = 240;
const PRELOADED_MONSTER_IMAGES = new Map();
const EMPTY_DEFENSES = Object.freeze({
  damage_vulnerabilities: [],
  damage_resistances: [],
  damage_immunities: [],
  condition_immunities: [],
});
const CODEX_MONSTERS = MONSTER_DATA.map((monster) => ({
  ...monster,
  ...(MONSTER_DEFENSES[monster.id] || EMPTY_DEFENSES),
}));

function safeStorage() {
  try {
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function readJson(key, fallback) {
  const storage = safeStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function readString(key, fallback = "") {
  const storage = safeStorage();
  if (!storage) return fallback;

  try {
    return storage.getItem(key) || fallback;
  } catch (error) {
    return fallback;
  }
}

function readBoolean(key, fallback) {
  const value = readJson(key, fallback);
  return typeof value === "boolean" ? value : fallback;
}

function writeJson(key, value) {
  const storage = safeStorage();
  if (!storage) return;

  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Ignore persistence failures in private/static contexts.
  }
}

function writeString(key, value) {
  const storage = safeStorage();
  if (!storage) return;

  try {
    if (!value) {
      storage.removeItem(key);
      return;
    }
    storage.setItem(key, value);
  } catch (error) {
    // Ignore persistence failures in private/static contexts.
  }
}

function formatModifier(score) {
  const modifier = Math.floor((Number(score || 0) - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : String(modifier);
}

function matchesCrBand(value, bandValue) {
  if (bandValue === "all") return true;
  const band = CR_BANDS.find((item) => item.value === bandValue);
  if (!band) return true;
  return value >= band.min && value <= band.max;
}

function compareMarkedFirst(left, right, markedSet, collator) {
  const leftMarked = markedSet.has(left.id) ? 1 : 0;
  const rightMarked = markedSet.has(right.id) ? 1 : 0;

  return rightMarked - leftMarked || collator.compare(left.name, right.name);
}

function formatListValue(items, emptyText = "None") {
  if (!Array.isArray(items) || !items.length) return emptyText;

  const labels = items
    .map((item) => {
      if (!item) return "";
      if (typeof item === "string") return item;
      if (typeof item === "object" && item.name) return item.name;
      return String(item);
    })
    .map((item) => item.trim())
    .filter(Boolean);

  return labels.length ? labels.join(", ") : emptyText;
}

function filterMonsters(monsters, filters, collator, statusSets = {}) {
  const search = filters.search.trim().toLowerCase();
  const selectedType = filters.type;
  const selectedEnvironment = filters.environment;
  const favorites = statusSets.favorites || new Set();
  const seen = statusSets.seen || new Set();

  const filtered = monsters.filter((monster) => {
    if (search && !monster.name.toLowerCase().includes(search)) return false;
    if (selectedType !== "all" && monster.type !== selectedType) return false;
    if (
      selectedEnvironment !== "all" &&
      !monster.environment.includes(selectedEnvironment)
    ) {
      return false;
    }
    if (!matchesCrBand(monster.challenge_rating_value, filters.crBand)) {
      return false;
    }
    return true;
  });

  filtered.sort((left, right) => {
    switch (filters.sort) {
      case "name-desc":
        return collator.compare(right.name, left.name);
      case "cr-asc":
        return (
          left.challenge_rating_value - right.challenge_rating_value ||
          collator.compare(left.name, right.name)
        );
      case "cr-desc":
        return (
          right.challenge_rating_value - left.challenge_rating_value ||
          collator.compare(left.name, right.name)
        );
      case "seen-first":
        return compareMarkedFirst(left, right, seen, collator);
      case "favorite-first":
        return compareMarkedFirst(left, right, favorites, collator);
      case "name-asc":
      default:
        return collator.compare(left.name, right.name);
    }
  });

  return filtered;
}

function resolveSelectedId(monsters, filters, preferredId, collator, statusSets = {}) {
  const filtered = filterMonsters(monsters, filters, collator, statusSets);
  if (!filtered.length) return "";
  if (preferredId && filtered.some((monster) => monster.id === preferredId)) {
    return preferredId;
  }
  return filtered[0].id;
}

function getSigilVariant(monster) {
  const type = String(monster.type || "").toLowerCase();

  if (type.includes("dragon") || type.includes("fiend") || type.includes("celestial")) {
    return "dragon";
  }

  if (type.includes("humanoid") || type.includes("giant")) {
    return "humanoid";
  }

  if (type.includes("beast") || type.includes("monstrosity") || type.includes("fey")) {
    return "beast";
  }

  if (type.includes("undead") || type.includes("ooze")) {
    return "undead";
  }

  return "arcane";
}

function createSigil(monster, size = "small") {
  const classes = ["sigil", `sigil--${getSigilVariant(monster)}`];
  if (size === "large") classes.push("sigil--large");

  return createElement("div", { className: classes.join(" ") }, [
    createElement("span", { className: "sigil__core", "aria-hidden": "true" }),
    createElement("span", { className: "sigil__crest", "aria-hidden": "true" }),
    createElement("span", { className: "sigil__satellite", "aria-hidden": "true" }),
    createElement("span", { className: "sigil__satellite-b", "aria-hidden": "true" }),
  ]);
}

function resolveMonsterImageUrl(monster) {
  const raw = String(monster?.image || "").trim();
  if (!raw) return "";

  try {
    return new URL(raw, SRD_IMAGE_ORIGIN).toString();
  } catch (error) {
    return "";
  }
}

function delayMs(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function preloadMonsterImage(url) {
  if (!url) return Promise.resolve("empty");

  const cached = PRELOADED_MONSTER_IMAGES.get(url);
  if (cached === "loaded" || cached === "error") {
    return Promise.resolve(cached);
  }

  if (cached && typeof cached.then === "function") {
    return cached;
  }

  const pending = new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      PRELOADED_MONSTER_IMAGES.set(url, "loaded");
      resolve("loaded");
    };

    image.onerror = () => {
      PRELOADED_MONSTER_IMAGES.set(url, "error");
      resolve("error");
    };

    image.src = url;
  });

  PRELOADED_MONSTER_IMAGES.set(url, pending);
  return pending;
}

function getPortraitNode(target) {
  if (!target || typeof target.closest !== "function") return null;
  return target.closest(".monster-portrait");
}

function markPortraitLoaded(event) {
  const portrait = getPortraitNode(event.currentTarget);
  if (!portrait) return;

  portrait.classList.add("is-loaded");
  portrait.classList.remove("is-fallback");
}

function markPortraitFallback(event) {
  const image = event.currentTarget;
  const portrait = getPortraitNode(image);
  if (portrait) {
    portrait.classList.add("is-fallback");
    portrait.classList.remove("is-loaded");
  }

  if (image && typeof image.remove === "function") {
    image.remove();
  }
}

function createMonsterPortrait(monster, size = "row") {
  const imageUrl = resolveMonsterImageUrl(monster);
  const classes = ["monster-portrait", `monster-portrait--${size}`];
  if (!imageUrl) classes.push("is-fallback");

  const sigilSize = size === "hero" ? "large" : "small";

  return createElement("div", { className: classes.join(" ") }, [
    createElement("div", { className: "monster-portrait__screen" }, [
      createElement(
        "div",
        { className: "monster-portrait__fallback", "aria-hidden": "true" },
        createSigil(monster, sigilSize),
      ),
      imageUrl
        ? createElement(
            "img",
            {
              className: "monster-portrait__image",
              src: imageUrl,
              alt: size === "hero" ? `${monster.name} illustration` : "",
              loading: size === "hero" ? "eager" : "lazy",
              decoding: "async",
            },
            null,
            [
              { type: "load", event: markPortraitLoaded },
              { type: "error", event: markPortraitFallback },
            ],
          )
        : null,
    ]),
  ]);
}

function createLoadingPortrait(monster) {
  return createElement("div", { className: "monster-portrait monster-portrait--hero monster-portrait--loading" }, [
    createElement("div", { className: "monster-portrait__screen" }, [
      createElement("div", { className: "monster-portrait__loader" }, [
        createSigil(monster, "large"),
        createElement("div", { className: "entry-loader__bars", "aria-hidden": "true" }, [
          createElement("span", { className: "entry-loader__bar" }),
          createElement("span", { className: "entry-loader__bar" }),
          createElement("span", { className: "entry-loader__bar" }),
          createElement("span", { className: "entry-loader__bar" }),
        ]),
      ]),
    ]),
  ]);
}

function createScrollViewport(areaClassName, attributes, content) {
  return createElement(
    "div",
    {
      ...(attributes || {}),
      className: areaClassName,
    },
    content,
  );
}

function createOptionNodes(options, selectedValue) {
  return options.map((option) =>
    createElement(
      "option",
      {
        value: option.value,
        selected: option.value === selectedValue,
      },
      option.label,
    ),
  );
}

function createMetricCard(label, value) {
  return createElement("article", { className: "metric-card" }, [
    createElement("p", { className: "metric-label" }, label),
    createElement("p", { className: "metric-value" }, value),
  ]);
}

function createStatCard(label, score) {
  return createElement("article", { className: "stat-card" }, [
    createElement("p", { className: "stat-label" }, label),
    createElement("p", { className: "stat-score" }, String(score)),
    createElement("p", { className: "stat-mod" }, formatModifier(score)),
  ]);
}

function createInfoRow(label, value) {
  return [
    createElement("dt", null, label),
    createElement("dd", null, value),
  ];
}

function createAbilitySection(title, kicker, items, emptyText) {
  return createElement("section", { className: "section-block" }, [
    createElement("div", { className: "section-header" }, [
      createElement("div", null, [
        createElement("p", { className: "section-kicker" }, kicker),
        createElement("h3", { className: "section-title" }, title),
      ]),
    ]),
    items.length
      ? createElement(
          "div",
          { className: "ability-list" },
          items.map((item) =>
            createElement("article", { className: "ability-card" }, [
              createElement("p", { className: "ability-title" }, item.name),
              createElement("p", { className: "ability-copy" }, item.description),
            ]),
          ),
        )
      : createElement("article", { className: "ability-card" }, [
          createElement("p", { className: "ability-title" }, "No record found"),
          createElement("p", { className: "ability-copy" }, emptyText),
        ]),
  ]);
}

function createSoundBoard(isEnabled) {
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  let audioContext = null;

  async function ensureContext() {
    if (!AudioContextCtor || !isEnabled()) return null;

    if (!audioContext) {
      audioContext = new AudioContextCtor();
    }

    if (audioContext.state === "suspended") {
      try {
        await audioContext.resume();
      } catch (error) {
        return null;
      }
    }

    return audioContext;
  }

  async function playPattern(pattern) {
    const context = await ensureContext();
    if (!context) return;

    const origin = context.currentTime;

    for (const note of pattern) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      const filterNode = context.createBiquadFilter();

      filterNode.type = "lowpass";
      filterNode.frequency.value = note.filter || 2400;

      oscillator.type = note.type || "square";
      oscillator.frequency.setValueAtTime(note.frequency, origin + note.delay);
      if (note.slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(
          note.slideTo,
          origin + note.delay + note.duration,
        );
      }

      gainNode.gain.setValueAtTime(0.0001, origin + note.delay);
      gainNode.gain.exponentialRampToValueAtTime(
        note.volume || 0.022,
        origin + note.delay + 0.012,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        origin + note.delay + note.duration,
      );

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(origin + note.delay);
      oscillator.stop(origin + note.delay + note.duration + 0.02);
    }
  }

  return {
    select() {
      void playPattern([
        { frequency: 330, slideTo: 410, duration: 0.06, delay: 0, type: "square" },
        { frequency: 500, slideTo: 620, duration: 0.05, delay: 0.06, type: "triangle" },
      ]);
    },
    favorite() {
      void playPattern([
        { frequency: 480, slideTo: 620, duration: 0.08, delay: 0, type: "triangle" },
        { frequency: 740, slideTo: 920, duration: 0.12, delay: 0.04, type: "triangle" },
      ]);
    },
    mark() {
      void playPattern([
        { frequency: 290, slideTo: 350, duration: 0.06, delay: 0, type: "square" },
        { frequency: 420, slideTo: 480, duration: 0.04, delay: 0.05, type: "square" },
      ]);
    },
    panel(isOpen) {
      void playPattern([
        {
          frequency: isOpen ? 210 : 360,
          slideTo: isOpen ? 320 : 230,
          duration: 0.08,
          delay: 0,
          type: "sawtooth",
          volume: 0.018,
          filter: 1800,
        },
      ]);
    },
  };
}

class ProgressDisplay extends Component {
  constructor(props = {}) {
    super({
      domElem: props.domElem || createElement("div", { className: "progress-grid" }),
      autoInit: false,
      autoRender: false,
    });
  }

  getCards = () => {
    return this.useMemo(
      "progress-cards",
      () => [
        { label: "Total", value: this.props.total },
        { label: "Seen", value: this.props.seenCount },
        { label: "Fav", value: this.props.favoriteCount },
      ],
      () => [this.props.total, this.props.seenCount, this.props.favoriteCount],
    );
  };

  render = async () => {
    return this.getCards().map((card) =>
      createElement("article", { className: "progress-card" }, [
        createElement("p", { className: "progress-label" }, card.label),
        createElement("p", { className: "progress-value" }, String(card.value)),
      ]),
    );
  };
}

class CatalogPanel extends Component {
  constructor(props = {}) {
    super({
      domElem:
        props.domElem ||
        createElement("aside", { className: "panel catalog-panel" }),
      autoInit: false,
      autoRender: false,
    });
    this.filterDraft = { ...(props.filters || DEFAULT_FILTERS) };
    this.lastFilterRevision = props.filterRevision || 0;
  }

  renderProgress = async () => {
    return this.childElem(
      "progress-display",
      () =>
        new ProgressDisplay({
          domElem: createElement("div", { className: "progress-grid" }),
          autoInit: false,
          autoRender: false,
          total: this.props.totalCount,
          seenCount: this.props.seenCount,
          favoriteCount: this.props.favoriteCount,
        }),
      (child) => {
        child.props.total = this.props.totalCount;
        child.props.seenCount = this.props.seenCount;
        child.props.favoriteCount = this.props.favoriteCount;
      },
    );
  };

  syncFilterDraftFromProps = () => {
    const nextRevision = this.props.filterRevision || 0;
    if (nextRevision === this.lastFilterRevision) return;

    this.filterDraft = { ...(this.props.filters || DEFAULT_FILTERS) };
    this.lastFilterRevision = nextRevision;
  };

  updateDraftField = (key, value) => {
    this.filterDraft = {
      ...this.filterDraft,
      [key]: value,
    };
  };

  applyDraftFilters = () => {
    return this.props.onFiltersChange({ ...this.filterDraft });
  };

  handleSearchInput = (event) => {
    this.updateDraftField("search", event.target.value);
  };

  handleSearchKeyDown = (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void this.applyDraftFilters();
  };

  handleDraftSelectChange = (key) => (event) => {
    this.updateDraftField(key, event.target.value);
  };

  handleApplyFilters = () => {
    void this.applyDraftFilters();
  };

  handleClearFilters = () => {
    this.filterDraft = { ...DEFAULT_FILTERS };
    this.lastFilterRevision = (this.props.filterRevision || 0) + 1;
    return this.props.onClearFilters();
  };

  getTypeOptions = () => {
    return createOptionNodes(
      [
        { value: "all", label: "All monster types" },
        ...this.props.types.map((type) => ({ value: type, label: type })),
      ],
      this.filterDraft.type,
    );
  };

  getCrBandOptions = () => {
    return createOptionNodes(CR_BANDS, this.filterDraft.crBand);
  };

  getEnvironmentOptions = () => {
    return createOptionNodes(
      [
        { value: "all", label: "All environments" },
        ...this.props.environments.map((environment) => ({
          value: environment,
          label: environment,
        })),
      ],
      this.filterDraft.environment,
    );
  };

  getSortOptions = () => {
    return createOptionNodes(SORT_OPTIONS, this.filterDraft.sort);
  };

  getMonsterRows = () => {
    return this.useMemo(
      "monster-rows",
      () =>
        this.props.filteredMonsters.map((monster) => {
          const isSelected = monster.id === this.props.selectedId;
          const isSeen = this.props.seen.has(monster.id);
          const isFavorite = this.props.favorites.has(monster.id);

          return createElement(
            "button",
            {
              className: `monster-row${isSelected ? " is-selected" : ""}`,
              type: "button",
            },
            [
              createSigil(monster),
              createElement("div", { className: "monster-row__copy" }, [
                createElement("p", { className: "monster-row__name" }, monster.name),
                createElement(
                  "p",
                  { className: "monster-row__meta" },
                  `${monster.size} ${monster.type}${
                    monster.subtype ? ` • ${monster.subtype}` : ""
                  }`,
                ),
              ]),
              createElement("div", { className: "monster-row__status" }, [
                createElement("div", { className: "status-lights" }, [
                  createElement("span", {
                    className: `status-light${isSeen ? " is-on" : ""}`,
                    title: "Seen",
                  }),
                  createElement("span", {
                    className: `status-light is-favorite${isFavorite ? " is-on" : ""}`,
                    title: "Favorite",
                  }),
                ]),
              ]),
            ],
            {
              type: "click",
              event: () => this.props.onSelectMonster(monster.id),
            },
          );
        }),
      () => [
        this.props.filteredMonsters,
        this.props.selectedId,
        this.props.seen,
        this.props.favorites,
      ],
    );
  };

  renderEmptyList = () => {
    return createElement("section", { className: "empty-state" }, [
      createSigil({ type: "Arcane" }, "large"),
      createElement("h3", { className: "empty-title" }, "No Signal"),
      createElement(
        "p",
        { className: "empty-copy" },
        "No returns on the current scan.",
      ),
      createElement(
        "button",
        {
          className: "empty-button",
          type: "button",
        },
        "Clear Filters",
        {
          type: "click",
          event: this.handleClearFilters,
        },
      ),
    ]);
  };

  render = async () => {
    const progressElem = await this.renderProgress();
    const rows = this.getMonsterRows();
    const isFiltering = this.props.filtersOpen;

    this.syncFilterDraftFromProps();

    return [
      createElement("div", { className: "panel-header panel-header--compact" }, [
        createElement("div", { className: "panel-heading-row panel-heading-row--compact" }, [
          progressElem,
          createElement(
            "button",
            {
              className: "utility-button filter-toggle",
              type: "button",
              "aria-expanded": String(this.props.filtersOpen),
            },
            this.props.filtersOpen ? "Hide" : "Filters",
            {
              type: "click",
              event: this.props.onToggleFilters,
            },
          ),
        ]),
      ]),
      isFiltering
        ? createScrollViewport(
            "filters-panel is-open",
            {},
            [
              createElement("div", { className: "filter-grid" }, [
                createElement("label", { className: "filter-block" }, [
                  createElement("span", { className: "filter-label" }, "Search"),
                  createElement(
                    "input",
                    {
                      className: "filter-input",
                      type: "search",
                      value: this.filterDraft.search,
                      placeholder: "Search monster name",
                      "aria-label": "Search monster name",
                      dataset: { role: "monster-search" },
                    },
                    null,
                    [
                      {
                        type: "input",
                        event: this.handleSearchInput,
                      },
                      {
                        type: "keydown",
                        event: this.handleSearchKeyDown,
                      },
                    ],
                  ),
                ]),
                createElement("label", { className: "filter-block" }, [
                  createElement("span", { className: "filter-label" }, "Type"),
                  createElement(
                    "select",
                    {
                      className: "filter-select",
                      "aria-label": "Filter by monster type",
                      value: this.filterDraft.type,
                    },
                    this.getTypeOptions(),
                    {
                      type: "change",
                      event: this.handleDraftSelectChange("type"),
                    },
                  ),
                ]),
                createElement("label", { className: "filter-block" }, [
                  createElement("span", { className: "filter-label" }, "Challenge Band"),
                  createElement(
                    "select",
                    {
                      className: "filter-select",
                      "aria-label": "Filter by challenge rating band",
                      value: this.filterDraft.crBand,
                    },
                    this.getCrBandOptions(),
                    {
                      type: "change",
                      event: this.handleDraftSelectChange("crBand"),
                    },
                  ),
                ]),
                createElement("label", { className: "filter-block" }, [
                  createElement("span", { className: "filter-label" }, "Environment"),
                  createElement(
                    "select",
                    {
                      className: "filter-select",
                      "aria-label": "Filter by environment",
                      value: this.filterDraft.environment,
                    },
                    this.getEnvironmentOptions(),
                    {
                      type: "change",
                      event: this.handleDraftSelectChange("environment"),
                    },
                  ),
                ]),
                createElement("label", { className: "filter-block" }, [
                  createElement("span", { className: "filter-label" }, "Sort"),
                  createElement(
                    "select",
                    {
                      className: "filter-select",
                      "aria-label": "Sort monsters",
                      value: this.filterDraft.sort,
                    },
                    this.getSortOptions(),
                    {
                      type: "change",
                      event: this.handleDraftSelectChange("sort"),
                    },
                  ),
                ]),
                createElement("div", { className: "filter-actions" }, [
                  createElement(
                    "button",
                    {
                      className: "control-button",
                      type: "button",
                    },
                    "Apply",
                    {
                      type: "click",
                      event: this.handleApplyFilters,
                    },
                  ),
                  createElement(
                    "button",
                    {
                      className: "control-button",
                      type: "button",
                    },
                    "Default",
                    {
                      type: "click",
                      event: this.handleClearFilters,
                    },
                  ),
                ]),
              ]),
            ],
          )
        : [
            createElement("div", { className: "results-meta" }, [
              createElement(
                "span",
                null,
                `${this.props.filteredMonsters.length} ${
                  this.props.filteredMonsters.length === 1 ? "entry" : "entries"
                } visible`,
              ),
            ]),
            createScrollViewport(
              "monster-list",
              {
                role: "list",
                "aria-label": "Monster list",
              },
              rows.length ? rows : this.renderEmptyList(),
            ),
          ],
    ];
  };
}

class DetailPanel extends Component {
  constructor(props = {}) {
    super({
      domElem:
        props.domElem ||
        createElement("section", { className: "panel detail-panel" }),
      autoInit: false,
      autoRender: false,
    });
    this.lastScanSequence = null;
  }

  getShouldAnimate = () => {
    const nextSequence = this.props.scanSequence;
    const shouldAnimate = nextSequence !== this.lastScanSequence;
    this.lastScanSequence = nextSequence;
    return shouldAnimate;
  };

  renderEmptyState = () => {
    return createScrollViewport(
      "detail-screen",
      {},
      [
        createElement("section", { className: "empty-state" }, [
          createSigil({ type: "Arcane" }, "large"),
          createElement("h3", { className: "empty-title" }, "Standby"),
          createElement(
            "p",
            { className: "empty-copy" },
            "Select a record.",
          ),
        ]),
      ],
    );
  };

  renderLoadingState = (monster) => {
    return createScrollViewport(
      "detail-screen detail-screen--loading",
      { "aria-live": "polite", "aria-busy": "true" },
      [
        createElement("article", { className: "scanner-entry scanner-entry--loading is-scanning" }, [
          createElement("div", { className: "detail-top" }, [
            createLoadingPortrait(monster),
            createElement("div", { className: "detail-headline detail-headline--loading" }, [
              createElement("p", { className: "eyebrow" }, `Index ${monster.id}`),
              createElement("h2", { className: "entry-name" }, monster.name),
              createElement(
                "p",
                { className: "entry-subline" },
                `${monster.size} ${monster.type}${
                  monster.subtype ? ` • ${monster.subtype}` : ""
                } • ${monster.alignment}`,
              ),
              createElement("div", { className: "entry-loader" }, [
                createElement("p", { className: "entry-loader__copy" }, "Buffering visual record"),
                createElement("div", { className: "entry-loader__lines", "aria-hidden": "true" }, [
                  createElement("span", { className: "entry-loader__line entry-loader__line--short" }),
                  createElement("span", { className: "entry-loader__line" }),
                  createElement("span", { className: "entry-loader__line entry-loader__line--mid" }),
                ]),
              ]),
            ]),
          ]),
        ]),
      ],
    );
  };

  render = async () => {
    const monster = this.props.monster;

    if (!monster) {
      return [this.renderEmptyState()];
    }

    if (this.props.isLoading) {
      return [this.renderLoadingState(monster)];
    }

    const shouldAnimate = this.getShouldAnimate();
    const articleClasses = ["scanner-entry"];
    if (shouldAnimate) articleClasses.push("is-scanning");

    return [
      createScrollViewport(
        "detail-screen",
        { "aria-live": "polite" },
        [
        createElement("article", { className: articleClasses.join(" ") }, [
          createElement("div", { className: "detail-top" }, [
            createMonsterPortrait(monster, "hero"),
            createElement("div", { className: "detail-headline" }, [
              createElement("p", { className: "eyebrow" }, `Index ${monster.id}`),
              createElement("h2", { className: "entry-name" }, monster.name),
              createElement(
                "p",
                { className: "entry-subline" },
                `${monster.size} ${monster.type}${
                  monster.subtype ? ` • ${monster.subtype}` : ""
                } • ${monster.alignment}`,
              ),
            ]),
          ]),
          createElement("div", { className: "status-strip" }, [
            createElement(
              "button",
              {
                className: `row-action${
                  this.props.isSeen ? " is-active" : ""
                }`,
                type: "button",
                "aria-pressed": String(this.props.isSeen),
              },
              "Seen",
              {
                type: "click",
                event: () => this.props.onToggleSeen(monster.id),
              },
            ),
            createElement(
              "button",
              {
                className: `row-action${
                  this.props.isFavorite ? " is-active is-favorite" : " is-favorite"
                }`,
                type: "button",
                "aria-pressed": String(this.props.isFavorite),
              },
              "Favorite",
              {
                type: "click",
                event: () => this.props.onToggleFavorite(monster.id),
              },
            ),
          ]),
          createElement("p", { className: "entry-summary" }, monster.summary),
          createElement("div", { className: "metric-grid" }, [
            createMetricCard("Armor Class", monster.armor_class_text),
            createMetricCard("Hit Points", `${monster.hit_points} (${monster.hit_dice})`),
            createMetricCard("Challenge Rating", monster.challenge_rating),
            createMetricCard("Speed", monster.speed),
          ]),
          createElement("div", { className: "detail-grid" }, [
            createElement("section", { className: "detail-card" }, [
              createElement("p", { className: "detail-label" }, "Archive"),
              createElement("dl", null, [
                ...createInfoRow("Type", monster.type),
                ...createInfoRow("Alignment", monster.alignment),
                ...createInfoRow("Senses", monster.senses),
                ...createInfoRow("Languages", monster.languages),
              ]),
            ]),
            createElement("section", { className: "detail-card" }, [
              createElement("p", { className: "detail-label" }, "Vitals"),
              createElement("div", { className: "stat-grid" }, [
                createStatCard("STR", monster.stats.str),
                createStatCard("DEX", monster.stats.dex),
                createStatCard("CON", monster.stats.con),
                createStatCard("INT", monster.stats.int),
                createStatCard("WIS", monster.stats.wis),
                createStatCard("CHA", monster.stats.cha),
              ]),
            ]),
            createElement("section", { className: "detail-card detail-card--defenses" }, [
              createElement("p", { className: "detail-label" }, "Defenses"),
              createElement("dl", null, [
                ...createInfoRow(
                  "Resistances",
                  formatListValue(monster.damage_resistances),
                ),
                ...createInfoRow(
                  "Immunities",
                  formatListValue(monster.damage_immunities),
                ),
                ...createInfoRow(
                  "Vulnerabilities",
                  formatListValue(monster.damage_vulnerabilities),
                ),
                ...createInfoRow(
                  "Condition Shielding",
                  formatListValue(monster.condition_immunities),
                ),
              ]),
            ]),
          ]),
          createAbilitySection(
            "Traits",
            "Passive",
            monster.traits,
            "No passive record.",
          ),
          createAbilitySection(
            "Actions",
            "Combat",
            monster.actions,
            "No combat record.",
          ),
          createAbilitySection(
            "Legendary Actions",
            "Extreme",
            monster.legendary_actions,
            "No extreme record.",
          ),
          createElement("section", { className: "section-block" }, [
            createElement("div", { className: "section-header" }, [
              createElement("div", null, [
                createElement("p", { className: "section-kicker" }, "Tags"),
                createElement("h3", { className: "section-title" }, "Biomes"),
              ]),
            ]),
            createElement(
              "div",
              { className: "tag-cluster" },
              monster.environment.map((tag) =>
                createElement("div", { className: "tag-chip" }, tag),
              ),
            ),
          ]),
        ]),
      ],
    ),
    ];
  };
}

class MonsterCodexApp extends Component {
  constructor(props = {}) {
    super({ domElem: props.domElem });

    this.monsters = CODEX_MONSTERS;
    this.monsterIds = new Set(this.monsters.map((monster) => monster.id));
    this.monsterMap = new Map(this.monsters.map((monster) => [monster.id, monster]));
    this.collator = new Intl.Collator(undefined, {
      sensitivity: "base",
      numeric: true,
    });
    this.detailLoadToken = 0;

    const restoredFavorites = this.restoreIdSet(STORAGE_KEYS.favorites);
    const restoredSeen = this.restoreIdSet(STORAGE_KEYS.seen);
    const restoredSelectedId = readString(STORAGE_KEYS.lastSelected, "");
    const selectedId = resolveSelectedId(
      this.monsters,
      DEFAULT_FILTERS,
      restoredSelectedId,
      this.collator,
      {
        favorites: restoredFavorites,
        seen: restoredSeen,
      },
    );
    const seen = new Set(restoredSeen);
    if (selectedId) {
      seen.add(selectedId);
    }
    const initialSelectedMonster = selectedId ? this.monsterMap.get(selectedId) || null : null;
    const initialDetailLoadingId =
      initialSelectedMonster && resolveMonsterImageUrl(initialSelectedMonster)
        ? selectedId
        : "";

    this.state = {
      filters: { ...DEFAULT_FILTERS },
      favorites: restoredFavorites,
      seen,
      selectedId,
      soundEnabled: readBoolean(STORAGE_KEYS.soundEnabled, true),
      filtersOpen: false,
      filtersRevision: 0,
      detailLoadingId: initialDetailLoadingId,
      scanSequence: 1,
    };

    this.sound = createSoundBoard(() => this.state.soundEnabled);
  }

  init = async () => {
    this.persistState();
    if (this.state.detailLoadingId && this.state.selectedId) {
      void this.finishDetailLoad(this.state.selectedId, ++this.detailLoadToken);
    }
  };

  restoreIdSet = (key) => {
    const raw = readJson(key, []);
    if (!Array.isArray(raw)) return new Set();
    return new Set(raw.filter((id) => this.monsterIds.has(id)));
  };

  getMonsterById = (id) => {
    if (!id) return null;
    return this.monsterMap.get(id) || null;
  };

  persistState = () => {
    writeJson(STORAGE_KEYS.favorites, Array.from(this.state.favorites).sort());
    writeJson(STORAGE_KEYS.seen, Array.from(this.state.seen).sort());
    writeString(STORAGE_KEYS.lastSelected, this.state.selectedId || "");
    writeJson(STORAGE_KEYS.soundEnabled, this.state.soundEnabled);
  };

  finishDetailLoad = async (monsterId, loadToken) => {
    const monster = this.getMonsterById(monsterId);
    if (!monster) return;

    const imageUrl = resolveMonsterImageUrl(monster);
    if (!imageUrl) return;

    await Promise.all([
      preloadMonsterImage(imageUrl),
      delayMs(DETAIL_LOAD_MIN_MS),
    ]);

    if (this.detailLoadToken !== loadToken) return;
    if (this.state.selectedId !== monsterId) return;
    if (this.state.detailLoadingId !== monsterId) return;

    await this.setState({ detailLoadingId: "" });
  };

  getFilteredMonsters = () => {
    return this.useMemo(
      "filtered-monsters",
      () =>
        filterMonsters(this.monsters, this.state.filters, this.collator, {
          favorites: this.state.favorites,
          seen: this.state.seen,
        }),
      () => [
        this.state.filters.search,
        this.state.filters.type,
        this.state.filters.crBand,
        this.state.filters.environment,
        this.state.filters.sort,
        this.state.favorites,
        this.state.seen,
      ],
    );
  };

  getSelectedMonster = (filteredMonsters) => {
    return this.useMemo(
      "selected-monster",
      () =>
        filteredMonsters.find((monster) => monster.id === this.state.selectedId) || null,
      () => [filteredMonsters, this.state.selectedId],
    );
  };

  setFilters = async (patch) => {
    const nextFilters = { ...this.state.filters, ...patch };
    const nextSelectedId = resolveSelectedId(
      this.monsters,
      nextFilters,
      this.state.selectedId,
      this.collator,
      {
        favorites: this.state.favorites,
        seen: this.state.seen,
      },
    );
    const nextSeen = new Set(this.state.seen);
    const selectedChanged = nextSelectedId !== this.state.selectedId;
    const selectionChanged = Boolean(nextSelectedId) && selectedChanged;
    const filtersChanged = Object.keys(DEFAULT_FILTERS).some(
      (key) => nextFilters[key] !== this.state.filters[key],
    );

    if (!filtersChanged && !selectedChanged) {
      return;
    }

    if (selectionChanged) {
      nextSeen.add(nextSelectedId);
    }

    const nextSelectedMonster = selectedChanged ? this.getMonsterById(nextSelectedId) : null;
    const nextDetailLoadingId = selectedChanged
      ? (nextSelectedMonster && resolveMonsterImageUrl(nextSelectedMonster) ? nextSelectedId : "")
      : this.state.detailLoadingId;
    const loadToken = selectedChanged ? ++this.detailLoadToken : this.detailLoadToken;

    await this.setState({
      filters: nextFilters,
      selectedId: nextSelectedId,
      seen: nextSeen,
      filtersRevision: filtersChanged
        ? this.state.filtersRevision + 1
        : this.state.filtersRevision,
      detailLoadingId: nextDetailLoadingId,
      scanSequence: selectionChanged
        ? this.state.scanSequence + 1
        : this.state.scanSequence,
    });
    this.persistState();

    if (selectedChanged && nextDetailLoadingId) {
      void this.finishDetailLoad(nextSelectedId, loadToken);
    }
  };

  clearFilters = async () => {
    await this.setFilters({ ...DEFAULT_FILTERS });
  };

  selectMonster = async (id, options = {}) => {
    const { forceScan = false, playSound = true } = options;
    if (!this.monsterIds.has(id)) return;
    if (this.state.selectedId === id && !forceScan) return;

    const nextSeen = new Set(this.state.seen);
    nextSeen.add(id);
    const monster = this.getMonsterById(id);
    const nextDetailLoadingId = monster && resolveMonsterImageUrl(monster) ? id : "";
    const loadToken = ++this.detailLoadToken;

    await this.setState({
      selectedId: id,
      seen: nextSeen,
      detailLoadingId: nextDetailLoadingId,
      scanSequence: this.state.scanSequence + 1,
    });
    this.persistState();

    if (playSound) {
      this.sound.select();
    }

    if (nextDetailLoadingId) {
      void this.finishDetailLoad(id, loadToken);
    }
  };

  toggleFavorite = async (id) => {
    const nextFavorites = new Set(this.state.favorites);

    if (nextFavorites.has(id)) {
      nextFavorites.delete(id);
    } else {
      nextFavorites.add(id);
    }

    await this.setState({ favorites: nextFavorites });
    this.persistState();
    this.sound.favorite();
  };

  toggleSeen = async (id) => {
    const nextSeen = new Set(this.state.seen);

    if (nextSeen.has(id)) {
      nextSeen.delete(id);
    } else {
      nextSeen.add(id);
    }

    await this.setState({ seen: nextSeen });
    this.persistState();
    this.sound.mark();
  };

  toggleSound = async () => {
    await this.setState({ soundEnabled: !this.state.soundEnabled });
    this.persistState();

    if (this.state.soundEnabled) {
      this.sound.mark();
    }
  };

  toggleFilters = async () => {
    const nextFiltersOpen = !this.state.filtersOpen;
    await this.setState({ filtersOpen: nextFiltersOpen });
    this.sound.panel(nextFiltersOpen);
  };

  renderCatalogPanel = async (filteredMonsters) => {
    return this.childElem(
      "catalog-panel",
      () =>
        new CatalogPanel({
          domElem: createElement("aside", { className: "panel catalog-panel" }),
          autoInit: false,
          autoRender: false,
          types: MONSTER_TYPES,
          environments: MONSTER_ENVIRONMENTS,
          totalCount: MONSTER_CODEX_META.total,
          seenCount: this.state.seen.size,
          favoriteCount: this.state.favorites.size,
          filteredMonsters,
          selectedId: this.state.selectedId,
          seen: this.state.seen,
          favorites: this.state.favorites,
          filters: this.state.filters,
          filterRevision: this.state.filtersRevision,
          filtersOpen: this.state.filtersOpen,
          onFiltersChange: this.setFilters,
          onClearFilters: this.clearFilters,
          onSelectMonster: this.selectMonster,
          onToggleFilters: this.toggleFilters,
        }),
      (child) => {
        child.props.types = MONSTER_TYPES;
        child.props.environments = MONSTER_ENVIRONMENTS;
        child.props.totalCount = MONSTER_CODEX_META.total;
        child.props.seenCount = this.state.seen.size;
        child.props.favoriteCount = this.state.favorites.size;
        child.props.filteredMonsters = filteredMonsters;
        child.props.selectedId = this.state.selectedId;
        child.props.seen = this.state.seen;
        child.props.favorites = this.state.favorites;
        child.props.filters = this.state.filters;
        child.props.filterRevision = this.state.filtersRevision;
        child.props.filtersOpen = this.state.filtersOpen;
        child.props.onFiltersChange = this.setFilters;
        child.props.onClearFilters = this.clearFilters;
        child.props.onSelectMonster = this.selectMonster;
        child.props.onToggleFilters = this.toggleFilters;
      },
    );
  };

  renderDetailPanel = async (selectedMonster) => {
    return this.childElem(
      "detail-panel",
      () =>
        new DetailPanel({
          domElem: createElement("section", { className: "panel detail-panel" }),
          autoInit: false,
          autoRender: false,
          monster: selectedMonster,
          isLoading: selectedMonster ? this.state.detailLoadingId === selectedMonster.id : false,
          isSeen: selectedMonster ? this.state.seen.has(selectedMonster.id) : false,
          isFavorite: selectedMonster ? this.state.favorites.has(selectedMonster.id) : false,
          scanSequence: this.state.scanSequence,
          onToggleFavorite: this.toggleFavorite,
          onToggleSeen: this.toggleSeen,
        }),
      (child) => {
        child.props.monster = selectedMonster;
        child.props.isLoading = selectedMonster
          ? this.state.detailLoadingId === selectedMonster.id
          : false;
        child.props.isSeen = selectedMonster
          ? this.state.seen.has(selectedMonster.id)
          : false;
        child.props.isFavorite = selectedMonster
          ? this.state.favorites.has(selectedMonster.id)
          : false;
        child.props.scanSequence = this.state.scanSequence;
        child.props.onToggleFavorite = this.toggleFavorite;
        child.props.onToggleSeen = this.toggleSeen;
      },
    );
  };

  renderBrandBlock = () => {
    return this.useMemo(
      "brand-block",
      () =>
        createElement(
          "div",
          { className: "brand-block" },
          createElement("h1", { className: "brand-title" }, "Monster Codex"),
        ),
      [],
    );
  };

  renderFooter = () => {
    return this.useMemo(
      "footer",
      () =>
        createElement("footer", { className: "codex-footer" }, [
          createElement(
            "p",
            { className: "footer-note" },
            "2014 SRD local bundle",
          ),
        ]),
      [],
    );
  };

  render = async () => {
    const filteredMonsters = this.getFilteredMonsters();
    const selectedMonster = this.getSelectedMonster(filteredMonsters);
    const catalogPanelElem = await this.renderCatalogPanel(filteredMonsters);
    const detailPanelElem = await this.renderDetailPanel(selectedMonster);

    return createElement("div", { className: "codex-shell" }, [
      createElement("header", { className: "codex-header" }, [
        this.renderBrandBlock(),
        createElement("div", { className: "header-actions" }, [
          createElement(
            "button",
            {
              className: `utility-button utility-button--sound ${
                this.state.soundEnabled ? "is-active" : "is-muted"
              }`,
              type: "button",
            },
            this.state.soundEnabled ? "Sound On" : "Sound Off",
            {
              type: "click",
              event: this.toggleSound,
            },
          ),
        ]),
      ]),
      createElement("div", { className: "shell-grid" }, [
        catalogPanelElem,
        detailPanelElem,
      ]),
      this.renderFooter(),
    ]);
  };
}

const mountNode = document.getElementById("app");
if (!mountNode) {
  throw new Error("Missing #app root element");
}

new MonsterCodexApp({ domElem: mountNode });
