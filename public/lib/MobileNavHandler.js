class MobileNavHandler {
  constructor() {
    this.visible = false;
    const mobileNav = document.getElementById("nav-links-container-mobile");
    // set event listener on nav hamburger
    document.getElementById("nav-ham").addEventListener("click", () => {
      if (this.visible) {
        mobileNav.classList.remove("open");
        this.visible = false;
      } else {
        mobileNav.classList.add("open");
        this.visible = true;
      }
    });
    // any click closes mobile nav
    document
      .getElementById("nav-links-container-mobile")
      .addEventListener("click", () => {
        mobileNav.classList.remove("open");
        this.visible = false;
      });
  }
}

new MobileNavHandler();
