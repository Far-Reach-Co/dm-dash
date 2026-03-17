(function () {
  function setFeedback(feedbackEl, message, isError) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message || "";
    feedbackEl.classList.toggle("is-error", Boolean(isError));
    feedbackEl.classList.toggle("is-success", !isError && Boolean(message));
  }

  function isInternalAdminRedirect(value) {
    if (!value) return false;
    try {
      const parsed = new URL(value, window.location.origin);
      return (
        parsed.origin === window.location.origin &&
        parsed.pathname === "/admin/affiliates"
      );
    } catch {
      return false;
    }
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      return;
    }

    const fallbackInput = document.createElement("textarea");
    fallbackInput.value = text;
    fallbackInput.setAttribute("readonly", "readonly");
    fallbackInput.style.position = "fixed";
    fallbackInput.style.opacity = "0";
    document.body.appendChild(fallbackInput);
    fallbackInput.focus();
    fallbackInput.select();
    document.execCommand("copy");
    document.body.removeChild(fallbackInput);
  }

  async function readErrorMessage(response) {
    try {
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = await response.json();
        const message =
          payload &&
          typeof payload === "object" &&
          payload.error &&
          typeof payload.error === "object" &&
          typeof payload.error.message === "string"
            ? payload.error.message.trim()
            : "";
        if (message) return message;
      }

      const text = (await response.text()).trim();
      return text;
    } catch {
      return "";
    }
  }

  async function handleConnectLinkFormSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    const card = form.closest(".affiliate-admin-item");
    const panel = card?.querySelector("[data-connect-link-panel]");
    const input = panel?.querySelector("[data-connect-link-input]");
    const openLink = panel?.querySelector("[data-connect-link-open]");
    const feedback = panel?.querySelector("[data-connect-link-feedback]");
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton?.textContent || "Generate Onboarding Link";

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Generating...";
    }
    setFeedback(feedback, "", false);

    try {
      const formData = new FormData(form);
      const requestBody = new URLSearchParams();
      formData.forEach((value, key) => {
        if (typeof value === "string") {
          requestBody.append(key, value);
        }
      });

      const response = await fetch(form.action, {
        method: "POST",
        body: requestBody,
        headers: {
          "HX-Request": "true",
        },
        credentials: "same-origin",
      });

      if (!response.ok) {
        const message = await readErrorMessage(response);
        throw new Error(message || "Failed to generate onboarding link.");
      }

      const redirectTarget = response.headers.get("HX-Redirect") || "";
      if (!redirectTarget) {
        throw new Error("Missing onboarding redirect URL.");
      }

      if (isInternalAdminRedirect(redirectTarget)) {
        window.location.assign(redirectTarget);
        return;
      }

      if (!(input instanceof HTMLInputElement)) {
        throw new Error("Unable to render onboarding link.");
      }

      if (!(openLink instanceof HTMLAnchorElement)) {
        throw new Error("Unable to render onboarding link.");
      }

      panel.hidden = false;
      input.value = redirectTarget;
      openLink.href = redirectTarget;
      setFeedback(
        feedback,
        "Link generated. Stripe links expire, so regenerate if needed.",
        false,
      );
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Unable to generate onboarding link right now.";
      if (panel) panel.hidden = false;
      setFeedback(feedback, message, true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  }

  function attachCopyHandler(panel) {
    const input = panel.querySelector("[data-connect-link-input]");
    const copyButton = panel.querySelector("[data-connect-link-copy]");
    const feedback = panel.querySelector("[data-connect-link-feedback]");

    if (!(input instanceof HTMLInputElement)) return;
    if (!(copyButton instanceof HTMLButtonElement)) return;

    copyButton.addEventListener("click", async () => {
      const value = input.value.trim();
      if (!value) {
        setFeedback(feedback, "Generate a link before copying.", true);
        return;
      }

      try {
        await copyToClipboard(value);
        setFeedback(feedback, "Copied onboarding link.", false);
      } catch {
        setFeedback(feedback, "Could not copy automatically. Copy the field manually.", true);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const forms = document.querySelectorAll("[data-connect-link-form]");
    forms.forEach((form) => {
      form.addEventListener("submit", handleConnectLinkFormSubmit);
      const panel = form
        .closest(".affiliate-admin-item")
        ?.querySelector("[data-connect-link-panel]");
      if (panel) attachCopyHandler(panel);
    });
  });
})();
