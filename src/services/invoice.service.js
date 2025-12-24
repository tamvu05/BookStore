import config from '../configs/app.config.js'
import InvoiceModel from '../models/invoice.model.js'
import { createHttpError } from '../utils/errorUtil.js'

const { PAGE_LIMIT } = config

const InvoiceService = {
    async getWithParam(query) {
        let { page, sort, order, keyword, status } = query

        let currentPage = Number(page)
        let limit = Number(PAGE_LIMIT)

        if (isNaN(limit) || limit < 2 || limit > 20) limit = 10

        if (!keyword) keyword = ''

        const total = await InvoiceModel.getTotal(keyword)
        const totalPage = Math.ceil(total / limit)

        if (isNaN(currentPage) || currentPage > totalPage) currentPage = 1
        else if (currentPage < 1) currentPage = totalPage

        const offset = (currentPage - 1) * limit

        const validParam = ['MaHD', 'NgayTaoHoaDon', 'ASC', 'asc', 'DESC', 'desc']
        const validStatus = [
            'CHO_THANH_TOAN',
            'DA_THANH_TOAN',
            'DA_HUY',
            'DA_HOAN_TRA',
        ]

        const sortBy = validParam.includes(sort) ? sort : 'MaHD'
        const sortOrder = validParam.includes(order) ? order : 'DESC'
        status = validStatus.includes(status) ? status : ''

        const invoices = await InvoiceModel.getWithParam(
            limit,
            offset,
            sortBy,
            sortOrder,
            keyword,
            status
        )

        return {
            invoices,
            currentPage,
            limit,
            totalPage,
            total,
            totalItem: total,
            PAGE_LIMIT,
        }
    },

    async getById(id) {
        if (!id) throw new Error('Thiếu mã hóa đơn')

        const invoice = await InvoiceModel.getById(id)
        if (!invoice) throw new Error('Hóa đơn không tồn tại')

        return invoice
    },

    async getDetailById(id) {
        if (!id) throw new Error('Thiếu mã hóa đơn')

        const detail = await InvoiceModel.getDetailById(id)
        if (!detail) throw new Error('Hóa đơn không tồn tại')

        return detail
    },

    async create(payload) {
        try {
            const { MaNV, NgayTao, ChiTietHD } = payload

            if (
                !MaNV ||
                !NgayTao ||
                !ChiTietHD ||
                MaNV === '' ||
                NgayTao === '' ||
                ChiTietHD.length === 0
            )
                throw createHttpError('Thông tin hóa đơn không hợp lệ', 401)

            if (!payload.SDTKhachHang) payload.SDTKhachHang = ''

            const insertId = await InvoiceModel.create(payload)

            return insertId
        } catch (error) {
            throw error
        }
    },

    async pay(id) {
        try {
            if (!id) throw new Error('Thiếu mã hóa đơn')

            const invoice = await InvoiceModel.getById(id)
            if (!invoice) throw new Error('Hóa đơn không tồn tại')

            if (invoice.TrangThai === 'DA_THANH_TOAN') {
                throw new Error('Hóa đơn đã được thanh toán')
            }

            if (invoice.TrangThai === 'DA_HUY') {
                throw new Error('Không thể thanh toán hóa đơn đã hủy')
            }

            if (invoice.TrangThai === 'DA_HOAN_TRA') {
                throw new Error('Không thể thanh toán hóa đơn đã hoàn trả')
            }

            const success = await InvoiceModel.updateStatus(id, 'DA_THANH_TOAN')
            if (!success) throw new Error('Không thể cập nhật trạng thái hóa đơn')

            return true
        } catch (error) {
            throw error
        }
    },

    async cancel(id) {
        try {
            if (!id) throw new Error('Thiếu mã hóa đơn')

            const invoice = await InvoiceModel.getById(id)
            if (!invoice) throw new Error('Hóa đơn không tồn tại')

            if (invoice.TrangThai === 'DA_HUY') {
                throw new Error('Hóa đơn đã được hủy')
            }

            if (invoice.TrangThai === 'DA_HOAN_TRA') {
                throw new Error('Không thể hủy hóa đơn đã hoàn trả')
            }

            const success = await InvoiceModel.cancelInvoice(id)
            if (!success) throw new Error('Không thể hủy hóa đơn')

            return true
        } catch (error) {
            throw error
        }
    },
}

export default InvoiceService
