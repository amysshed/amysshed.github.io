// sketchbook.js

window.addEventListener('load', () => {
  const gallery = document.querySelector('.sketchbook-gallery');
  const tiles = gallery.querySelectorAll('.sketchbook-tile');

  tiles.forEach(tile => {
    const img = tile.querySelector('img');
    // dynamically calculate row span
    const rowHeight = parseInt(getComputedStyle(gallery).getPropertyValue('grid-auto-rows'));
    const rowGap = parseInt(getComputedStyle(gallery).getPropertyValue('gap'));
    const rowSpan = Math.ceil((img.getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    tile.style.setProperty('--row-span', rowSpan);

    // populate date overlay from data-date attribute
    const dateSpan = tile.querySelector('.date');
    dateSpan.textContent = img.dataset.date;
  });
});
