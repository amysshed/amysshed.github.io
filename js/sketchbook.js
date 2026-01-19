const gallery = document.getElementById("sketchbook-gallery");

// Load journal images into sketchbook
fetch("journalentries/journal-manifest.json")
  .then(res => res.json())
  .then(entries => {
    entries.forEach(entry => {
      fetch(`journalentries/${entry}`)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const images = doc.querySelectorAll('img[data-sketchbook="true"]');

          images.forEach(img => {
            const tile = document.createElement("div");
            tile.className = "sketchbook-tile";
            tile.dataset.source = "journal";

            tile.dataset.tags = img.dataset.tags
              ? img.dataset.tags.toLowerCase()
              : "journal";

            const inner = document.createElement("div");
            inner.className = "tile-inner";

            const newImg = document.createElement("img");
            newImg.src = img.getAttribute("src");
            newImg.alt = img.getAttribute("alt") || "";

            inner.appendChild(newImg);

            // Optional date overlay
            if (img.dataset.date) {
              const overlay = document.createElement("div");
              overlay.className = "overlay";

              const date = document.createElement("span");
              date.className = "date";
              date.textContent = img.dataset.date;

              overlay.appendChild(date);
              inner.appendChild(overlay);
            }

            tile.appendChild(inner);
            gallery.appendChild(tile);
          });

          // IMPORTANT: re-run masonry sizing if you use it
          if (typeof updateMasonry === "function") {
            updateMasonry();
          }
        });
    });
  })
  .catch(err => console.error("Journal manifest load error:", err));


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
