document.addEventListener("DOMContentLoaded", async () => {
    try {
        const eventId = localStorage.getItem('selectedEventId');
        if (!eventId) {
            alert("Không tìm thấy thông tin sự kiện. Vui lòng chọn lại.");
            window.location.href = "homepage.html";
            return;
        }

        const eventData = await loadEventData(eventId);

        if (eventData) {
            displayEventDetails(eventData);
            // Gọi hàm gán sự kiện TƯƠNG TÁC sau khi đã điền xong dữ liệu
            initializeInteractions();
        } else {
            alert("Không tìm thấy dữ liệu cho sự kiện này.");
            window.location.href = "homepage.html";
        }
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu sự kiện:", error);
    }
});

async function loadEventData(eventId) {
    try {
        const response = await fetch("../../data/events.json");
        const events = await response.json();
        // QUAN TRỌNG: Đảm bảo file events.json của bạn có dữ liệu
        return events.find(event => event.id === eventId);
    } catch (error) {
        console.error("Lỗi khi tải file events.json:", error);
        return null;
    }
}

function displayEventDetails(eventData) {
    // Hàm helper để sửa đường dẫn ảnh
    const fixImagePath = (path) => path ? path.replace('../', '../../') : '';

    // A. Cập nhật Hero Section
    document.querySelector('.hero-info-box h1').textContent = eventData.tenSuKien;

    // Sử dụng cấu trúc suatDien nếu có, nếu không thì dùng thoiGian cũ
    const sessionTime = eventData.suatDien ? eventData.suatDien[0].thoiGian : eventData.thoiGian;
    if (sessionTime) {
        const startTime = new Date(sessionTime.batDau);
        const endTime = new Date(sessionTime.ketThuc);
        const timeString = `${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${startTime.toLocaleDateString('vi-VN')}`;
        document.querySelector('.hero-info-box .info-item:nth-of-type(1) p').textContent = timeString;
    }

    const address = eventData.diaChi.diaDiem;
    const addressContainer = document.querySelector('.hero-info-box .info-item:nth-of-type(2) div');
    if (addressContainer) {
        addressContainer.querySelector('strong').textContent = address.soNha;
        addressContainer.querySelector('p').textContent = `${address.phuong}, ${address.quan}, ${address.tinh}`;
    }

    const heroBanner = document.querySelector('.hero-image-box img');
    heroBanner.src = fixImagePath(eventData.banner);
    heroBanner.alt = eventData.tenSuKien;

    // Tính giá vé thấp nhất từ 'loaiVe' (cấu trúc cũ)
    const tickets = eventData.suatDien ? eventData.suatDien[0].loaiVe : eventData.loaiVe;
    if (tickets && tickets.length > 0) {
        const minPrice = Math.min(...tickets.map(ticket => ticket.giaVe || Infinity));
        document.querySelector('.price-info strong').textContent = `${minPrice > 0 ? minPrice.toLocaleString() : 'Miễn phí'} đ >`;
    }

    // B. Cập nhật phần Giới thiệu
    const formattedInfo = eventData.thongTinSuKien.replace(/..\/images\//g, "../../images/");
    document.getElementById('intro-content').innerHTML = formattedInfo;

    // C. Cập nhật thông tin Ban tổ chức
    const btcContent = document.getElementById('btc-content');
    if (btcContent && eventData.banToChuc) {
        btcContent.innerHTML = `
            ${eventData.banToChuc.logo ? `<img src="${fixImagePath(eventData.banToChuc.logo)}" alt="BTC Logo" style="width:100px; height:100px; border-radius:8px;">` : ''}
            <p><strong>${eventData.banToChuc.ten}</strong></p>
        `;
    }

    // D. Cập nhật danh sách Vé (theo cấu trúc cũ)
    const performanceList = document.querySelector('.performance-list');
    performanceList.innerHTML = '';

    if (tickets) {
        let ticketsHTML = '';
        tickets.forEach(ticket => {
            const isAvailable = ticket.trangThai.toLowerCase() === 'còn vé' || ticket.trangThai.toLowerCase() === 'sắp mở bán';
            ticketsHTML += `
                <div class="ticket-item">
                    <p>${ticket.tenVe}</p>
                    <div class="ticket-price-info">
                        <span>${ticket.giaVe.toLocaleString()} đ</span>
                        <span class="ticket-badge ${isAvailable ? 'available' : 'sold-out'}">${ticket.trangThai}</span>
                    </div>
                </div>
            `;
        });
        performanceList.innerHTML = `<div class="ticket-details-wrapper" style="max-height: 1000px; padding-left: 0;">${ticketsHTML}</div>`;
    }
}

// Hàm gán sự kiện cho các element tương tác
function initializeInteractions() {
    // GÁN SỰ KIỆN CHO NÚT EXPAND GIỚI THIỆU
    const introToggleBtn = document.getElementById('intro-toggle-btn');
    if (introToggleBtn) {
        const introContent = document.getElementById('intro-content');
        introToggleBtn.addEventListener('click', () => {
            introContent.classList.toggle('expanded');
            introToggleBtn.classList.toggle('expanded');
        });
    }

    // GÁN SỰ KIỆN CHO NÚT MUA VÉ CHÍNH
    const buyNowLink = document.querySelector('a.btn-buy-now');
    if (buyNowLink) {
        buyNowLink.addEventListener('click', (e) => {
            const eventId = localStorage.getItem('selectedEventId');
            if (!eventId) {
                e.preventDefault();
                alert("Lỗi: Không tìm thấy ID sự kiện để tiếp tục.");
            }
            // Không cần làm gì thêm, thẻ <a> sẽ tự chuyển trang
        });
    }
}