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


    // ===================================================================
    // LOGIC XỬ LÝ AUTHENTICATION (ĐĂNG NHẬP, ĐĂNG KÝ, ĐĂNG XUẤT)
    // ===================================================================

    /**
     * Lấy danh sách tất cả người dùng từ localStorage.
     * @returns {Array} Mảng các đối tượng người dùng.
     */
    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    /**
     * Lưu lại danh sách người dùng vào localStorage.
     * @param {Array} users - Mảng người dùng cần lưu.
     */
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    /**
     * Lưu thông tin người dùng đang đăng nhập vào sessionStorage.
     * @param {object} user - Đối tượng người dùng.
     */
    function setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    }

    /**
     * Lấy thông tin người dùng đang đăng nhập từ sessionStorage.
     * @returns {object|null} Đối tượng người dùng hoặc null.
     */
    function getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    }

    /**
     * Xóa thông tin người dùng đang đăng nhập.
     */
    function clearCurrentUser() {
        sessionStorage.removeItem('currentUser');
    }

    function updateHeaderUI() {
        const currentUser = getCurrentUser();

        // --- Header Chung ---
        const guestView = document.getElementById('guest-view');
        const userView = document.getElementById('user-view');
        if (guestView && userView) {
            guestView.style.display = currentUser ? 'none' : 'block';
            userView.style.display = currentUser ? 'block' : 'none';
            if (currentUser) {
                const userNameSpan = document.getElementById('user-name-span');
                const userAvatarImg = document.getElementById('user-avatar-img');
                // Hiển thị tên (ưu tiên fullName, nếu không có thì lấy từ email)
                userNameSpan.textContent = currentUser.fullName || currentUser.email.split('@')[0];
                // Hiển thị avatar (nếu có) hoặc ảnh mặc định
                userAvatarImg.src = currentUser.avatar || '../../images/common/default-avatar.png';
            }
        }

        // --- Header Riêng của Organizer ---
        const orgGuestView = document.getElementById('org-guest-view');
        const orgUserView = document.getElementById('org-user-view');
        if (orgGuestView && orgUserView) {
            orgGuestView.style.display = currentUser ? 'none' : 'flex';
            orgUserView.style.display = currentUser ? 'flex' : 'none';
            if (currentUser) {
                const orgUserNameSpan = document.getElementById('org-user-name-span');
                const orgUserAvatarImg = document.getElementById('org-user-avatar-img');
                orgUserNameSpan.textContent = currentUser.fullName || currentUser.email.split('@')[0];
                orgUserAvatarImg.src = currentUser.avatar || '../../images/pages/create_event/user-avatar.png';
            }
        }
    }

    function initializeUserMenu() {
        // Menu cho header chung
        const userAvatarTrigger = document.getElementById('user-avatar-trigger');
        const userDropdownMenu = document.getElementById('user-dropdown-menu');
        const logoutBtn = document.getElementById('logout-btn');
        if (userAvatarTrigger && userDropdownMenu) {
            userAvatarTrigger.addEventListener('click', () => {
                userDropdownMenu.style.display = userDropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
        }
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clearCurrentUser();
                updateHeaderUI();
            });
        }

        // Menu cho header organizer
        const orgAvatarTrigger = document.getElementById('org-user-avatar-trigger');
        const orgDropdownMenu = document.getElementById('org-user-dropdown-menu');
        const orgLogoutBtn = document.getElementById('org-logout-btn');
        const orgLoginBtn = document.getElementById('org-login-btn'); // Nút đăng nhập của header org
        const openAuthModalBtn = document.getElementById('open-auth-modal-btn'); // Nút đăng nhập của header chung

        if (orgAvatarTrigger && orgDropdownMenu) {
            orgAvatarTrigger.addEventListener('click', () => {
                orgDropdownMenu.style.display = orgDropdownMenu.style.display === 'block' ? 'none' : 'block';
            });
        }
        if (orgLogoutBtn) {
            orgLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                clearCurrentUser();
                window.location.reload(); // Tải lại trang để guard kích hoạt
            });
        }
        // Gắn sự kiện cho nút "Đăng nhập" của header organizer
        if (orgLoginBtn && openAuthModalBtn) {
            orgLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openAuthModalBtn.click(); // Kích hoạt popup từ header chung
            });
        }

        // Ẩn tất cả dropdown khi click ra ngoài
        document.addEventListener('click', (e) => {
            if (userDropdownMenu && userAvatarTrigger && !userAvatarTrigger.contains(e.target)) {
                userDropdownMenu.style.display = 'none';
            }
            if (orgDropdownMenu && orgAvatarTrigger && !orgAvatarTrigger.contains(e.target)) {
                orgDropdownMenu.style.display = 'none';
            }
        });
    }

    /**
         * Giả lập quá trình đăng nhập bằng Google.
         */
    function handleGoogleLogin() {
        // 1. Giả lập một tài khoản Google mẫu
        const googleUser = {
            email: "google.user@gmail.com",
            // Google không trả về mật khẩu, nên chúng ta không cần lưu
            // Bạn có thể thêm các thông tin khác như tên, avatar...
            name: "Google User",
            avatar: "../../images/common/google-avatar-example.png" // Chuẩn bị 1 ảnh avatar mẫu
        };

        // 2. Lấy danh sách user hiện tại
        let users = getUsers();

        // 3. Kiểm tra xem user Google này đã tồn tại trong "database" của chúng ta chưa
        let existingUser = users.find(user => user.email === googleUser.email);

        if (!existingUser) {
            // Nếu chưa tồn tại, tạo một tài khoản mới cho họ
            users.push(googleUser);
            saveUsers(users);
            existingUser = googleUser;
        }

        // 4. Thực hiện đăng nhập
        setCurrentUser(existingUser);

        // 5. Thông báo, đóng popup và cập nhật giao diện
        alert(`Đăng nhập thành công với tài khoản Google: ${existingUser.email}`);
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.remove('active');
        }
        updateHeaderUI();
        document.dispatchEvent(new Event('loginSuccess'));
    }


    function initializeAuthModal() {
        const authModal = document.getElementById('auth-modal');
        const openModalBtn = document.getElementById('open-auth-modal-btn');
        if (!authModal || !openModalBtn) {
            console.warn("Bỏ qua khởi tạo popup: không tìm thấy auth-modal hoặc open-auth-modal-btn.");
            return;
        }

        const handleFormSubmit = () => { // <--- BỎ tham số formType
            const emailInput = authModal.querySelector('input[type="email"], input[placeholder*="email"]');
            const passwordInputs = authModal.querySelectorAll('input[type="password"]');

            if (!emailInput || passwordInputs.length === 0) {
                alert('Lỗi cấu trúc form: Không tìm thấy ô email hoặc mật khẩu.');
                return;
            }

            // --- XÁC ĐỊNH LOẠI FORM TẠI THỜI ĐIỂM CLICK ---
            // Nếu có nhiều hơn 1 ô password, đó là form signup
            const formType = passwordInputs.length > 1 ? 'signup' : 'login';
            // ---------------------------------------------------

            const email = emailInput.value.trim();
            const password = passwordInputs[0].value;

            // ... (Phần validation email, password rỗng giữ nguyên) ...
            if (!email || !password) {
                alert('Vui lòng nhập đầy đủ email và mật khẩu.');
                return;
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Định dạng email không hợp lệ. Vui lòng kiểm tra lại.');
                return;
            }

            const users = getUsers();

            if (formType === 'signup') {
                const passwordConfirm = passwordInputs[1].value;
                if (!passwordConfirm) {
                    alert('Vui lòng nhập lại mật khẩu.');
                    return;
                }
                if (password !== passwordConfirm) {
                    alert('Mật khẩu nhập lại không khớp.');
                    return;
                }
                if (users.find(user => user.email === email)) {
                    alert('Email này đã được sử dụng. Vui lòng chọn email khác.');
                    return;
                }

                const newUser = { email, password };
                users.push(newUser);
                saveUsers(users);
                setCurrentUser(newUser);

                alert('Đăng ký thành công! Chuyển đến trang cài đặt tài khoản.');
                authModal.classList.remove('active');
                window.location.href = isInsidePages ? 'profile.html' : 'html/pages/profile.html';

            } else if (formType === 'login') {
                const foundUser = users.find(user => user.email === email && user.password === password);
                if (foundUser) {
                    setCurrentUser(foundUser);
                    alert('Đăng nhập thành công!');
                    authModal.classList.remove('active');
                    updateHeaderUI();
                    document.dispatchEvent(new Event('loginSuccess'));
                } else {
                    alert('Email hoặc mật khẩu không chính xác.');
                }
            }
        };

        const loadAndShowModal = (modalName) => {
            const modalPath = isInsidePages ? `../templates/${modalName}.html` : `html/templates/${modalName}.html`;
            fetch(modalPath)
                .then(response => response.text())
                .then(html => {
                    const correctedHtml = html.replace(/src="\.\.\/\.\.\/images\//g, 'src="../../images/');
                    authModal.innerHTML = correctedHtml;
                    authModal.classList.add('active');
                    attachModalEvents(); // <--- BỎ tham số modalName
                });
        };

        const attachModalEvents = () => { // <--- BỎ tham số modalName
            const content = authModal.querySelector('.auth-modal-content');
            if (!content) return;

            // Dọn dẹp listener cũ trước khi gắn mới (phương pháp an toàn)
            const oldPrimaryBtn = content.querySelector('.btn-primary');
            const newPrimaryBtn = oldPrimaryBtn.cloneNode(true);
            oldPrimaryBtn.parentNode.replaceChild(newPrimaryBtn, oldPrimaryBtn);

            // Gắn sự kiện
            content.querySelector('.close-modal-btn')?.addEventListener('click', () => authModal.classList.remove('active'));
            newPrimaryBtn.addEventListener('click', handleFormSubmit); // <--- THAY ĐỔI
            content.querySelector('.btn-google')?.addEventListener('click', handleGoogleLogin);

            content.querySelectorAll('[data-modal]').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadAndShowModal(link.dataset.modal);
                });
            });

            content.querySelectorAll('.password-toggle-icon').forEach(toggle => {
                toggle.addEventListener('click', () => {
                    // ... logic toggle password giữ nguyên ...
                    const passwordInput = toggle.previousElementSibling;
                    if (passwordInput && passwordInput.type) {
                        const isPassword = passwordInput.type === 'password';
                        passwordInput.type = isPassword ? 'text' : 'password';
                        const eyeIconPath = '../../images/common/';
                        toggle.src = isPassword ? `${eyeIconPath}icon-eye-open.png` : `${eyeIconPath}icon-eye-closed.png`;
                    }
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
    }

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

    async function initializePage() {
        // LUÔN TẢI HEADER CHUNG VÀ FOOTER TRÊN MỌI TRANG
        await Promise.all([
            loadTemplate('#header-placeholder', 'html/templates/header.html'),
            loadTemplate('#footer-placeholder', 'html/templates/footer.html')
        ]);

        // ẨN HEADER CHUNG NẾU ĐÂY LÀ TRANG ORGANIZER
        const isOrganizerPage = document.body.classList.contains('organizer-body');
        if (isOrganizerPage) {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                headerPlaceholder.style.display = 'none';
            }
        }

        // Sau khi các thành phần cần thiết đã tải xong
        updateHeaderUI();
        initializeAuthModal(); // Bây giờ hàm này sẽ luôn tìm thấy #open-auth-modal-btn
        initializeUserMenu();

        // --- GỌI CÁC HÀM KHỞI TẠO CỦA TRANG CON TẠI ĐÂY ---
        // Điều này đảm bảo chúng chỉ được gọi một lần, sau khi mọi thứ đã sẵn sàng.
        if (typeof initializeProfilePage === 'function') {
            initializeProfilePage();
        }
        if (typeof initializeMyTicketPage === 'function') {
            initializeMyTicketPage();
        }
        if (typeof initializeCreateEventPage === 'function') {
            initializeCreateEventPage();
        }
        // Thêm các hàm của trang khác vào đây nếu cần...

        // Phát tín hiệu cho các script guard (nếu vẫn cần)
        document.dispatchEvent(new Event('commonJsLoaded'));
    }

    // Gọi hàm khởi tạo chính
    initializePage();

}); // <-- Kết thúc của document.addEventListener('DOMContentLoaded', ...)