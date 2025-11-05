// js/common.js - PHIÊN BẢN HOÀN THIỆN

document.addEventListener("DOMContentLoaded", function () {
    // ===================================================================
    // ĐỊNH NGHĨA CÁC HÀM DÙNG CHUNG
    // ===================================================================

    // BIẾN QUAN TRỌNG: Kiểm tra xem trang hiện tại có nằm trong thư mục /pages/ hay không.
    const isInsidePages = window.location.pathname.includes('/html/pages/');

    // Thêm modal auth vào body nếu chưa tồn tại
    if (!document.getElementById('auth-modal')) {
        const modalDiv = document.createElement('div');
        modalDiv.id = 'auth-modal';
        modalDiv.className = 'auth-modal-overlay';
        document.body.appendChild(modalDiv);
    }

    /**
     * Hàm tải template (header, footer) và chèn vào trang.
     * @param {string} selector - Selector CSS của element đích (ví dụ: '#header-placeholder').
     * @param {string} url - Đường dẫn đến file template TÍNH TỪ THƯ MỤC GỐC của dự án.
     */
    function loadTemplate(selector, url) {
        // Đường dẫn tương đối từ vị trí file HTML hiện tại đến file template
        // Nếu đang ở trong /html/pages/, đường dẫn cần đi ngược lên 2 cấp (../../)
        // Nếu ở gốc, đường dẫn giữ nguyên.
        // Đây là cách tính toán chính xác nhất.
        const finalUrl = isInsidePages ? `../../${url}` : url;

        return fetch(finalUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Không thể tải ${finalUrl}. Status: ${response.status}`);
                return response.text();
            })
            .then(data => {
                const element = document.querySelector(selector);
                if (element) {
                    // Sửa lại đường dẫn ảnh bên trong template để luôn đúng
                    // Bất kể template được chèn vào đâu, đường dẫn ảnh luôn tính từ gốc.
                    const correctedHtml = data.replace(/src="\.\.\/\.\.\/images\//g, 'src="../../images/');
                    element.innerHTML = correctedHtml;
                    // Nếu đây là header, khởi tạo modal auth sau khi header được load
                    if (selector === '#header-placeholder') {
                        initializeAuthModal();
                    }
                }
            })
            .catch(error => console.error(`Lỗi khi tải template cho '${selector}':`, error));
    };

    /**
     * Khởi tạo tất cả logic cho popup (mở, đóng, chuyển form).
     */
    function initializeAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const openModalBtn = document.getElementById('open-auth-modal-btn');

        if (!authModal || !openModalBtn) {
            console.warn("Không tìm thấy element của modal hoặc nút mở modal. Bỏ qua khởi tạo popup.");
            return;
        }

        const loadAndShowModal = (modalName) => {
            const modalPath = isInsidePages ? `../templates/${modalName}.html` : `html/templates/${modalName}.html`;
            fetch(modalPath)
                .then(response => response.text())
                .then(html => {
                    const correctedHtml = html.replace(/src="\.\.\/\.\.\/images\//g, 'src="../../images/');
                    authModal.innerHTML = correctedHtml;
                    authModal.classList.add('active');
                    attachModalEvents();
                });
        };

        const attachModalEvents = () => {
            const closeModalBtn = authModal.querySelector('.close-modal-btn');
            if (closeModalBtn) closeModalBtn.addEventListener('click', () => authModal.classList.remove('active'));

            authModal.querySelectorAll('[data-modal]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadAndShowModal(link.getAttribute('data-modal'));
                });
            });

            authModal.querySelectorAll('.password-toggle-icon').forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const passwordInput = toggle.previousElementSibling;
                    const isPassword = passwordInput.type === 'password';
                    passwordInput.type = isPassword ? 'text' : 'password';
                    const eyeIconPath = '../../images/common/';
                    toggle.src = isPassword ? `${eyeIconPath}icon-eye-open.png` : `${eyeIconPath}icon-eye-closed.png`;
                });
            });
        };

        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loadAndShowModal('login');
        });

        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) authModal.classList.remove('active');
        });
    };

    // (Hàm initializeDatePicker của bạn giữ nguyên, không cần sửa)
    window.initializeDatePicker = (options) => {
        const modal = document.getElementById(options.modalId);
        if (!modal) return;
        // ... (phần còn lại của hàm không thay đổi)
        let currentTargetInput = null;
        let displayedDate = new Date();
        let startDate = null;
        let endDate = null;

        const dateInputs = options.triggerSelector ? document.querySelectorAll(options.triggerSelector) : [document.getElementById(options.triggerId)];
        const calendarGrid1 = document.getElementById(options.grid1Id);
        const calendarGrid2 = document.getElementById(options.grid2Id);
        const monthName1 = document.getElementById(options.month1Id);
        const monthName2 = document.getElementById(options.month2Id);
        const prevBtn = document.getElementById(options.prevBtnId);
        const nextBtn = document.getElementById(options.nextBtnId);
        const applyBtn = modal.querySelector('.btn-apply');
        const resetBtn = modal.querySelector('.btn-reset');
        const quickOptions = modal.querySelector('.quick-date-options');

        const renderMonth = (grid, monthNameEl, month, year) => {
            if (!grid || !monthNameEl) return;
            grid.innerHTML = '';
            monthNameEl.textContent = `Tháng ${month + 1}, ${year}`;
            const firstDayOfMonth = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

            for (let i = 0; i < dayOffset; i++) grid.insertAdjacentHTML('beforeend', '<span></span>');

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dayEl = document.createElement('span');
                dayEl.textContent = day;
                dayEl.classList.add('day');
                dayEl.dataset.date = date.toISOString();

                if (options.mode === 'range') {
                    if (startDate && date.getTime() === startDate.getTime()) dayEl.classList.add('selected-start');
                    if (endDate && date.getTime() === endDate.getTime()) dayEl.classList.add('selected-end');
                    if (startDate && endDate && date > startDate && date < endDate) dayEl.classList.add('in-range');
                } else {
                    if (startDate && date.toDateString() === startDate.toDateString()) dayEl.classList.add('selected-start');
                }
                grid.appendChild(dayEl);
            }
        };

        const renderCalendar = (month, year) => {
            renderMonth(calendarGrid1, monthName1, month, year);
            const nextMonthDate = new Date(year, month + 1, 1);
            renderMonth(calendarGrid2, monthName2, nextMonthDate.getMonth(), nextMonthDate.getFullYear());
        };

        const handleDayClick = (e) => {
            const target = e.target.closest('.day');
            if (!target) return;
            const clickedDate = new Date(target.dataset.date);

            if (options.mode === 'range') {
                if (!startDate || (startDate && endDate)) {
                    startDate = clickedDate;
                    endDate = null;
                } else if (clickedDate < startDate) {
                    startDate = clickedDate;
                } else {
                    endDate = clickedDate;
                }
            } else {
                startDate = clickedDate;
            }
            renderCalendar(displayedDate.getMonth(), displayedDate.getFullYear());
        };

        dateInputs.forEach(input => {
            input.addEventListener('click', (e) => {
                currentTargetInput = e.target;
                startDate = null;
                endDate = null;
                renderCalendar(displayedDate.getMonth(), displayedDate.getFullYear());
                modal.classList.add('active');
            });
        });

        if (calendarGrid1) calendarGrid1.addEventListener('click', handleDayClick);
        if (calendarGrid2) calendarGrid2.addEventListener('click', handleDayClick);
        if (prevBtn) prevBtn.addEventListener('click', () => {
            displayedDate.setMonth(displayedDate.getMonth() - 1);
            renderCalendar(displayedDate.getMonth(), displayedDate.getFullYear());
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            displayedDate.setMonth(displayedDate.getMonth() + 1);
            renderCalendar(displayedDate.getMonth(), displayedDate.getFullYear());
        });

        if (applyBtn) applyBtn.addEventListener('click', () => {
            let combinedTime = null;
            const hourEl = modal.querySelector('#org-hour-select');
            const minuteEl = modal.querySelector('#org-minute-select');
            if (hourEl && minuteEl) {
                combinedTime = `${hourEl.value}:${minuteEl.value}`;
            } else {
                const legacyTimeInput = modal.querySelector('input[type="time"]');
                if (legacyTimeInput) {
                    combinedTime = legacyTimeInput.value;
                }
            }
            options.onApply({ startDate, endDate, time: combinedTime, target: currentTargetInput });
            modal.classList.remove('active');
        });

        if (resetBtn) resetBtn.addEventListener('click', () => {
            startDate = null;
            endDate = null;
            if (currentTargetInput) currentTargetInput.value = '';
            renderCalendar(displayedDate.getMonth(), displayedDate.getFullYear());
        });

        if (quickOptions) {
            quickOptions.addEventListener('click', (e) => {
                if (e.target.tagName !== 'BUTTON') return;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const range = e.target.dataset.range;
                if (range === 'all') { startDate = null; endDate = null; }
                if (range === 'today') { startDate = today; endDate = today; }
                if (range === 'tomorrow') { const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1); startDate = tomorrow; endDate = tomorrow; }
                if (range === 'this_weekend') {
                    const dayOfWeek = today.getDay();
                    const saturday = new Date(today);
                    saturday.setDate(today.getDate() + (6 - (dayOfWeek === 0 ? 7 : dayOfWeek) + 7) % 7);
                    const sunday = new Date(saturday);
                    sunday.setDate(saturday.getDate() + 1);
                    startDate = (dayOfWeek === 0) ? today : saturday;
                    endDate = sunday;
                }
                if (range === 'this_month') {
                    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                }
                renderCalendar(displayedDate.getMonth(), displayedDate.getFullYear());
            });
        }
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

        if (calendarGrid1 && monthName1) {
            renderCalendar(displayedDate.getMonth(), displayedDate.getFullYear());
        }
    };

    // ===================================================================
    // ĐIỂM BẮT ĐẦU CHẠY CODE
    // ===================================================================

    // Hàm chính để khởi tạo trang
    async function initializePage() {
        // Bước 1: Tải đồng thời header và footer. Chờ cho đến khi cả hai hoàn thành.
        await Promise.all([
            loadTemplate('#header-placeholder', 'html/templates/header.html'),
            loadTemplate('#footer-placeholder', 'html/templates/footer.html')
        ]);

        // Bước 2: Sau khi header và footer đã chắc chắn có trong DOM,
        // mới tiến hành khởi tạo các chức năng phụ thuộc vào chúng.
        initializeAuthModal();

        // (Nếu các hàm khác cũng phụ thuộc vào header/footer, hãy đặt chúng ở đây)
    }

    // Gọi hàm khởi tạo chính
    initializePage();

    // --- PHẦN 2: CHẠY LOGIC DÀNH RIÊNG CHO TỪNG TRANG ---
    // Phần này có thể giữ nguyên vì nó không phụ thuộc vào header/footer
    if (typeof initializeCreateEventPage === 'function' && document.getElementById('create-event-page')) {
        initializeCreateEventPage();
    }
    if (typeof initializeProfilePage === 'function' && document.querySelector('.profile-content:not(.my-tickets)')) {
        initializeProfilePage();
    }
    if (typeof initializeMyTicketPage === 'function' && document.querySelector('.my-tickets')) {
        initializeMyTicketPage();
    }
});