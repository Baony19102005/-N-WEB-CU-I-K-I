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

    const filterGroups = {
        pills: document.querySelectorAll('.filter-pill'),
        subFilters: document.querySelectorAll('.sub-filter-link'),
        pages: document.querySelectorAll('.page-number')
    };

    const handleActiveClass = (group, clickedElement) => {
        group.forEach(el => el.classList.remove('active'));
        clickedElement.classList.add('active');
    };

    for (const key in filterGroups) {
        if (filterGroups[key].length > 0) {
            filterGroups[key].forEach(element => {
                element.addEventListener('click', (e) => {
                    e.preventDefault();
                    handleActiveClass(filterGroups[key], e.currentTarget);
                });
            });
        }
    }

    // ========== ĐỔ DỮ LIỆU VÉ TỪ data/events.json + localStorage ==========
    const listContainer = document.querySelector('.ticket-list-container');
    if (!listContainer) return;

    const selectedEventId = localStorage.getItem('selectedEventId');
    const selectedTicket = JSON.parse(localStorage.getItem('selectedTicket') || 'null');
    const myTickets = JSON.parse(localStorage.getItem('myTickets') || 'null');

    const fixPath = (p) => (p ? p.replace('../images/', '../../images/') : '../../images/pages/myticket/ticket-event-1.jpg');

    const renderTickets = (items, events) => {
        listContainer.innerHTML = '';
        if (!items || items.length === 0) {
            listContainer.innerHTML = '<p>Chưa có vé nào. Hãy đặt vé để xem tại đây.</p>';
            return;
        }
        items.forEach(t => {
            const ev = events.find(e => e.id === t.eventId) || events.find(e => e.tenSuKien === t.eventName) || {};
            const start = new Date((ev.suatChieu && ev.suatChieu[0]?.batDau) || ev.thoiGian?.batDau || Date.now());
            const end = new Date((ev.suatChieu && ev.suatChieu[0]?.ketThuc) || ev.thoiGian?.ketThuc || Date.now());
            const dateStr = `${start.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}, ${start.toLocaleDateString('vi-VN')}`;
            const locationStr = ev?.diaChi?.diaDiem ? (ev.diaChi.diaDiem.soNha || '') : '';
            const imgSrc = fixPath(ev.banner || ev.anhSuKien);
            const zone = t.zoneName || t.zone || '--';
            const qty = t.quantity ?? 1;
            const code = t.bookingCode || `M${start.getFullYear().toString().slice(2)}${String(start.getMonth()+1).padStart(2,'0')}${String(start.getDate()).padStart(2,'0')}${Math.floor(Math.random()*9000+1000)}`;

            const card = document.createElement('div');
            card.className = 'ticket-card';
            card.innerHTML = `
                <div class="ticket-image">
                    <img src="${imgSrc}" alt="Event Image">
                </div>
                <div class="ticket-details">
                    <h3>${ev.tenSuKien || t.eventName || 'Sự kiện'}</h3>
                    <div class="info-line">
                        <img src="../../images/pages/myticket/icon-calendar-dark.png" alt="Calendar">
                        <p>${dateStr}</p>
                    </div>
                    <div class="info-line">
                        <img src="../../images/pages/myticket/icon-location-dark.png" alt="Location">
                        <p>${locationStr}</p>
                    </div>
                    <div class="specifics">
                        <p>Loại vé: ${zone} (Số lượng: ${qty} vé)</p>
                        <p>Mã đặt vé: ${code}</p>
                    </div>
                </div>
                <div class="ticket-actions">
                    <a href="event_detail.html" class="btn-view-detail">Xem chi tiết</a>
                </div>`;

            // Lưu lại eventId khi xem chi tiết
            const detailLink = card.querySelector('.btn-view-detail');
            detailLink.addEventListener('click', () => {
                if (ev.id) localStorage.setItem('selectedEventId', ev.id);
            });

            listContainer.appendChild(card);
        });
    };

    const getEndTime = (ev) => {
        const end = (ev.suatChieu && ev.suatChieu[0]?.ketThuc) || ev.thoiGian?.ketThuc;
        return end ? new Date(end).getTime() : Date.now();
    };

    const now = () => Date.now();

    const applyFiltersAndRender = (events) => {
        let items = JSON.parse(localStorage.getItem('myTickets') || '[]');
        // loại bỏ hold hết hạn
        items = items.filter(t => !(t.status === 'Đang xử lý' && t.expiresAt && now() > Number(t.expiresAt)));
        localStorage.setItem('myTickets', JSON.stringify(items));

        // Nếu không có gì và có selectedTicket, hiển thị tạm
        if (items.length === 0 && (selectedEventId || selectedTicket)) {
            const COUNTDOWN_KEY = 'buyTicketCountdownEnd';
            const expiresAt = Number(sessionStorage.getItem(COUNTDOWN_KEY));
            const temp = {
                eventId: selectedEventId,
                eventName: selectedTicket?.eventName,
                zoneName: selectedTicket?.zoneName,
                quantity: selectedTicket?.quantity,
                status: expiresAt && now() < expiresAt ? 'Đang xử lý' : 'Thành công',
                expiresAt
            };
            items = [temp];
        }

        // Status filter
        const activePill = document.querySelector('.filter-pill.active');
        const statusFilter = activePill ? activePill.textContent.trim() : 'Tất cả';
        let filtered = items.filter(t => {
            if (statusFilter === 'Tất cả') return true;
            return t.status === statusFilter;
        });

        // Time filter
        const subActive = document.querySelector('.sub-filter-link.active');
        const timeFilter = subActive ? subActive.textContent.trim() : 'Sắp diễn ra';
        filtered = filtered.filter(t => {
            const ev = events.find(e => e.id === t.eventId) || events.find(e => e.tenSuKien === t.eventName);
            if (!ev) return true;
            const ended = getEndTime(ev) < now();
            return timeFilter === 'Sắp diễn ra' ? !ended : ended;
        });

        renderTickets(filtered, events);
    };

    // Load events.json rồi render + bind filters
    fetch('../../data/events.json')
        .then(r => r.json())
        .then(events => {
            applyFiltersAndRender(events);
            // Re-render when filters clicked
            ['.filter-pill', '.sub-filter-link'].forEach(sel => {
                document.querySelectorAll(sel).forEach(el => {
                    el.addEventListener('click', (e) => {
                        e.preventDefault();
                        const group = document.querySelectorAll(sel);
                        group.forEach(x => x.classList.remove('active'));
                        e.currentTarget.classList.add('active');
                        applyFiltersAndRender(events);
                    });
                });
            });
        })
        .catch(() => renderTickets([], []));
}
