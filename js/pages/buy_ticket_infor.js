document.addEventListener("DOMContentLoaded", () => {
  // Always reset countdown to 15:00 on page load
  const COUNTDOWN_KEY = "buyTicketCountdownEnd";
  const COUNTDOWN_DURATION_MS = 15 * 60 * 1000;
  const countdownEl = document.getElementById("countdown");

  // Clear any previous timer state (switching event or reload)
  try { sessionStorage.removeItem(COUNTDOWN_KEY); } catch (_) {}

  function formatTime(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function startCountdown() {
    if (!countdownEl) return;

    let endTs = Date.now() + COUNTDOWN_DURATION_MS;
    try { sessionStorage.setItem(COUNTDOWN_KEY, String(endTs)); } catch (_) {}

    const timer = setInterval(() => {
      const remain = endTs - Date.now();
      if (remain <= 0) {
        clearInterval(timer);
        countdownEl.textContent = "00:00";
        const btn = document.querySelector(".btn-continue");
        if (btn) {
          btn.setAttribute("disabled", "true");
          btn.style.opacity = "0.6";
          btn.style.cursor = "not-allowed";
        }
        try { sessionStorage.removeItem(COUNTDOWN_KEY); } catch (_) {}
        // Hiển thị thông báo trước khi chuyển trang
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
          // Fallback
          setTimeout(goBack, 500);
        }
        return;
      }
      countdownEl.textContent = formatTime(remain);
    }, 1000);
  }

  startCountdown();
  // Lấy thông tin vé từ localStorage
  const ticketInfo = JSON.parse(localStorage.getItem("selectedTicket")) || {};

  // Hiển thị thông tin vé
  document.getElementById("event-name").textContent = ticketInfo.eventName || "--";
  document.getElementById("zone-name").textContent = ticketInfo.zoneName || "--";
  document.getElementById("zone-qty").textContent = ticketInfo.quantity || "--";
  document.getElementById("zone-price").textContent =
    ticketInfo.price ? `${ticketInfo.price.toLocaleString()} đ` : "--";
  document.getElementById("zone-total").textContent =
    ticketInfo.total ? `${ticketInfo.total.toLocaleString()} đ` : "--";

  // Hiển thị thông tin sự kiện
  document.getElementById("event-title").textContent = ticketInfo.eventName || "--";
  document.getElementById("event-time").textContent = ticketInfo.time || "--";
  document.getElementById("event-location").textContent = ticketInfo.location || "--";




  // Xử lý nút "Tiếp tục"
  const continueBtn = document.querySelector(".btn-continue");
  const showFieldError = (el, msg) => {
    if (!el) return;
    el.classList.add("field-error");
    // nếu đã có thông báo thì cập nhật
    let hint = el.nextElementSibling;
    if (!hint || !hint.classList || !hint.classList.contains('field-error-text')) {
      hint = document.createElement('div');
      hint.className = 'field-error-text';
      el.insertAdjacentElement('afterend', hint);
    }
    hint.textContent = msg;
  };

  const clearFieldError = (el) => {
    if (!el) return;
    el.classList.remove("field-error");
    const hint = el.nextElementSibling;
    if (hint && hint.classList && hint.classList.contains('field-error-text')) {
      hint.remove();
    }
  };
  continueBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Lấy thông tin người mua từ form
    const buyerInfo = {
      fullname: document.getElementById("fullname").value,
      phone: document.getElementById("phone").value,
      email: document.getElementById("email").value,
      invoice: document.getElementById("invoice").value,
      agree: document.getElementById("agree").checked,
    };

    // Xóa trạng thái lỗi cũ
    ["fullname","phone","email"].forEach(id => {
      clearFieldError(document.getElementById(id));
    });

    // Validate tối thiểu + focus vào ô đầu tiên thiếu
    const focusTo = (el, msg) => {
      showFieldError(el, msg || "Bạn cần điền đầy đủ thông tin để nhận vé");
      if (typeof el.focus === 'function') el.focus();
      try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
    };

    const emailValid = (v) => /.+@.+\..+/.test(String(v || '').trim());

    if (!buyerInfo.fullname?.trim()) {
      return focusTo(document.getElementById("fullname"));
    }
    if (!buyerInfo.phone?.trim()) {
      return focusTo(document.getElementById("phone"));
    }
    if (!buyerInfo.email?.trim() || !emailValid(buyerInfo.email)) {
      return focusTo(document.getElementById("email"), "Email không hợp lệ. Bạn cần điền đầy đủ thông tin để nhận vé");
    }
    if (!buyerInfo.agree) {
      const agreeEl = document.getElementById("agree");
      if (agreeEl) {
        agreeEl.focus();
        try { agreeEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(_) {}
      }
      return;
    }

    // Lưu thông tin người mua vào localStorage
    localStorage.setItem("buyerInfo", JSON.stringify(buyerInfo));

    // Chuyển hướng sang trang payment.html
    window.location.href = "../../html/pages/payment.html";
  });

  // Tự xóa lỗi khi người dùng nhập lại
  ["fullname","phone","email"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => clearFieldError(el));
    el.addEventListener('blur', () => {
      // nếu có nội dung hợp lệ thì xóa lỗi
      if (id !== 'email') {
        if (el.value && el.value.trim()) clearFieldError(el);
      } else {
        if (/.+@.+\..+/.test(String(el.value || '').trim())) clearFieldError(el);
      }
    });
  });
});