// js/pages/my_events.js - Logic dành riêng cho trang Sự kiện của tôi

document.addEventListener("DOMContentLoaded", function () {
    // Tìm tất cả các nút lọc và thẻ sự kiện
    const filterTabs = document.querySelectorAll('.filter-tab');
    const eventCards = document.querySelectorAll('.event-card-organizer');

    if (filterTabs.length > 0 && eventCards.length > 0) {
        
        // Hàm để thực hiện việc lọc
        const filterEvents = (filter) => {
            eventCards.forEach(card => {
                const statuses = card.dataset.status.split(' ');

                if (filter === 'all' || statuses.includes(filter)) {
                    card.style.display = 'grid'; // Hiển thị thẻ
                } else {
                    card.style.display = 'none'; // Ẩn thẻ
                }
            });
        };

        // Gán sự kiện click cho mỗi nút lọc
        filterTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Xóa class 'active' khỏi tất cả các nút
                filterTabs.forEach(t => t.classList.remove('active'));
                
                // Thêm class 'active' vào nút vừa được nhấn
                this.classList.add('active');

                // Lấy giá trị filter từ thuộc tính data-filter
                const filterValue = this.dataset.filter;

                // Gọi hàm lọc
                filterEvents(filterValue);
            });
        });
    }
});