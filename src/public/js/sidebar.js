document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const wrapper = document.getElementById('wrapper');

    if (sidebarToggle && wrapper) {
        sidebarToggle.addEventListener('click', function() {
            // Chuyển đổi lớp 'toggled'
            wrapper.classList.toggle('toggled');
        });
    }
});