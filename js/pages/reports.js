// js/pages/reports.js - Logic dành riêng cho trang Báo cáo

document.addEventListener("DOMContentLoaded", function () {
    const revenueChartCtx = document.getElementById('revenueChart');
    const ticketTypeChartCtx = document.getElementById('ticketTypeChart');

    if (!revenueChartCtx || !ticketTypeChartCtx) {
        return; // Dừng lại nếu không tìm thấy canvas
    }

    // --- DỮ LIỆU GIẢ LẬP ---

    // Dữ liệu cho biểu đồ doanh thu theo ngày
    const revenueLabels = ['Ngày 1', 'Ngày 2', 'Ngày 3', 'Ngày 4', 'Ngày 5', 'Ngày 6', 'Ngày 7'];
    const revenueData = {
        labels: revenueLabels,
        datasets: [{
            label: 'Doanh thu (VND)',
            data: [15000000, 22000000, 18000000, 35000000, 41000000, 38000000, 55000000],
            borderColor: '#A855F7',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#fff',
            pointBorderColor: '#A855F7',
            pointHoverRadius: 7,
            pointHoverBackgroundColor: '#A855F7',
        }]
    };

    // Dữ liệu cho biểu đồ tròn phân loại vé
    const ticketTypeData = {
        labels: ['Vé VIP', 'Vé Thường', 'Vé Early Bird'],
        datasets: [{
            label: 'Số lượng vé đã bán',
            data: [1120, 3550, 450],
            backgroundColor: [
                '#A855F7', // Màu tím chính
                '#6D28D9', // Tím đậm hơn
                '#D8B4FE'  // Tím nhạt hơn
            ],
            hoverOffset: 4,
            borderColor: '#2D2D2D',
            borderWidth: 2,
        }]
    };

    // --- TÙY CHỈNH CHUNG CHO CÁC BIỂU ĐỒ (THEME TỐI) ---
    Chart.defaults.color = '#ccc';
    Chart.defaults.borderColor = '#444';

    // --- VẼ BIỂU ĐỒ DOANH THU (BIỂU ĐỒ ĐƯỜNG) ---
    new Chart(revenueChartCtx, {
        type: 'line',
        data: revenueData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1E1E1E',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    padding: 10,
                    cornerRadius: 8,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) { return (value / 1000000) + ' Tr'; }
                    }
                }
            }
        }
    });

    // --- VẼ BIỂU ĐỒ PHÂN LOẠI VÉ (BIỂU ĐỒ TRÒN) ---
    new Chart(ticketTypeChartCtx, {
        type: 'doughnut',
        data: ticketTypeData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20
                    }
                },
                tooltip: {
                    backgroundColor: '#1E1E1E',
                    titleColor: '#fff',
                    bodyColor: '#ccc',
                    padding: 10,
                    cornerRadius: 8,
                }
            }
        }
    });
});