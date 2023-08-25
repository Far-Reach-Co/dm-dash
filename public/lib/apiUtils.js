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
        'You have reached the image data limit for this project. Please subscribe to our "Pro" package to increase the limit.'
      );
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
