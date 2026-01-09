window.addEventListener("load", () => {
  const gallery = document.querySelector(".sketchbook-gallery");
  if (!gallery) return;

  const tiles = Array.from(
    gallery.querySelectorAll(".sketchbook-tile")
  );

  const rowHeight = parseInt(
    getComputedStyle(gallery).getPropertyValue("grid-auto-rows")
  );
  const rowGap = parseInt(
    getComputedStyle(gallery).getPropertyValue("gap")
  );

  // ---------- Masonry resize ----------
  function resizeAllTiles() {
    tiles.forEach(tile => {
      if (tile.classList.contains("is-hidden")) return;

      const img = tile.querySelector("img");
      if (!img) return;

      const height = img.getBoundingClientRect().height;
      const rowSpan = Math.ceil(
        (height + rowGap) / (rowHeight + rowGap)
      );

      tile.style.setProperty("--row-span", rowSpan);
    });
  }

  // ---------- Initial setup ----------
  tiles.forEach(tile => {
    const img = tile.querySelector("img");
    const dateSpan = tile.querySelector(".date");

    // Populate date
    if (img?.dataset.date && dateSpan) {
      dateSpan.textContent = img.dataset.date;
    }

    // Ensure resize after image load
    if (img?.complete) {
      resizeAllTiles();
    } else {
      img?.addEventListener("load", resizeAllTiles);
    }
  });

  // ---------- FILTER (select dropdown) ----------
  const filterSelect = document.getElementById("sketchbook-filter");

  if (filterSelect) {
    filterSelect.addEventListener("change", () => {
      const filter = filterSelect.value.toLowerCase();

      tiles.forEach(tile => {
        const tags = tile.dataset.tags
          ?.toLowerCase()
          .split(",")
          .map(t => t.trim());

        if (filter === "all" || tags?.includes(filter)) {
          tile.classList.remove("is-hidden");
        } else {
          tile.classList.add("is-hidden");
        }
      });

      // Force masonry recalculation
      requestAnimationFrame(resizeAllTiles);
    });
  }
});
