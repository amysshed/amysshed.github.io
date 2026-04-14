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
    const dA = new Date(a.querySelector("img").dataset.date || 0);
    const dB = new Date(b.querySelector("img").dataset.date || 0);
    return dB - dA;
  });

  tiles.forEach(tile => gallery.appendChild(tile));
}


   /* ========================= FILTER ========================= */ 
const filterSelect = 
   document.getElementById("sketchbook-filter"); 
   if (filterSelect){ 
      filterSelect.addEventListener("change", () => { 
         const filter = filterSelect.value.toLowerCase();  
         
         document.querySelectorAll(".sketchbook-tile").forEach(tile => { 
            const tags = 
               tile.dataset.tags?.split(",").map(t => t.trim()); 
               tile.classList.toggle( "is-hidden", 
               filter !== "all" && !tags?.includes(filter) ); 
         }); 

/* =========================
   LOAD
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

            const tile = document.createElement("div");
            tile.className = "sketchbook-tile";

            // ✅ IMPORTANT (restores filter)
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
            gallery.appendChild(tile);

            populateMeta(tile, newImg);

            newImg.addEventListener("load", () => {
              sortGallery();
              resizeAllTiles();
            });
          });
        });
    });
  });
