import showToast from './toast.js'

class OrderModal {
    constructor(orderTableInstance) {
        this.orderTableInstance = orderTableInstance

        // Modal và Buttons
        this.modal = document.querySelector('#add-order-modal')
        this.btnSave = this.modal.querySelector('.btn-save')

        // Khu vực hiển thị thông tin
        this.labelName = this.modal.querySelector('#view-hoten')
        this.labelEmail = this.modal.querySelector('#view-email')
        this.labelPhone = this.modal.querySelector('#view-sdt')
        this.labelAdresss = this.modal.querySelector('#view-diachi')
        this.labelNote = this.modal.querySelector('#view-noidung')
        this.selectStatus = this.modal.querySelector('#order-status-select')
        this.tableDetails = this.modal.querySelector('#view-receipt-items-body')
        this.totalPrice = this.modal.querySelector('#view-total-amount')

        this.currentOrderId = null
        this.bookItems = null

        this.TRANG_THAI = {
            CHO_XAC_NHAN: 'Chờ xác nhận',
            DANG_CHUAN_BI_HANG: 'Đang chuẩn bị hàng',
            DA_GIAO_CHO_DON_VI_VAN_CHUYEN: 'Đã chuyển cho đơn vị vận chuyển',
            DA_GIAO: 'Đã giao hàng',
            DA_HUY: 'Đã hủy',
        }

        this.initEventListeners()
    }

    initEventListeners() {
        if (this.btnSave) {
            this.btnSave.addEventListener(
                'click',
                this.updateOrderStatus.bind(this)
            )
        }

        // Đóng modal (reset trạng thái)
        if (this.modal) {
            this.modal.addEventListener(
                'hidden.bs.modal',
                this.resetModal.bind(this)
            )
        }
    }

    // Hàm format tiền tệ (Lấy từ tableOrder.ejs)
    formatPrice(price) {
        const numericPrice = Number(price)

        if (isNaN(numericPrice)) {
            return '0 ₫'
        }

        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
        return formatter.format(numericPrice)
    }

    // Hàm cập nhật trạng thái đơn hàng
    async updateOrderStatus() {
        if (!this.currentOrderId) return

        try {
            const newStatus = this.selectStatus.value

            const res = await fetch(
                `/api/sale/order/${this.currentOrderId}/status`,
                {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ TrangThai: newStatus }),
                }
            )

            const data = await res.json()

            if (!res.ok) {
                throw new Error(
                    data.message ||
                        `Lỗi HTTP ${res.status}: Cập nhật trạng thái thất bại`
                )
            }

            showToast('Đã cập nhật trạng thái đơn hàng', 'success')

