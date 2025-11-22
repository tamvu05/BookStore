import showToast from './toast.js'

const paginationZone = document.querySelector('#pagination-view-manager')

if (paginationZone) {
    paginationZone.addEventListener('click', (event) => {
        const btn = event.target.closest('a.page-link')

        if (btn && btn.hasAttribute('href')) {
            event.preventDefault()

            const href = btn.getAttribute('href')
            const url = new URL(href, window.location.origin)
            const newPage = url.searchParams.get('page')

            updateView(newPage)
        }
    })
}

// Hàm cập nhật view
async function updateView(page = 1) {
    try {
        const res = await fetch(`/api/category/partials?page=${page}`)
        const data = await res.json()

        if (!res.ok) {
            throw new Error(data.message || `Lỗi không xác định: ${res.status}`)
        }

        const tableViewElement = document.querySelector('#table-view-manager')
        const paginationElement = document.querySelector(
            '#pagination-view-manager'
        )

        tableViewElement.innerHTML = data.table
        paginationElement.innerHTML = data.pagination

        // Cập nhật lại URL trình duyệt mà kh reload trang
        const currentUrl = new URL(window.location.href)
        currentUrl.searchParams.set('page', page)
        history.pushState(null, '', currentUrl.toString())
    } catch (error) {
        showToast('Lỗi cập nhật view', 'danger')
    }
}
