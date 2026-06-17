const gallery = document.querySelector(".sketchbook-gallery");

if (!gallery) {
  console.warn("Sketchbook gallery not found");
}

/* =========================
   IMAGE LAZY LOADER
========================= */

const imageObserver = new IntersectionObserver(entries => {

  entries.forEach(entry => {

    if (!entry.isIntersecting) return;

    const img = entry.target;

    if (!img.src) {
      img.src = img.dataset.src;
    }

    imageObserver.unobserve(img);

  });

}, {
  rootMargin: "500px"
});

/*japan second page to reduce crowding*/
const pageCountry =
  document.body.dataset.country || null;

/* =========================
   MASONRY
========================= */
function resizeAllTiles() {
  const tiles = document.querySelectorAll(".sketchbook-tile");

  const grid = document.querySelector(".date-grid");
  if (!grid) return;

  const rowHeight = parseInt(
    getComputedStyle(grid).getPropertyValue("grid-auto-rows")
  );
  const rowGap = parseInt(
    getComputedStyle(grid).getPropertyValue("gap")
  );

  tiles.forEach(tile => {
    if (tile.classList.contains("is-hidden")) return;

    const img = tile.querySelector("img");
    if (!img) return;

    const height = img.getBoundingClientRect().height;
    const rowSpan = Math.ceil((height + rowGap) / (rowHeight + rowGap));

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
   SORT + GROUP BY location and date
========================= */
function sortGalleryByShoot() {
  const tiles = Array.from(document.querySelectorAll(".sketchbook-tile"));

  // Sort newest first
  tiles.sort((a, b) => {
    const dA = new Date(a.querySelector("img")?.dataset.date || 0);
    const dB = new Date(b.querySelector("img")?.dataset.date || 0);
    return dB - dA;
  });

  gallery.innerHTML = "";

  tiles.forEach(tile => {
    const img = tile.querySelector("img");

    const date = img?.dataset.date || "undated";
    const location = img?.dataset.location || "Unknown";

    // 👇 KEY: group by BOTH date + location
    const groupKey = `${date}-${location}`;

    let section = gallery.querySelector(`[data-group="${groupKey}"]`);

    if (!section) {
      section = document.createElement("div");
      section.className = "date-section";
      section.dataset.group = groupKey;

      const header = document.createElement("div");
      header.className = "date-divider";

      const title = document.createElement("span");
      title.className = "date-title";

      // 👇 what user sees
      title.textContent = `${location} — ${date}`;

      header.appendChild(title);
      section.appendChild(header);

      const grid = document.createElement("div");
      grid.className = "date-grid";

      section.appendChild(grid);
      gallery.appendChild(section);
    }

    section.querySelector(".date-grid").appendChild(tile);
  });

  initScrollReveal();
}

/* =========================
   SCROLL REVEAL
========================= */
let observer;

function initScrollReveal() {
  if (observer) observer.disconnect();

  const sections = document.querySelectorAll(".date-section");

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  sections.forEach(section => observer.observe(section));
}

/* =========================
   LOAD IMAGES
========================= */
fetch("JE1/manifest.json")
  .then(res => res.json())
  .then(entries => {

    let filesProcessed = 0;

    entries.forEach(entry => {

      fetch(`JE1/${entry}`)
        .then(res => res.text())
        .then(html => {

          const doc = new DOMParser().parseFromString(
            html,
            "text/html"
          );
        
          doc.querySelectorAll('img[data-photoalbum="true"]').forEach(img => {
        
            const album =
              img.dataset.album?.toLowerCase();
        
            if (pageCountry === "Japan") {
        
              if (album !== "japan") return;
        
            } else {
        
              if (album === "japan") return;
        
            }
        
            const uniqueId =
              `${entry}-${img.getAttribute("src")}`;
            

            if (gallery.querySelector(`[data-id="${uniqueId}"]`)) return;

            const tile = document.createElement("div");
            tile.className = "sketchbook-tile";
            tile.dataset.id = uniqueId;
            tile.dataset.tags =
              img.dataset.tags?.toLowerCase() || "journal";

            const inner = document.createElement("div");
            inner.className = "tile-inner";

            const newImg = document.createElement("img");

            newImg.loading = "lazy";
            newImg.decoding = "async";

            // lazy-load source
            newImg.dataset.src = img.getAttribute("src");

            newImg.dataset.date = img.dataset.date || "";
            newImg.dataset.title = img.dataset.title || "";
            newImg.dataset.location =
              img.dataset.location || "Unknown";

            newImg.addEventListener("click", () => {

              document
                .querySelectorAll(".sketchbook-tile")
                .forEach(t => t.classList.remove("show-info"));

              tile.classList.toggle("show-info");

            });

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

            imageObserver.observe(newImg);

            newImg.addEventListener("load", () => {
              resizeAllTiles();
            });
          
          });
          

          // one journal file processed
          filesProcessed++;

          // all journal files processed
          if (filesProcessed === entries.length) {

            populateDates();
            populateTitles();

            sortGalleryByShoot();

            requestAnimationFrame(() => {
              resizeAllTiles();
            });

          }

        });

    });

  })
  .catch(err => {
    console.error("Manifest load error:", err);
  });
