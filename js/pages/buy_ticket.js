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
              <img src="../../images/pages/payment/icon-time.png" alt="time" class="icon" />
              <span>${timeString}</span>
            </div>
            <div class="event-meta">
              <img src="../../images/pages/payment/icon-location.png" alt="location" class="icon" />
              <span>${locationString}</span>
            </div>
          </div>
        `;
        }
    }

    const seatSection = document.querySelector('.seat-map');
    if (eventData?.seatmap?.anh) {
        const img = document.getElementById("seatmap-img");
        img.src = eventData.seatmap.anh.replace("../images/", "../../images/");
        img.alt = eventData.tenSuKien || "Sơ đồ chỗ ngồi";
    } else if (seatSection) {
        // Không có seatmap: hiển thị UI chọn vé đơn giản với bộ đếm số lượng
        seatSection.innerHTML = `
            <h3 class="map-title">Chọn vé</h3>
            <div class="simple-ticket-box">
                <div class="simple-header"><span>Loại vé</span><span>Số lượng</span></div>
                <div id="simple-ticket-list"></div>
            </div>
        `;

        const listEl = seatSection.querySelector('#simple-ticket-list');
        const qtyMap = {};
        const renderRow = (ticket, idx) => {
            const row = document.createElement('div');
            row.className = 'simple-row';
            row.innerHTML = `
                <div class="row-info">
                    <div class="row-name">${ticket.tenVe}</div>
                    <div class="row-price">${Number(ticket.giaVe).toLocaleString()} đ</div>
                </div>
                <div class="row-stepper" data-index="${idx}">
                    <button type="button" class="step-btn step-minus">-</button>
                    <span class="step-qty">0</span>
                    <button type="button" class="step-btn step-plus">+</button>
                </div>
            `;
            qtyMap[idx] = 0;
            listEl.appendChild(row);
        };
        (eventData.loaiVe || []).forEach(renderRow);

        // Chỉ cho phép chọn một loại vé tại một thời điểm
        const updateAllZeroExcept = (keepIdx) => {
            listEl.querySelectorAll('.row-stepper').forEach(st => {
                const i = Number(st.dataset.index);
                if (i !== keepIdx) {
                    qtyMap[i] = 0;
                    st.querySelector('.step-qty').textContent = '0';
                }
            });
        };

        listEl.addEventListener('click', (e) => {
            const wrap = e.target.closest('.row-stepper');
            if (!wrap) return;
            const idx = Number(wrap.dataset.index);
            const qtyEl = wrap.querySelector('.step-qty');
            if (e.target.classList.contains('step-plus')) {
                updateAllZeroExcept(idx);
                qtyMap[idx] = Math.min(10, (qtyMap[idx] || 0) + 1);
                qtyEl.textContent = String(qtyMap[idx]);
            } else if (e.target.classList.contains('step-minus')) {
                qtyMap[idx] = Math.max(0, (qtyMap[idx] || 0) - 1);
                qtyEl.textContent = String(qtyMap[idx]);
            }
        });

        // Nút tiếp tục bên phải sử dụng lựa chọn này
        const proceedBtn = document.querySelector('.choose-btn');
        if (proceedBtn) {
            proceedBtn.textContent = 'Tiếp tục →';
            proceedBtn.addEventListener('click', (ev) => {
                ev.preventDefault();
                const selectedIdx = Object.keys(qtyMap).find(k => qtyMap[k] > 0);
                if (selectedIdx == null) {
                    // không chọn gì, không làm gì
                    return;
                }
                const ticket = eventData.loaiVe[Number(selectedIdx)];
                const quantity = qtyMap[selectedIdx];
                const price = Number(ticket.giaVe) || 0;
                const info = {
                    eventName: document.querySelector('#event-info h4')?.textContent || eventData.tenSuKien || 'Sự kiện',
                    time: document.querySelector('#event-info .event-meta span')?.textContent || '',
                    location: document.querySelectorAll('#event-info .event-meta span')[1]?.textContent || '',
                    zoneName: ticket.tenVe,
                    quantity,
                    price,
                    total: quantity * price,
                };
                localStorage.setItem('selectedTicket', JSON.stringify(info));
                window.location.href = "../../html/pages/buy_ticket_infor.html";
            });
        }
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
