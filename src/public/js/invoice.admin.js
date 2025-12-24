import BaseTable from './base.table.js'
import getCurrentVietNamTime from './getCurrentVietNamTime.js'

function formatToVietNamTime(dateInput) {
    const dateObject = new Date(dateInput)

    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }
    return dateObject.toLocaleString('vi-VN', options)
}

function formatPrice(price) {
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

function isValidVietnamesePhoneNumber(phoneNumber) {
    if (!phoneNumber) {
        return false
    }

    const phoneRegex = /^(0|\+84)(9\d|8\d|7\d|5\d|3\d)\d{7}$/

    return phoneRegex.test(phoneNumber.trim())
}

class InvoiceAddModal {
    constructor(invoiceTableInstance) {
        this.invoiceTableInstance = invoiceTableInstance

        this.modal = document.querySelector('#add-invoice-modal')
        this.btnSave = document.querySelector('.btn-save-receipt')
        this.btnAddItem = document.querySelector('.btn-add-item')

        this.inputName = this.modal.querySelector('#input-hoten')
        this.inputPhone = this.modal.querySelector('#input-sdt')
        // Đã bỏ trường địa chỉ theo yêu cầu

        this.inputDate = this.modal.querySelector('#receipt-date-input')
        this.textareaNotes = this.modal.querySelector('#receipt-notes-textarea')
        this.paymentMethod = this.modal.querySelector('#payment-method-select')

        this.selectBookItem = this.modal.querySelector('#book-select-item')
        this.inputQuantity = this.modal.querySelector('#input-quantity')
        this.inputUnitPrice = this.modal.querySelector('#input-unit-price')

        this.itemsBody = this.modal.querySelector('#receipt-items-body')
        this.totalAmountDisplay = this.modal.querySelector(
            '#receipt-total-amount'
        )

        this.selectedItems = new Map()

        this.initEventListeners()
        this.initSelect2()
        this.renderTotalAmount()
    }

    initSelect2() {
        const select2Config = {
            placeholder: 'Chọn...',
            allowClear: true,
            width: '100%',
            dropdownParent: $(this.modal),
        }

        $('#book-select-item').select2({
            ...select2Config,
            placeholder: 'Chọn sách',
        })
    }

    initEventListeners() {
        if (this.btnSave) {
            this.btnSave.addEventListener(
                'click',
                this.createInvoice.bind(this)
            )
        }

        if (this.btnAddItem) {
            this.btnAddItem.addEventListener(
                'click',
                this.addItemDetail.bind(this)
            )
        }

        if (this.itemsBody) {
            this.itemsBody.addEventListener(
                'click',
                this.handleItemAction.bind(this)
            )
            this.itemsBody.addEventListener(
                'input',
                this.handleItemInput.bind(this)
            )
        }

        if (this.modal) {
            this.modal.addEventListener(
                'hidden.bs.modal',
                this.resetModal.bind(this)
            )

            // Load sách khi modal chuẩn bị mở
            this.modal.addEventListener('show.bs.modal', async () => {
                await this.loadBookSelect()
            })
        }

        // Tự động điền đơn giá theo giá sách khi chọn (không cho sửa)
        // Sử dụng select2:select event cho Select2
        if (this.selectBookItem) {
            $(this.selectBookItem).on('select2:select', (e) => {
                const selectedOption = e.params.data.element
                const price = Number(selectedOption?.dataset?.price || 0)
                if (!isNaN(price) && price > 0) {
                    this.inputUnitPrice.value = price
                }
                // Reset số lượng về 1 khi chọn sách mới
                this.inputQuantity.value = 1
            })
        }

        // Ngăn người dùng chỉnh sửa đơn giá
        if (this.inputUnitPrice) {
            this.inputUnitPrice.addEventListener('input', (e) => {
                const selectedOption =
                    this.selectBookItem.options[
                        this.selectBookItem.selectedIndex
                    ]
                const price = Number(selectedOption?.dataset?.price || 0)
                if (!isNaN(price) && price > 0) {
                    this.inputUnitPrice.value = price
                }
            })
        }
    }

    async loadBookSelect() {
        try {
            const res = await fetch('/api/book/')
            const books = await res.json()

            let html = '<option value="">Chọn sách</option>'
            for (const book of books) {
                html += `
                <option value="${book.MaSach}" data-price="${book.DonGia}" data-stock="${book.SoLuongTon}">
                    ${book.TenSach} (ISBN: ${book.ISBN}, Tồn: ${book.SoLuongTon}) 
                </option>`
            }

            this.selectBookItem.innerHTML = html
        } catch (error) {
            // Xử lý lỗi tải sách
            console.error('Lỗi khi tải danh sách sách:', error)
            Swal.fire({
                icon: 'error',
                title: 'Tải sách thất bại!',
                text: error.message,
            })
        }

        this.inputDate.setAttribute('value', getCurrentVietNamTime())
    }

    // --- LOGIC THAO TÁC CHI TIẾT SÁCH (Giữ nguyên) ---
    handleItemAction(event) {
        const btnDelete = event.target.closest('.btn-remove-item')
        if (btnDelete) {
            const itemId = btnDelete.dataset.id
            this.removeItemDetail(itemId)
        }
    }

    handleItemInput(event) {
        const inputElement = event.target.closest('input[data-field]')
        if (!inputElement) return

        const itemId = inputElement.closest('tr').dataset.id
        const field = inputElement.dataset.field
        let value = Number(inputElement.value)

        if (itemId && this.selectedItems.has(itemId)) {
            const item = this.selectedItems.get(itemId)

            if (field === 'quantity') {
                value = Math.max(1, value)
                inputElement.value = value
                item.SoLuong = value
                
                this.selectedItems.set(itemId, item)
                this.renderTotalAmount()
            }
            // Đơn giá không được phép chỉnh sửa
        }
    }

    removeItemDetail(itemId) {
        this.selectedItems.delete(itemId)
        this.renderItemsTable()
        this.renderTotalAmount()
    }

    renderItemsTable() {
        this.itemsBody.innerHTML = ''
        if (this.selectedItems.size === 0) {
            this.itemsBody.innerHTML =
                '<tr><td colspan="4" class="text-center text-muted">Chưa có mặt hàng nào được thêm.</td></tr>'
            this.modal.querySelector('.items-error').classList.remove('d-none')
            return
        }

        this.modal.querySelector('.items-error').classList.add('d-none')

        this.selectedItems.forEach((item) => {
            const row = document.createElement('tr')
            row.dataset.id = item.MaSach
            row.innerHTML = `
                <td>${item.TenSach}</td>
                <td><input type="number" class="form-control form-control-sm text-end" value="${item.SoLuong}" min="1" data-field="quantity" data-id="${item.MaSach}"></td>
                <td><input type="number" class="form-control form-control-sm text-end" value="${item.DonGia}" min="0" step="1000" data-field="price" data-id="${item.MaSach}" readonly></td>
                <td class="text-center">
                    <button type="button" class="btn btn-sm btn-danger btn-remove-item" data-id="${item.MaSach}">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            `
            this.itemsBody.appendChild(row)
        })
    }

    renderTotalAmount() {
        let total = 0
        this.selectedItems.forEach((item) => {
            total += item.SoLuong * item.DonGia
        })

        const formatter = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        })
        this.totalAmountDisplay.textContent = formatter.format(total)
    }

    async addItemDetail() {
        const bookId = this.selectBookItem.value
        let quantity = Number(this.inputQuantity.value)
        let unitPrice = Number(this.inputUnitPrice.value)

        // Lấy tồn kho từ data-stock
        const selectedOption =
            this.selectBookItem.options[this.selectBookItem.selectedIndex]
        const currentStock = Number(selectedOption?.dataset?.stock || 0)

        if (!bookId || quantity <= 0) {
            this.modal
                .querySelector('.item-input-error')
                .classList.remove('d-none')
            return
        }
        this.modal.querySelector('.item-input-error').classList.add('d-none')

        if (this.selectedItems.has(bookId)) {
            Swal.fire({
                icon: 'warning',
                title: 'Sách đã tồn tại!',
                text: 'Sách này đã được thêm. Vui lòng chỉnh sửa số lượng trong bảng.',
            })
            return
        }

        // KIỂM TRA TỒN KHO TẠI CLIENT
        if (quantity > currentStock) {
            this.modal
                .querySelector('.out-of-stock-error')
                .classList.remove('d-none')
            Swal.fire({
                icon: 'warning',
                title: 'Số lượng không đủ!',
                text: `Sách này chỉ còn ${currentStock} cuốn.`,
            })
            return
        } else {
            this.modal
                .querySelector('.out-of-stock-error')
                .classList.add('d-none')
        }

        // ... (Tiếp tục thêm item và reset form) ...
        const newItem = {
            MaSach: bookId,
            TenSach: selectedOption.text.split(' (ISBN:')[0].trim(),
            SoLuong: quantity,
            DonGia: unitPrice,
        }
        this.selectedItems.set(bookId, newItem)

        $(this.selectBookItem).val(null).trigger('change')
        this.inputQuantity.value = 1
        this.inputUnitPrice.value = 0

        this.renderItemsTable()
        this.renderTotalAmount()
    }

    async createInvoice() {
        try {
            const ok = await this.validateForm()
            if (!ok) return

            const ChiTietHD = Array.from(this.selectedItems.values()).map(
                (item) => ({
                    MaSach: item.MaSach,
                    SoLuong: item.SoLuong,
                    DonGia: item.DonGia,
                })
            )

            const payload = {
                TenKhachHang: this.inputName.value.trim() || 'Khách lẻ',
                SDTKhachHang: this.inputPhone.value.trim() || '',
                NgayTao: this.inputDate.value,
                HinhThucThanhToan: this.paymentMethod.value,
                GhiChu: this.textareaNotes.value.trim(),
                ChiTietHD: ChiTietHD,
                MaNV: 1, // TODO: lấy từ session/nguồn phù hợp
            }

            Swal.fire({
                title: 'Đang xử lý...',
                text: 'Vui lòng chờ trong giây lát!',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading()
                },
            })

            const res = await fetch('/api/sale/invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                const errorMessage =
                    data.message ||
                    `Lỗi HTTP ${res.status}: Tạo hóa đơn thất bại.`
                throw new Error(errorMessage)
            }

            Swal.close()
            Swal.fire({
                title: 'Tạo hóa đơn thành công!',
                icon: 'success',
                draggable: true,
            })

            this.modal.querySelector('.btn-close').click()
            this.invoiceTableInstance.updateView()
        } catch (error) {
            console.error('Lỗi khi tạo hóa đơn:', error)
            Swal.close()
            Swal.fire({
                icon: 'error',
                title: ' thất bại!',
                text: error.message,
            })
        }
    }

    async validateForm() {
        const phone = this.inputPhone.value.trim()
        if (phone && phone !== '') {
            const ok = isValidVietnamesePhoneNumber(phone)
            if (!ok) {
                this.modal
                    .querySelector('.invalid-phone-number')
                    .classList.remove('d-none')
                return false
            } else {
                this.modal
                    .querySelector('.invalid-phone-number')
                    .classList.add('d-none')
            }
        } else {
            this.modal
                .querySelector('.invalid-phone-number')
                .classList.add('d-none')
        }

        const requiredSelectors = [
            {
                element: this.inputDate,
                errorClass: 'empty-date',
                message: 'Vui lòng chọn ngày tạo hóa đơn!',
            },
        ]

        for (const field of requiredSelectors) {
            const errorElement = this.modal.querySelector(
                `.${field.errorClass}`
            )
            const value = field.element.value || $(field.element).val()

            if (!value || value === '' || value === null) {
                errorElement.classList.remove('d-none')
                return false
            } else {
                errorElement.classList.add('d-none')
            }
        }

        // 2. Kiểm tra Chi tiết Phiếu (Items)
        const itemsErrorEl = this.modal.querySelector('.items-error')
        if (this.selectedItems.size === 0) {
            itemsErrorEl.classList.remove('d-none')
            return false
        } else {
            itemsErrorEl.classList.add('d-none')
        }

        // 3. Kiểm tra tính hợp lệ của SL/Đơn giá trong bảng (Bao gồm Tồn kho lần cuối)
        let hasError = false
        if (!hasError && this.selectedItems.size > 0) {
            const invalidAmountErrorEl = this.modal.querySelector(
                '.invalid-item-amount'
            )
            const outOfStockErrorEl = this.modal.querySelector(
                '.out-of-stock-error2'
            )

            let isValidAmount = true
            let outOfStock = false

            for (const item of this.selectedItems) {
                const book = item[1]
                if (
                    book.SoLuong <= 0 ||
                    book.DonGia <= 0 ||
                    isNaN(book.SoLuong) ||
                    isNaN(book.DonGia)
                ) {
                    isValidAmount = false
                    break
                }

                // KIỂM TRA TỒN KHO THỰC TẾ LẦN CUỐI (Tương tự Export)
                const res = await fetch('/api/book/quantity/' + book.MaSach)
                const stock = await res.json()

                if (book.SoLuong > stock) {
                    outOfStock = true
                    break
                }
            }

            if (!isValidAmount) {
                invalidAmountErrorEl.classList.remove('d-none')
                hasError = true
            } else {
                invalidAmountErrorEl.classList.add('d-none')
            }

            if (outOfStock) {
                outOfStockErrorEl.classList.remove('d-none')
                hasError = true
            } else {
                outOfStockErrorEl.classList.add('d-none')
            }
        }

        return !hasError
    }

    resetModal() {
        this.inputDate.value = getCurrentVietNamTime()
        this.textareaNotes.value = ''
        this.inputQuantity.value = 1
        this.inputUnitPrice.value = 0

        this.inputName.value = '' 
        this.inputPhone.value = ''
        // Bỏ reset địa chỉ vì không còn sử dụng

        // Reset Select2 fields
        $(this.selectBookItem).val(null).trigger('change')

        // Reset items
        this.selectedItems.clear()
        this.renderItemsTable()
        this.renderTotalAmount()

        this.modal.querySelectorAll('.value-error').forEach((errorEl) => {
            errorEl.classList.add('d-none')
        })
    }
}

