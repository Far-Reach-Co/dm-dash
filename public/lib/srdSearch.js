(function () {
  var form = document.getElementById("srd-search-form");
  var input = document.getElementById("srd-search-input");
  var results = document.getElementById("srd-search-results");
  var miniForm = document.getElementById("srd-mini-search-form");
  var miniInput = document.getElementById("srd-mini-search-input");
  var modal = document.getElementById("srd-search-modal");
  var closeBtn = document.querySelector("[data-close-srd-search]");
  var openBtns = document.querySelectorAll("[data-open-srd-search]");

  if (!form || !input || !results) return;

  var btn = form.querySelector("button");
  var lastFocusedElement = null;
  var pageContext = getPageContext();
  var contextEnabled = Boolean(pageContext && pageContext.isDetailPage);

  function clearResult() {
    results.textContent = "";
    input.value = "";
    input.focus();
  }

  function showResult(className, text) {
    results.textContent = "";
    var div = document.createElement("div");
    div.className = className;

    if (
      className === "search-answer" &&
      typeof marked !== "undefined" &&
      typeof DOMPurify !== "undefined"
    ) {
      div.innerHTML = DOMPurify.sanitize(marked.parse(text));
    } else {
      div.textContent = text;
      if (className === "search-answer") {
        div.style.whiteSpace = "pre-wrap";
      }
    }

    results.appendChild(div);

    if (className === "search-answer") {
      var clearBtn = document.createElement("button");
      clearBtn.className = "search-clear-btn";
      clearBtn.textContent = "Clear";
      clearBtn.addEventListener("click", clearResult);
      results.appendChild(clearBtn);
    }
  }

  function openModal(prefillQuery) {
    if (!modal) return;
    if (prefillQuery) input.value = prefillQuery;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    lastFocusedElement = document.activeElement;
    input.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function normalizePath(pathname) {
    if (!pathname || typeof pathname !== "string") return null;
    var normalized = pathname.split(/[?#]/)[0].replace(/\/+$/, "");
    if (!normalized.length) return null;
    return normalized;
  }

  function getPageContext() {
    var pathname = normalizePath(window.location.pathname || "");
    if (!pathname || pathname.indexOf("/dnd/5e/srd/") !== 0) return null;

    var segments = pathname.split("/").filter(Boolean).slice(3);
    var category = String(segments[0] || "").trim().toLowerCase() || null;
    var index =
      segments.length === 2
        ? String(segments[1] || "").trim().toLowerCase() || null
        : null;
    var title = resolveContextTitle(index, category);

    if (!category && !index && pathname === "/dnd/5e/srd/contents") {
      return {
        path: pathname,
        category: null,
        index: null,
        title: title || "SRD Contents",
        isDetailPage: false,
      };
    }

    if (!category) return null;

    return {
      path: pathname,
      category: category,
      index: index,
      title: title,
      isDetailPage: Boolean(index),
    };
  }

  function normalizeLooseText(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .replace(/\s+/g, " ");
  }

  function isGenericSrdTitle(value) {
    var normalized = normalizeLooseText(value);
    return (
      normalized === "dungeons dragons fifth edition srd" ||
      normalized === "dungeons and dragons fifth edition srd"
    );
  }

  function titleCaseFromSlug(value) {
    if (!value) return null;
    var words = String(value)
      .split("-")
      .map(function (word) {
        if (!word) return "";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .filter(Boolean);
    if (!words.length) return null;
    return words.join(" ");
  }

  function getNodeText(selector) {
    var node = document.querySelector(selector);
    if (!node) return null;
    var text = String(node.textContent || "").trim();
    if (!text || isGenericSrdTitle(text)) return null;
    return text.slice(0, 120);
  }

  function resolveContextTitle(index, category) {
    var title =
      getNodeText(".breadcrumbs .text-green") ||
      getNodeText(".breadcrumbs .current") ||
      getNodeText('.breadcrumbs [aria-current="page"]') ||
      getNodeText(".info-container > h1") ||
      getNodeText(".info-container h1") ||
      getNodeText("h1");

    if (title) return title;
    if (index) return titleCaseFromSlug(index);
    if (category) return titleCaseFromSlug(category);
    return null;
  }

  function ensureContextToggle() {
    if (!pageContext) return;
    if (pageContext.path === "/dnd/5e/srd/contents") return;
    if (document.getElementById("srd-search-context-checkbox")) return;

    var wrapper = document.createElement("label");
    wrapper.className = "srd-search-context-toggle";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "srd-search-context-checkbox";
    checkbox.checked = contextEnabled;
    checkbox.addEventListener("change", function (e) {
      contextEnabled = Boolean(e.target && e.target.checked);
    });

    var labelText = document.createElement("span");
    labelText.className = "srd-search-context-toggle-text";

    if (pageContext.isDetailPage && pageContext.title) {
      labelText.textContent = 'Use this page as context: "' + pageContext.title + '"';
    } else if (pageContext.category) {
      labelText.textContent = "Use this page as context";
    } else {
      labelText.textContent = "Use current page context";
    }

    wrapper.appendChild(checkbox);
    wrapper.appendChild(labelText);

    form.insertAdjacentElement("afterend", wrapper);
  }

  function buildSearchPayload(query) {
    var payload = { query: query };
    if (contextEnabled && pageContext) {
      payload.context = {
        path: pageContext.path,
        category: pageContext.category || undefined,
        index: pageContext.index || undefined,
        title: pageContext.title || undefined,
        enabled: true,
      };
    }
    return payload;
  }

  function runSearch(query) {
    if (!btn) return Promise.resolve();
    btn.disabled = true;
    showResult("search-loading", "Searching the archives...");

    return fetch("/dnd/5e/srd/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildSearchPayload(query)),
    })
      .then(function (res) {
        if (res.status === 429) {
          throw new Error(
            "Too many requests. Please wait a few minutes and try again.",
          );
        }
        if (!res.ok) throw new Error("Something went wrong. Please try again.");
        return res.json();
      })
      .then(function (data) {
        showResult("search-answer", data.answer);
      })
      .catch(function (err) {
        showResult("search-error", err.message);
      })
      .finally(function () {
        btn.disabled = false;
      });
  }

  ensureContextToggle();

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (modal && e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  if (modal) {
    openBtns.forEach(function (triggerBtn) {
      triggerBtn.addEventListener("click", function () {
        openModal();
      });
    });
  }

  if (modal && miniForm && miniInput) {
    miniForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var query = miniInput.value.trim();
      openModal(query);
      if (query.length >= 3) {
        runSearch(query);
      } else {
        showResult("search-error", "Please enter at least 3 characters.");
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var query = input.value.trim();
    if (query.length < 3) {
      showResult("search-error", "Please enter at least 3 characters.");
      return;
    }
    runSearch(query);
  });
})();
