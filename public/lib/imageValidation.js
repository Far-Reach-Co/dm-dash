const placeholderImage =
  "data:image/svg+xml;base64," +
  btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="150" height="100" viewBox="0 0 150 100">
      <rect width="150" height="100" fill="#aaaaa" />
      <text x="75" y="55" font-size="14" text-anchor="middle" fill="#a00" font-family="sans-serif">Image not found</text>
    </svg>
  `);

function createValidatedImage(src) {
  const img = document.createElement("img");
  img.src = src;
  img.alt = "Image";
  img.style =
    "max-width: 100%; max-height: 250px; margin: 5px; cursor: pointer;";

  img.onerror = () => {
    img.src = placeholderImage;
  };

  img.addEventListener("click", (e) => {
    window.open(src, "_blank");
  });

  return img;
}
function isImageUrl(url) {
  const parts = url.split(".");
  if (parts.length < 2) return false;
  const ext = parts[parts.length - 1].toLowerCase().split("?")[0];
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "tiff"].includes(ext);
}

export { createValidatedImage, isImageUrl };
