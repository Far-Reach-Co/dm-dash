export function getCanvasSaveEndpoint(tableView) {
  return (
    tableView?.data_save_url ||
    (tableView?.id ? `/api/edit_table_view_data/${tableView.id}` : null)
  );
}

function sanitizeTextObjectForFabric(object) {
  if (!object || typeof object !== "object") return;

  const isTextType =
    object.type === "i-text" ||
    object.type === "textbox" ||
    object.type === "text";

  if (isTextType) {
    if (typeof object.text !== "string") {
      object.text = "";
    }
    if (!object.styles || typeof object.styles !== "object") {
      object.styles = {};
    }
  }

  if (Array.isArray(object.objects)) {
    object.objects.forEach((child) => sanitizeTextObjectForFabric(child));
  }
}

function sanitizeCanvasDataForFabric(data) {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data.objects)) {
    data.objects.forEach((object) => sanitizeTextObjectForFabric(object));
  }

  return data;
}

export async function saveCanvasState(canvasEngine, tableView, options = {}) {
  const { signal } = options;
  const saveEndpoint = getCanvasSaveEndpoint(tableView);
  if (!saveEndpoint || !canvasEngine) return null;

  const jsonCanvas = canvasEngine.toJSON();
  try {
    const res = await fetch(saveEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({ data: jsonCanvas }),
    });
    if (res.status === 200 || res.status === 201) {
      try {
        return await res.json();
      } catch (_err) {
        return {};
      }
    }
    throw new Error(`save failed with status ${res.status}`);
  } catch (err) {
    if (err?.name === "AbortError") {
      return null;
    }
    console.log(err);
    return null;
  }
}

export function loadCanvasFromData(canvasEngine, data, onObjectLoaded) {
  return new Promise((resolve) => {
    const sanitizedData = sanitizeCanvasDataForFabric(data);
    canvasEngine.loadFromJSON(sanitizedData, () => {
      canvasEngine.getObjects().forEach((object) => {
        onObjectLoaded?.(object);
      });
      canvasEngine.render();
      resolve();
    });
  });
}
