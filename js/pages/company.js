document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.acc-item');
  items.forEach((item, index) => {
    const btn = item.querySelector('.acc-header');
    if (!btn) return;
    btn.addEventListener('click', () => {
      // Đóng các mục khác để bố cục gọn gàng
      items.forEach(i => { if (i !== item) i.classList.remove('active'); });
      item.classList.toggle('active');
    });
  });
});
