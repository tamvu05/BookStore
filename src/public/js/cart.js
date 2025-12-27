// src/public/js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    // Tìm tất cả nút "Thêm vào giỏ"
    const addToCartButtons = document.querySelectorAll('.btn-add-cart');
    const cartBadge = document.querySelector('.bi-cart-fill').nextElementSibling; // Tìm cái số màu đỏ cạnh icon giỏ hàng

    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault(); // Chặn việc load lại trang hoặc nhảy link
            
            // Hiệu ứng bấm nút (cho người dùng biết là đã bấm)
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';
            btn.disabled = true;

            const bookId = btn.getAttribute('data-id');

            try {
                const response = await fetch('/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ bookId })
                });

                const result = await response.json();

                if (response.ok) {
                    // 1. Cập nhật số lượng trên Header
                    if (cartBadge) {
                        cartBadge.innerText = result.totalQuantity;
                        // Hiệu ứng rung lắc badge cho vui mắt
                        cartBadge.classList.add('animate-bounce');
                        setTimeout(() => cartBadge.classList.remove('animate-bounce'), 1000);
                    }

                    // 2. Thông báo thành công (Dùng alert tạm, sau này dùng Toast đẹp hơn)
                    alert('✅ Đã thêm vào giỏ hàng!');
                } else {
                    // Nếu chưa đăng nhập thì chuyển sang trang login
                    if (response.status === 401) {
                        alert('Vui lòng đăng nhập để mua hàng!');
                        window.location.href = '/login';
                    } else {
                        alert('❌ Lỗi: ' + result.message);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Lỗi kết nối server!');
            } finally {
                // Trả lại trạng thái cũ cho nút
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }
        });
    });

    // 1. Nút Tăng/Giảm
    const updateQuantity = async (btn, change) => {
        const row = btn.closest('tr');
        const bookId = row.getAttribute('data-book-id');
        const input = row.querySelector('.cart-qty-input');
        let newQty = parseInt(input.value) + change;

        if (newQty < 1) return; 

        try {
            const response = await fetch('/cart/update', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId, quantity: newQty })
            });

            const result = await response.json();

            if (result.success) {
                // 1. Cập nhật số lượng hiển thị
                input.value = newQty;
                
                // 2. Tính lại Thành tiền của dòng đó
                // Lấy giá gốc từ data-price của tr (nếu chưa có thì phải thêm vào ejs: <tr data-price="<%= item.DonGia %>">)
                // Hoặc lấy từ data-total chia số lượng cũ (hơi rủi ro). Tốt nhất EJS thêm data-price vào <tr>
                // Giả sử EJS đã thêm data-price vào <tr> như code trên
                const price = parseFloat(row.getAttribute('data-price')) || 0;
                const newTotal = price * newQty;
                
                // Cập nhật text hiển thị
                row.querySelector('.cart-total-display').innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(newTotal);

                // 👇 CẬP NHẬT DATA CHO CHECKBOX ĐỂ HÀM TÍNH TỔNG BIẾT
                const checkbox = row.querySelector('.item-checkbox');
                if (checkbox) {
                    checkbox.setAttribute('data-total', newTotal);
                }

                // 👇 GỌI HÀM TÍNH LẠI TỔNG (Hàm này nằm bên file ejs)
                if (typeof window.updateCartSelection === 'function') {
                    window.updateCartSelection();
                }

                // Cập nhật icon giỏ hàng
                if (result.totalQty !== undefined && cartBadge) {
                    cartBadge.innerText = result.totalQty;
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    document.querySelectorAll('.btn-increase').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn, 1));
    });

    document.querySelectorAll('.btn-decrease').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn, -1));
    });

    // 2. Nút Xóa 
    document.querySelectorAll('.btn-remove-cart').forEach(btn => {
        btn.addEventListener('click', async function() {
            if (!confirm('Bạn có chắc muốn xóa sách này?')) return;

            const row = this.closest('tr');
            const bookId = row.getAttribute('data-book-id');

            const response = await fetch('/cart/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookId })
            });

            const result = await response.json();
            if (result.success) {
                row.remove(); 
                
                // 👇 GỌI HÀM TÍNH LẠI TỔNG
                if (typeof window.updateCartSelection === 'function') {
                    window.updateCartSelection();
                }

                if (cartBadge) cartBadge.innerText = result.totalQty;
                if (result.totalQty === 0) location.reload();
            }
        });
    });
});