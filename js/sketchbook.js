window.addEventListener("load", () => {
  const gallery = document.querySelector(".sketchbook-gallery");
  if (!gallery) return;

  const tiles = gallery.querySelectorAll(".sketchbook-tile");

  const rowHeight = parseInt(
    getComputedStyle(gallery).getPropertyValue("grid-auto-rows")
  );
  const rowGap = parseInt(
    getComputedStyle(gallery).getPropertyValue("gap")
  );

  tiles.forEach(tile => {
    const img = tile.querySelector("img");
    const dateSpan = tile.querySelector(".date");

    if (img.dataset.date && dateSpan) {
      dateSpan.textContent = img.dataset.date;
    }

    const resizeTile = () => {
      const imageHeight = img.getBoundingClientRect().height;
      const rowSpan = Math.ceil(
        (imageHeight + rowGap) / (rowHeight + rowGap)
      );
      tile.style.setProperty("--row-span", rowSpan);
    };

    if (img.complete) {
      resizeTile();
    } else {
      img.addEventListener("load", resizeTile);
    }
  });
});
