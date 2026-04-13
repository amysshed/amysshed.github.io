const gallery = document.querySelector(".sketchbook-gallery");

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
    const img = tile.querySelector("img");
    if (!img) return;

    const height = img.getBoundingClientRect().height;
    const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));

    tile.style.setProperty("--row-span", rowSpan);
  });
}

/* =========================
   OVERLAY
========================= */
function populateMeta(tile, img) {
  const title = tile.querySelector(".title");
  const date = tile.querySelector(".date");

  if (title) title.textContent = img.dataset.title || "";
  if (date) date.textContent = img.dataset.date || "";
}

/* =========================
   SORT + GROUP
========================= */
function sortAndGroup() {
  const tiles = Array.from(document.querySelectorAll(".sketchbook-tile"));

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
   LIGHTBOX
========================= */
const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = `<img src="" alt="">`;
document.body.appendChild(lightbox);

lightbox.addEventListener("click", () => {
  lightbox.classList.remove("active");
});

/* =========================
   CLICK HANDLING
========================= */
let clickTimer = null;

function handleClicks(tile, img) {
  tile.addEventListener("click", () => {
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;

      // DOUBLE CLICK → OPEN
      lightbox.querySelector("img").src = img.src;
      lightbox.classList.add("active");
    } else {
      clickTimer = setTimeout(() => {
        tile.classList.toggle("show-info");
        clickTimer = null;
      }, 250);
    }
  });
}

/* =========================
   LOAD IMAGES
========================= */
fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(entries => {
    entries.forEach(entry => {
      fetch(`JE1/${entry}`)
        .then(res => res.text())
        .then(html => {
          const doc = new DOMParser().parseFromString(html, "text/html");

          doc.querySelectorAll('img[data-photoalbum="true"]').forEach(img => {

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
            gallery.appendChild(tile);

            populateMeta(tile, newImg);
            handleClicks(tile, newImg);

            newImg.addEventListener("load", () => {
              sortAndGroup();
              resizeAllTiles();
            });
          });
        });
    });
  });
