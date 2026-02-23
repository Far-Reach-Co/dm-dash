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

  function runSearch(query) {
    if (!btn) return Promise.resolve();
    btn.disabled = true;
    showResult("search-loading", "Searching the archives...");

    return fetch("/dnd/5e/srd/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: query }),
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
