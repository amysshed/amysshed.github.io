const gallery = document.querySelector(".sketchbook-gallery");

/* =========================
   MASONRY
========================= */
function resizeAllTiles() {

  if (!gallery) return;

  const tiles = document.querySelectorAll(".sketchbook-tile");

  const rowHeight = parseInt(
    getComputedStyle(gallery).getPropertyValue("grid-auto-rows")
  );

  const rowGap = parseInt(
    getComputedStyle(gallery).getPropertyValue("gap")
  );

  tiles.forEach(tile => {
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
    const dA = new Date(a.querySelector("img").dataset.date || 0);
    const dB = new Date(b.querySelector("img").dataset.date || 0);
    return dB - dA;
  });

  tiles.forEach(tile => gallery.appendChild(tile));
}

/* =========================
   FILTER (NEW SYSTEM)
========================= */
function setupFilter() {

  const filterToggle = document.querySelector(".filter-toggle");
  const filterMenu = document.querySelector(".filter-menu");

  if (!filterToggle || !filterMenu) return;

  // Toggle menu
  filterToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    filterMenu.style.display =
      filterMenu.style.display === "block" ? "none" : "block";
  });

  // Filter buttons
  filterMenu.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {

      const filter = button.dataset.filter;

      document.querySelectorAll(".sketchbook-tile").forEach(tile => {
        const tags = tile.dataset.tags
          ?.split(",")
          .map(t => t.trim());

        tile.classList.toggle(
          "is-hidden",
          filter !== "all" && !tags?.includes(filter)
        );
      });

      filterMenu.style.display = "none";

      requestAnimationFrame(() => {
        resizeAllTiles();
      });

    });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!filterToggle.contains(e.target) && !filterMenu.contains(e.target)) {
      filterMenu.style.display = "none";
    }
  });
}

/* =========================
   LOAD (STABLE VERSION)
========================= */
fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(async entries => {

    const allTiles = [];

    for (const entry of entries) {

      const res = await fetch(`JE1/${entry}`);
      const html = await res.text();

      const doc = new DOMParser().parseFromString(html, "text/html");

      const imgs = doc.querySelectorAll('img[data-sketchbook="true"]');

      imgs.forEach(img => {

        const tile = document.createElement("div");
        tile.className = "sketchbook-tile";

        // ✅ IMPORTANT for filter
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

        const overlay = document.createElement("div");
        overlay.className = "overlay";

        overlay.innerHTML = `
          <span class="title"></span>
          <span class="date"></span>
        `;

        inner.appendChild(overlay);
        tile.appendChild(inner);

        populateMeta(tile, newImg);

        allTiles.push(tile);
      });
    }

    // ✅ Append all at once
    allTiles.forEach(tile => gallery.appendChild(tile));

    // ✅ Run once
    sortGallery();

    setTimeout(() => {
      resizeAllTiles();
    }, 100);

    // ✅ Setup filter AFTER tiles exist
    setupFilter();

  });

/* =========================
   RESIZE HANDLING
========================= */
window.addEventListener("resize", () => {
  resizeAllTiles();
});
