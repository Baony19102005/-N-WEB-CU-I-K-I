// js/pages/profile.js - Chỉ định nghĩa các hàm, không tự gọi

function initializeProfilePage() {
    // Đoạn này kiểm tra để chắc chắn chỉ chạy khi có form
    const form = document.querySelector('.profile-content form');
    if (!form) return;

    const avatarPreviewContainer = document.getElementById('avatar-preview-container');
    const avatarUploadInput = document.getElementById('avatar-upload-input');
    const btnChangeAvatar = document.getElementById('btn-change-avatar');

    const fullNameInput = document.getElementById('full-name');
    const phoneInput = document.getElementById('phone-number');
    const emailInput = document.getElementById('email');
    const birthDateInput = document.getElementById('birth-date');

    const sidebarAvatar = document.getElementById('sidebar-avatar-img');
    const sidebarName = document.getElementById('sidebar-user-name');

    let newAvatarDataUrl = null;

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    const renderAvatar = (src) => {
        const oldImg = avatarPreviewContainer.querySelector('#avatar-preview-img');
        if (oldImg) oldImg.remove();
        if (src) {
            const newImg = document.createElement('img');
            newImg.id = 'avatar-preview-img';
            newImg.src = src;
            newImg.alt = "User Avatar";
            avatarPreviewContainer.prepend(newImg);
        }
    };

    if (sidebarAvatar) {
        sidebarAvatar.src = currentUser.avatar || '../../images/pages/profile/user-avatar.png';
    }
    if (sidebarName) {
        sidebarName.textContent = currentUser.fullName || currentUser.email.split('@')[0];
    }

    fullNameInput.value = currentUser.fullName || (currentUser.name || '');
    phoneInput.value = currentUser.phone || '';
    emailInput.value = currentUser.email || '';
    emailInput.disabled = true;
    birthDateInput.value = currentUser.birthDate || '';

    renderAvatar(currentUser.avatar);

    if (currentUser.gender) {
        const genderRadio = document.querySelector(`input[name="gender"][value="${currentUser.gender}"]`);
        if (genderRadio) genderRadio.checked = true;
    }

    if (btnChangeAvatar && avatarUploadInput) {
        btnChangeAvatar.addEventListener('click', () => avatarUploadInput.click());

        avatarUploadInput.addEventListener('change', () => {
            const file = avatarUploadInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    renderAvatar(e.target.result);
                    newAvatarDataUrl = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(user => user.email === currentUser.email);

        if (userIndex === -1) {
            alert('Lỗi: Không tìm thấy người dùng.');
            return;
        }

        const updatedUser = {
            ...users[userIndex],
            fullName: fullNameInput.value,
            phone: phoneInput.value,
            birthDate: birthDateInput.value,
            gender: document.querySelector('input[name="gender"]:checked')?.value,
            avatar: newAvatarDataUrl || users[userIndex].avatar
        };

        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

        alert('Cập nhật thông tin thành công!');
        window.location.reload();
    });
}

function initializeMyTicketPage() {
    // Kiểm tra để chắc chắn chỉ chạy khi có đúng trang
    if (!document.querySelector('.my-tickets')) return;

    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const listContainer = document.querySelector('.ticket-list-container');

    // Cập nhật thông tin sidebar
    if (currentUser) {
        const sidebarAvatar = document.getElementById('sidebar-avatar-img');
        const sidebarName = document.getElementById('sidebar-user-name');
        if (sidebarAvatar) {
            sidebarAvatar.src = currentUser.avatar || '../../images/pages/myticket/user-avatar.png';
        }
        if (sidebarName) {
            sidebarName.textContent = currentUser.fullName || currentUser.email.split('@')[0];
        }
    }

    if (!listContainer) return;

    // --- Định nghĩa các hàm tiện ích ---
    const fixPath = (p) => (p ? p.replace('../images/', '../../images/') : '../../images/pages/myticket/ticket-event-1.jpg');
    const getEndTime = (ev) => {
        const end = (ev.suatChieu && ev.suatChieu[0]?.ketThuc) || ev.thoiGian?.ketThuc;
        return end ? new Date(end).getTime() : 0;
    };

    // --- Hàm Render (không đổi) ---
    const renderTickets = (items, events) => {
        listContainer.innerHTML = '';
        if (!items || items.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #6B7280;">Chưa có vé nào. Hãy đặt vé để xem tại đây.</p>';
            return;
        }
        items.forEach(t => {
            const ev = events.find(e => e.id === t.eventId) || {};
            const start = new Date((ev.suatChieu && ev.suatChieu[0]?.batDau) || ev.thoiGian?.batDau || Date.now());
            const end = new Date((ev.suatChieu && ev.suatChieu[0]?.ketThuc) || ev.thoiGian?.ketThuc || Date.now());
            const dateStr = `${start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${start.toLocaleDateString('vi-VN')}`;
            const locationParts = [ev?.diaChi?.diaDiem?.soNha, ev?.diaChi?.diaDiem?.tinh];
            const locationStr = locationParts.filter(Boolean).join(', ');
            const imgSrc = fixPath(ev.banner || ev.anhSuKien);
            const zone = t.zoneName || '--';
            const qty = t.quantity || 1;
            const code = t.bookingCode || 'N/A';

            const card = document.createElement('div');
            card.className = 'ticket-card';
            card.innerHTML = `
                <div class="ticket-image"><img src="${imgSrc}" alt="Event Image"></div>
                <div class="ticket-details">
                    <h3>${ev.tenSuKien || t.eventName || 'Sự kiện không xác định'}</h3>
                    <div class="info-line"><img src="../../images/pages/myticket/icon-calendar-dark.png" alt="Calendar"><p>${dateStr}</p></div>
                    <div class="info-line"><img src="../../images/pages/myticket/icon-location-dark.png" alt="Location"><p>${locationStr}</p></div>
                    <div class="specifics">
                        <p>Loại vé: ${zone} (Số lượng: ${qty} vé)</p>
                        <p>Mã đặt vé: ${code}</p>
                    </div>
                </div>
                <div class="ticket-actions"><a href="event_detail.html" class="btn-view-detail">Xem chi tiết</a></div>`;

            card.querySelector('.btn-view-detail').addEventListener('click', () => {
                if (ev.id) localStorage.setItem('selectedEventId', ev.id);
            });
            listContainer.appendChild(card);
        });
    };

    // --- Hàm Lọc và Render ---
    const applyFiltersAndRender = (events) => {
        if (!currentUser) {
            renderTickets([], events);
            return;
        }
        let allMyTickets = JSON.parse(localStorage.getItem('myTickets') || '[]');
        let items = allMyTickets.filter(ticket => ticket.userId === currentUser.email);

        const activePill = document.querySelector('.filter-pill.active');
        const statusFilter = activePill ? activePill.textContent.trim() : 'Tất cả';
        const filteredByStatus = items.filter(t => statusFilter === 'Tất cả' || t.status === statusFilter);

        const subActive = document.querySelector('.sub-filter-link.active');
        const timeFilter = subActive ? subActive.textContent.trim() : 'Sắp diễn ra';
        const finalFiltered = filteredByStatus.filter(t => {
            const ev = events.find(e => e.id === t.eventId);
            if (!ev) return true;
            const isEventEnded = getEndTime(ev) < Date.now();
            return timeFilter === 'Sắp diễn ra' ? !isEventEnded : isEventEnded;
        });

        renderTickets(finalFiltered, events);
    };

    // --- ĐIỂM THỰC THI CHÍNH ---
    fetch('../../data/events.json')
        .then(response => {
            if (!response.ok) throw new Error("Network response error");
            return response.json();
        })
        .then(events => {
            // Chỉ gắn sự kiện cho filter MỘT LẦN DUY NHẤT
            document.querySelectorAll('.filter-pill, .sub-filter-link').forEach(el => {
                el.addEventListener('click', (e) => {
                    e.preventDefault();
                    const group = e.currentTarget.classList.contains('filter-pill')
                        ? document.querySelectorAll('.filter-pill')
                        : document.querySelectorAll('.sub-filter-link');
                    group.forEach(x => x.classList.remove('active'));
                    e.currentTarget.classList.add('active');

                    // Mỗi lần click, gọi lại hàm lọc với dữ liệu `events` đã có
                    applyFiltersAndRender(events);
                });
            });

            // Chạy lần render đầu tiên sau khi đã gắn xong sự kiện
            applyFiltersAndRender(events);
        })
        .catch(error => {
            console.error("Lỗi khi tải hoặc xử lý events.json:", error);
            renderTickets([], []);
        });
}