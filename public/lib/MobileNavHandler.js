class MobileNavHandler {
  constructor() {
    this.visible = false;
    const mobileNav = document.getElementById("nav-links-container-mobile");
    const navHam = document.getElementById("nav-ham");
    if (!mobileNav || !navHam) return;
    // set event listener on nav hamburger
    navHam.addEventListener("click", () => {
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

class DesktopNavDropdownHandler {
  constructor() {
    this.desktopQuery = window.matchMedia("(min-width: 981px)");
    this.menus = Array.from(document.querySelectorAll(".nav-products-menu"));
    this.closeTimers = new WeakMap();
    if (!this.menus.length) return;

    document.documentElement.classList.add("nav-dropdowns-ready");
    this.bindMenus();
    this.bindGlobalEvents();
    this.closeAllMenus();
  }

  isDesktop = () => {
    return this.desktopQuery.matches;
  };

  getMenuParts(menu) {
    return {
      trigger: menu?.querySelector(".nav-products-trigger") || null,
      dropdown: menu?.querySelector(".nav-products-dropdown") || null,
    };
  }

  setMenuState(menu, isOpen, isPinned = false) {
    const { trigger, dropdown } = this.getMenuParts(menu);
    if (!menu || !trigger || !dropdown) return;
    menu.dataset.open = isOpen ? "true" : "false";
    menu.dataset.pinned = isPinned ? "true" : "false";
    trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    dropdown.setAttribute("aria-hidden", isOpen ? "false" : "true");
  }

  openMenu(menu, options = {}) {
    if (!menu || !this.isDesktop()) return;
    const isPinned = options.pinned === true;
    this.menus.forEach((candidate) => {
      this.setMenuState(candidate, candidate === menu, candidate === menu && isPinned);
    });
  }

  closeMenu(menu) {
    this.clearCloseTimer(menu);
    this.setMenuState(menu, false, false);
  }

  closeAllMenus = () => {
    this.menus.forEach((menu) => this.closeMenu(menu));
  };

  clearCloseTimer(menu) {
    const timer = this.closeTimers.get(menu);
    if (!timer) return;
    window.clearTimeout(timer);
    this.closeTimers.delete(menu);
  }

  scheduleClose(menu) {
    if (!menu || !this.isDesktop()) return;
    if (menu.dataset.pinned === "true") return;
    this.clearCloseTimer(menu);

    const timer = window.setTimeout(() => {
      const { trigger, dropdown } = this.getMenuParts(menu);
      if (!trigger || !dropdown) return;
      if (menu.dataset.pinned === "true") return;
      if (menu.contains(document.activeElement)) return;
      if (trigger.matches(":hover") || dropdown.matches(":hover")) return;
      this.closeMenu(menu);
    }, 160);

    this.closeTimers.set(menu, timer);
  }

  focusMenuLink(menu, position = "first") {
    const links = Array.from(menu.querySelectorAll(".nav-dropdown-link"));
    if (!links.length) return;
    const nextLink =
      position === "last" ? links[links.length - 1] : links[0];
    nextLink.focus();
  }

  bindMenus() {
    this.menus.forEach((menu) => {
      const { trigger, dropdown } = this.getMenuParts(menu);
      if (!trigger || !dropdown) return;

      this.setMenuState(menu, false, false);

      const openFromHover = () => {
        if (!this.isDesktop()) return;
        this.clearCloseTimer(menu);
        this.openMenu(menu);
      };

      trigger.addEventListener("pointerenter", openFromHover);
      dropdown.addEventListener("pointerenter", openFromHover);

      trigger.addEventListener("pointerleave", () => {
        this.scheduleClose(menu);
      });

      dropdown.addEventListener("pointerleave", () => {
        this.scheduleClose(menu);
      });

      menu.addEventListener("focusin", () => {
        if (!this.isDesktop()) return;
        this.clearCloseTimer(menu);
        this.openMenu(menu);
      });

      menu.addEventListener("focusout", (event) => {
        if (!this.isDesktop()) return;
        const nextTarget = event.relatedTarget;
        if (nextTarget && menu.contains(nextTarget)) return;
        if (menu.dataset.pinned === "true") return;
        this.scheduleClose(menu);
      });

      trigger.addEventListener("click", (event) => {
        if (!this.isDesktop()) return;
        event.preventDefault();
        const isPinnedOpen =
          menu.dataset.open === "true" && menu.dataset.pinned === "true";
        if (isPinnedOpen) {
          this.closeAllMenus();
          trigger.focus();
          return;
        }
        this.openMenu(menu, { pinned: true });
      });

      trigger.addEventListener("keydown", (event) => {
        if (!this.isDesktop()) return;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          this.openMenu(menu, { pinned: true });
          this.focusMenuLink(menu, "first");
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          this.openMenu(menu, { pinned: true });
          this.focusMenuLink(menu, "last");
        }
        if (event.key === "Escape") {
          this.closeAllMenus();
          trigger.focus();
        }
      });

      dropdown.addEventListener("keydown", (event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        this.closeAllMenus();
        trigger.focus();
      });

      dropdown.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const link = target.closest(".nav-dropdown-link");
        if (!link) return;
        this.closeAllMenus();
      });
    });
  }

  bindGlobalEvents() {
    document.addEventListener("click", (event) => {
      if (!this.isDesktop()) {
        this.closeAllMenus();
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        this.closeAllMenus();
        return;
      }
      const clickedInsideMenu = target.closest(".nav-products-menu");
      if (clickedInsideMenu) return;
      this.closeAllMenus();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      this.closeAllMenus();
    });

    const handleViewportChange = () => {
      this.closeAllMenus();
    };

    if (typeof this.desktopQuery.addEventListener === "function") {
      this.desktopQuery.addEventListener("change", handleViewportChange);
      return;
    }

    if (typeof this.desktopQuery.addListener === "function") {
      this.desktopQuery.addListener(handleViewportChange);
    }
  }
}

new MobileNavHandler();
new DesktopNavDropdownHandler();
