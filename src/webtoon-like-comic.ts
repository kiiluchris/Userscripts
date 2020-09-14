

(() => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const likeButton = document.getElementById('likeItButton');
      const isLiked = likeButton?.firstElementChild?.classList.contains('on') || true;
      if (!isLiked) {
        likeButton?.click();
      }
    }, 5000);
  });
})();
