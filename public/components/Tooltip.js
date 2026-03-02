import createElement from "../lib/salt-lib/createElement.js";
import Component from "../lib/salt-lib/Component.js";

class Tooltip extends Component {
  constructor() {
    const existingElem = document.getElementById("tooltip-hover");
    const domElem =
      existingElem ||
      createElement("div", {
        id: "tooltip-hover",
      });

    super({
      domElem,
      autoInit: false,
      autoRender: false,
    });

    this.init();
  }

  init = () => {
    if (!this.domElem.parentNode) {
      document.body.appendChild(this.domElem);
    }
    this.domElem.id = "tooltip-hover";
    this.domElem.style.display = "none";
    this.domElem.style.position = "absolute";
    this.domElem.style.zIndex = "9999";
  };

  /**
   * Show tooltip with smart positioning
   * @param {Object} options - Configuration options
   * @param {HTMLElement|string} options.content - Content to display (element or text)
   * @param {Event} options.event - Mouse event to position relative to
   * @param {HTMLElement} options.target - Target element (defaults to event.target)
   * @param {number} options.maxWidth - Max width in pixels (default: 300)
   * @param {number} options.offset - Offset from target in pixels (default: 5)
   */
  show({ content, event, target, maxWidth = 300, offset = 5 }) {
    if (!this.domElem) this.init();

    // Clear previous content
    this.domElem.replaceChildren();
    this.domElem.style.display = "block";

    // Add content
    const contentWrapper = createElement(
      "div",
      { style: `max-width: ${maxWidth}px;` },
      typeof content === "string" ? content : null
    );

    if (typeof content !== "string") {
      if (Array.isArray(content)) {
        content.forEach((item) => contentWrapper.appendChild(item));
      } else {
        contentWrapper.appendChild(content);
      }
    }

    this.domElem.appendChild(contentWrapper);

    // Calculate smart position
    const targetElem = target || event.target;
    this.position(targetElem, offset);
  }

  /**
   * Position tooltip relative to target element with overflow prevention
   * @param {HTMLElement} targetElem - Element to position relative to
   * @param {number} offset - Offset in pixels
   */
  position(targetElem, offset = 5) {
    if (!this.domElem) return;

    const rect = targetElem.getBoundingClientRect();
    const tooltipRect = this.domElem.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Default position: below the target
    let top = rect.bottom + window.scrollY + offset;
    let left = rect.left + window.scrollX;

    // Check vertical overflow
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const tooltipHeight = tooltipRect.height;

    if (spaceBelow < tooltipHeight + offset && spaceAbove > spaceBelow) {
      // Position above if more space above
      top = rect.top + window.scrollY - tooltipHeight - offset;
    }

    // Check horizontal overflow
    const tooltipWidth = tooltipRect.width;
    if (left + tooltipWidth > viewportWidth) {
      // Align to right edge with padding
      left = Math.max(10, viewportWidth - tooltipWidth - 10);
    }

    // Ensure tooltip doesn't go off left edge
    left = Math.max(10, left);

    this.domElem.style.top = top + "px";
    this.domElem.style.left = left + "px";
  }

  /**
   * Hide the tooltip
   */
  hide() {
    if (!this.domElem) return;
    this.domElem.style.display = "none";
    this.domElem.replaceChildren();
  }

  /**
   * Check if tooltip is currently visible
   */
  isVisible() {
    return this.domElem && this.domElem.style.display === "block";
  }
}

// Export singleton instance
const tooltip = new Tooltip();
export default tooltip;
