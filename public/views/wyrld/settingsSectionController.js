import { apiDelete, apiPost } from "../../lib/apiUtils.js";
import { handleApiFailure } from "../../lib/apiUiFeedback.js";

export default class WyrldSettingsSectionController {
  constructor(config) {
    this.config = config;
  }

  get projectId() {
    return this.config.projectId;
  }

  get projectTitle() {
    return this.config.projectTitle;
  }

  get projectIsPro() {
    return this.config.projectIsPro;
  }

  get defaultBannerAlt() {
    return this.config.defaultBannerAlt;
  }

  mount() {
    if (this.config.isOwner) {
      this.mountOwnerSettings();
      return;
    }

    this.mountMemberSettings();
  }

  getElement(id) {
    return document.getElementById(id);
  }

  resolveMessageElement(target) {
    if (!target) return null;
    return typeof target === "string" ? this.getElement(target) : target;
  }

  setMessage(target, message, isError = false) {
    const elem = this.resolveMessageElement(target);
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

  showApiError(target, result, fallbackMessage) {
    handleApiFailure(result, {
      fallbackMessage,
      includeResultMessage: true,
    });
    this.setMessage(target, result.error || fallbackMessage, true);
  }

  renderBannerPreview(src, altText) {
    const preview = this.getElement("settings-banner-preview");
    if (!preview) return;

    preview.textContent = "";
    if (src) {
      const img = document.createElement("img");
      img.id = "settings-banner-image";
      img.src = src;
      img.alt = altText || this.defaultBannerAlt;
      preview.appendChild(img);
    } else {
      const empty = document.createElement("small");
      empty.id = "settings-banner-empty";
      empty.textContent = "No banner selected.";
      preview.appendChild(empty);
    }

    const clearButton = this.getElement("settings-banner-clear");
    if (clearButton) {
      clearButton.disabled = !src;
    }
  }

  async postFormData(endpoint, formData) {
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

  async confirmAction(message, options) {
    if (typeof window.customConfirm === "function") {
      return await window.customConfirm(message, options);
    }

    return window.confirm(message);
  }

  async setProjectBanner(imageId) {
    const result = await apiPost(`/api/edit_project_banner_image/${this.projectId}`, {
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

  removeJoinRequestRow(requestId) {
    const row = this.getElement(`join-request-${requestId}`);
    if (row) row.remove();

    const requestList = this.getElement("settings-join-requests-list");
    if (!requestList) return;

    const remaining = requestList.querySelectorAll('[id^="join-request-"]');
    if (!remaining.length) {
      requestList.innerHTML = "<small>No pending join requests.</small>";
    }
  }

  async respondJoinRequest(requestId, action) {
    return await apiPost(`/api/respond_project_join_request/${requestId}`, {
      action,
    });
  }

  buildPublicSettingsPayload() {
    const publicListedElem = this.getElement("settings-public-listed");
    const joinModeElem = this.getElement("settings-public-join-mode");
    const capacityElem = this.getElement("settings-public-capacity");
    const featuredRecordElem = this.getElement("settings-featured-record-id");

    const capacityInput = capacityElem ? capacityElem.value.trim() : "";
    const featuredRecordIdValue = featuredRecordElem ? featuredRecordElem.value : "";

    return {
      is_public_listed: publicListedElem ? publicListedElem.checked : false,
      public_join_mode: joinModeElem ? joinModeElem.value : "invite_only",
      public_join_capacity: capacityInput ? Number(capacityInput) : null,
      featured_record_id: featuredRecordIdValue
        ? Number(featuredRecordIdValue)
        : null,
    };
  }

  mountOwnerSettings() {
    this.mountTitleControls();
    this.mountDescriptionControls();
    this.mountBannerControls();
    this.mountPublicSettingsControls();
    this.mountJoinRequestControls();
    this.mountUserManagementControls();
    this.mountDeleteControls();
  }

  mountTitleControls() {
    const titleSaveButton = this.getElement("settings-title-save");
    if (!titleSaveButton) return;

    titleSaveButton.addEventListener("click", async () => {
      const titleInput = this.getElement("settings-title-input");
      const title = titleInput ? titleInput.value.trim() : "";
      if (!title) return;

      const result = await apiPost(`/api/edit_project_title/${this.projectId}`, {
        title,
      });
      if (!result.ok) {
        this.showApiError(
          "settings-title-msg",
          result,
          "Error saving title",
        );
        return;
      }

      this.setMessage("settings-title-msg", "Saved");
    });
  }

  mountDescriptionControls() {
    const descriptionInput = this.getElement("settings-description-input");
    const descriptionCount = this.getElement("settings-description-count");

    if (descriptionInput && descriptionCount) {
      descriptionInput.addEventListener("input", () => {
        descriptionCount.textContent = `${descriptionInput.value.length}/1200`;
      });
    }

    const descriptionSaveButton = this.getElement("settings-description-save");
    if (!descriptionSaveButton) return;

    descriptionSaveButton.addEventListener("click", async () => {
      const description = descriptionInput ? descriptionInput.value.trim() : "";

      const result = await apiPost(
        `/api/edit_project_description/${this.projectId}`,
        { description },
      );
      if (!result.ok) {
        this.showApiError(
          "settings-description-msg",
          result,
          "Error saving description",
        );
        return;
      }

      this.setMessage("settings-description-msg", "Saved");
    });
  }

  mountBannerControls() {
    if (!this.projectIsPro) return;

    const bannerUploadInput = this.getElement("settings-banner-upload");
    const bannerClearButton = this.getElement("settings-banner-clear");

    if (bannerUploadInput) {
      bannerUploadInput.addEventListener("change", async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) return;

        bannerUploadInput.disabled = true;
        if (bannerClearButton) {
          bannerClearButton.disabled = true;
        }
        this.setMessage("settings-banner-msg", "Uploading banner...");

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bucket_name", "wyrld");
          formData.append("folder_name", "images");
          formData.append("project_id", this.projectId);

          const uploadResult = await this.postFormData(
            "/api/new_image_for_project",
            formData,
          );
          if (!uploadResult.ok || !uploadResult.data) {
            this.showApiError(
              "settings-banner-msg",
              uploadResult,
              "Banner upload failed",
            );
            return;
          }

          const uploadData = uploadResult.data;
          const linkResult = await apiPost("/api/add_table_image_by_project", {
            project_id: this.projectId,
            image_id: uploadData.id,
            folder_id: null,
          });

          if (!linkResult.ok) {
            this.showApiError(
              "settings-banner-msg",
              linkResult,
              "Failed to link uploaded image to this wyrld",
            );
            return;
          }

          const bannerData = await this.setProjectBanner(uploadData.id);
          if (!bannerData) return;

          this.renderBannerPreview(
            bannerData.src || uploadData.src || null,
            bannerData.original_name ||
              uploadData.original_name ||
              this.defaultBannerAlt,
          );
          this.setMessage("settings-banner-msg", "Banner updated");
        } finally {
          bannerUploadInput.disabled = false;
          bannerUploadInput.value = "";
          if (bannerClearButton && this.getElement("settings-banner-image")) {
            bannerClearButton.disabled = false;
          }
        }
      });
    }

    if (!bannerClearButton) return;

    bannerClearButton.addEventListener("click", async () => {
      if (bannerClearButton.disabled) return;

      bannerClearButton.disabled = true;
      const bannerData = await this.setProjectBanner(null);
      if (!bannerData) {
        bannerClearButton.disabled = false;
        return;
      }

      this.renderBannerPreview(null, null);
      this.setMessage("settings-banner-msg", "Banner removed");
    });
  }

  mountPublicSettingsControls() {
    const savePublicSettingsBtn = this.getElement("settings-public-save");
    if (!savePublicSettingsBtn) return;

    savePublicSettingsBtn.addEventListener("click", async () => {
      const result = await apiPost(
        `/api/edit_project_public_settings/${this.projectId}`,
        this.buildPublicSettingsPayload(),
      );

      if (!result.ok) {
        this.showApiError(
          "settings-public-msg",
          result,
          "Failed to save public settings",
        );
        return;
      }

      this.setMessage("settings-public-msg", "Saved");
    });
  }

  mountJoinRequestControls() {
    document.querySelectorAll(".settings-join-approve").forEach((button) => {
      button.addEventListener("click", async () => {
        const requestId = button.dataset.id;
        if (!requestId) return;

        const result = await this.respondJoinRequest(requestId, "approve");
        if (!result.ok) {
          this.showApiError(
            "settings-join-msg",
            result,
            "Failed to approve request",
          );
          return;
        }

        this.removeJoinRequestRow(requestId);
        this.setMessage("settings-join-msg", "Request approved");
      });
    });

    document.querySelectorAll(".settings-join-reject").forEach((button) => {
      button.addEventListener("click", async () => {
        const requestId = button.dataset.id;
        if (!requestId) return;

        const result = await this.respondJoinRequest(requestId, "reject");
        if (!result.ok) {
          this.showApiError(
            "settings-join-msg",
            result,
            "Failed to reject request",
          );
          return;
        }

        this.removeJoinRequestRow(requestId);
        this.setMessage("settings-join-msg", "Request rejected");
      });
    });
  }

  mountUserManagementControls() {
    document.querySelectorAll(".settings-editor-toggle").forEach((checkbox) => {
      checkbox.addEventListener("change", async () => {
        const id = checkbox.dataset.id;
        if (!id) return;

        const desiredValue = checkbox.checked;
        const result = await apiPost(`/api/edit_project_user_is_editor/${id}`, {
          is_editor: desiredValue,
        });

        if (!result.ok) {
          handleApiFailure(result, {
            fallbackMessage: "Failed to update manager access",
            includeResultMessage: true,
          });
          checkbox.checked = !desiredValue;
        }
      });
    });

    document
      .querySelectorAll(".settings-remove-btn[data-id]")
      .forEach((button) => {
        button.addEventListener("click", async () => {
          const id = button.dataset.id;
          const name = button.dataset.name || "this user";
          if (!id) return;

          const confirmed = await this.confirmAction(
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

          const row = this.getElement(`settings-user-${id}`);
          if (row) row.remove();

          const usersList = this.getElement("settings-users-list");
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
  }

  mountDeleteControls() {
    const deleteWyrldButton = this.getElement("settings-delete-wyrld");
    if (!deleteWyrldButton) return;

    deleteWyrldButton.addEventListener("click", async () => {
      const confirmed = await this.confirmAction(
        `Are you sure you want to delete ${this.projectTitle}? This cannot be undone.`,
        { confirmText: "Delete Wyrld", danger: true },
      );
      if (!confirmed) return;

      const result = await apiDelete(`/api/remove_project/${this.projectId}`);
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

  mountMemberSettings() {
    const leaveButton = this.getElement("settings-leave-wyrld");
    const leaveMessage = this.getElement("settings-leave-msg");
    if (!leaveButton || !leaveMessage) return;

    leaveButton.addEventListener("click", async () => {
      const confirmed = await this.confirmAction(
        `Leave ${this.projectTitle}? You will lose access to this wyrld.`,
        { confirmText: "Leave Wyrld", danger: true },
      );
      if (!confirmed) return;

      leaveButton.disabled = true;
      this.setMessage(leaveMessage, "Leaving wyrld...");

      const result = await apiPost(`/api/leave_project/${this.projectId}`, {});
      if (!result.ok) {
        handleApiFailure(result, {
          fallbackMessage: "Failed to leave wyrld",
          includeResultMessage: true,
        });
        this.setMessage(
          leaveMessage,
          result.error || "Failed to leave wyrld",
          true,
        );
        leaveButton.disabled = false;
        return;
      }

      const redirect = result?.data?.redirect || "/dash/wyrlds";
      window.location.href = redirect;
    });
  }
}
