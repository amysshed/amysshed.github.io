const gallery = document.querySelector(".sketchbook-gallery");

if (!gallery) {
  console.warn("Sketchbook gallery not found");
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
   OVERLAY HELPERS
========================= */
function populateDates() {
  document.querySelectorAll(".sketchbook-tile").forEach(tile => {
    const img = tile.querySelector("img");
    const dateSpan = tile.querySelector(".date");
    if (img?.dataset.date && dateSpan) {
      dateSpan.textContent = img.dataset.date;
    }
  });
}

function populateTitles() {
  document.querySelectorAll(".sketchbook-tile").forEach(tile => {
    const img = tile.querySelector("img");
    const titleSpan = tile.querySelector(".title");
    if (img?.dataset.title && titleSpan) {
      titleSpan.textContent = img.dataset.title;
    }
  });
}

/* =========================
   SORT + GROUP BY DATE
========================= */
function sortGalleryByDate() {
  const tiles = Array.from(document.querySelectorAll(".sketchbook-tile"));

  // Sort newest first
  tiles.sort((a, b) => {
    const dateA = new Date(a.querySelector("img")?.dataset.date || 0);
    const dateB = new Date(b.querySelector("img")?.dataset.date || 0);
    return dateB - dateA;
  });

  // Clear gallery before rebuilding
  gallery.innerHTML = "";

  tiles.forEach(tile => {
    const img = tile.querySelector("img");
    const dateKey = img?.dataset.date || "undated";

    let section = gallery.querySelector(`[data-date-group="${dateKey}"]`);

    if (!section) {
      section = document.createElement("div");
      section.className = "date-section";
      section.dataset.dateGroup = dateKey;

      // Divider
      const header = document.createElement("div");
      header.className = "date-divider";

      const title = document.createElement("span");
      title.className = "date-title";
      title.textContent = dateKey;

      header.appendChild(title);
      section.appendChild(header);

      // Grid container
      const grid = document.createElement("div");
      grid.className = "date-grid";

      section.appendChild(grid);
      gallery.appendChild(section);
    }

    section.querySelector(".date-grid").appendChild(tile);
  });
}

/* =========================
   LOAD PHOTOALBUM IMAGES
========================= */
fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(entries => {
    entries.forEach(entry => {
      fetch(`JE1/${entry}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load ${entry}`);
          return res.text();
        })
        .then(htm