            // Đóng modal và cập nhật bảng
            this.modal.querySelector('.btn-close').click()
            this.orderTableInstance.updateView(null)
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error)
            showToast(error.message, 'danger')
        }
    }

    // Hàm nạp dữ liệu chi tiết và hiển thị modal
    async initValue(id) {
        this.currentOrderId = id

        try {
            const res1 = await fetch('/api/sale/order/' + id)
            const orderData = await res1.json()

            if (!res1.ok) {
                throw new Error(
                    orderData.message ||
                        `Lỗi HTTP ${res1.status}: Không tìm thấy đơn hàng`
                )
            }

            const res2 = await fetch('/api/sale/order/detail/' + id)
            const orderDetail = await res2.json()

            if (!res2.ok) {
                throw new Error(
                    orderDetail.message ||
                        `Lỗi HTTP ${res2.status}: Không tìm thấy đơn hàng`
                )
            }

            this.labelName.textContent = orderData.TenNguoiNhan
            this.labelEmail.textContent = orderData.Email || 'Không có'
            this.labelPhone.textContent = orderData.SDT
            this.labelAdresss.textContent = orderData.DiaChiNhan
            this.labelNote.textContent = orderData.GhiChu || 'Không có ghi chú'

            this.selectStatus.value = orderData.TrangThai

            let html = ''
            let totalAmount = 0

            orderDetail.forEach((detail) => {
                const price = detail.DonGia * detail.SoLuong
                totalAmount += price

                // Thêm 1 trường khuyến mãi
                html += `
                    <tr>
                        <td>${detail.TenSach}</td>
                        <td class="text-end">${detail.SoLuong}</td>
                        <td class="text-end">${this.formatPrice(
                            detail.DonGia
                        )}</td>
                        
                        <td class="text-end"></td>
                        <td class="text-end">${this.formatPrice(price)}</td>
                    </tr>
                `
            })

            this.tableDetails.innerHTML = html
            this.totalPrice.textContent = this.formatPrice(totalAmount)

            // Gắn chi tiết sách vào 1 biến
            this.bookItems = orderDetail
        } catch (error) {
            console.error('Lỗi khi hiển thị chi tiết đơn hàng:', error)
            showToast(error.message, 'danger')
        }
    }

    showModal(id) {
        const modalInstance = bootstrap.Modal.getInstance(this.modal)
        if (modalInstance) {
            modalInstance.show()
        } else {
            const newInstance = new bootstrap.Modal(this.modal)
            newInstance.show()
        }

        this.initValue(id)
    }

    resetModal() {
        this.currentOrderId = null
        // Có thể thêm logic reset input/label nếu cần
    }
}

class OrderTable {
    constructor() {
        this.config = {
            apiBaseUrl: '/api/sale/order',
            entityName: 'đơn đặt hàng',
        }
        this.tableWrapper = document.querySelector('#table-view-manager')
        this.paginationWrapper = document.querySelector(
            '#pagination-view-manager'
        )
        this.btnSearch = document.querySelector(
            '.manager-container .btn-search'
        )
        this.searchInput = document.querySelector(
            '.manager-container .search-value'
        )
        this.statusFilter = document.querySelector('#order-status-filter') // Bộ lọc trạng thái
        this.sortableHeaders =
            this.tableWrapper?.querySelectorAll('tr .sortable')

        this.orderModalInstance = null

        this.loadInitialState()
        this.initEventListeners()
    }

    loadInitialState() {
        const urlParams = new URLSearchParams(window.location.search)

        if (this.searchInput) {
            const keyword = urlParams.get('keyword')
            if (keyword) this.searchInput.value = keyword
        }

        if (this.statusFilter) {
            const status = urlParams.get('status')
            if (status) this.statusFilter.value = status
        }

        const page = urlParams.get('page')
        const sort = urlParams.get('sort')
        const order = urlParams.get('order')
        const keyword = urlParams.get('keyword')
        const status = urlParams.get('status')

        const currentPage = page ? Number(page) : 1

        this.updateView(currentPage, sort, order, keyword, status, false, true)
    }

