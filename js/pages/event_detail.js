document.addEventListener("DOMContentLoaded", async () => {
    // Hàm này sẽ chạy khi trang đã tải xong
    try {
        const eventId = localStorage.getItem('selectedEventId');
        if (!eventId) {
            alert("Không tìm thấy thông tin sự kiện. Vui lòng chọn lại từ trang chủ.");
            window.location.href = "homepage.html";
            return;
        }

        const eventData = await loadEventData(eventId);

        if (eventData) {
            displayEventDetails(eventData);
            initializeInteractions(); // Gắn các sự kiện click sau khi render
        } else {
            alert("Không thể tải dữ liệu cho sự kiện này.");
            window.location.href = "homepage.html";
        }
    } catch (error) {
        console.error("Lỗi khi khởi tạo trang chi tiết sự kiện:", error);
    }
});

/**
 * Tải dữ liệu của một sự kiện cụ thể từ file JSON.
 * @param {string} eventId - ID của sự kiện cần tải.
 * @returns {Promise<object|null>} Dữ liệu sự kiện hoặc null nếu có lỗi.
 */
async function loadEventData(eventId) {
    try {
        const response = await fetch("../../data/events.json");
        if (!response.ok) throw new Error('Network response was not ok');
        const events = await response.json();
        return events.find(event => event.id === eventId);
    } catch (error) {
        console.error("Lỗi khi tải file events.json:", error);
        return null;
    }
}

/**
 * Hiển thị toàn bộ thông tin chi tiết của sự kiện lên trang.
 * @param {object} eventData - Dữ liệu của sự kiện.
 */
