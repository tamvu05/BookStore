import BaseTable from './base.table.js'
import helpers from './helpers.js'

const DANG_GIAO = 'DA_GIAO_CHO_DON_VI_VAN_CHUYEN'

class OrderModal {
    constructor(orderTableInstance) {
        this.orderTableInstance = orderTableInstance

        // Modal và Buttons
        this.modal = document.querySelector('#add-order-modal')
        this.btnSave = this.modal.querySelector('.btn-save')

        // Khu vực hiển thị thông tin
        this.labelName = this.modal.querySelector('#view-hoten')
        this.labelPhone = this.modal.querySelector('#view-sdt')
        this.labelAdresss = this.modal.querySelector('#view-diachi')
        this.labelNote = this.modal.querySelector('#view-noidung')
        this.selectStatus = this.modal.querySelector('#order-status-select')
        this.tableDetails = this.modal.querySelector('#view-receipt-items-body')
        this.totalPrice = this.modal.querySelector('#view-total-amount')
        this.labelDate = this.modal.querySelector('#view-ngaydat')

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

        if (this.modal) {
            this.modal.addEventListener(
                'hidden.bs.modal',
                this.resetModal.bind(this)
            )
        }
    }

    async updateOrderStatus() {
        if (!this.currentOrderId) return

        try {
            const newStatus = this.selectStatus.value

            Swal.fire({
                title: 'Đang xử lý...',
                text: 'Vui lòng chờ trong giây lát!',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })

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

            Swal.close()
            Swal.fire({
                title: 'Cập nhật trạng thái đơn hàng thành công!',
                icon: 'success',
                draggable: true,
            })

            this.modal.querySelector('.btn-close').click()
            this.orderTableInstance.updateView(null)
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái:', error)

            Swal.close()
            Swal.fire({
                icon: 'error',
                title: 'Cập nhật trạng thái đơn hàng thất bại!',
                text: error.message,
            })
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
            this.labelPhone.textContent = orderData.SDT
            this.labelAdresss.textContent = orderData.DiaChiNhan
            this.labelNote.textContent = orderData.GhiChu || 'Không có ghi chú'
            this.labelDate.textContent = helpers.formatTime7(orderData.NgayDat)

            this.selectStatus.value = orderData.TrangThai

            // Disable status update nếu đơn hàng đã giao hoặc đã hủy
            const isDelivered = orderData.TrangThai === 'DA_GIAO'
            const isCancelled = orderData.TrangThai === 'DA_HUY'
            this.selectStatus.disabled = isDelivered || isCancelled
            this.btnSave.disabled = isDelivered || isCancelled

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
                        <td class="text-end">${helpers.formatPrice(
                            detail.DonGia
                        )}</td>
                        
                        <td class="text-end"></td>
                        <td class="text-end">${helpers.formatPrice(price)}</td>
                    </tr>
                `
            })

            this.tableDetails.innerHTML = html
            this.totalPrice.textContent = helpers.formatPrice(totalAmount)

            // Gắn chi tiết sách vào 1 biến
            this.bookItems = orderDetail
        } catch (error) {
            console.error('Lỗi khi hiển thị chi tiết đơn hàng:', error)
            Swal.fire({
                icon: 'error',
                title: 'Lỗi hiển thị chi tiết đơn hàng!',
                text: error.message,
            })
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
        // Reset disabled state khi đóng modal
        if (this.selectStatus) this.selectStatus.disabled = false
        if (this.btnSave) this.btnSave.disabled = false
    }
}

class OrderTable extends BaseTable {
    constructor() {
        super({
            apiBaseUrl: '/api/sale/order',
            entityName: 'đơn đặt hàng',
        })
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
        this.statusFilter = document.querySelector('#order-status-filter') 
        this.sortableHeaders =
            this.tableWrapper?.querySelectorAll('tr .sortable')

        this.orderModalInstance = null

        // Collect filter values for status
        this.collectFilters = () => ({
            status: this.statusFilter?.value || null,
        })

        // Apply filters from URL
        this.applyFiltersFromUrl = (urlParams) => {
            if (this.statusFilter) {
                const status = urlParams.get('status')
                if (status) this.statusFilter.value = status
            }
        }

        this.loadInitialState()
        this.initEventListeners()
    }

    loadInitialState() {
        const urlParams = new URLSearchParams(window.location.search)

        if (this.searchInput) {
            const keyword = urlParams.get('keyword')
            if (keyword) this.searchInput.value = keyword
        }

        this.applyFiltersFromUrl(urlParams)

        const page = urlParams.get('page')
        const sort = urlParams.get('sort')
        const order = urlParams.get('order')
        const keyword = urlParams.get('keyword')

        const currentPage = page ? Number(page) : 1

        this.updateView(currentPage, sort, order, keyword, false, true)
    }

    initEventListeners() {
        if (this.tableWrapper)
            this.tableWrapper.addEventListener('click', (event) => {
                const btnCancel = event.target.closest('.btn-cancel-order')
                const btnDetails = event.target.closest('.btn-show-details')
                const sortableHeader = event.target.closest('tr i.sortable')

                if (btnCancel) {
                    this.cancelOrder(btnCancel)
                } else if (btnDetails) {
                    const id = btnDetails.closest('tr').dataset.id
                    this.orderModalInstance.showModal(id)
                } else if (sortableHeader) {
                    this.sortData(sortableHeader)
                }
            })

        if (this.statusFilter) {
            this.statusFilter.addEventListener(
                'change',
                this.handleSearch.bind(this)
            )
        }

        if (this.paginationWrapper) {
            this.paginationWrapper.addEventListener('click', (e) => {
                e.preventDefault()
                this.handlePageChange(e.target)
            })
        }

        window.addEventListener('popstate', this.handlePopState.bind(this))

        if (this.btnSearch) {
            this.btnSearch.addEventListener('click', this.handleSearch.bind(this))
        }

        if (this.searchInput) {
            this.searchInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') this.btnSearch.click()
            })
            this.searchInput.addEventListener(
                'input',
                this.debounced(() => this.handleSearch(), 1000)
            )
        }
    }

    async cancelOrder(btnCancel) {
        try {
            const result = await Swal.fire({
                title: 'Xác nhận hủy đơn đặt hàng?',
                text: 'Hành động này sẽ hoàn trả tồn kho và không thể hoàn tác lại',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy bỏ',
            })

            if (!result.isConfirmed) return

            const status = btnCancel.closest('tr').dataset.status
            const allowedStatusesForCancel = [
                'CHO_XAC_NHAN',
                'CHO_THANH_TOAN',
                'DANG_CHUAN_BI_HANG',
            ]
            
            if (!allowedStatusesForCancel.includes(status)) {
                Swal.fire({
                    icon: 'info',
                    title: 'Không thể hủy đơn hàng!',
                    text: 'Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận, Chờ thanh toán hoặc Đang chuẩn bị hàng.',
                })
                return
            }

            Swal.fire({
                title: 'Đang xử lý...',
                text: 'Vui lòng chờ trong giây lát!',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })

            const id = btnCancel.closest('tr').dataset.id
            const res = await fetch(`/api/sale/order/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ TrangThai: 'DA_HUY' }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(
                    data.message ||
                        `Lỗi HTTP ${res.status}: Cập nhật trạng thái thất bại`
                )
            }

            Swal.close()
            Swal.fire({
                title: 'Hủy đơn đặt hàng thành công!',
                icon: 'success',
                draggable: true,
            })

            const page = this.getCurrentPage()
            this.updateView(page)
        } catch (error) {
            Swal.close()
            Swal.fire({
                icon: 'error',
                title: 'Hủy đơn đặt hàng thất bại!',
                text: error.message,
            })
        }
    }

    setOrderModalInstance(instance) {
        this.orderModalInstance = instance
    }

    // updateView, handlePageChange, handlePopState, handleSearch,
    // sortData, updateSortIcon, debounced
    // đều dùng từ BaseTable

    getCurrentPage() {
        const urlParams = new URLSearchParams(window.location.search)
        const page = urlParams.get('page')
        return page
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const orderTable = new OrderTable()
    const orderModal = new OrderModal(orderTable)
    orderTable.setOrderModalInstance(orderModal)
})
