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
   SORT BY DATE (NEWEST FIRST)
========================= */
function sortGalleryByDate() {
  const tiles = Array.from(document.querySelectorAll(".sketchbook-tile"));

  tiles.sort((a, b) => {
    const dateA = new Date(a.querySelector("img")?.dataset.date || 0);
    const dateB = new Date(b.querySelector("img")?.dataset.date || 0);
    return dateB - dateA;
  });

  tiles.forEach(tile => const dateKey = newImg.dataset.date || "undated";

// Find or create section for this date
let section = gallery.querySelector(`[data-date-group="${dateKey}"]`);

if (!section) {
  section = document.createElement("div");
  section.className = "date-section";
  section.dataset.dateGroup = dateKey;

  // Divider + title
  const header = document.createElement("div");
  header.className = "date-divider";

  const title = document.createElement("span");
  title.className = "date-title";
  title.textContent = dateKey;

  header.appendChild(title);
  section.appendChild(header);

  // Grid container for images
  const grid = document.createElement("div");
  grid.className = "date-grid";

  section.appendChild(grid);

  gallery.appendChild(section);
}

// Append tile into the correct grid
section.querySelector(".date-grid").appendChild(tile);

}

/* =========================
   LOAD photo album IMAGES
========================= */
fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(entries => {
    entries.forEach(entry => {
      fetch(`JE1/${entry}`)
        .then(res => res.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, "text/html");

          doc
  .querySelectorAll('img[data-photoalbum="true"]')
  .forEach(img => {

    // ✅ UNIQUE ID (ADD THIS)
    const uniqueId = `${entry}-${img.getAttribute("src")}`;

    // ✅ PREVENT DUPLICATES (ADD THIS)
    if (gallery.querySelector(`[data-id="${uniqueId}"]`)) return;

    const tile = document.createElement("div");
    tile.className = "sketchbook-tile";

    // ✅ STORE ID (ADD THIS)
    tile.dataset.id = uniqueId;

    tile.dataset.source = "journal";
    tile.dataset.entry = entry;

              tile.dataset.tags = img.dataset.tags?.toLowerCase() || "journal";

              const inner = document.createElement("div");
              inner.className = "tile-inner";

              const newImg = document.createElement("img");
              const entryPath = `JE1/${entry}`;
              const entryDir = entryPath.substring(0, entryPath.lastIndexOf("/") + 1);
              const imgSrc = img.getAttribute("src");  

              newImg.src = new URL(imgSrc, window.location.origin + "/" + entryDir).href;

              newImg.alt = img.alt || "";
              newImg.dataset.date = img.dataset.date || "";
              newImg.dataset.title = img.dataset.title || "";

              inner.appendChild(newImg);

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

              tile.addEventListener("dblclick", () => {
                window.location.href = `JE1/${entry}`;
              });

              newImg.addEventListener("load", () => {
                populateDates();
                populateTitles();
                sortGalleryByDate();
                resizeAllTiles();
              });
            });
        });
    });
  })
  .catch(err => console.error("Journal load error:", err));


/* =========================
   INITIAL SETUP (MANUAL TILES)
========================= */
window.addEventListener("load", () => {
  populateDates();
  populateTitles();
  sortGalleryByDate();
  resizeAllTiles();
});

/* =========================
   FILTER
========================= */
const filterSelect = document.getElementById("sketchbook-filter");
if (filterSelect) {
  filterSelect.addEventListener("change", () => {
    const filter = filterSelect.value.toLowerCase();

    document.querySelectorAll(".sketchbook-tile").forEach(tile => {
      const tags = tile.dataset.tags?.split(",").map(t => t.trim());
      tile.classList.toggle(
        "is-hidden",
        filter !== "all" && !tags?.includes(filter)
      );
    });

    requestAnimationFrame(resizeAllTiles);
  });
}

