// js/pages/my_events.js

document.addEventListener("DOMContentLoaded", function () {
    const eventListContainer = document.querySelector('.event-list-organizer');
    const filterTabs = document.querySelectorAll('.filter-tab');

    if (!eventListContainer || filterTabs.length === 0) {
        return;
    }

    // --- HÀM TẠO HTML CHO MỘT THẺ SỰ KIỆN ---
    const createEventCardHTML = (eventData) => {
        // Ánh xạ status từ dữ liệu sang class CSS và text hiển thị
        const statusMap = {
            live: { class: 'status-live', text: 'Đang diễn ra' },
            pending: { class: 'status-pending', text: 'Chờ duyệt' },
            rejected: { class: 'status-rejected', text: 'Bị từ chối' },
            upcoming: { class: 'status-upcoming', text: 'Sắp diễn ra' },
            approved: { class: 'status-approved', text: 'Được duyệt' },
            ended: { class: 'status-ended', text: 'Đã kết thúc' }
        };
         const statusInfo = statusMap[eventData.status] || { class: 'status-pending', text: 'Chờ duyệt' };

        // --- LOGIC MỚI: LẤY ẢNH TỪ sessionStorage ---
        let imgSrc = '../../images/pages/create_event/default-thumb.png'; // Ảnh mặc định
        if (eventData.anhSuKienRef) {
            // Nếu là sự kiện mới tạo, đọc từ sessionStorage
            imgSrc = sessionStorage.getItem(eventData.anhSuKienRef) || imgSrc;
        } else if (eventData.anhSuKien) {
            // Nếu là sự kiện cũ (viết cứng trong HTML), dùng đường dẫn trực tiếp
            imgSrc = eventData.anhSuKien;
        }

        return `
            <div class="event-card-organizer" data-status="${eventData.status}">
                <img src="${eventData.anhSuKien}" alt="Event Thumbnail">
                <div class="event-card-info">
                    <h3>${eventData.tenSuKien}</h3>
                    <p>${new Date(eventData.thoiGian.batDau).toLocaleDateString('vi-VN')}</p>
                </div>
                <div class="event-card-stats">
                    <span class="event-status-badge ${statusInfo.class}">${statusInfo.text}</span>
                    <span>Đã bán: <strong>${eventData.daBan || 0}/${eventData.tongVe || 'N/A'}</strong></span>
                </div>
                <div class="event-card-actions">
                    ${eventData.status !== 'ended' ? '<a href="create_event.html">Chỉnh sửa</a>' : ''}
                    ${eventData.status !== 'pending' && eventData.status !== 'rejected' ? '<a href="reports.html">Xem báo cáo</a>' : ''}
                </div>
            </div>
        `;
    };

    // --- LẤY VÀ HIỂN THỊ SỰ KIỆN TỪ LOCALSTORAGE ---
    const myCreatedEvents = JSON.parse(localStorage.getItem('myCreatedEvents')) || [];
    myCreatedEvents.forEach(event => {
        const eventCardHTML = createEventCardHTML(event);
        // Chèn sự kiện mới vào đầu danh sách
        eventListContainer.insertAdjacentHTML('afterbegin', eventCardHTML);
    });


    // --- LOGIC LỌC (GIỮ NGUYÊN NHƯNG CẬP NHẬT ĐỂ BAO GỒM CẢ SỰ KIỆN MỚI) ---
    const allEventCards = document.querySelectorAll('.event-card-organizer'); // Lấy lại tất cả thẻ card

    const filterEvents = (filter) => {
        allEventCards.forEach(card => {
            const statuses = card.dataset.status.split(' ');
            if (filter === 'all' || statuses.includes(filter)) {
                card.style.display = 'grid';
            } else {
                card.style.display = 'none';
            }
        });
    };

    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const filterValue = this.dataset.filter;
            filterEvents(filterValue);
        });
    });

    // Kích hoạt bộ lọc mặc định ("Tất cả") khi tải trang
    filterEvents('all');
});