// ===============================
// TRANG PAYMENT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const payZone = document.getElementById("pay_zone");
  const payQty = document.getElementById("pay_qty");
  const payPrice = document.getElementById("pay_price");
  const payTotal = document.getElementById("pay_total");
  const payFullname = document.getElementById("pay_fullname");
  const payPhone = document.getElementById("pay_phone");
  const payEmail = document.getElementById("pay_email");
  const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");

  if (payZone && payQty && payPrice && payTotal) {
    const selForQr = JSON.parse(localStorage.getItem("selectedTicket") || "null");
    const ticketData = selForQr ? { price: Number(selForQr.price), quantity: Number(selForQr.quantity) } : JSON.parse(localStorage.getItem("ticketSelection") || "null");
    const buyerData = JSON.parse(localStorage.getItem("buyerInfo"));

    if (ticketData) {
      payZone.textContent = ticketData.zone;
      payQty.textContent = ticketData.quantity;
      payPrice.textContent = `${ticketData.price.toLocaleString()} đ`;
      payTotal.textContent = `${(ticketData.price * ticketData.quantity).toLocaleString()} đ`;
    }
    if (buyerData) {
      payFullname.textContent = buyerData.fullname;
      payPhone.textContent = buyerData.phone;
      payEmail.textContent = buyerData.email;
    }

    // (Đã di chuyển logic QR xuống dưới để tránh trùng lặp và lỗi)

  }
});


// Lưu vé vào localStorage.myTickets khi người dùng xác nhận thanh toán
function saveTicketToMyTickets() {
  try {
    // Kiểm tra và lấy thông tin vé
    const selectedTicket = JSON.parse(localStorage.getItem("selectedTicket") || "null") 
      || JSON.parse(localStorage.getItem("ticketSelection") || "null");
    if (!selectedTicket) {
      console.error("Không tìm thấy thông tin vé để lưu");
      return;
    }

    // Kiểm tra người dùng đã đăng nhập
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
      console.error("Không tìm thấy người dùng đã đăng nhập để lưu vé.");
      return;
    }

    // Chuẩn bị thông tin vé
    const eventId = localStorage.getItem("selectedEventId") || null;
    const quantity = Number(selectedTicket.quantity) || 1;
    const price = Number(selectedTicket.price) || 0;
    const total = Number(selectedTicket.total) || price * quantity;

    // Tạo mã đặt vé
    const codeSeed = Date.now();
    const bookingCode = `M${new Date(codeSeed).getFullYear().toString().slice(2)}${String(new Date(codeSeed).getMonth() + 1).padStart(2, '0')}${String(new Date(codeSeed).getDate()).padStart(2, '0')}${Math.floor(Math.random() * 9000 + 1000)}`;

    // Lấy danh sách vé hiện tại
    const myTickets = JSON.parse(localStorage.getItem("myTickets") || "[]");

    // Thêm vé mới vào danh sách
    const newTicket = {
      userId: currentUser.email,
      eventId,
      eventName: selectedTicket.eventName || null,
      zoneName: selectedTicket.zoneName || selectedTicket.zone || null,
      quantity,
      price,
      total,
      bookingCode,
      createdAt: new Date(codeSeed).toISOString(),
      status: "Thành công"
    };

    // Thêm vé mới vào mảng
    myTickets.push(newTicket);

    // Lưu lại toàn bộ danh sách vé
    localStorage.setItem("myTickets", JSON.stringify(myTickets));

    // Xóa dữ liệu tạm thời
    localStorage.removeItem("selectedTicket");
    localStorage.removeItem("ticketSelection");
    localStorage.removeItem("selectedEventId");
    sessionStorage.removeItem("currentProcessingHoldId");

    console.log("Đã lưu vé thành công:", newTicket);
  } catch (error) {
    console.error("Lỗi khi lưu vé:", error);
  }
}


