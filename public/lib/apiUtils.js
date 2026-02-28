function parseJsonSafe(res) {
  return res.json().catch(() => null);
}

function readMessage(data, fallback = "Request failed") {
  return data?.error?.message || data?.message || fallback;
}

function readErrorCode(data) {
  return data?.error?.code || data?.error?.message || null;
}

function resultOk(status, data) {
  return {
    ok: true,
    status,
    data,
    error: null,
    code: null,
  };
}

function resultErr(status, error, data = null, code = null) {
  return {
    ok: false,
    status,
    data,
    error,
    code,
  };
}

async function requestJson(endpoint, options = {}) {
  try {
    const res = await fetch(endpoint, options);
    const data = await parseJsonSafe(res);
    if (res.ok) return resultOk(res.status, data);

    const message = readMessage(data);
    const code = readErrorCode(data);

    console.error(
      `${options.method || "GET"} ${endpoint} -> ${res.status}: ${message}`,
    );
    return resultErr(res.status, message, data, code);
  } catch (err) {
    console.log(err);
    return resultErr(
      0,
      err?.message || "Network request failed",
      null,
      "NETWORK_ERROR",
    );
  }
}

async function apiGet(endpoint, options = {}) {
  return await requestJson(endpoint, {
    cache: "no-store",
    ...options,
    method: "GET",
  });
}

async function apiPost(endpoint, body, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const payload =
    typeof body === "undefined" ? undefined : JSON.stringify(body);
  return await requestJson(endpoint, {
    ...options,
    method: "POST",
    headers,
    body: payload,
  });
}

async function apiDelete(endpoint, options = {}) {
  return await requestJson(endpoint, {
    ...options,
    method: "DELETE",
  });
}

export {
  apiDelete,
  apiGet,
  apiPost,
};
