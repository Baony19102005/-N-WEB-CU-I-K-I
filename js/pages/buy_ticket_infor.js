document.addEventListener("DOMContentLoaded", () => {


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

    // Kiểm tra thông tin bắt buộc
    if (!buyerInfo.fullname || !buyerInfo.phone || !buyerInfo.email || !buyerInfo.agree) {
      alert("Vui lòng điền đầy đủ thông tin và đồng ý điều khoản.");
      return;
    }

    // Lưu thông tin người mua vào localStorage
    localStorage.setItem("buyerInfo", JSON.stringify(buyerInfo));

    // Chuyển hướng sang trang payment.html
    window.location.href = "../../html/pages/payment.html";
  });
});
