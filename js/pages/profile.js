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
}