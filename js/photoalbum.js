/* =========================
   CONFIGURATION
========================= */
const CONFIG = {
  MANIFEST_PATH: "JE1/manifest.json",
  MOBILE_BREAKPOINT: 768,
  REVEAL_THRESHOLD: 0.1,
  RESIZE_DEBOUNCE_MS: 250,
};

const gallery = document.querySelector(".sketchbook-gallery");

/* =========================
   MASONRY
========================= */
function resizeAllTiles() {
  // 🔥 disable masonry on mobile
  if (window.innerWidth <= CONFIG.MOBILE_BREAKPOINT) return;

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
          observer.unobserve(entry.target); // Stop observing after visible
        }
      });
    },
    { threshold: CONFIG.REVEAL_THRESHOLD }
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
function handleClicks(tile, img) {
  tile.addEventListener("click", () => {
    try {
      const img = tile.querySelector("img");
      if (!img) return;

      const lightboxImg = lightbox.querySelector("img");
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || img.dataset.title || "";
      lightbox.classList.add("active");
    } catch (error) {
      console.error("Error opening lightbox:", error);
    }
  });
}

/* =========================
   WINDOW RESIZE HANDLER
========================= */
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => resizeAllTiles(), CONFIG.RESIZE_DEBOUNCE_MS);
});

/* =========================
   LOAD IMAGES
========================= */
async function loadImages() {
  try {
    const manifestRes = await fetch(CONFIG.MANIFEST_PATH);
    if (!manifestRes.ok) throw new Error(`Failed to load manifest: ${manifestRes.status}`);
    
    const entries = await manifestRes.json();

    let imagesLoaded = 0;
    let totalImages = 0;

    // First pass: count total images
    const htmlPromises = entries.map(entry =>
      fetch(`JE1/${entry}`)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load ${entry}: ${res.status}`);
          return res.text();
        })
    );

    const htmls = await Promise.all(htmlPromises);

    // Count images in all fetched content
    htmls.forEach(html => {
      const doc = new DOMParser().parseFromString(html, "text/html");
      const imgs = doc.querySelectorAll('img[data-photoalbum="true"]');
      totalImages += imgs.length;
    });

    // Second pass: create tiles and load images
    htmls.forEach(html => {
      try {
        const doc = new DOMParser().parseFromString(html, "text/html");
        const imgs = doc.querySelectorAll('img[data-photoalbum="true"]');

        imgs.forEach(img => {
          try {
            const tile = document.createElement("div");
            tile.className = "sketchbook-tile";

            const inner = document.createElement("div");
            inner.className = "tile-inner";

            const newImg = document.createElement("img");

            // Find the entry name from the HTML to construct correct path
            let entryName = "";
            for (let i = 0; i < entries.length; i++) {
              // We can't determine which entry this came from, so use a fallback
              entryName = entries[i];
              break;
            }

            const entryPath = `JE1/${entryName}`;
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
              imagesLoaded++;

              // ✅ Only run once ALL images are loaded
              if (imagesLoaded === totalImages) {
                sortAndGroup();
                resizeAllTiles();
              }
            });

            newImg.addEventListener("error", () => {
              imagesLoaded++;
              console.error(`Failed to load image: ${newImg.src}`);

              // Still trigger layout update if all images processed
              if (imagesLoaded === totalImages) {
                sortAndGroup();
                resizeAllTiles();
              }
            });
          } catch (error) {
            console.error("Error creating tile:", error);
          }
        });
      } catch (error) {
        console.error("Error parsing HTML:", error);
      }
    });

  } catch (error) {
    console.error("Error loading images:", error);
  }
}

// Initialize
loadImages();
