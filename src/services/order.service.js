import pool from '../configs/db.js'
import config from '../configs/app.config.js'
import OrderModel from '../models/order.model.js'

const { PAGE_LIMIT } = config

const OrderService = {
    // Lấy danh sách đơn hàng của 1 khách
    async getMyOrders(customerId) {
        try {
            // Sắp xếp ngày giảm dần (Đơn mới nhất lên đầu)
            const query = `
                SELECT * FROM DonHang 
                WHERE MaKH = ? 
                ORDER BY NgayDat DESC
            `
            const [orders] = await pool.query(query, [customerId])
            return orders
        } catch (error) {
            console.error(error)
            return []
        }
    },

    // Lấy chi tiết 1 đơn hàng (Gồm các sách bên trong) - Để dùng cho trang chi tiết đơn sau này
    async getOrderDetail(orderId) {
        try {
            // 1. Lấy thông tin chung của đơn hàng
            const [orders] = await pool.query(
                'SELECT * FROM DonHang WHERE MaDH = ?',
                [orderId]
            )
            const order = orders[0]

            if (!order) return null

            // 2. Lấy danh sách sách trong đơn đó (JOIN với bảng Sach để lấy Tên và Ảnh)
            const queryItems = `
                SELECT ct.*, s.TenSach, s.HinhAnh
                FROM CTDonHang ct
                JOIN Sach s ON ct.MaSach = s.MaSach
                WHERE ct.MaDH = ?
            `
            const [items] = await pool.query(queryItems, [orderId])

            return { order, items }
        } catch (error) {
            console.error(error)
            return null
        }
    },

    async getWithParam(query) {
        let { page, sort, order, keyword, status } = query

        let currentPage = Number(page)
        let limit = Number(PAGE_LIMIT)

        if (isNaN(limit) || limit < 2 || limit > 20) limit = 10

        if (!keyword) keyword = ''

        const total = await OrderModel.getTotal(keyword)
        const totalPage = Math.ceil(total / limit)

        if (isNaN(currentPage) || currentPage > totalPage) currentPage = 1
        else if (currentPage < 1) currentPage = totalPage

        const offset = (currentPage - 1) * limit

        const validParam = ['MaDH', 'NgayDat', 'ASC', 'asc', 'DESC', 'desc']
        const validStatus = [
            'CHO_XAC_NHAN',
            'DANG_CHUAN_BI_HANG',
            'DA_GIAO_CHO_DON_VI_VAN_CHUYEN',
            'DA_GIAO',
            'DA_HUY',
            'DA_HOAN_TRA',
        ]

        const sortBy = validParam.includes(sort) ? sort : 'MaDH'
        const sortOrder = validParam.includes(order) ? order : 'DESC'
        status = validStatus.includes(status) ? status : ''

        const orders = await OrderModel.getWithParam(
            limit,
            offset,
            sortBy,
            sortOrder,
            keyword,
            status
        )

        return {
            orders,
            currentPage,
            limit,
            totalPage,
            total,
            totalItem: total,
            PAGE_LIMIT,
        }
    },

    async getById(id) {
        if (!id) throw new Error('Thiếu mã đơn hàng')

        const order = await OrderModel.getById(id)
        if (!order) throw new Error('Đơn hàng không tồn tại')

        return order
    },

    async getDetailById(id) {
        if (!id) throw new Error('Thiếu mã đơn hàng')

        const order = await OrderModel.getDetailById(id)
        if (!order) throw new Error('Đơn hàng không tồn tại')

        return order
    },

    async updateState(id, TrangThai) {
        if (!id) throw new Error('Thiếu mã đơn hàng')
        const isValid = [
            'CHO_XAC_NHAN',
            'DANG_CHUAN_BI_HANG',
            'DA_GIAO_CHO_DON_VI_VAN_CHUYEN',
            'DA_GIAO',
            'DA_HUY',
            'DA_HOAN_TRA',
        ]
        TrangThai = isValid.includes(TrangThai) ? TrangThai : 'CHO_XAC_NHAN'

        const order = await OrderModel.getById(id)
        if (!order) throw new Error('Đơn hàng không tồn tại')

        // Không cho cập nhật trạng thái nếu là đơn MoMo chưa thanh toán
        if (order.HinhThucThanhToan === 'MOMO' && order.ThanhToan !== 'DA_THANH_TOAN') {
            throw new Error('Không thể cập nhật trạng thái đơn hàng MoMo chưa được thanh toán')
        }

        // Nếu cập nhật sang trạng thái hủy thì thực hiện hoàn kho
        if (TrangThai === 'DA_HUY') {
            const cancellable = [
                'CHO_XAC_NHAN',
                'CHO_THANH_TOAN',
                'DANG_CHUAN_BI_HANG',
            ]

            if (!cancellable.includes(order.TrangThai)) {
                throw new Error(
                    'Chỉ có thể hủy đơn hàng ở trạng thái Chờ xác nhận, Chờ thanh toán hoặc Đang chuẩn bị hàng'
                )
            }

            const result = await OrderService.cancelAndRestock(id)
            if (!result) throw new Error('Hủy đơn hàng thất bại')
            return { success: true }
        }

        const result = await OrderModel.updateState(id, TrangThai)

        if (!result) throw new Error('Cập nhật trạng thái đơn hàng thất bại')
        return result
    },

    async delete(id) {
        try {
            // Kiểm tra trạng thái đơn hàng trước khi xóa
            const order = await OrderModel.getById(id)
            if (!order) throw new Error('Đơn hàng không tồn tại')
            
            const allowedStatuses = ['CHO_XAC_NHAN', 'CHO_THANH_TOAN', 'DANG_CHUAN_BI_HANG']
            if (!allowedStatuses.includes(order.TrangThai)) {
                throw new Error(`Chỉ có thể xóa/hủy đơn hàng ở trạng thái Chờ xác nhận, Chờ thanh toán hoặc Đang chuẩn bị hàng`)
            }
            
            const result = await OrderModel.delete(id)
            return result
        } catch (error) {
            throw error
        }
    },

    // 2. HỦY ĐƠN HÀNG & HOÀN KHO (Logic quan trọng)
    async cancelOrder(orderId, customerId) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // B1: Kiểm tra xem đơn này có đúng là của khách này và đang "Chờ xác nhận" không?
            const [order] = await connection.query(
                `SELECT TrangThai FROM DonHang WHERE MaDH = ? AND MaKH = ?`, 
                [orderId, customerId]
            );

            if (order.length === 0) {
                throw new Error('Đơn hàng không tồn tại hoặc không phải của bạn!');
            }

            const cancellable = ['CHO_XAC_NHAN', 'CHO_THANH_TOAN', 'DANG_CHUAN_BI_HANG'];
            if (!cancellable.includes(order[0].TrangThai)) {
                throw new Error('Chỉ có thể hủy đơn hàng khi đang chờ xác nhận, chờ thanh toán hoặc đang chuẩn bị hàng!');
            }

            // B2: Cập nhật trạng thái thành 'DA_HUY'
            await connection.query(
                `UPDATE DonHang SET TrangThai = 'DA_HUY' WHERE MaDH = ?`, 
                [orderId]
            );

            // B3: Lấy danh sách sách trong đơn để cộng lại vào kho
            const [items] = await connection.query(
                `SELECT MaSach, SoLuong FROM CTDonHang WHERE MaDH = ?`,
                [orderId]
            );

            // B4: Hoàn trả số lượng tồn kho
            for (const item of items) {
                await connection.query(
                    `UPDATE Sach SET SoLuongTon = SoLuongTon + ? WHERE MaSach = ?`,
                    [item.SoLuong, item.MaSach]
                );
            }

            await connection.commit();
            return { success: true, message: 'Đã hủy đơn hàng thành công!' };

        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // Hủy đơn do hệ thống (MoMo fail) và hoàn kho
    async cancelAndRestock(orderId) {
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();

            const [orderRows] = await connection.query(
                `SELECT TrangThai FROM DonHang WHERE MaDH = ?`,
                [orderId]
            );

            if (orderRows.length === 0) {
                await connection.rollback();
                return false;
            }

            // Cập nhật trạng thái hủy
            await connection.query(
                `UPDATE DonHang SET TrangThai = 'DA_HUY' WHERE MaDH = ?`,
                [orderId]
            );

            // Hoàn trả kho
            const [items] = await connection.query(
                `SELECT MaSach, SoLuong FROM CTDonHang WHERE MaDH = ?`,
                [orderId]
            );

            for (const item of items) {
                await connection.query(
                    `UPDATE Sach SET SoLuongTon = SoLuongTon + ? WHERE MaSach = ?`,
                    [item.SoLuong, item.MaSach]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
};

export default OrderService;