async function getThings(endpoint) {
  try {
    const res = await fetch(
      window.location.origin + endpoint,
      {
        headers: {
          "x-access-token": `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await res.json();
    if (res.status === 200) {
      return data;
    } else throw new Error();
  } catch (err) {
    console.log(err);
    return null;
  }
}

export {
  getThings
}