// ===============================
// POPUP VOUCHER TRONG PAYMENT
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const voucherModal = document.getElementById("voucherModal");
  const openVoucherBtn = document.getElementById("openVoucherBtn");
  const confirmVoucherBtn = document.getElementById("voucherConfirmBtn");
  const cancelVoucherBtn = document.getElementById("voucherCancelBtn");
  const voucherDisplay = document.getElementById("voucher-display");
  const payTotalEl = document.getElementById("pay_total");

  if (!voucherModal || !openVoucherBtn || !voucherDisplay || !payTotalEl) return;

  // Lấy data đơn hàng hiện tại
  function getTicketData() {
    // Prefer data saved by buy_ticket flow
    const sel = JSON.parse(localStorage.getItem("selectedTicket") || "null");
    if (sel && sel.price != null && sel.quantity != null) {
      return { price: Number(sel.price), quantity: Number(sel.quantity) };
    }
    // Fallback (old key)
    const legacy = JSON.parse(localStorage.getItem("ticketSelection") || "null");
    return legacy ? { price: Number(legacy.price), quantity: Number(legacy.quantity) } : null;
  }
  function getCurrentTotal() {
    const t = getTicketData();
    if (!t) return 0;
    return Number(t.price) * Number(t.quantity);
  }

  // Lấy phương thức thanh toán hiện tại
  function getSelectedPaymentMethod() {
    const checked = document.querySelector('input[name="paymentMethod"]:checked');
    return checked ? checked.value : null;
  }

  // mở popup voucher
  openVoucherBtn.addEventListener("click", (e) => {
    e.preventDefault();
    voucherModal.classList.add("active");

    const selectedMethod = getSelectedPaymentMethod();
    const voucherItems = voucherModal.querySelectorAll(".voucher-item");

    voucherItems.forEach(item => {
      const method = item.dataset.method;
      const input = item.querySelector('input[name="voucherSelect"]');
      if (method !== selectedMethod) {
        item.classList.add("disabled");
        input.disabled = true;
        input.checked = false;
      } else {
        item.classList.remove("disabled");
        input.disabled = false;
      }
    });

    // khi popup mở lại, tắt nút Xác nhận cho đến khi chọn radio
    confirmVoucherBtn.disabled = true;
    confirmVoucherBtn.classList.remove("active");
  });

  // đóng popup
  cancelVoucherBtn.addEventListener("click", () => {
    voucherModal.classList.remove("active");
  });
  voucherModal.addEventListener("click", (e) => {
    if (e.target === voucherModal) {
      voucherModal.classList.remove("active");
    }
  });

  // Helper: Show nice notify modal (instead of alert)
  function showNotify(message) {
    const overlay = document.getElementById("notifyModal");
    const textEl = document.getElementById("notifyText");
    const okBtn = document.getElementById("notifyOkBtn");
    if (!overlay || !textEl || !okBtn) return alert(message);
    textEl.textContent = message;
    overlay.classList.add("active");
    const close = () => overlay.classList.remove("active");
    okBtn.onclick = close;
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  }

  // Tự áp dụng voucher khi chọn radio
  const radioList = voucherModal.querySelectorAll('input[name="voucherSelect"]');
  radioList.forEach(r => {
    r.addEventListener("change", () => {
      const chosenItem = r.closest('.voucher-item');
      const minOrder = parseInt(chosenItem.dataset.minorder) || 0;
      const discountText = chosenItem.querySelector('.voucher-title-main').textContent;
      const discountValue = parseInt(discountText.replace(/\D/g, '')) || 0;
      const logoType = chosenItem.dataset.logo;
      const voucherName = discountText;

      const orderTotal = getCurrentTotal();
      if (orderTotal < minOrder) {
        // Reset radio back to unchecked and notify
        r.checked = false;
        confirmVoucherBtn.disabled = true;
        confirmVoucherBtn.classList.remove('active');
        showNotify('Đơn hàng chưa đủ điều kiện áp dụng voucher này.');
        return;
      }

      // Apply immediately
      const appliedVoucher = { name: voucherName, discount: discountValue, minOrder, logo: logoType };
      localStorage.setItem('selectedVoucher', JSON.stringify(appliedVoucher));

      const logoSrc = logoType === 'momo' ? '../../images/pages/payment/logo-momo.png'
        : logoType === 'zalo' ? '../../images/pages/payment/icon-zalopay.png'
          : '../../images/pages/payment/icon-Spay.jpg';

      voucherDisplay.innerHTML = `
        <div class="applied-voucher">
          <img src="${logoSrc}" alt="${logoType} logo" class="voucher-applied-icon">
          <span class="voucher-applied-name">${voucherName}</span>
          <button id="removeVoucherBtn" class="remove-voucher-btn">×</button>
        </div>
      `;

      const newTotal = orderTotal - discountValue;
      payTotalEl.textContent = newTotal.toLocaleString('vi-VN') + ' đ';

      voucherModal.classList.remove('active');

      // Rebind remove
      const removeBtn = document.getElementById('removeVoucherBtn');
      if (removeBtn) {
        removeBtn.addEventListener('click', () => {
          localStorage.removeItem('selectedVoucher');
          voucherDisplay.innerHTML = `<button class="voucher-btn" id="openVoucherBtn">+ Nhập mã giảm giá</button>`;
          payTotalEl.textContent = getCurrentTotal().toLocaleString('vi-VN') + ' đ';
          // reset radios + confirm button
          voucherModal.querySelectorAll('input[name="voucherSelect"]').forEach(v => v.checked = false);
          confirmVoucherBtn.disabled = true;
          confirmVoucherBtn.classList.remove('active');
          rebindOpenVoucherBtn();
        });
      }
    });
  });

  // xác nhận voucher
  confirmVoucherBtn.addEventListener("click", () => {
    if (confirmVoucherBtn.disabled) return;

    const chosenRadio = voucherModal.querySelector('input[name="voucherSelect"]:checked');
    if (!chosenRadio) return;

    const chosenItem = chosenRadio.closest(".voucher-item");

    const logoType = chosenItem.dataset.logo;        // "momo" / "spay" / "zalo"
    const minOrder = parseInt(chosenItem.dataset.minorder) || 0;
    const discountText = chosenItem.querySelector(".voucher-title-main").textContent; // "Giảm 20.000đ"
    const discountValue = parseInt(discountText.replace(/\D/g, "")) || 0;
    const voucherName = discountText;

    const orderTotal = getCurrentTotal();
    if (orderTotal < minOrder) {
      showNotify("Đơn hàng chưa đủ điều kiện áp dụng voucher này.");
      return;
    }

    // build object lưu
    const appliedVoucher = {
      name: voucherName,
      discount: discountValue,
      minOrder: minOrder,
      logo: logoType,
    };
    localStorage.setItem("selectedVoucher", JSON.stringify(appliedVoucher));

    // render ra ngoài
    const logoSrc =
      logoType === "momo"
        ? "../../images/pages/payment/logo-momo.png"
        : logoType === "zalo"
          ? "../../images/pages/payment/icon-zalopay.png"
          : "../../images/pages/payment/icon-Spay.jpg";

    voucherDisplay.innerHTML = `
      <div class="applied-voucher">
        <img src="${logoSrc}" alt="${logoType} logo" class="voucher-applied-icon">
        <span class="voucher-applied-name">${voucherName}</span>
        <button id="removeVoucherBtn" class="remove-voucher-btn">×</button>
      </div>
    `;

    // cập nhật tổng tiền sau giảm
    const newTotal = orderTotal - discountValue;
    payTotalEl.textContent = newTotal.toLocaleString("vi-VN") + " đ";

    voucherModal.classList.remove("active");

    // nút xóa voucher
    const removeBtn = document.getElementById("removeVoucherBtn");
    removeBtn.addEventListener("click", () => {
      // 1️⃣ Xóa dữ liệu voucher trong localStorage
      localStorage.removeItem("selectedVoucher");

      // 2️⃣ Lấy lại tổng tiền gốc từ dữ liệu vé
      const t = getTicketData();
      const baseTotal = t ? t.price * t.quantity : 0;

      // 3️⃣ Render lại nút “+ Nhập mã giảm giá”
      voucherDisplay.innerHTML = `<button class="voucher-btn" id="openVoucherBtn">+ Nhập mã giảm giá</button>`;
      payTotalEl.textContent = baseTotal.toLocaleString("vi-VN") + " đ";

      // 4️⃣ Reset radio trong popup để có thể chọn lại cùng voucher
      voucherModal.querySelectorAll('input[name="voucherSelect"]').forEach(r => {
        r.checked = false;
      });

      // 5️⃣ Reset trạng thái nút Xác nhận
      confirmVoucherBtn.disabled = true;
      confirmVoucherBtn.classList.remove("active");

      // 6️⃣ Gắn lại sự kiện mở popup cho nút mới
      rebindOpenVoucherBtn();

      console.log("✅ Voucher đã được xóa và có thể chọn lại cùng voucher ngay.");
    });


  });

  // Load lại voucher nếu refresh trang
  restoreVoucherIfValid();

  function restoreVoucherIfValid() {
    const savedVoucher = JSON.parse(localStorage.getItem("selectedVoucher"));
    const methodNow = getSelectedPaymentMethod();
    const totalNow = getCurrentTotal();
    if (!savedVoucher) return;
    // nếu ví đã đổi hoặc đơn ko đủ minOrder => bỏ qua
    if (savedVoucher.logo !== methodNow || totalNow < savedVoucher.minOrder) {
      localStorage.removeItem("selectedVoucher");
      return;
    }

    const logoSrc =
      savedVoucher.logo === "momo"
        ? "../../images/pages/payment/logo-momo.png"
        : savedVoucher.logo === "zalo"
          ? "../../images/pages/payment/icon-zalopay.png"
          : "../../images/pages/payment/icon-Spay.jpg";

    voucherDisplay.innerHTML = `
      <div class="applied-voucher">
        <img src="${logoSrc}" alt="${savedVoucher.logo} logo" class="voucher-applied-icon">
        <span class="voucher-applied-name">${savedVoucher.name}</span>
        <button id="removeVoucherBtn" class="remove-voucher-btn">×</button>
      </div>
    `;

    payTotalEl.textContent = (totalNow - savedVoucher.discount).toLocaleString("vi-VN") + " đ";

    const removeBtn = document.getElementById("removeVoucherBtn");
    removeBtn.addEventListener("click", () => {
      // 1️⃣ Xóa dữ liệu voucher
      localStorage.removeItem("selectedVoucher");

      // 2️⃣ Cập nhật giao diện lại nút "+ Nhập mã giảm giá"
      voucherDisplay.innerHTML = `<button class="voucher-btn" id="openVoucherBtn">+ Nhập mã giảm giá</button>`;
      const t2 = getTicketData();
      const baseTotal = t2 ? t2.price * t2.quantity : 0;
      payTotalEl.textContent = baseTotal.toLocaleString("vi-VN") + " đ";


      // 3️⃣ Reset radio trong popup
      voucherModal.querySelectorAll('input[name="voucherSelect"]').forEach(r => {
        r.checked = false;
      });

      // 4️⃣ Reset lại trạng thái nút xác nhận
      confirmVoucherBtn.disabled = true;
      confirmVoucherBtn.classList.remove("active");

      // 5️⃣ GẮN LẠI SỰ KIỆN MỞ POPUP CHO NÚT MỚI — PHẢI ĐẶT SAU KHI DOM ĐƯỢC TẠO
      rebindOpenVoucherBtn();
    });

  }

  // Khi đổi phương thức thanh toán → xóa voucher luôn
  const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      localStorage.removeItem("selectedVoucher");

      // reset UI
      voucherDisplay.innerHTML = `<button class="voucher-btn" id="openVoucherBtn">+ Nhập mã giảm giá</button>`;
      payTotalEl.textContent = getCurrentTotal().toLocaleString("vi-VN") + " đ";

      // clear radio trong popup
      voucherModal.querySelectorAll('input[name="voucherSelect"]').forEach(v => {
        v.checked = false;
      });

      // disable confirm nút
      confirmVoucherBtn.disabled = true;
      confirmVoucherBtn.classList.remove("active");

      // gắn lại click mở popup vào nút mới
      rebindOpenVoucherBtn();
    });
  });

  function rebindOpenVoucherBtn() {
    const btn = document.getElementById("openVoucherBtn");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        voucherModal.classList.add("active");

        const selectedMethod = getSelectedPaymentMethod();
        const voucherItems = voucherModal.querySelectorAll(".voucher-item");
        voucherItems.forEach(item => {
          const method = item.dataset.method;
          const input = item.querySelector('input[name="voucherSelect"]');
          if (method !== selectedMethod) {
            item.classList.add("disabled");
            input.disabled = true;
            input.checked = false;
          } else {
            item.classList.remove("disabled");
            input.disabled = false;
          }
        });

        confirmVoucherBtn.disabled = true;
        confirmVoucherBtn.classList.remove("active");
      });
    }
  }

  // đảm bảo nút mở popup hiện tại có sự kiện (sau khi load trang)
  rebindOpenVoucherBtn();
});


