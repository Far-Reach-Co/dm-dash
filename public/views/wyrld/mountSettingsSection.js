import { apiDelete, apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";

function setSettingsMessage(elemId, message, isError = false) {
  const msg = document.getElementById(elemId);
  if (!msg) return;
  msg.textContent = message || "";
  msg.style.color = isError ? "var(--red)" : "var(--green)";
  if (message) {
    window.setTimeout(() => {
      if (msg.textContent === message) {
        msg.textContent = "";
      }
    }, 3000);
  }
}

function renderBannerPreview(src, altText, defaultBannerAlt) {
  const preview = document.getElementById("settings-banner-preview");
  if (!preview) return;

  preview.textContent = "";
  if (src) {
    const img = document.createElement("img");
    img.id = "settings-banner-image";
    img.src = src;
    img.alt = altText || defaultBannerAlt;
    preview.appendChild(img);
  } else {
    const empty = document.createElement("small");
    empty.id = "settings-banner-empty";
    empty.textContent = "No banner selected.";
    preview.appendChild(empty);
  }

  const clearButton = document.getElementById("settings-banner-clear");
  if (clearButton) {
    clearButton.disabled = !src;
  }
}

async function postFormData(endpoint, formData) {
  try {
    const res = await fetch(endpoint, { method: "POST", body: formData });
    const data = await res.json().catch(() => null);
    if (res.ok && data && !data.error) {
      return {
        ok: true,
        status: res.status,
        data,
        error: null,
        code: null,
      };
    }
    const message = data?.error?.message || "Request failed";
    return {
      ok: false,
      status: res.status,
      data,
      error: message,
      code: data?.error?.code || data?.error?.message || null,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || "Network request failed",
      code: "NETWORK_ERROR",
    };
  }
}

async function confirmAction(message, options) {
  if (typeof window.customConfirm === "function") {
    return await window.customConfirm(message, options);
  }
  return window.confirm(message);
}

function mountOwnerSettings({
  projectId,
  projectTitle,
  projectIsPro,
  defaultBannerAlt,
}) {
  const titleSaveButton = document.getElementById("settings-title-save");
  if (titleSaveButton) {
    titleSaveButton.addEventListener("click", async () => {
      const titleInput = document.getElementById("settings-title-input");
      const title = titleInput ? titleInput.value.trim() : "";
      if (!title) return;

      const result = await apiPost(`/api/edit_project_title/${projectId}`, { title });
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Error saving title",
          includeResultMessage: true,
        });
        setSettingsMessage(
          "settings-title-msg",
          result.error || "Error saving title",
          true,
        );
        return;
      }
      setSettingsMessage("settings-title-msg", "Saved", false);
    });
  }

  const settingsDescriptionInput = document.getElementById(
    "settings-description-input",
  );
  const settingsDescriptionCount = document.getElementById(
    "settings-description-count",
  );
  if (settingsDescriptionInput && settingsDescriptionCount) {
    settingsDescriptionInput.addEventListener("input", () => {
      settingsDescriptionCount.textContent =
        `${settingsDescriptionInput.value.length}/1200`;
    });
  }

  const descriptionSaveButton = document.getElementById("settings-description-save");
  if (descriptionSaveButton) {
    descriptionSaveButton.addEventListener("click", async () => {
      const descriptionInput = document.getElementById("settings-description-input");
      const description = descriptionInput ? descriptionInput.value.trim() : "";

      const result = await apiPost(`/api/edit_project_description/${projectId}`, {
        description,
      });
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Error saving description",
          includeResultMessage: true,
        });
        setSettingsMessage(
          "settings-description-msg",
          result.error || "Error saving description",
          true,
        );
        return;
      }
      setSettingsMessage("settings-description-msg", "Saved", false);
    });
  }

  if (projectIsPro) {
    const bannerUploadInput = document.getElementById("settings-banner-upload");
    const bannerClearButton = document.getElementById("settings-banner-clear");

    async function setProjectBanner(imageId) {
      const result = await apiPost(`/api/edit_project_banner_image/${projectId}`, {
        image_id: imageId,
      });
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to save banner image",
          includeResultMessage: true,
        });
        return null;
      }
      return result.data;
    }

    if (bannerUploadInput) {
      bannerUploadInput.addEventListener("change", async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        bannerUploadInput.disabled = true;
        if (bannerClearButton) {
          bannerClearButton.disabled = true;
        }
        setSettingsMessage("settings-banner-msg", "Uploading banner...", false);

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bucket_name", "wyrld");
          formData.append("folder_name", "images");
          formData.append("project_id", projectId);

          const uploadResult = await postFormData(
            "/api/new_image_for_project",
            formData,
          );
          if (!uploadResult.ok || !uploadResult.data) {
            handleApiFailure(uploadResult, {
              fallbackMessage: "Banner upload failed",
              includeResultMessage: true,
            });
            setSettingsMessage(
              "settings-banner-msg",
              uploadResult.error || "Banner upload failed",
              true,
            );
            return;
          }
          const uploadData = uploadResult.data;

          const linkResult = await apiPost("/api/add_table_image_by_project", {
            project_id: projectId,
            image_id: uploadData.id,
            folder_id: null,
          });
          if (!linkResult.ok) {
            handleApiFailure(linkResult, {
              fallbackMessage: "Failed to link uploaded image to this wyrld",
              includeResultMessage: true,
            });
            setSettingsMessage(
              "settings-banner-msg",
              linkResult.error || "Failed to link uploaded image to this wyrld",
              true,
            );
            return;
          }

          const bannerData = await setProjectBanner(uploadData.id);
          if (!bannerData) return;

          renderBannerPreview(
            bannerData.src || uploadData.src || null,
            bannerData.original_name ||
              uploadData.original_name ||
              defaultBannerAlt,
            defaultBannerAlt,
          );
          setSettingsMessage("settings-banner-msg", "Banner updated", false);
        } finally {
          bannerUploadInput.disabled = false;
          bannerUploadInput.value = "";
          if (bannerClearButton && document.getElementById("settings-banner-image")) {
            bannerClearButton.disabled = false;
          }
        }
      });
    }

    if (bannerClearButton) {
      bannerClearButton.addEventListener("click", async () => {
        if (bannerClearButton.disabled) return;

        bannerClearButton.disabled = true;
        const bannerData = await setProjectBanner(null);
        if (!bannerData) {
          bannerClearButton.disabled = false;
          return;
        }

        renderBannerPreview(null, null, defaultBannerAlt);
        setSettingsMessage("settings-banner-msg", "Banner removed", false);
      });
    }
  }

  const savePublicSettingsBtn = document.getElementById("settings-public-save");
  if (savePublicSettingsBtn) {
    savePublicSettingsBtn.addEventListener("click", async () => {
      const publicListedElem = document.getElementById("settings-public-listed");
      const joinModeElem = document.getElementById("settings-public-join-mode");
      const capacityElem = document.getElementById("settings-public-capacity");
      const featuredRecordElem = document.getElementById("settings-featured-record-id");

      const capacityInput = capacityElem ? capacityElem.value.trim() : "";
      const featuredRecordIdValue = featuredRecordElem ? featuredRecordElem.value : "";
      const payload = {
        is_public_listed: publicListedElem ? publicListedElem.checked : false,
        public_join_mode: joinModeElem ? joinModeElem.value : "invite_only",
        public_join_capacity: capacityInput ? Number(capacityInput) : null,
        featured_record_id: featuredRecordIdValue
          ? Number(featuredRecordIdValue)
          : null,
      };

      const result = await apiPost(
        `/api/edit_project_public_settings/${projectId}`,
        payload,
      );
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to save public settings",
          includeResultMessage: true,
        });
        setSettingsMessage(
          "settings-public-msg",
          result.error || "Error saving public settings",
          true,
        );
        return;
      }
      setSettingsMessage("settings-public-msg", "Saved", false);
    });
  }

  function removeJoinRequestRow(requestId) {
    const row = document.getElementById(`join-request-${requestId}`);
    if (row) row.remove();

    const requestList = document.getElementById("settings-join-requests-list");
    if (!requestList) return;

    const remaining = requestList.querySelectorAll('[id^="join-request-"]');
    if (!remaining.length) {
      requestList.innerHTML = "<small>No pending join requests.</small>";
    }
  }

  async function respondJoinRequest(requestId, action) {
    return await apiPost(`/api/respond_project_join_request/${requestId}`, {
      action,
    });
  }

  document.querySelectorAll(".settings-join-approve").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const requestId = btn.dataset.id;
      if (!requestId) return;

      const result = await respondJoinRequest(requestId, "approve");
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to approve request",
          includeResultMessage: true,
        });
        setSettingsMessage(
          "settings-join-msg",
          result.error || "Failed to approve request",
          true,
        );
        return;
      }

      removeJoinRequestRow(requestId);
      setSettingsMessage("settings-join-msg", "Request approved", false);
    });
  });

  document.querySelectorAll(".settings-join-reject").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const requestId = btn.dataset.id;
      if (!requestId) return;

      const result = await respondJoinRequest(requestId, "reject");
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to reject request",
          includeResultMessage: true,
        });
        setSettingsMessage(
          "settings-join-msg",
          result.error || "Failed to reject request",
          true,
        );
        return;
      }

      removeJoinRequestRow(requestId);
      setSettingsMessage("settings-join-msg", "Request rejected", false);
    });
  });

  document.querySelectorAll(".settings-editor-toggle").forEach((cb) => {
    cb.addEventListener("change", async () => {
      const id = cb.dataset.id;
      if (!id) return;

      const desiredValue = cb.checked;
      const result = await apiPost(`/api/edit_project_user_is_editor/${id}`, {
        is_editor: desiredValue,
      });
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to update manager access",
          includeResultMessage: true,
        });
        cb.checked = !desiredValue;
      }
    });
  });

  document.querySelectorAll(".settings-remove-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name || "this user";
      if (!id) return;

      const confirmed = await confirmAction(
        `Are you sure you want to remove ${name}?`,
        { confirmText: "Remove", danger: true },
      );
      if (!confirmed) return;

      const result = await apiDelete(`/api/remove_project_user/${id}`);
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to remove user",
          includeResultMessage: true,
        });
        return;
      }

      const row = document.getElementById(`settings-user-${id}`);
      if (row) row.remove();

      const usersList = document.getElementById("settings-users-list");
      if (!usersList) return;

      const remainingUsers = usersList.querySelectorAll(".settings-user-row");
      if (!remainingUsers.length) {
        usersList.textContent = "";
        const empty = document.createElement("small");
        empty.textContent = "No users have joined yet...";
        usersList.appendChild(empty);
      }
    });
  });

  const deleteWyrldButton = document.getElementById("settings-delete-wyrld");
  if (deleteWyrldButton) {
    deleteWyrldButton.addEventListener("click", async () => {
      const confirmed = await confirmAction(
        `Are you sure you want to delete ${projectTitle}? This cannot be undone.`,
        { confirmText: "Delete Wyrld", danger: true },
      );
      if (!confirmed) return;

      const result = await apiDelete(`/api/remove_project/${projectId}`);
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to delete wyrld",
          includeResultMessage: true,
        });
        return;
      }

      const redirect = result?.data?.redirect || "/dash";
      window.location.href = redirect;
    });
  }
}

