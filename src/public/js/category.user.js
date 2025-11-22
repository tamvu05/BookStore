// src/public/js/category.user.js

document.addEventListener('DOMContentLoaded', function() {
    // Lấy các phần tử cần thiết
    const searchInput = document.getElementById('categorySearch');
    const noResultMsg = document.getElementById('noResult');
    const items = document.querySelectorAll('.category-item');

    // Nếu trang này không có ô tìm kiếm thì dừng (để tránh lỗi console ở trang khác)
    if (!searchInput) return;

    // Bắt sự kiện khi người dùng gõ phím
    searchInput.addEventListener('keyup', function() {
        const searchValue = this.value.trim().toLowerCase(); // Chuyển về chữ thường
        let hasResult = false;

        items.forEach(item => {
            // Tìm phần tử chứa tên thể loại
            const nameEl = item.querySelector('.category-name');
            const name = nameEl ? nameEl.innerText.toLowerCase() : '';

            // Kiểm tra xem tên có chứa từ khóa không
            if (name.includes(searchValue)) {
                item.classList.remove('d-none'); // Hiện
                hasResult = true;
            } else {
                item.classList.add('d-none'); // Ẩn
            }
        });

        // Ẩn/Hiện thông báo "Không tìm thấy"
        if (hasResult) {
            noResultMsg.classList.add('d-none');
        } else {
            noResultMsg.classList.remove('d-none');
        }
    });
});