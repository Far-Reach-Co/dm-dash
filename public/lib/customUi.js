(function initCustomUi(global) {
  var TOAST_DURATION_MS = 4000;
  var toastTimer = null;
  var activeConfirm = null;

  function createElement(tagName, attributes, text) {
    var node = document.createElement(tagName);
    if (attributes && typeof attributes === "object") {
      Object.keys(attributes).forEach(function (key) {
        node.setAttribute(key, attributes[key]);
      });
    }
    if (typeof text === "string") {
      node.textContent = text;
    }
    return node;
  }

  function ensureToastRoot() {
    var root = document.getElementById("toast-custom");
    if (root) return root;
    root = createElement("div", { id: "toast-custom", "aria-live": "polite" });
    document.body.appendChild(root);
    return root;
  }

  function hideToast() {
    var root = document.getElementById("toast-custom");
    if (!root) return;
    clearTimeout(toastTimer);
    toastTimer = null;
    root.classList.remove("visible");
  }

  function showToast(message, isError) {
    var root = ensureToastRoot();
    root.innerHTML = "";

    var toastClass = "toast-custom" + (isError ? " toast-error" : "");
    var content = createElement("div", { class: toastClass }, String(message || ""));
    root.appendChild(content);
    root.classList.add("visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, TOAST_DURATION_MS);
  }

  function ensureConfirmRoot() {
    var root = document.getElementById("confirm-custom");
    if (root) {
      return {
        root: root,
        content: document.getElementById("confirm-custom-content"),
        close: document.getElementById("confirm-custom-close"),
      };
    }

    root = createElement("div", {
      id: "confirm-custom",
      class: "modal-custom custom-confirm-modal",
      "aria-hidden": "true",
    });

    var container = createElement("div", {
      class: "modal-custom-container custom-confirm-container",
    });

    var close = createElement(
      "div",
      {
        id: "confirm-custom-close",
        class: "close-custom-modal",
        role: "button",
        tabindex: "0",
        "aria-label": "Close confirmation dialog",
      },
      "x",
    );

    var content = createElement("div", {
      id: "confirm-custom-content",
      class: "modal-custom-content",
    });

    container.appendChild(close);
    container.appendChild(content);
    root.appendChild(container);
    document.body.appendChild(root);

    return { root: root, content: content, close: close };
  }

  function closeConfirm(result) {
    if (!activeConfirm) return;
    var state = activeConfirm;
    activeConfirm = null;

    state.root.classList.remove("visible");
    state.root.setAttribute("aria-hidden", "true");

    state.confirmButton.removeEventListener("click", state.onConfirm);
    state.cancelButton.removeEventListener("click", state.onCancel);
    state.root.removeEventListener("click", state.onOverlayClick);
    state.close.removeEventListener("click", state.onCloseClick);
    state.close.removeEventListener("keydown", state.onCloseKeyDown);
    document.removeEventListener("keydown", state.onEscapeKey);

    state.resolve(Boolean(result));
  }

  function showConfirm(message, options) {
    if (activeConfirm) {
      closeConfirm(false);
    }

    var config = options || {};
    var title = typeof config.title === "string" ? config.title : "Please confirm";
    var confirmText =
      typeof config.confirmText === "string" ? config.confirmText : "Confirm";
    var cancelText =
      typeof config.cancelText === "string" ? config.cancelText : "Cancel";
    var isDanger = Boolean(config.danger);

    var nodes = ensureConfirmRoot();
    nodes.content.innerHTML = "";

    var dialog = createElement("div", {
      class: "modal-pro-warning-container custom-confirm-dialog",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title,
    });
    dialog.appendChild(createElement("h2", {}, title));
    dialog.appendChild(
      createElement("p", { class: "custom-confirm-message" }, String(message || "")),
    );

    var actions = createElement("div", { class: "custom-confirm-actions" });
    var cancelButton = createElement(
      "button",
      { type: "button", class: "custom-confirm-btn" },
      cancelText,
    );
    var confirmClass = isDanger
      ? "custom-confirm-btn btn-red"
      : "custom-confirm-btn modal-form-button";
    var confirmButton = createElement(
      "button",
      { type: "button", class: confirmClass },
      confirmText,
    );
    actions.appendChild(cancelButton);
    actions.appendChild(confirmButton);
    dialog.appendChild(actions);
    nodes.content.appendChild(dialog);

    nodes.root.classList.add("visible");
    nodes.root.setAttribute("aria-hidden", "false");

    return new Promise(function (resolve) {
      var onConfirm = function () {
        closeConfirm(true);
      };
      var onCancel = function () {
        closeConfirm(false);
      };
      var onOverlayClick = function (event) {
        if (event.target === nodes.root) {
          closeConfirm(false);
        }
      };
      var onCloseClick = function () {
        closeConfirm(false);
      };
      var onCloseKeyDown = function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          closeConfirm(false);
        }
      };
      var onEscapeKey = function (event) {
        if (event.key === "Escape") {
          closeConfirm(false);
        }
      };

      activeConfirm = {
        resolve: resolve,
        root: nodes.root,
        close: nodes.close,
        confirmButton: confirmButton,
        cancelButton: cancelButton,
        onConfirm: onConfirm,
        onCancel: onCancel,
        onOverlayClick: onOverlayClick,
        onCloseClick: onCloseClick,
        onCloseKeyDown: onCloseKeyDown,
        onEscapeKey: onEscapeKey,
      };

      confirmButton.addEventListener("click", onConfirm);
      cancelButton.addEventListener("click", onCancel);
      nodes.root.addEventListener("click", onOverlayClick);
      nodes.close.addEventListener("click", onCloseClick);
      nodes.close.addEventListener("keydown", onCloseKeyDown);
      document.addEventListener("keydown", onEscapeKey);

      setTimeout(function () {
        confirmButton.focus();
      }, 0);
    });
  }

  var api = {
    alert: function (message) {
      showToast(message, false);
    },
    alertError: function (message) {
      showToast(message, true);
    },
    confirm: function (message, options) {
      return showConfirm(message, options);
    },
  };

  global.customUI = api;
  global.customAlert = api.alert;
  global.customAlertError = api.alertError;
  global.customConfirm = api.confirm;

  function bindHtmxConfirm() {
    if (!document.body || document.body.dataset.customHtmxConfirmBound === "1") {
      return;
    }
    document.body.dataset.customHtmxConfirmBound = "1";
    document.body.addEventListener("htmx:confirm", function (event) {
      if (!event || !event.detail || !event.detail.issueRequest) return;
      if (!event.detail.question) return;
      event.preventDefault();
      showConfirm(event.detail.question, { confirmText: "Confirm" }).then(
        function (confirmed) {
          if (confirmed) {
            event.detail.issueRequest(true);
          }
        },
      );
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindHtmxConfirm);
  } else {
    bindHtmxConfirm();
  }
})(window);
