function handleClicks(tile, img) {
  tile.addEventListener("click", () => {
    tile.classList.toggle("show-info");
  });
}