
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Tải dữ liệu từ file events.json
        const response = await fetch("../../data/events.json");
        const events = await response.json();

        // Hiển thị sự kiện nổi bật
        displayFeaturedEvents(events);

        // Hiển thị các sự kiện theo thể loại
        displayStageArtEvents(events);
        displayOtherCategoryEvents(events);
        displayTrendingEvents(events);
        displayForYouEvents(events);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu sự kiện:", error);
    }
});


// Helper: lấy chuỗi "giá từ" với phân cách bằng dấu phẩy
function getMinPriceText(event) {
    if (!event || !Array.isArray(event.loaiVe) || event.loaiVe.length === 0) return "Miễn phí";
    // Chỉ tính những vé còn bán; nếu tất cả hết thì lấy toàn bộ danh sách
    const available = event.loaiVe.filter(v => String(v.trangThai || '').toLowerCase() === 'còn vé');
    const source = available.length > 0 ? available : event.loaiVe;
    const prices = source
        .map(v => (typeof v.giaVe === 'number' ? v.giaVe : parseFloat(v.giaVe)))
        .filter(n => Number.isFinite(n) && n >= 0);
    if (prices.length === 0) return "Miễn phí";
    const min = Math.min(...prices);
    return min > 0 ? `${min.toLocaleString('en-US')}đ` : "Miễn phí";
}

// Hàm hiển thị sự kiện nổi bật
function displayFeaturedEvents(events) {
    const featuredContainer = document.getElementById("featured-events");
    if (!featuredContainer) return;

    const featuredEvents = events.slice(0, 4); // Lấy 4 sự kiện đầu tiên

    featuredEvents.forEach(event => {
        // Hiển thị poster thay vì banner cho mục Sự kiện nổi bật
        const imagePath = (event.anhSuKien || event.banner || "").replace("../images/", "../../images/");
        const minPriceText = getMinPriceText(event);
        const eventHTML = `
            <a href="event_detail.html" style="text-decoration: none; color: inherit;" onclick="saveEventId('${event.id}')">
                <div class="event-card">
                    <img src="${imagePath}" alt="${event.tenSuKien}">
                    <div class="event-info">
                        <h3>${event.tenSuKien}</h3>
                        <p class="event-price">Từ ${minPriceText}</p>
                        <p class="event-date">${new Date(event.thoiGian.batDau).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </a>
        `;
        featuredContainer.innerHTML += eventHTML;
    });
}

// Hàm hiển thị sự kiện thuộc thể loại "Sân khấu & Nghệ thuật"
function displayStageArtEvents(events) {
    const stageArtContainer = document.getElementById("stage-art-events");
    if (!stageArtContainer) return;

    // Lọc các sự kiện thuộc thể loại "Sân khấu & Nghệ thuật"
    const stageArtEvents = events.filter(event => event.theLoai === "Sân khấu & Nghệ thuật").slice(0, 4); // Lấy 4 sự kiện đầu tiên

    stageArtEvents.forEach(event => {
        const imagePath = event.banner.replace("../images/", "../../images/");
        const minPriceText = getMinPriceText(event);
        const eventHTML = `
            <a href="event_detail.html" style="text-decoration: none; color: inherit;" onclick="saveEventId('${event.id}')">
                <div class="event-card-horizontal">
                    <img src="${imagePath}" alt="${event.tenSuKien}">
                    <div class="event-info">
                        <h3>${event.tenSuKien}</h3>
                        <p class="event-price">Từ ${minPriceText}</p>
                        <p class="event-date">${new Date(event.thoiGian.batDau).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </a>
        `;
        stageArtContainer.innerHTML += eventHTML;
    });
}

// Hàm hiển thị sự kiện thuộc thể loại "Khác"
function displayOtherCategoryEvents(events) {
    const otherCategoryContainer = document.getElementById("other-categories-events");
    if (!otherCategoryContainer) return;

    // Lọc các sự kiện thuộc thể loại "Khác"
    const otherCategoryEvents = events.filter(event => event.theLoai === "Khác");

    otherCategoryEvents.forEach(event => {
        const imagePath = event.banner.replace("../images/", "../../images/");
        const minPriceText = getMinPriceText(event);
        const eventHTML = `
            <a href="event_detail.html" style="text-decoration: none; color: inherit;" onclick="saveEventId('${event.id}')">
                <div class="event-card-horizontal">
                    <img src="${imagePath}" alt="${event.tenSuKien}">
                    <div class="event-info">
                        <h3>${event.tenSuKien}</h3>
                        <p class="event-price">Từ ${minPriceText}</p>
                        <p class="event-date">${new Date(event.thoiGian.batDau).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </a>
        `;
        otherCategoryContainer.innerHTML += eventHTML;
    });
}

// Hàm hiển thị sự kiện đang hot
function displayTrendingEvents(events) {
    const trendingContainer = document.getElementById("trending-events");
    if (!trendingContainer) return;

    const trendingEvents = events.slice(0, 4); // Lấy 4 sự kiện bất kỳ

    trendingEvents.forEach((event, index) => {
        const imagePath = event.banner.replace("../images/", "../../images/");
        const eventHTML = `
            <a href="event_detail.html" style="text-decoration: none; color: inherit;" onclick="saveEventId('${event.id}')">
                <div class="trending-card">
                    <img src="${imagePath}" alt="${event.tenSuKien}">
                    <span class="trending-number">${index + 1}</span>
                </div>
            </a>
        `;
        trendingContainer.innerHTML += eventHTML;
    });
}

// Hàm hiển thị sự kiện "Dành cho bạn"
function displayForYouEvents(events) {
    const forYouContainer = document.getElementById("for-you-events");
    if (!forYouContainer) return;

    const forYouEvents = events.slice(4, 8); // Lấy 4 sự kiện bất kỳ (có thể thay đổi logic nếu cần)

    forYouEvents.forEach(event => {
        const imagePath = event.banner.replace("../images/", "../../images/");
        const minPriceText = getMinPriceText(event);
        const eventHTML = `
            <a href="event_detail.html" style="text-decoration: none; color: inherit;" onclick="saveEventId('${event.id}')">
                <div class="event-card-horizontal">
                    <img src="${imagePath}" alt="${event.tenSuKien}">
                    <div class="event-info">
                        <h3>${event.tenSuKien}</h3>
                        <p class="event-price">Từ ${minPriceText}</p>
                        <p class="event-date">${new Date(event.thoiGian.batDau).toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>
            </a>
        `;
        forYouContainer.innerHTML += eventHTML;
    });
}

// Hàm lưu eventId vào localStorage khi người dùng nhấp vào sự kiện
function saveEventId(eventId) {
    localStorage.setItem("selectedEventId", eventId);
}