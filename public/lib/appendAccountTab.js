async function verifyToken() {
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const res = await fetch(`${window.location.origin}/api/verify_jwt`, {
        headers: { "x-access-token": `Bearer ${token}` },
      });
      const resData = await res.json();
      if (res.status === 200) {
        return resData;
      } else if (res.status === 400) {
        console.log("expired token");
        return null;
      } else throw resData.error;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
}

async function appendAccountTabOrLogin() {
  const token = await verifyToken();
  const div = document.getElementById("nav-links-container");
  if (token) {
    // account
    const accountBtn = document.createElement("a");
    accountBtn.innerText = "Account";
    accountBtn.className = "top-nav-btn";
    accountBtn.href = "/account.html";
    // logout
    const logoutBtn = document.createElement("a");
    logoutBtn.innerText = "Logout";
    logoutBtn.className = "top-nav-btn";
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.pathname = "/";
    });
    div.append(accountBtn, logoutBtn);
  } else {
    const accountBtn = document.createElement("a");
    accountBtn.innerText = "Login";
    accountBtn.className = "top-nav-btn";
    accountBtn.href = "/login.html";
    div.appendChild(accountBtn);
  }
}

appendAccountTabOrLogin();
