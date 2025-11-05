// DÁN TOÀN BỘ CODE NÀY ĐỂ THAY THẾ CHO FILE js/pages/search.js CỦA BẠN

// Hàm này cần được đặt ở ngoài để HTML có thể gọi qua onclick
function saveEventId(eventId) {
    localStorage.setItem("selectedEventId", eventId);
}

document.addEventListener("DOMContentLoaded", function () {

    // Chỉ chạy code nếu đây là trang search
    if (!document.querySelector('.search-page-background')) {
        return;
    }

    // --- KHAI BÁO CÁC BIẾN CẦN THIẾT ---
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchTitle = document.getElementById('search-title');
    const mainFilterBtn = document.getElementById('main-filter-btn');
    const mainFilterModal = document.getElementById('main-filter-modal');
    const activeFiltersContainer = document.getElementById('active-filters-container');

    let allEventsData = []; // Biến lưu toàn bộ dữ liệu sự kiện
    let activeFilters = {}; // Biến lưu các bộ lọc đang chọn

    // --- CÁC HÀM XỬ LÝ CHÍNH ---

    // Hàm hiển thị các sự kiện ra màn hình
    function displayEvents(eventsToDisplay) {
        if (!searchResultsContainer) return;
        searchResultsContainer.innerHTML = '';
        if (eventsToDisplay.length === 0) {
            searchResultsContainer.innerHTML = "<p style='color: white; font-size: 1.2rem;'>Không tìm thấy sự kiện nào phù hợp.</p>";
            return;
        }
        eventsToDisplay.forEach(event => {
            const fixImagePath = (path) => path ? path.replace('../', '../../') : '';
            const firstSession = event.suatDien ? event.suatDien[0] : (event.thoiGian ? { thoiGian: event.thoiGian, loaiVe: event.loaiVe } : null);
            if (!firstSession) return;

            let minPrice = Infinity;
            (firstSession.loaiVe || []).forEach(ticket => { if (ticket.giaVe < minPrice) minPrice = ticket.giaVe; });
            const priceText = minPrice > 0 && minPrice !== Infinity ? `Từ ${minPrice.toLocaleString()}đ` : 'Miễn phí';
            const eventDate = new Date(firstSession.thoiGian.batDau).toLocaleDateString('vi-VN');

            const eventCardHTML = `
                <a href="event_deatail.html" onclick="saveEventId('${event.id}')" style="text-decoration: none; color: inherit;">
                    <div class="event-card-horizontal"> <!-- << ĐÃ SỬA -->
                        <img src="${fixImagePath(event.banner)}" alt="${event.tenSuKien}"> <!-- << ĐÃ SỬA -->
                        <div class="event-info">
                            <h3>${event.tenSuKien}</h3>
                            <p class="event-price">${priceText}</p>
                            <p class="event-date">${eventDate}</p>
                        </div>
                    </div>
                </a>
            `;
            searchResultsContainer.innerHTML += eventCardHTML;
        });
    }


    // THAY THẾ TOÀN BỘ HÀM NÀY
    function applyAllFilters() {
        let filteredEvents = [...allEventsData];

        // 1. Lọc theo TỪ KHÓA (nếu có trong activeFilters)
        if (activeFilters.keyword) {
            const lowercasedKeyword = activeFilters.keyword.toLowerCase();
            filteredEvents = filteredEvents.filter(event =>
                event.tenSuKien.toLowerCase().includes(lowercasedKeyword)
            );
        }

        // 2. Lọc theo DANH MỤC (nếu có trong activeFilters)
        if (activeFilters.category) {
            const popupCategoryMap = { 'nhạc sống': 'Âm nhạc', 'sân khấu & nghệ thuật': 'Sân khấu & Nghệ thuật', 'thể thao': 'Thể thao', 'khác': 'Khác' };
            const categoryToFilter = popupCategoryMap[activeFilters.category.value.toLowerCase()] || activeFilters.category.text;
            filteredEvents = filteredEvents.filter(event => event.theLoai === categoryToFilter);
        }

        // 3. Lọc theo ĐỊA ĐIỂM (nếu có trong activeFilters)
        if (activeFilters.location) {
            const locationMap = { 'hcm': 'TP.HCM', 'hn': 'Hà Nội', 'dl': 'Đà Lạt' };
            const locationName = locationMap[activeFilters.location.value];
            if (locationName) {
                filteredEvents = filteredEvents.filter(event => event.diaChi.diaDiem.tinh === locationName);
            }
        }

        // 4. Lọc VÉ MIỄN PHÍ (nếu có trong activeFilters)
        if (activeFilters.price && activeFilters.price.value === 'free') {
            filteredEvents = filteredEvents.filter(event =>
                (event.suatDien || [{ loaiVe: [] }]).some(session =>
                    session.loaiVe.some(ticket => ticket.giaVe === 0)
                )
            );
        }

        displayEvents(filteredEvents);
    }


    // THAY THẾ TOÀN BỘ HÀM NÀY
    async function initializeSearchPage() {
        try {
            const response = await fetch("../../data/events.json");
            allEventsData = await response.json();

            const urlParams = new URLSearchParams(window.location.search);
            const keyword = urlParams.get('keyword');
            const categoryFromUrl = urlParams.get('category');

            // Cập nhật activeFilters từ URL
            if (keyword) {
                activeFilters.keyword = keyword;
            }
            if (categoryFromUrl) {
                const categoryMap = { 'music': 'Âm nhạc', 'art': 'Sân khấu & Nghệ thuật', 'sport': 'Thể thao', 'other': 'Khác' };
                const categoryName = categoryMap[categoryFromUrl];
                if (categoryName) {
                    activeFilters.category = { value: categoryFromUrl, text: categoryName };
                }
            }

            // Cập nhật tiêu đề
            if (keyword) {
                searchTitle.innerHTML = `Kết quả tìm kiếm cho: "<strong>${keyword}</strong>"`;
            } else if (activeFilters.category) {
                searchTitle.textContent = `Kết quả cho danh mục: "${activeFilters.category.text}"`;
            } else {
                searchTitle.textContent = "Tất cả sự kiện";
            }

            applyAllFilters();
            initializeFilterPopups();

        } catch (error) {
            console.error("Lỗi khi tải hoặc xử lý dữ liệu:", error);
        }
    }

    // --- LOGIC CHO POPUP BỘ LỌC CHÍNH ---
    function initializeFilterPopups() {
        if (!mainFilterBtn || !mainFilterModal || !activeFiltersContainer) return;

        const renderActiveFilterPills = () => {
            activeFiltersContainer.innerHTML = '';
            for (const key in activeFilters) {
                const filter = activeFilters[key];
                if (filter.value) {
                    const pill = document.createElement('div');
                    pill.className = 'active-filter-pill';
                    pill.innerHTML = `<span>${filter.text}</span><button class="remove-filter-btn" data-filter-key="${key}">&times;</button>`;
                    activeFiltersContainer.appendChild(pill);
                }
            }
        };

        const checkUrlForCategoryFilter = () => {
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            if (category) {
                const categoryMap = { 'music': 'Âm nhạc', 'art': 'Sân khấu & Nghệ thuật', 'sport': 'Thể Thao', 'other': 'Khác' };
                const categoryText = categoryMap[category];
                if (categoryText) {
                    activeFilters.category = { value: category.toLowerCase(), text: categoryText, type: 'pill', name: 'category' };
                }
            }
        };

        checkUrlForCategoryFilter();
        renderActiveFilterPills();

        const syncModalState = () => {
            const freeCheckbox = mainFilterModal.querySelector('input[value="free"]');
            if (freeCheckbox) freeCheckbox.checked = false;
            mainFilterModal.querySelectorAll('.category-pills .filter-pill').forEach(p => p.classList.remove('active'));
            const defaultLocation = mainFilterModal.querySelector('input[name="location"][value=""]');
            if (defaultLocation) defaultLocation.checked = true;
            for (const key in activeFilters) {
                const filter = activeFilters[key];
                if (filter.type === 'radio') {
                    const radioToSelect = mainFilterModal.querySelector(`input[name="${filter.name}"][value="${filter.value}"]`);
                    if (radioToSelect) radioToSelect.checked = true;
                } else if (filter.type === 'checkbox') {
                    const checkboxToSelect = mainFilterModal.querySelector(`input[value="${filter.value}"]`);
                    if (checkboxToSelect) checkboxToSelect.checked = true;
                } else if (filter.type === 'pill') {
                    mainFilterModal.querySelectorAll('.category-pills .filter-pill').forEach(pill => {
                        if (pill.textContent === filter.text) {
                            pill.classList.add('active');
                        }
                    });
                }
            }
        };

        mainFilterBtn.addEventListener('click', () => {
            syncModalState();
            mainFilterModal.classList.add('active');
        });

        mainFilterModal.addEventListener('click', (e) => {
            if (e.target === mainFilterModal) {
                mainFilterModal.classList.remove('active');
            }
        });

        const applyBtn = mainFilterModal.querySelector('.btn-apply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const locationInput = mainFilterModal.querySelector('input[name="location"]:checked');
                if (locationInput && locationInput.parentElement.textContent.trim() !== 'Toàn quốc') {
                    activeFilters.location = { value: locationInput.value, text: locationInput.parentElement.textContent.trim(), type: 'radio', name: 'location' };
                } else { delete activeFilters.location; }
                const priceInput = mainFilterModal.querySelector('input[value="free"]');
                if (priceInput && priceInput.checked) {
                    activeFilters.price = { value: 'free', text: 'Miễn phí', type: 'checkbox', name: 'free' };
                } else { delete activeFilters.price; }
                const activeCategoryPill = mainFilterModal.querySelector('.category-pills .filter-pill.active');
                if (activeCategoryPill) {
                    activeFilters.category = { value: activeCategoryPill.textContent.toLowerCase(), text: activeCategoryPill.textContent, type: 'pill', name: 'category' };
                } else { delete activeFilters.category; }
                renderActiveFilterPills();
                mainFilterModal.classList.remove('active');
                applyAllFilters();
            });
        }

        const categoryPills = mainFilterModal.querySelectorAll('.category-pills .filter-pill');
        categoryPills.forEach(pill => {
            pill.addEventListener('click', (e) => {
                e.preventDefault();
                if (pill.classList.contains('active')) {
                    pill.classList.remove('active');
                } else {
                    categoryPills.forEach(p => p.classList.remove('active'));
                    pill.classList.add('active');
                }
            });
        });

        const resetBtn = mainFilterModal.querySelector('.btn-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // Chuyển hướng về trang search.html không có tham số để reset hoàn toàn
                window.location.href = 'search.html';
            });
        }

        activeFiltersContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-filter-btn')) {
                const keyToRemove = e.target.dataset.filterKey;
                delete activeFilters[keyToRemove];
                renderActiveFilterPills();
                applyAllFilters();
            }
        });

        if (window.initializeDatePicker) {
            window.initializeDatePicker({
                modalId: 'date-filter-modal',
                triggerId: 'date-filter-btn',
                grid1Id: 'calendar-grid-1',
                grid2Id: 'calendar-grid-2',
                month1Id: 'month-name-1',
                month2Id: 'month-name-2',
                prevBtnId: 'calendar-prev-month',
                nextBtnId: 'calendar-next-month',
                mode: 'range',
                onApply: ({ startDate, endDate }) => {
                    const dateFilterText = document.getElementById('date-filter-text');
                    if (!dateFilterText) return;
                    const formatDate = (date) => `${date.getDate()} thg ${date.getMonth() + 1}`;
                    if (startDate && endDate) {
                        dateFilterText.textContent = startDate.getTime() === endDate.getTime() ? formatDate(startDate) : `${formatDate(startDate)} - ${formatDate(endDate)}`;
                    } else if (startDate) {
                        dateFilterText.textContent = formatDate(startDate);
                    } else {
                        dateFilterText.textContent = 'Tất cả các ngày';
                    }
                }
            });
        }
    }

    // CHẠY HÀM KHỞI TẠO CHÍNH
    initializeSearchPage();
});