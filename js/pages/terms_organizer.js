document.addEventListener("DOMContentLoaded", function () {
    const accordionItems = document.querySelectorAll('.accordion-item');

    if (accordionItems.length > 0) {
        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            if (header) {
                header.addEventListener('click', () => {
                    // Đóng tất cả các mục khác
                    accordionItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Mở hoặc đóng mục hiện tại
                    item.classList.toggle('active');
                });
            }
        });
    }
});