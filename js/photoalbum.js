const gallery = document.querySelector(".sketchbook-gallery");

/* =========================
   MASONRY (DESKTOP ONLY)
========================= */
function resizeAllTiles() {
  if (window.innerWidth <= 768) return;

  const grids = document.querySelectorAll(".date-grid");

  grids.forEach(grid => {
    const rowHeight = parseInt(
      getComputedStyle(grid).getPropertyValue("grid-auto-rows")
    );

    const rowGap = parseInt(
      getComputedStyle(grid).getPropertyValue("gap")
    );

    const tiles = grid.querySelectorAll(".sketchbook-tile");

    tiles.forEach(tile => {
      const img = tile.querySelector("img");
      if (!img) return;

      const height = img.getBoundingClientRect().height;

      const rowSpan = Math.ceil(
        (height + rowGap) / (rowHeight + rowGap)
      );

      tile.style.setProperty("--row-span", rowSpan);
    });
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
   CLICK (SINGLE ONLY)
========================= */
function handleClicks(tile) {
  tile.addEventListener("click", () => {
    tile.classList.toggle("show-info");
  });
}

/* =========================
   SORT + GROUP
========================= */
function sortAndGroup(tiles) {

  tiles.sort((a, b) => {
    const dA = new Date(a.querySelector("img").dataset.date || 0);
    const dB = new Date(b.querySelector("img").dataset.date || 0);
    return dB - dA;
  });

  gallery.innerHTML = "";

  const groups = {};

  tiles.forEach(tile => {
    const date = tile.querySelector("img").dataset.date || "undated";
    if (!groups[date]) groups[date] = [];
    groups[date].push(tile);
  });

  Object.keys(groups).forEach(date => {

    const section = document.createElement("div");
    section.className = "date-section";

    const divider = document.createElement("div");
    divider.className = "date-divider";

    const title = document.createElement("span");
    title.className = "date-title";
    title.textContent = date;

    divider.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "date-grid";

    groups[date].forEach(tile => grid.appendChild(tile));

    section.appendChild(divider);
    section.appendChild(grid);

    gallery.appendChild(section);
  });

  setupReveal();

  // run masonry after DOM updated
  setTimeout(resizeAllTiles, 100);
}

/* =========================
   SCROLL REVEAL
========================= */
function setupReveal() {
  const sections = document.querySelectorAll(".date-section");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach(section => observer.observe(section));
}

/* =========================
   LOAD IMAGES (STABLE)
========================= */
fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(entries => {

    const tilePromises = entries.map(entry => {
      return fetch(`JE1/${entry}`)
        .then(res => res.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, "text/html");

          const imgs = doc.querySelectorAll('img[data-photoalbum="true"]');

          return Array.from(imgs).map(img => {

            const tile = document.createElement("div");
            tile.className = "sketchbook-tile";

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
            handleClicks(tile);

            return new Promise(resolve => {
              newImg.onload = () => resolve(tile);
              newImg.onerror = () => resolve(tile);
            });
          });
        });
    });

    // Wait for EVERYTHING properly
    Promise.all(tilePromises)
      .then(results => {

        const allTiles = results.flat();

        sortAndGroup(allTiles);
      });

  });
