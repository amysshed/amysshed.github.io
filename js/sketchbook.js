const gallery = document.getElementById("sketchbook-gallery");

/* =========================
   MASONRY LOGIC
   ========================= */

function resizeAllTiles() {
  const tiles = document.querySelectorAll(".sketchbook-tile");

  const rowHeight = parseInt(
    getComputedStyle(gallery).getPropertyValue("grid-auto-rows")
  );
  const rowGap = parseInt(
    getComputedStyle(gallery).getPropertyValue("gap")
  );

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

/* =========================
   LOAD JOURNAL IMAGES
   ========================= */

fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(entries => {
    entries.forEach(entry => {
      fetch(`journalentries/${entry}`)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          const images = doc.querySelectorAll(
            'img[data-sketchbook="true"]'
          );

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

            // Resize after image loads
            if (newImg.complete) {
              resizeAllTiles();
            } else {
              newImg.addEventListener("load", resizeAllTiles);
            }
          });
        });
    });
  })
  .catch(err =>
    console.error("Journal manifest load error:", err)
  );

/* =========================
   INITIAL MASONRY (manual tiles)
   ========================= */

window.addEventListener("load", () => {
  resizeAllTiles();
});

/* =========================
   FILTER LOGIC
   ========================= */

const filterSelect = document.getElementById("sketchbook-filter");

if (filterSelect) {
  filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value.toLowerCase();
    const tiles = document.querySelectorAll(".sketchbook-tile");

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

    requestAnimationFrame(resizeAllTiles);
  });
}
