(function () {
  var form = document.getElementById("srd-search-form");
  var input = document.getElementById("srd-search-input");
  var results = document.getElementById("srd-search-results");
  var btn = form.querySelector("button");

  function showResult(className, text) {
    results.textContent = "";
    var div = document.createElement("div");
    div.className = className;

    // Render markdown for search answers; sanitized with DOMPurify to prevent XSS
    if (className === "search-answer" && typeof marked !== "undefined" && typeof DOMPurify !== "undefined") {
      div.innerHTML = DOMPurify.sanitize(marked.parse(text));
    } else {
      div.textContent = text;
    }

    results.appendChild(div);

    if (className === "search-answer") {
      var clearBtn = document.createElement("button");
      clearBtn.className = "search-clear-btn";
      clearBtn.textContent = "Clear";
      clearBtn.addEventListener("click", function () {
        results.textContent = "";
        input.value = "";
        input.focus();
      });
      results.appendChild(clearBtn);
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var query = input.value.trim();
    if (query.length < 3) {
      showResult("search-error", "Please enter at least 3 characters.");
      return;
    }

    btn.disabled = true;
    showResult("search-loading", "Searching the archives...");

    fetch("/dnd/5e/srd/search", {
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
  });
})();
