import createElement from "../lib/salt-lib/createElement.js";

export default function parseUrlTextContent(content) {
  const urlRegexAll = /(https?:\/\/[^\s]+)/g;
  const urlRegex = /^https?:\/\/[^\s]+$/;
  const parts = content.split(urlRegexAll);

  const nodes = [];

  parts.forEach((part, index) => {
    const subparts = part.split("\n");

    subparts.forEach((subpart, subIndex) => {
      if (urlRegex.test(subpart)) {
        nodes.push(
          createElement(
            "a",
            {
              href: subpart,
              target: "_blank",
              rel: "noopener noreferrer",
            },
            subpart,
            {
              type: "click",
              event: (e) => {
                window.open(e.target.href, "_blank");
              },
            }
          )
        );
      } else {
        nodes.push(document.createTextNode(subpart));
      }

      if (subIndex < subparts.length - 1) {
        nodes.push(createElement("br"));
      }
    });
  });

  return nodes;
}