// ===============================
// POPUP QR THANH TOÁN
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const qrModal = document.getElementById("qrModal");
  const qrCloseBtn = document.getElementById("qrCloseBtn");
  const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
  const qrMinutes = document.getElementById("qrMinutes");
  const qrSeconds = document.getElementById("qrSeconds");
  const qrTotal = document.getElementById("qrTotal");
  const qrPaidSuccessBtn = document.getElementById("qrPaidSuccessBtn");

  if (!qrModal || !confirmPaymentBtn) return;

  let countdownInterval;

  function openQrModalWithCountdown(totalAmount) {
    try { clearInterval(countdownInterval); } catch (_) {}
    if (typeof totalAmount === 'number') {
      qrTotal.textContent = totalAmount.toLocaleString('vi-VN') + ' đ';
    }
    // Set initial 10:30
    let time = 10 * 60 + 30;
    qrMinutes.textContent = Math.floor(time / 60).toString().padStart(2, '0');
    qrSeconds.textContent = (time % 60).toString().padStart(2, '0');
    qrModal.classList.add('active');

    countdownInterval = setInterval(() => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      qrMinutes.textContent = minutes.toString().padStart(2, '0');
      qrSeconds.textContent = seconds.toString().padStart(2, '0');
      time--;
      if (time < 0) {
        clearInterval(countdownInterval);
        alert('Giao dịch đã hết hạn! Vui lòng quét lại mã QR để thanh toán.');
        qrModal.classList.remove('active');
      }
    }, 1000);
  }

  confirmPaymentBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Yêu cầu đăng nhập
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
      alert('Vui lòng đăng nhập để hoàn tất thanh toán.');
      const openAuthBtn = document.getElementById('open-auth-modal-btn');
      if (openAuthBtn) {
        openAuthBtn.click();
      } else {
        window.location.href = '../../html/pages/hompage.html';
      }
      return;
    }

    // Validate buyer info (phone, email)
    try {
      const buyer = JSON.parse(localStorage.getItem("buyerInfo") || "null");
      const phone = String(buyer?.phone || "").trim();
      const email = String(buyer?.email || "").trim();
      const phoneRegex = /^(?:\+?84|0)(?:3|5|7|8|9)\d{8}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!buyer || !phone || !email) {
        alert("Thiếu thông tin người mua (họ tên/số điện thoại/email). Vui lòng quay lại bước trước để nhập.");
        return;
      }
      if (!phoneRegex.test(phone)) {
        alert("Số điện thoại không hợp lệ. Vui lòng nhập số di động Việt Nam (bắt đầu 0/ +84, 10 số).");
        return;
      }
      if (!emailRegex.test(email)) {
        alert("Email không hợp lệ. Vui lòng kiểm tra lại.");
        return;
      }
    } catch (err) {
      console.error("Lỗi kiểm tra buyerInfo:", err);
      alert("Không đọc được thông tin người mua. Vui lòng thực hiện lại bước trước.");
      return;
    }

    // Tính tổng tiền và mở QR
    const selForQr = JSON.parse(localStorage.getItem("selectedTicket") || "null");
    const basicData = selForQr ? { price: Number(selForQr.price), quantity: Number(selForQr.quantity) } : JSON.parse(localStorage.getItem("ticketSelection") || "null");
    const voucher = JSON.parse(localStorage.getItem("selectedVoucher"));
    let totalAmount = 0;
    if (basicData && basicData.price != null && basicData.quantity != null) {
      totalAmount = Number(basicData.price) * Number(basicData.quantity);
      if (voucher) totalAmount -= Number(voucher.discount || 0);
    }
    openQrModalWithCountdown(totalAmount);
  });

  // Nút xác nhận thanh toán thành công trong popup
  if (qrPaidSuccessBtn) {
    qrPaidSuccessBtn.addEventListener('click', () => {
      try {
        saveTicketToMyTickets();
      } catch (e) {
        console.error('Lỗi khi lưu vé:', e);
      }
      try { clearInterval(countdownInterval); } catch (_) {}
      qrModal.classList.remove('active');
      alert('Thanh toán thành công! Vé của bạn đã được lưu.');
      window.location.href = '../../html/pages/myticket.html';
    });
  }

  // Đóng popup (nút X)
  qrCloseBtn.addEventListener("click", () => {
    qrModal.classList.remove("active");
    try { clearInterval(countdownInterval); } catch (_) {}
  });

  // Click ra ngoài cũng đóng popup
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) {
      qrModal.classList.remove("active");
      try { clearInterval(countdownInterval); } catch (_) {}
    }
  });
});

