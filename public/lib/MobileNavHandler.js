class MobileNavHandler {
  constructor() {
    this.visible = false;
    
    const mobileNav = document.getElementById("nav-links-container-mobile");
    // set event listener on nav hamburger
    document.getElementById("nav-ham").addEventListener("click", () => {
      if (this.visible) {
        mobileNav.style.visibility = "hidden";
        mobileNav.style.zIndex = "1"
        this.visible = false;
      } else {
        mobileNav.style.visibility = "visible";
        mobileNav.style.zIndex = "3"
        this.visible = true;
      }
    });
    // any click closes mobile nav
    document.getElementById("nav-links-container-mobile").addEventListener("click", () => {
      mobileNav.style.visibility = "hidden";
      mobileNav.style.zIndex = "1"
      this.visible = false;
    })
  }
}

new MobileNavHandler()