function mountMemberSettings({ projectId, projectTitle }) {
  const leaveButton = document.getElementById("settings-leave-wyrld");
  const leaveMessage = document.getElementById("settings-leave-msg");
  if (!leaveButton || !leaveMessage) return;

  function setLeaveMessage(message, isError = false) {
    leaveMessage.textContent = message || "";
    leaveMessage.style.color = isError ? "var(--red)" : "var(--green)";
  }

  leaveButton.addEventListener("click", async () => {
    const confirmed = await confirmAction(
      `Leave ${projectTitle}? You will lose access to this wyrld.`,
      { confirmText: "Leave Wyrld", danger: true },
    );
    if (!confirmed) return;

    leaveButton.disabled = true;
    setLeaveMessage("Leaving wyrld...", false);

    const result = await apiPost(`/api/leave_project/${projectId}`, {});
    if (!result.ok) {
      handleApiFailure(result, {
        fallbackMessage: "Failed to leave wyrld",
        includeResultMessage: true,
      });
      setLeaveMessage(result.error || "Failed to leave wyrld", true);
      leaveButton.disabled = false;
      return;
    }

    const redirect = result?.data?.redirect || "/dash/wyrlds";
    window.location.href = redirect;
  });
}

export default function mountSettingsSection(config) {
  if (config.isOwner) {
    mountOwnerSettings(config);
    return;
  }
  mountMemberSettings(config);
}
