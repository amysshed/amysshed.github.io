window.addEventListener("load", () => {
  const gallery = document.querySelector(".sketchbook-gallery");
  if (!gallery) return;

  const tiles = gallery.querySelectorAll(".sketchbook-tile");

  const rowHeight = parseInt(
    getComputedStyle(gallery).getPropertyValue("grid-auto-rows")
  );
  const rowGap = parseInt(
    getComputedStyle(gallery).getPropertyValue("gap")
  );

  tiles.forEach(tile => {
    const img = tile.querySelector("img");
    const dateSpan = tile.querySelector(".date");

    if (img.dataset.date && dateSpan) {
      dateSpan.textContent = img.dataset.date;
    }

    const resizeTile = () => {
      const imageHeight = img.getBoundingClientRect().height;
      const rowSpan = Math.ceil(
        (imageHeight + rowGap) / (rowHeight + rowGap)
      );
      tile.style.setProperty("--row-span", rowSpan);
    };

    if (img.complete) {
      resizeTile();
    } else {
      img.addEventListener("load", resizeTile);
    }
  });
});


// FILTER LOGIC
const filterToggle = document.querySelector(".filter-toggle");
const filterMenu = document.querySelector(".filter-menu");
const filterButtons = document.querySelectorAll(".filter-menu button");
const tiles = document.querySelectorAll(".sketchbook-tile");

// Toggle menu
filterToggle.addEventListener("click", () => {
  filterMenu.style.display =
    filterMenu.style.display === "block" ? "none" : "block";
});

// Apply filter
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

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

    filterMenu.style.display = "none";
  });
});

const filterSelect = document.getElementById("sketchbook-filter");
const tiles = document.querySelectorAll(".sketchbook-tile");

filterSelect.addEventListener("change", () => {
  const filter = filterSelect.value;

  tiles.forEach(tile => {
    const tags = tile.dataset.tags || "";

    if (filter === "all" || tags.includes(filter)) {
      tile.style.display = "";
    } else {
      tile.style.display = "none";
    }
  });
});