// ===============================
// HEADER + ĐỒNG HỒ + ĐỔ DỮ LIỆU ĐƠN HÀNG
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const COUNTDOWN_KEY = "buyTicketCountdownEnd";

  // --- SỬA LẠI CÁCH LẤY ELEMENT HEADER ---
  const eventHeaderTitle = document.querySelector(".event-header h2");
  const eventHeaderTime = document.querySelector(".event-header .event-meta:nth-of-type(1) span");
  const eventHeaderLocation = document.querySelector(".event-header .event-meta:nth-of-type(2) span");
  // --- KẾT THÚC SỬA ---

  const minEl = document.getElementById("minutes");
  const secEl = document.getElementById("seconds");

  const selectedTicket = JSON.parse(localStorage.getItem("selectedTicket") || "null");
  const buyerInfo = JSON.parse(localStorage.getItem("buyerInfo") || "null");

  if (selectedTicket) {
    // --- THÊM 3 DÒNG NÀY ĐỂ CẬP NHẬT HEADER ---
    if (eventHeaderTitle) eventHeaderTitle.textContent = selectedTicket.eventName || "--";
    if (eventHeaderTime) eventHeaderTime.textContent = selectedTicket.time || "--";
    if (eventHeaderLocation) eventHeaderLocation.textContent = selectedTicket.location || "--";

    const payZone = document.getElementById("pay_zone");
    const payQty = document.getElementById("pay_qty");
    const payPrice = document.getElementById("pay_price");
    const payTotal = document.getElementById("pay_total");
    if (payZone) payZone.textContent = selectedTicket.zoneName || "--";
    if (payQty) payQty.textContent = selectedTicket.quantity ?? "--";
    if (payPrice) payPrice.textContent = selectedTicket.price != null ? `${Number(selectedTicket.price).toLocaleString()} đ` : "--";
    if (payTotal) payTotal.textContent = selectedTicket.total != null ? `${Number(selectedTicket.total).toLocaleString()} đ` : "--";
  }

  if (buyerInfo) {
    const payFullname = document.getElementById("pay_fullname");
    const payPhone = document.getElementById("pay_phone");
    const payEmail = document.getElementById("pay_email");
    const payInvoice = document.getElementById("pay_invoice");
    if (payFullname) payFullname.textContent = buyerInfo.fullname || "--";
    if (payPhone) payPhone.textContent = buyerInfo.phone || "--";
    if (payEmail) payEmail.textContent = buyerInfo.email || "--";
    if (payInvoice) payInvoice.textContent = buyerInfo.invoice ? buyerInfo.invoice : "Không yêu cầu";
  }

  // Continue countdown from buy_ticket_infor
  function startPaymentCountdown() {
    if (!minEl || !secEl) return;
    let endTs = Number(sessionStorage.getItem(COUNTDOWN_KEY));
    if (!endTs || isNaN(endTs)) {
      endTs = Date.now() + 15 * 60 * 1000; // fallback
    }
    const tick = () => {
      const remain = endTs - Date.now();
      const total = Math.max(0, Math.floor(remain / 1000));
      const m = Math.floor(total / 60);
      const s = total % 60;
      minEl.textContent = String(m).padStart(2, "0");
      secEl.textContent = String(s).padStart(2, "0");
      if (remain <= 0) {
        clearInterval(timer);
        const btn = document.getElementById("confirmPaymentBtn");
        if (btn) {
          btn.setAttribute("disabled", "true");
          btn.style.opacity = "0.6";
          btn.style.cursor = "not-allowed";
        }
        // Hết thời gian: hiện thông báo, sau đó quay về trang chọn vé
        try { sessionStorage.removeItem(COUNTDOWN_KEY); } catch (_) { }
        const overlay = document.getElementById("notifyModal");
        const textEl = document.getElementById("notifyText");
        const okBtn = document.getElementById("notifyOkBtn");
        const goBack = () => { window.location.href = "../../html/pages/buy_ticket.html"; };
        if (overlay && textEl && okBtn) {
          textEl.textContent = "Hết thời gian giữ chỗ. Bạn sẽ được chuyển về trang chọn vé.";
          overlay.classList.add("active");
          okBtn.onclick = goBack;
          overlay.addEventListener("click", (e) => { if (e.target === overlay) goBack(); });
          setTimeout(goBack, 3000);
        } else {
          setTimeout(goBack, 500);
        }
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
  }

  startPaymentCountdown();
});
