const gallery = document.querySelector(".sketchbook-gallery");

if (!gallery) {
  console.warn("Gallery not found");
}

/* =========================
   MASONRY
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
   META
========================= */
function populateMeta(tile, img) {
  const title = tile.querySelector(".title");
  const date = tile.querySelector(".date");

  if (title) title.textContent = img.dataset.title || "";
  if (date) date.textContent = img.dataset.date || "";
}

/* =========================
   SORT
========================= */
function sortGallery() {
  const tiles = Array.from(document.querySelectorAll(".sketchbook-tile"));

  tiles.sort((a, b) => {
    const dA = new Date(a.querySelector("img")?.dataset.date || 0);
    const dB = new Date(b.querySelector("img")?.dataset.date || 0);
    return dB - dA;
  });

  tiles.forEach(tile => gallery.appendChild(tile));
}

/* =========================
   FILTER (BUTTON VERSION)
========================= */

  const filterButtons = document.querySelectorAll(".filter-menu button");
  const filterToggle = document.querySelector(".filter-toggle");
  const filterMenu = document.querySelector(".filter-menu");

  if (filterToggle && filterMenu) {
    filterToggle.addEventListener("click", () => {
      filterMenu.style.display =
        filterMenu.style.display === "block" ? "none" : "block";
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter.toLowerCase();

      document.querySelectorAll(".sketchbook-tile").forEach(tile => {
        const tags = (tile.dataset.tags || "")
          .toLowerCase()
          .split(",")
          .map(t => t.trim());

        const match = filter === "all" || tags.includes(filter);

        tile.classList.toggle("is-hidden", !match);
      });

      filterMenu.style.display = "none";
      requestAnimationFrame(resizeAllTiles);
    });
  });


/* =========================
   LOAD FROM JOURNAL
========================= */
fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(entries => {
    entries.forEach(entry => {
      fetch(`JE1/${entry}`)
        .then(res => res.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, "text/html");

          doc.querySelectorAll('img[data-sketchbook="true"]').forEach(img => {

            // ✅ Prevent duplicates
            const uniqueId = `${entry}-${img.getAttribute("src")}`;
            if (gallery.querySelector(`[data-id="${uniqueId}"]`)) return;

            const tile = document.createElement("div");
            tile.className = "sketchbook-tile";
            tile.dataset.id = uniqueId;

            // ✅ Filter support
            tile.dataset.tags = img.dataset.tags?.toLowerCase() || "journal";

            const inner = document.createElement("div");
            inner.className = "tile-inner";

            const newImg = document.createElement("img");

            const entryPath = `JE1/${entry}`;
            const entryDir = entryPath.substring(0, entryPath.lastIndexOf("/") + 1);

            newImg.src = new URL(
              img.getAttribute("src"),
              window.location.origin + "/" + entryDir
            ).href;

            newImg.dataset.date = img.dataset.date || "";
            newImg.dataset.title = img.dataset.title || "";

            inner.appendChild(newImg);

            // Overlay
            const overlay = document.createElement("div");
            overlay.className = "overlay";

            const titleSpan = document.createElement("span");
            titleSpan.className = "title";

            const dateSpan = document.createElement("span");
            dateSpan.className = "date";

            overlay.appendChild(titleSpan);
            overlay.appendChild(dateSpan);

            inner.appendChild(overlay);
            tile.appendChild(inner);
            gallery.appendChild(tile);

            // ✅ Double-click navigation
            tile.addEventListener("dblclick", () => {
              window.location.href = `JE1/${entry}`;
            });
            let clickTimer = null;

            tile.addEventListener("click", () => {
              if (clickTimer) return;

            clickTimer = setTimeout(() => {
            tile.classList.toggle("show-meta");
            clickTimer = null;
              }, 200);
            });

            tile.addEventListener("dblclick", () => {
            clearTimeout(clickTimer);
            clickTimer = null;
            window.location.href = `JE1/${entry}`;
            });

            // ✅ Populate meta
            populateMeta(tile, newImg);

            // ✅ Wait for image load (fix masonry)
            newImg.addEventListener("load", () => {
              sortGallery();
              resizeAllTiles();
            });
          });
        });
    });
  })
  .catch(err => console.error("Manifest load error:", err));

/* =========================
   INITIAL LOAD (manual tiles)
========================= */
window.addEventListener("load", () => {
  document.querySelectorAll(".sketchbook-tile").forEach(tile => {
    const img = tile.querySelector("img");
    if (img) populateMeta(tile, img);
  });

  sortGallery();
  resizeAllTiles();
});