function displayEventDetails(eventData) {
    const fixImagePath = (path) => path ? path.replace('../', '../../') : '';

    // --- A. Cập nhật Hero Section ---
    document.querySelector('.hero-info-box h1').textContent = eventData.tenSuKien;

    // Lấy thông tin từ suất chiếu đầu tiên để hiển thị ở hero
    const firstSession = eventData.suatChieu && eventData.suatChieu[0] ? eventData.suatChieu[0] : eventData.thoiGian;
    if (firstSession) {
        const startTime = new Date(firstSession.batDau);
        const endTime = new Date(firstSession.ketThuc);
        const dateString = startTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeString = `${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${dateString}`;
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

    // Tính giá vé thấp nhất
    if (eventData.loaiVe && eventData.loaiVe.length > 0) {
        const minPrice = Math.min(...eventData.loaiVe.map(ticket => ticket.giaVe));
        document.querySelector('.price-info strong').textContent = `${minPrice > 0 ? minPrice.toLocaleString() : 'Miễn phí'} đ >`;
    }

    // --- B. Cập nhật phần Giới thiệu ---
    const introContent = document.getElementById('intro-content');
    // Kiểm tra xem thongTinSuKien có phải là đường dẫn ảnh hay không
    if (eventData.thongTinSuKien.startsWith('../images/')) {
        introContent.innerHTML = `<img src="${fixImagePath(eventData.thongTinSuKien)}" alt="Thông tin sự kiện" class="content-image">`;
    } else {
        introContent.innerHTML = eventData.thongTinSuKien;
    }

    // --- C. Cập nhật Ban tổ chức ---
    const btcInfoContainer = document.querySelector('.btc-info');
    if (btcInfoContainer && eventData.banToChuc) {
        const { ten = '', logo = '', thongTin = '' } = eventData.banToChuc;
        btcInfoContainer.innerHTML = `
            <img src="${fixImagePath(logo)}" alt="Logo ${ten}">
            <div class="btc-text">
                <p class="btc-name">${ten}</p>
                ${thongTin ? `<p class="btc-desc">${thongTin}</p>` : ''}
            </div>
        `;
    }

    // --- D. Cập nhật danh sách Suất chiếu và Vé (LOGIC MỚI) ---
    const performanceListContainer = document.getElementById('performance-list-container');
    performanceListContainer.innerHTML = ''; // Xóa nội dung cũ

    if (eventData.suatChieu && eventData.suatChieu.length > 0) {
        eventData.suatChieu.forEach(session => {
            const startTime = new Date(session.batDau);
            const endTime = new Date(session.ketThuc);
            const dateString = startTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const timeString = `${startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

            // Kiểm tra xem tất cả vé trong suất chiếu này có hết không
            const allTicketsSoldOut = eventData.loaiVe.every(ticket => ticket.trangThai.toLowerCase() !== 'còn vé');

            const performanceItem = document.createElement('div');
            performanceItem.className = 'performance-item';

            let ticketDetailsHTML = '';
            eventData.loaiVe.forEach(ticket => {
                const isAvailable = ticket.trangThai.toLowerCase() === 'còn vé';
                ticketDetailsHTML += `
                    <div class="ticket-item">
                        <p>${ticket.tenVe}</p>
                        <div class="ticket-price-info">
                            <span>${ticket.giaVe.toLocaleString()} đ</span>
                            <span class="ticket-badge ${isAvailable ? 'available' : 'sold-out'}">${ticket.trangThai}</span>
                        </div>
                    </div>
                `;
            });

            performanceItem.innerHTML = `
                <div class="performance-toggle">
                    <div class="performance-time">
                        <img src="../../images/pages/event_detail/icon-chevron-down-white.png" class="chevron-icon" alt="Toggle">
                        <span>${session.ten} (${timeString}, ${dateString})</span>
                    </div>
                    ${allTicketsSoldOut
                    ? `<span class="status-badge-small">Đã hết vé</span>`
                    : `<a href="buy_ticket.html" class="btn-buy-session">Mua vé ngay</a>`
                }
                </div>
                <div class="ticket-details-wrapper">
                    ${ticketDetailsHTML}
                </div>
            `;
            performanceListContainer.appendChild(performanceItem);
        });
    }
}

function initializeInteractions() {
    // --- GÁN SỰ KIỆN CHO NÚT MỞ RỘNG/THU GỌN GIỚI THIỆU ---
    const introToggleBtn = document.getElementById('intro-toggle-btn');
    const introContent = document.getElementById('intro-content');
    if (introToggleBtn && introContent) {
        introToggleBtn.addEventListener('click', () => {
            introContent.classList.toggle('expanded');
            introToggleBtn.classList.toggle('expanded');
        });
    }

    // --- GÁN SỰ KIỆN CHO CÁC SUẤT CHIẾU ---
    document.querySelectorAll('.performance-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-buy-session')) {
                return;
            }
            const parentItem = toggle.closest('.performance-item');
            if (parentItem) {
                parentItem.classList.toggle('expanded');
            }
        });
    });

    // --- BẢO VỆ CÁC NÚT "MUA VÉ NGAY" (LOGIC MỚI) ---
    document.querySelectorAll('a.btn-buy-now, a.btn-buy-session').forEach(button => {
        button.addEventListener('click', (event) => {
            const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
            const openAuthModalBtn = document.getElementById('open-auth-modal-btn');

            if (!currentUser) {
                // Nếu chưa đăng nhập, ngăn chuyển trang và mở popup
                event.preventDefault();
                alert('Vui lòng đăng nhập để tiếp tục mua vé.');
                if (openAuthModalBtn) {
                    openAuthModalBtn.click(); // Kích hoạt popup đăng nhập
                }

                // Lắng nghe sự kiện đăng nhập thành công để tự động chuyển trang
                document.addEventListener('loginSuccess', () => {
                    // Sau khi đăng nhập thành công, chuyển người dùng đến trang mua vé
                    window.location.href = button.href;
                }, { once: true }); // { once: true } để listener tự hủy sau 1 lần chạy

            } else {
                // Nếu đã đăng nhập, chỉ cần đảm bảo eventId được lưu
                const eventId = localStorage.getItem('selectedEventId');
                if (!eventId) {
                    alert("Lỗi: Không tìm thấy ID sự kiện để tiếp tục.");
                    event.preventDefault();
                }
                // Mặc định, thẻ <a> sẽ tự chuyển trang đến href
            }
        });
    });
}