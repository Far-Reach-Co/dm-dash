export function getCanvasSaveEndpoint(tableView) {
  return (
    tableView?.data_save_url ||
    (tableView?.id ? `/api/edit_table_view_data/${tableView.id}` : null)
  );
}

export async function saveCanvasState(canvas, tableView) {
  const saveEndpoint = getCanvasSaveEndpoint(tableView);
  if (!saveEndpoint || !canvas) return null;

  const jsonCanvas = canvas.toJSON();
  try {
    const res = await fetch(saveEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    console.log(err);
    return null;
  }
}

export function loadCanvasFromData(canvas, data, onObjectLoaded) {
  return new Promise((resolve) => {
    canvas.loadFromJSON(data, () => {
      canvas.getObjects().forEach((object) => {
        onObjectLoaded?.(object);
      });
      canvas.renderAll();
      resolve();
    });
  });
}
