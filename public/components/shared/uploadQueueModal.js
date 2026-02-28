import createElement from "../createElement.js";
import modal from "../modal.js";

function getUploadStats(items) {
  const total = items.length;
  const completed = items.filter((item) => item.status === "done").length;
  const failed = items.filter((item) => item.status === "failed").length;
  const cancelled = items.filter((item) => item.status === "cancelled").length;
  const inFlight = items.filter((item) => item.status === "uploading").length;
  const settled = completed + failed + cancelled;
  const pct = total ? Math.round((settled / total) * 100) : 0;
  return { total, completed, failed, cancelled, inFlight, pct };
}

function renderStatPills({ total, completed, failed, cancelled, inFlight }) {
  const pills = [
    { label: "Done", value: completed, tone: "done" },
    { label: "Failed", value: failed, tone: "failed" },
    { label: "Cancelled", value: cancelled, tone: "cancelled" },
    { label: "Uploading", value: inFlight, tone: "uploading" },
    { label: "Total", value: total, tone: "total" },
  ];

  return createElement(
    "div",
    { class: "library-upload-stats", "aria-live": "polite" },
    pills.map((pill) =>
      createElement(
        "span",
        { class: `library-upload-stat-pill tone-${pill.tone}` },
        `${pill.label}: ${pill.value}`,
      ),
    ),
  );
}

function renderQueueRows(items, emptyQueueText) {
  if (!items.length) {
    return [
      createElement("div", { class: "library-pack-empty" }, emptyQueueText),
    ];
  }

  return items.map((item) =>
    createElement("div", { class: "library-upload-item" }, [
      createElement("div", { class: "library-upload-item-name" }, item.file.name),
      createElement(
        "div",
        { class: `library-upload-item-status status-${item.status}` },
        item.status === "failed"
          ? `failed${item.error ? `: ${item.error}` : ""}`
          : item.status,
      ),
    ]),
  );
}

function renderNotice(renderContextNotice) {
  if (typeof renderContextNotice !== "function") {
    return createElement("div", { class: "d-none" });
  }
  const node = renderContextNotice();
  return node instanceof Node ? node : createElement("div", { class: "d-none" });
}

