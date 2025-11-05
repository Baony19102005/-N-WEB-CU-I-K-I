document.addEventListener("DOMContentLoaded", async () => {
    // Logic của trang buy_ticket
    const eventId = localStorage.getItem("selectedEventId");
    if (!eventId) {
        alert("Không tìm thấy thông tin sự kiện. Vui lòng chọn lại.");
        window.location.href = "event_detail.html";
        return;
    }

    // === HÀM TẢI DỮ LIỆU SỰ KIỆN TỪ FILE JSON (dành riêng cho trang này) ===
    async function loadEventData(id) {
        try {
            const response = await fetch("../../data/events.json");
            const events = await response.json();
            return events.find((event) => event.id === id);
        } catch (err) {
            console.error("Lỗi khi tải dữ liệu sự kiện:", err);
            return null;
        }
    }

    // === HÀM MỞ POPUP CHỌN VÉ (dành riêng cho trang này) ===
    function openPopup(zoneName, price) {
        const popup = document.getElementById("popup");
        const nameEl = document.getElementById("popup-zone-name");
        const qtyEl = document.getElementById("quantity");
        const continueBtn = document.getElementById("continueBtn");

        if (!popup || !nameEl || !qtyEl || !continueBtn) return;

        nameEl.textContent = zoneName;
        qtyEl.textContent = "1";
        continueBtn.textContent = `Tiếp tục - ${(parseInt(price)).toLocaleString()} đ`;

        popup.style.display = "flex";

        let quantity = 1;
        document.getElementById("minus").onclick = () => {
            if (quantity > 1) {
                quantity--;
                qtyEl.textContent = quantity;
                continueBtn.textContent = `Tiếp tục - ${(quantity * price).toLocaleString()} đ`;
            }
        };

        document.getElementById("plus").onclick = () => {
            // Có thể thêm giới hạn số lượng vé tối đa ở đây nếu cần
            quantity++;
            qtyEl.textContent = quantity;
            continueBtn.textContent = `Tiếp tục - ${(quantity * price).toLocaleString()} đ`;
        };

        continueBtn.onclick = () => {
            const ticketInfo = {
                eventName: document.querySelector("#event-info h4")?.textContent || "Không có",
                time: document.querySelector("#event-info .event-meta span")?.textContent || "Không có",
                location: document.querySelectorAll("#event-info .event-meta span")[1]?.textContent || "Không có",
                zoneName: zoneName,
                quantity: quantity,
                price: price,
                total: quantity * price,
            };

            localStorage.setItem("selectedTicket", JSON.stringify(ticketInfo));
            window.location.href = "../../html/pages/buy_ticket_infor.html";
        };

        document.getElementById("closePopup").onclick = () => {
            popup.style.display = "none";
        };
    }


    // === CHẠY LOGIC CHÍNH CỦA TRANG ===
    const eventData = await loadEventData(eventId);

    if (eventData) {
        const eventInfo = document.getElementById("event-info");
        if (eventInfo) {
            const startTime = new Date(eventData.thoiGian.batDau);
            const endTime = new Date(eventData.thoiGian.ketThuc);
            const timeString = `${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, ${startTime.toLocaleDateString('vi-VN')}`;
            const locationString = `${eventData.diaChi?.diaDiem?.soNha || ''}, ${eventData.diaChi?.diaDiem?.tinh || ''}`;

            eventInfo.innerHTML = `
          <div class="event-card">
            <h4>${eventData.tenSuKien}</h4>
            <div class="event-meta">
              <img src="../../images/icon-time.png" alt="time" class="icon" />
              <span>${timeString}</span>
            </div>
            <div class="event-meta">
              <img src="../../images/icon-location.png" alt="location" class="icon" />
              <span>${locationString}</span>
            </div>
          </div>
        `;
        }
    }

    if (eventData?.seatmap?.anh) {
        const img = document.getElementById("seatmap-img");
        img.src = eventData.seatmap.anh.replace("../images/", "../../images/");
        img.alt = eventData.tenSuKien || "Sơ đồ chỗ ngồi";
    }

    if (eventData?.loaiVe) {
        const list = document.getElementById("price-list");
        list.innerHTML = ''; // Xóa nội dung cũ trước khi thêm
        eventData.loaiVe.forEach((v) => {
            const li = document.createElement("li");
            li.className = "price-item";
            li.dataset.name = v.tenVe;
            li.dataset.price = v.giaVe;
            li.innerHTML = `
        <span><span class="color" style="background:${v.mauKhuVuc}"></span>${v.tenVe}</span>
        <b>${v.giaVe.toLocaleString()} đ</b>`;

            li.addEventListener("click", () => {
                openPopup(li.dataset.name, li.dataset.price);
            });
            list.appendChild(li);
        });
    }
});