    initEventListeners() {
        // Bắt sự kiện xem/cập nhật chi tiết
        if (this.tableWrapper)
            this.tableWrapper.addEventListener('click', (event) => {
                const btnDetails = event.target.closest('.btn-show-details')
                const sortableHeader = event.target.closest('tr i.sortable')

                if (btnDetails) {
                    const id = btnDetails.closest('tr').dataset.id
                    this.orderModalInstance.showModal(id)
                } else if (sortableHeader) {
                    this.sortData(sortableHeader)
                }
            })

        // Bắt sự kiện thay đổi bộ lọc trạng thái
        if (this.statusFilter) {
            this.statusFilter.addEventListener(
                'change',
                this.handleSearch.bind(this)
            )
        }

        // ... (Listeners Phân trang, Search, Popstate tương tự các file khác) ...
        if (this.paginationWrapper) {
            this.paginationWrapper.addEventListener('click', (e) => {
                e.preventDefault()
                this.handlePageChange(e.target)
            })
        }

        window.addEventListener('popstate', this.handlePopState.bind(this))

        if (this.btnSearch) {
            this.btnSearch.addEventListener(
                'click',
                this.handleSearch.bind(this)
            )
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') this.btnSearch.click()
            })
            this.searchInput.addEventListener('input', () => {
                const func = () => {
                    this.handleSearch()
                }
                const delay = 1000
                const handleDebounced = this.debounced(func, delay)
                handleDebounced()
            })
        }
    }

    setOrderModalInstance(instance) {
        this.orderModalInstance = instance
    }

    // Gộp logic tìm kiếm và lọc trạng thái
    handleSearch() {
        const keyword = this.searchInput ? this.searchInput.value.trim() : null
        const status = this.statusFilter ? this.statusFilter.value : null

        const sortableHeader = this.tableWrapper?.querySelector(
            'tr i.sortable[data-order]'
        )
        let sort = null,
            order = null
        if (sortableHeader) {
            sort = sortableHeader.dataset.sort
            order = sortableHeader.dataset.order
        }
        // Luôn quay về trang 1 khi tìm kiếm hoặc lọc
        this.updateView(1, sort, order, keyword, status)
    }

    // Cần truyền thêm status vào updateView
    async updateView(
        page = 1,
        sort,
        order,
        keyword,
        status, 
        shouldPushState = true,
        shouldReplaceState = false
    ) {
        try {
            if (isNaN(page) || Number(page) < 1) page = 1

            let query = `page=${page}`
            if (sort) query += `&sort=${sort}`
            if (order) query += `&order=${order}`
            if (keyword) query += `&keyword=${keyword}`
            if (status) query += `&status=${status}`

            const res = await fetch(
                `${this.config.apiBaseUrl}/partials?${query}`
            )
            const data = await res.json()

            if (!res.ok) {
                throw new Error(
                    data.message || `Lỗi không xác định: ${res.status}`
                )
            }

            if (this.tableWrapper) this.tableWrapper.innerHTML = data.table
            if (this.paginationWrapper)
                this.paginationWrapper.innerHTML = data.pagination

            // Cập nhật lại URL trình duyệt
            if (shouldPushState || shouldReplaceState) {
                const currentUrl = new URL(window.location.href)
                currentUrl.search = ''
                currentUrl.searchParams.set('page', page)
                if (sort) currentUrl.searchParams.set('sort', sort)
                if (order) currentUrl.searchParams.set('order', order)
                if (keyword) currentUrl.searchParams.set('keyword', keyword)
                if (status) currentUrl.searchParams.set('status', status) // Thêm status vào URL

                const urlString = currentUrl.toString()
                if (shouldReplaceState) {
                    history.replaceState(null, '', urlString)
                } else {
                    history.pushState(null, '', urlString)
                }
            }
        } catch (error) {
            showToast(error.message, 'danger')
        }
    }

    handlePageChange(targetElement) {
        const pageLink = targetElement.closest('.page-link')
        if (!pageLink) return

        let targetPage = pageLink.dataset.page
        if (!targetPage) return

        const urlParams = new URLSearchParams(window.location.search)
        const sort = urlParams.get('sort')
        const order = urlParams.get('order')
        const keyword = urlParams.get('keyword')
        const status = urlParams.get('status') 

        this.updateView(Number(targetPage), sort, order, keyword, status)
    }

    handlePopState() {
        const urlParams = new URLSearchParams(window.location.search)

        const page = urlParams.get('page')
        const sort = urlParams.get('sort')
        const order = urlParams.get('order')
        const keyword = urlParams.get('keyword')
        const status = urlParams.get('status') 

        const currentPage = page ? Number(page) : 1

        this.updateView(currentPage, sort, order, keyword, status, false)
    }

    debounced(func, delay) {
        let timerID
        return function () {
            clearTimeout(timerID)
            timerID = setTimeout(() => {
                func.apply(this, arguments)
            }, delay)
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const orderTable = new OrderTable()
    const orderModal = new OrderModal(orderTable)
    orderTable.setOrderModalInstance(orderModal)
})
