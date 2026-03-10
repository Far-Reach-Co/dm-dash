import modal from "../../components/modal.js";
import { apiDelete, apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";

function setCommunityMessage(elem, message, isError = false) {
  if (!elem) return;
  elem.textContent = message || "";
  elem.style.color = isError ? "var(--red)" : "var(--green)";
  if (message) {
    window.setTimeout(() => {
      if (elem.textContent === message) {
        elem.textContent = "";
      }
    }, 3000);
  }
}

function showCommunityError(elem, result, fallbackMessage) {
  const message = result?.error || fallbackMessage;
  setCommunityMessage(elem, message, true);
  handleApiFailure(result, {
    fallbackMessage,
    includeResultMessage: true,
  });
}

function openCreateThreadModal(projectId) {
  const container = document.createElement("div");
  container.className = "modal-form";

  const heading = document.createElement("h2");
  heading.textContent = "Create Discussion Thread";
  container.appendChild(heading);

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.className = "modal-form-input";
  titleInput.maxLength = 140;
  titleInput.placeholder = "Thread title";
  titleInput.required = true;
  container.appendChild(titleInput);

  const bodyInput = document.createElement("textarea");
  bodyInput.className = "modal-form-input";
  bodyInput.rows = 6;
  bodyInput.maxLength = 5000;
  bodyInput.placeholder = "Start the discussion...";
  bodyInput.required = true;
  container.appendChild(bodyInput);

  const messageElem = document.createElement("small");
  messageElem.className = "success-message";
  container.appendChild(messageElem);

  const submitButton = document.createElement("button");
  submitButton.type = "button";
  submitButton.className = "modal-form-button";
  submitButton.textContent = "Post Thread";
  submitButton.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();
    if (!title || !body) {
      setCommunityMessage(messageElem, "Title and content are required", true);
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Posting...";

    const result = await apiPost(
      `/api/add_project_discussion_thread/${projectId}`,
      { title, body },
    );

    if (!result.ok) {
      showCommunityError(messageElem, result, "Failed to create thread");
      submitButton.disabled = false;
      submitButton.textContent = "Post Thread";
      return;
    }

    const redirect =
      result?.data?.redirect || `/wyrld/community?id=${projectId}`;
    window.location.href = redirect;
  });
  container.appendChild(submitButton);

  modal.show(container);
  titleInput.focus();
}

async function confirmAction(message, options) {
  if (typeof window.customConfirm === "function") {
    return await window.customConfirm(message, options);
  }
  return window.confirm(message);
}

export default function mountCommunitySection({ projectId }) {
  if (!projectId) return;

  const openCreateThreadModalButton = document.getElementById(
    "community-open-create-modal",
  );
  const replyButton = document.getElementById("community-reply-submit");
  const replyMessageElem = document.getElementById("community-reply-msg");

  if (openCreateThreadModalButton) {
    openCreateThreadModalButton.addEventListener("click", (event) => {
      event.preventDefault();
      openCreateThreadModal(projectId);
    });
  }

  if (replyButton) {
    replyButton.addEventListener("click", async () => {
      const threadId = replyButton.dataset.threadId;
      const replyInput = document.getElementById("community-reply-content");
      const content = replyInput ? replyInput.value.trim() : "";
      if (!threadId) return;

      const result = await apiPost(`/api/add_project_discussion_post/${threadId}`, {
        content,
      });
      if (!result.ok) {
        showCommunityError(replyMessageElem, result, "Failed to post reply");
        return;
      }
      window.location.reload();
    });
  }

  window.openDiscussionThread = (threadId) => {
    if (!threadId) return;
    window.location.href = `/wyrld/community?id=${projectId}&thread=${threadId}`;
  };

  window.toggleDiscussionThreadLock = async (threadId) => {
    if (!threadId) return;
    const result = await apiPost(
      `/api/toggle_project_discussion_thread_lock/${threadId}`,
      {},
    );
    if (!result.ok) {
      handleApiFailure(result, {
        fallbackMessage: "Failed to update thread",
        includeResultMessage: true,
      });
      return;
    }
    window.location.reload();
  };

  window.deleteDiscussionThread = async (threadId) => {
    if (!threadId) return;
    const confirmed = await confirmAction(
      "Delete this discussion thread and all replies?",
      { confirmText: "Delete", danger: true },
    );
    if (!confirmed) return;

    const result = await apiDelete(
      `/api/remove_project_discussion_thread/${threadId}`,
    );
    if (!result.ok) {
      handleApiFailure(result, {
        fallbackMessage: "Failed to delete thread",
        includeResultMessage: true,
      });
      return;
    }

    window.location.href = `/wyrld/community?id=${projectId}`;
  };

  window.deleteDiscussionPost = async (postId) => {
    if (!postId) return;
    const confirmed = await confirmAction("Delete this reply?", {
      confirmText: "Delete",
      danger: true,
    });
    if (!confirmed) return;

    const result = await apiDelete(`/api/remove_project_discussion_post/${postId}`);
    if (!result.ok) {
      handleApiFailure(result, {
        fallbackMessage: "Failed to delete reply",
        includeResultMessage: true,
      });
      return;
    }

    window.location.reload();
  };
}
