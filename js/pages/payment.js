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
    const ticketData = JSON.parse(localStorage.getItem("ticketSelection"));
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

  if (!qrModal || !confirmPaymentBtn) return;

  let countdownInterval;

  confirmPaymentBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Lấy dữ liệu vé và voucher
    const ticketData = JSON.parse(localStorage.getItem("ticketSelection"));
    const voucher = JSON.parse(localStorage.getItem("selectedVoucher"));

    if (ticketData) {
      let total = ticketData.price * ticketData.quantity;
      if (voucher) total -= voucher.discount;
      qrTotal.textContent = `${total.toLocaleString()} đ`;
    }

    // Mở popup QR
    qrModal.classList.add("active");

    // Khởi động đếm ngược 10:30
    let time = 10 * 60 + 30;
    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      qrMinutes.textContent = minutes.toString().padStart(2, "0");
      qrSeconds.textContent = seconds.toString().padStart(2, "0");
      time--;

      if (time < 0) {
        clearInterval(countdownInterval);
        alert("Giao dịch đã hết hạn! Vui lòng quét lại mã QR để thanh toán.");
        qrModal.classList.remove("active");
      }
    }, 1000);
  });

    // Đóng popup
    qrCloseBtn.addEventListener("click", () => {
        qrModal.classList.remove("active");
        clearInterval(countdownInterval);
    });

    qrModal.addEventListener("click", (e) => {
        if (e.target === qrModal) {
        qrModal.classList.remove("active");
        clearInterval(countdownInterval);
        }
    });
    });

  }
});



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
    return JSON.parse(localStorage.getItem("ticketSelection"));
  }
  function getCurrentTotal() {
    const t = getTicketData();
    if (!t) return 0;
    return t.price * t.quantity;
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

  // bật nút xác nhận khi chọn radio
  const radioList = voucherModal.querySelectorAll('input[name="voucherSelect"]');
  radioList.forEach(r => {
    r.addEventListener("change", () => {
      confirmVoucherBtn.disabled = false;
      confirmVoucherBtn.classList.add("active");
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
      alert("Không thể áp dụng voucher này vì đơn hàng chưa đủ điều kiện.");
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
        ? "../../images/logo-momo.png"
        : logoType === "zalo"
        ? "../../images/icon-zalopay.png"
        : "../../images/icon-Spay.jpg";

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
  const ticketData = JSON.parse(localStorage.getItem("ticketSelection"));
  const baseTotal = ticketData ? ticketData.price * ticketData.quantity : 0;

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
        ? "../../images/logo-momo.png"
        : savedVoucher.logo === "zalo"
        ? "../../images/icon-zalopay.png"
        : "../../images/icon-Spay.jpg";

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
  const ticketData = JSON.parse(localStorage.getItem("ticketSelection"));
  const baseTotal = ticketData ? ticketData.price * ticketData.quantity : 0;
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

  if (!qrModal || !confirmPaymentBtn) return;

  let countdownInterval;

  confirmPaymentBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Lấy dữ liệu vé
    const ticketData = JSON.parse(localStorage.getItem("ticketSelection"));
    const voucher = JSON.parse(localStorage.getItem("selectedVoucher"));
    if (ticketData) {
      let total = ticketData.price * ticketData.quantity;
      if (voucher) total -= voucher.discount;
      qrTotal.textContent = `${total.toLocaleString()} đ`;
    }

    // Mở popup QR
    qrModal.classList.add("active");

    // Đếm ngược 10:30
    let time = 10 * 60 + 30; // 10 phút 30 giây
    clearInterval(countdownInterval);

    countdownInterval = setInterval(() => {
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;

      qrMinutes.textContent = minutes.toString().padStart(2, "0");
      qrSeconds.textContent = seconds.toString().padStart(2, "0");

      time--;

      if (time < 0) {
        clearInterval(countdownInterval);
        alert("Giao dịch đã hết hạn! Vui lòng quét lại mã QR để thanh toán.");
        qrModal.classList.remove("active");
      }
    }, 1000);
  });

  // Đóng popup
  qrCloseBtn.addEventListener("click", () => {
    qrModal.classList.remove("active");
    clearInterval(countdownInterval);
  });

  // Click ra ngoài cũng đóng popup
  qrModal.addEventListener("click", (e) => {
    if (e.target === qrModal) {
      qrModal.classList.remove("active");
      clearInterval(countdownInterval);
    }
  });
});
