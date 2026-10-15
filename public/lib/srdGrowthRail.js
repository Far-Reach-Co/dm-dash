(function () {
  var rail = document.querySelector(".srd-growth-rail");
  var reopenButton = document.querySelector("[data-show-srd-tools]");
  if (!rail || !reopenButton) return;

  var cards = Array.prototype.slice.call(rail.querySelectorAll("[data-srd-tool]"));
  var storagePrefix = "srd-tool-dismissed:";

  function isDismissed(tool) {
    try {
      return window.localStorage.getItem(storagePrefix + tool) === "1";
    } catch (_error) {
      return false;
    }
  }

  function setDismissed(tool, dismissed) {
    try {
      if (dismissed) window.localStorage.setItem(storagePrefix + tool, "1");
      else window.localStorage.removeItem(storagePrefix + tool);
    } catch (_error) {
      // The controls still work for the current page when storage is unavailable.
    }
  }

  function updateVisibility() {
    var visibleCount = 0;
    var dismissedCount = 0;
    cards.forEach(function (card) {
      if (card.hidden) dismissedCount++;
      else visibleCount++;
    });
    rail.hidden = visibleCount === 0;
    reopenButton.hidden = dismissedCount === 0;
  }

  cards.forEach(function (card) {
    var tool = card.getAttribute("data-srd-tool");
    card.hidden = isDismissed(tool);
    var closeButton = card.querySelector("[data-dismiss-srd-tool]");
    if (!closeButton) return;
    closeButton.addEventListener("click", function () {
      card.hidden = true;
      setDismissed(tool, true);
      updateVisibility();
    });
  });

  reopenButton.addEventListener("click", function () {
    cards.forEach(function (card) {
      card.hidden = false;
      setDismissed(card.getAttribute("data-srd-tool"), false);
    });
    updateVisibility();
  });

  updateVisibility();
})();