class InvoiceViewModal {
    constructor(invoiceTableInstance) {
        this.invoiceTableInstance = invoiceTableInstance

        // Modal và Buttons
        this.modal = document.querySelector('#modal-view-invoice') // ID modal

        // Khu vực hiển thị thông tin chung
        this.labelName = this.modal.querySelector('#view-hoten')
        this.labelPhone = this.modal.querySelector('#view-sdt')
        // Đã bỏ hiển thị địa chỉ theo yêu cầu
        this.labelDate = this.modal.querySelector('#view-ngaydat')
        this.labelNote = this.modal.querySelector('#view-noidung') // Nếu có

        // Khu vực hiển thị Chi tiết
        this.tableDetails = this.modal.querySelector('#view-receipt-items-body')
        this.totalPrice = this.modal.querySelector('#view-total-amount')

        this.initEventListeners()
    }

    initEventListeners() {
        // Reset data khi modal đóng
        if (this.modal) {
            this.modal.addEventListener(
                'hidden.bs.modal',
                this.resetModal.bind(this)
            )
        }
    }

    // Hàm nạp dữ liệu chi tiết và hiển thị modal
    async initValue(id) {
        try {
            const res1 = await fetch('/api/sale/invoice/' + id)
            const invoiceData = await res1.json()

            if (!res1.ok) {
                throw new Error(
                    invoiceData.message ||
                        `Lỗi HTTP ${res1.status}: Không tìm thấy hóa đơn`
                )
            }

            // Fetch Invoice Items (Chi tiết đơn hàng)
            const res2 = await fetch('/api/sale/invoice/detail/' + id)
            const invoiceDetail = await res2.json()

            if (!res2.ok) {
                throw new Error(
                    invoiceDetail.message ||
                        `Lỗi HTTP ${res2.status}: Không tìm thấy chi tiết hóa đơn`
                )
            }

            // --- 1. HIỂN THỊ THÔNG TIN KHÁCH HÀNG & PHIẾU ---
            this.labelName.textContent = invoiceData.TenKhachHang || 'Khách lẻ'
            this.labelPhone.textContent = invoiceData.SDTKhachHang || 'Không ghi nhận'
            this.labelDate.textContent = formatToVietNamTime(
                invoiceData.NgayTaoHoaDon
            )
            // this.labelNote.textContent = invoiceData.GhiChu || 'Không có ghi chú' // Nếu có trường ghi chú

            // --- 2. HIỂN THỊ CHI TIẾT SÁCH TRONG BẢNG ---
            let html = ''

            // Dữ liệu chi tiết hóa đơn: TenSach, SoLuong, DonGia
            invoiceDetail.forEach((detail) => {
                const lineTotal = detail.DonGia * detail.SoLuong

                html += `
                    <tr>
                        <td>${detail.TenSach}</td>
                        <td class="text-end">${detail.SoLuong}</td>
                        <td class="text-end">${this.formatPrice(detail.DonGia)}</td>
                        <td class="text-end">${this.formatPrice(lineTotal)}</td>
                    </tr>
                `
            })

            this.tableDetails.innerHTML = html
            // Hiển thị tổng tiền theo hóa đơn từ DB
            this.totalPrice.textContent = this.formatPrice(invoiceData.TongTien || 0)
        } catch (error) {
            console.error('Lỗi khi hiển thị chi tiết hóa đơn:', error)
            Swal.fire({
                icon: 'error',
                title: 'Tải dữ liệu thất bại!',
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

    // Modal Hóa đơn không cần reset phức tạp
    resetModal() {
        this.labelName.textContent = ''
        this.labelPhone.textContent = ''
        this.labelDate.textContent = ''
        this.tableDetails.innerHTML = ''
        this.totalPrice.textContent = ''
    }

    formatPrice(price) {
        // Áp dụng hàm formatPrice từ constructor
        return formatPrice(price)
    }
}

class InvoiceTable extends BaseTable {
    constructor() {
        super({
            apiBaseUrl: '/api/sale/invoice',
            entityName: 'hóa đơn bán hàng',
        })
        this.apiBaseUrl = '/api/sale/invoice'
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
        this.statusFilter = document.querySelector('#invoice-status-filter')

        this.invoiceModalInstance = null

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
        // Hóa đơn thường không lọc trạng thái
        this.searchInput.setAttribute(
            'placeholder',
            'Tìm kiếm theo số điện thoại khách hàng'
        )

        const urlParams = new URLSearchParams(window.location.search)

        if (this.searchInput) {
            const keyword = urlParams.get('keyword')
            if (keyword) this.searchInput.value = keyword
        }

        this.applyFiltersFromUrl(urlParams)

        const page = urlParams.get('page')
        const status = urlParams.get('status')
        const keyword = urlParams.get('keyword')

        const currentPage = page ? Number(page) : 1

        this.updateView(currentPage, null, null, keyword, false, true)
    }

    initEventListeners() {
        // Bắt sự kiện xem chi tiết
        if (this.tableWrapper)
            this.tableWrapper.addEventListener('click', (event) => {
                const btnDetails = event.target.closest('.btn-show-details')
                const btnPay = event.target.closest('.btn-pay')
                const btnCancel = event.target.closest('.btn-cancel')

                if (btnDetails) {
                    const id = btnDetails.closest('tr').dataset.id
                    this.invoiceModalInstance.showModal(id)
                }

                if (btnPay) {
                    const row = btnPay.closest('tr')
                    const id = row.dataset.id
                    this.handlePayInvoice(id)
                }

                if (btnCancel) {
                    const row = btnCancel.closest('tr')
                    const id = row.dataset.id
                    this.handleCancelInvoice(id)
                }
            })

        // Status filter change
        if (this.statusFilter) {
            this.statusFilter.addEventListener('change', () => {
                this.handleSearch()
            })
        }

        // ... (Listeners Phân trang, Search, Popstate tương tự OrderTable) ...
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
            this.searchInput.addEventListener(
                'input',
                this.debounced(() => this.handleSearch(), 1000)
            )
        }
    }

    setInvoiceModalInstance(instance) {
        this.invoiceModalInstance = instance
    }

    async handlePayInvoice(id) {
        const confirmed = await Swal.fire({
            title: 'Xác nhận thanh toán?',
            text: 'Hóa đơn sẽ được đánh dấu là đã thanh toán',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận',
            cancelButtonText: 'Hủy',
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
        })

        if (!confirmed.isConfirmed) return

        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}/pay`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Không thể thanh toán hóa đơn')
            }

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã thanh toán hóa đơn',
                timer: 2000,
                showConfirmButton: false,
            })

            // Reload current page
            const urlParams = new URLSearchParams(window.location.search)
            const currentPage = Number(urlParams.get('page')) || 1
            this.updateView(currentPage)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: error.message || 'Không thể thanh toán hóa đơn',
            })
        }
    }

    async handleCancelInvoice(id) {
        const confirmed = await Swal.fire({
            title: 'Xác nhận hủy hóa đơn?',
            text: 'Hành động này sẽ hoàn trả tồn kho và không thể hoàn tác',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xác nhận hủy',
            cancelButtonText: 'Không',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
        })

        if (!confirmed.isConfirmed) return

        try {
            const response = await fetch(`${this.apiBaseUrl}/${id}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Không thể hủy hóa đơn')
            }

            Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã hủy hóa đơn',
                timer: 2000,
                showConfirmButton: false,
            })

            // Reload current page
            const urlParams = new URLSearchParams(window.location.search)
            const currentPage = Number(urlParams.get('page')) || 1
            this.updateView(currentPage)
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: error.message || 'Không thể hủy hóa đơn',
            })
        }
    }

    // updateView, handlePageChange, handlePopState, handleSearch,
    // sortData, updateSortIcon, debounced
    // đều dùng từ BaseTable
}

document.addEventListener('DOMContentLoaded', () => {
    const invoiceTable = new InvoiceTable()
    const invoiceViewModal = new InvoiceViewModal(invoiceTable)
    const invoiceAddModal = new InvoiceAddModal(invoiceTable)

    invoiceTable.setInvoiceModalInstance(invoiceViewModal)
})
