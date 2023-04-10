import toast from "../components/Toast.js";
import renderTierLimitWarning from "./renderTierLimitWarning.js";

async function getThings(endpoint) {
  try {
    const res = await fetch(window.location.origin + endpoint, {
      headers: {
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
    });
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
    const res = await fetch(window.location.origin + endpoint, {
      method: "DELETE",
      headers: {
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
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
    const res = await fetch(window.location.origin + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-token": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    console.log(res, data);
    if (res.status === 200 || res.status === 201) {
      // toast.show("Success");
      return data;
    } else if (res.status === 402 && data.error.message === "USER_IS_NOT_PRO") {
      renderTierLimitWarning(
        'Please subscribe to our "Pro" package to gain access. In order to continue providing our services we need your support <3. Please read about our available tiers <insert link here> and choose the best option for your future.'
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
