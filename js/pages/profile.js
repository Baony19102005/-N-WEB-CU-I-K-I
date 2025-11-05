// js/pages/profile.js - Logic dành riêng cho trang Profile và My Tickets

function initializeProfilePage() {
    const btnChangeAvatar = document.getElementById('btn-change-avatar');
    if (btnChangeAvatar) {
        const avatarUploadInput = document.getElementById('avatar-upload-input');
        const avatarPreviewImg = document.getElementById('avatar-preview-img');
        btnChangeAvatar.addEventListener('click', () => avatarUploadInput.click());
        avatarUploadInput.addEventListener('change', () => {
            const file = avatarUploadInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { avatarPreviewImg.src = e.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }
};

function initializeMyTicketPage() {
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
};