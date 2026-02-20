import toast from "../components/Toast.js";
import renderTierLimitWarning from "../components/renderTierLimitWarning.js";

async function getThings(endpoint) {
  try {
    const res = await fetch(endpoint, {});
    const data = await res.json();
    if (res.status === 200) {
      return data;
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

async function deleteThing(endpoint) {
  try {
    const res = await fetch(endpoint, {
      method: "DELETE",
    });
    if (res.status === 204) {
      toast.show("Removed");
    } else {
      throw new Error();
    }
  } catch (err) {
    toast.error("Error");
    console.log(err);
  }
}

async function postThing(endpoint, body) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 201) {
      // toast.show("Success");
      return data;
    } else if (res.status === 402 && data.error.message === "USER_IS_NOT_PRO") {
      renderTierLimitWarning(
        'You have reached the limit for this feature on your account. Please subscribe to our "Pro User" package to increase the limit.'
      );
      return null;
    } else if (
      res.status === 413 &&
      data.error.message === "USER_DATA_HARD_LIMIT_REACHED"
    ) {
      renderTierLimitWarning(
        "This account is at its hard image data cap. Remove unused images to free space."
      );
      return null;
    } else if (
      res.status === 402 &&
      data.error.message === "PROJECT_IS_NOT_PRO"
    ) {
      renderTierLimitWarning(
        'This Wyrld has reached the limit for this feature. Please subscribe to our "Pro Wyrld" package to increase the limit.'
      );
      return null;
    } else if (
      res.status === 413 &&
      data.error.message === "PROJECT_DATA_HARD_LIMIT_REACHED"
    ) {
      renderTierLimitWarning(
        "This Wyrld is at its hard image data cap. Remove unused images to free space."
      );
      return null;
    } else {
      let error = new Error();
      if (data && data.error) error = data.error;
      throw error;
    }
  } catch (err) {
    console.log(err);
    toast.error("Error");

    return null;
  }
}

export { getThings, deleteThing, postThing };