export function renderUploadQueueModal(config) {
  const {
    state,
    resetQueue,
    addFilesToQueue,
    retryFailedUploads,
    uploadFile,
    onUploadStart,
    onUploadSuccess,
    onUploadComplete,
    renderContextNotice,
    getMakeImageSmall,
    setMakeImageSmall,
    filesInputId,
    folderInputId,
    filesInputName = "image_files",
    folderInputName = "image_folder",
    title = "Upload Images",
    folderUploadHelpText = "Folder upload adds all image files found in that folder tree.",
    resizeOptionTitle =
      "If image width is larger than 100px this resizes the image width to 100px while maintaining aspect ratio.",
    emptyQueueText = "Add image files or a whole folder to begin.",
  } = config;

  resetQueue();
  let renderVersion = 0;

  const runQueue = async (renderModal) => {
    if (state.running) return;
    state.running = true;
    state.cancelling = false;
    renderModal();

    try {
      if (typeof onUploadStart === "function") {
        await onUploadStart();
      }

      for (const item of state.items) {
        if (state.cancelling) break;
        if (item.status !== "queued") continue;

        item.status = "uploading";
        renderModal();

        const controller = new AbortController();
        state.activeController = controller;

        try {
          const result = await uploadFile(item.file, controller.signal);
          if (!result) {
            item.status = "failed";
            item.error = "upload failed";
          } else {
            item.result = result;
            if (typeof onUploadSuccess === "function") {
              await onUploadSuccess(result, item);
            }
            item.status = "done";
          }
        } catch (err) {
          if (err?.name === "AbortError") {
            item.status = "cancelled";
            item.error = "cancelled";
          } else {
            item.status = "failed";
            item.error = "upload failed";
            console.log(err);
          }
        } finally {
          state.activeController = null;
          renderModal();
        }
      }
    } finally {
      state.running = false;
      if (typeof onUploadComplete === "function") {
        await onUploadComplete({ state, stats: getUploadStats(state.items) });
      }
      renderModal();
    }
  };

  const renderModal = () => {
    const version = ++renderVersion;
    const items = state.items;
    const stats = getUploadStats(items);
    const { total, pct } = stats;
    const queueRows = renderQueueRows(items, emptyQueueText);
    const makeImageSmall = !!getMakeImageSmall();
    const progressLabel = total ? `${pct}% complete` : "No files queued";

    const content = createElement("div", { class: "help-content library-upload-modal" }, [
      createElement("h1", {}, title),
      createElement("div", { class: "library-upload-intro" }, [
        renderNotice(renderContextNotice),
        createElement("small", { class: "modal-subtitle" }, folderUploadHelpText),
      ]),
      createElement("h2", {}, "Options"),
      createElement("div", { class: "library-upload-options-card" }, [
        createElement(
          "div",
          {
            class: "library-upload-option-row",
            title: resizeOptionTitle,
          },
          [
            createElement("small", { class: "library-upload-option-label" }, "Make image small (100px)"),
            createElement(
              "input",
              { type: "checkbox", ...(makeImageSmall ? { checked: true } : {}) },
              null,
              {
                type: "change",
                event: (e) => setMakeImageSmall(e.target.checked),
              },
            ),
          ],
        ),
      ]),
      createElement("div", { class: "library-upload-actions" }, [
        createElement(
          "input",
          {
            id: filesInputId,
            name: filesInputName,
            type: "file",
            accept: "image/*",
            class: "file-input-hidden",
            multiple: true,
          },
          null,
          {
            type: "change",
            event: async (e) => {
              await addFilesToQueue(e.target.files);
              e.target.value = "";
              if (version !== renderVersion) return;
              renderModal();
            },
          },
        ),
        createElement(
          "input",
          {
            id: folderInputId,
            name: folderInputName,
            type: "file",
            accept: "image/*",
            class: "file-input-hidden",
            multiple: true,
            webkitdirectory: "true",
            directory: "true",
          },
          null,
          {
            type: "change",
            event: async (e) => {
              await addFilesToQueue(e.target.files);
              e.target.value = "";
              if (version !== renderVersion) return;
              renderModal();
            },
          },
        ),
        createElement("div", { class: "library-upload-action-group pickers" }, [
          createElement(
            "label",
            {
              for: filesInputId,
              class: "label-btn library-upload-btn library-upload-picker-btn",
              title: "Choose image files",
            },
            "Choose Files",
          ),
          createElement(
            "label",
            {
              for: folderInputId,
              class: "label-btn library-upload-btn library-upload-picker-btn",
              title: "Choose a folder",
            },
            "Choose Folder",
          ),
        ]),
        createElement("div", { class: "library-upload-action-group controls" }, [
          createElement(
            "button",
            {
              class: "new-btn library-upload-btn library-upload-btn-start",
              type: "button",
              ...(state.running || !items.some((item) => item.status === "queued")
                ? { disabled: true }
                : {}),
            },
            "Start Upload",
            {
              type: "click",
              event: () => runQueue(renderModal),
            },
          ),
          createElement(
            "button",
            {
              class: "new-btn library-upload-btn library-upload-btn-cancel",
              type: "button",
              ...(!state.running ? { disabled: true } : {}),
            },
            "Cancel",
            {
              type: "click",
              event: () => {
                state.cancelling = true;
                if (state.activeController) state.activeController.abort();
                state.items = state.items.map((item) =>
                  item.status === "queued"
                    ? { ...item, status: "cancelled", error: "cancelled" }
                    : item,
                );
                renderModal();
              },
            },
          ),
          createElement(
            "button",
            {
              class: "new-btn library-upload-btn library-upload-btn-retry",
              type: "button",
              ...(state.running || !items.some((item) => item.status === "failed")
                ? { disabled: true }
                : {}),
            },
            "Retry Failed",
            {
              type: "click",
              event: () => {
                retryFailedUploads();
                renderModal();
              },
            },
          ),
          createElement(
            "button",
            {
              class: "new-btn library-upload-btn library-upload-btn-clear",
              type: "button",
              ...(state.running || !items.length ? { disabled: true } : {}),
            },
            "Clear Queue",
            {
              type: "click",
              event: () => {
                state.items = [];
                renderModal();
              },
            },
          ),
        ]),
      ]),
      createElement(
        "div",
        { class: "library-upload-progress-text" },
        progressLabel,
      ),
      renderStatPills(stats),
      createElement("div", { class: "library-upload-progress-bar" }, [
        createElement("div", {
          class: "library-upload-progress-fill",
          style: `width:${pct}%`,
        }),
      ]),
      createElement("div", { class: "library-upload-queue-wrap" }, [
        createElement("small", { class: "library-upload-queue-title" }, "Upload Queue"),
        createElement("div", { class: "library-upload-queue" }, queueRows),
      ]),
    ]);

    modal.show(content);
  };

  renderModal();
  return createElement("div");
}
