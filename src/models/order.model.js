import pool from '../configs/db.js'

const OrderModel = {
    async getWithParam(limit, offset, sortBy = 'MaDH', sortOrder = 'DESC', keyword = '', status = '') {
        const SDT = `%${keyword}%`
        const TrangThai = `%${status}%`

        const [rows] = await pool.query(
            `SELECT *
            FROM DonHang
            WHERE SDT like ? AND TrangThai like ?
            ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
            [SDT, TrangThai, limit, offset]
        )
        return rows
    },

    async getTotal(keyword = '') {
        const SDT = `%${keyword}%`
        const [result] = await pool.query(
            `SELECT COUNT(*) AS total
            FROM DonHang
            WHERE SDT like ?`,
            [SDT]
        )
        return result[0].total
    },

    async getById(id) {
        const [rows] = await pool.query(
            `SELECT *
            FROM DonHang
            WHERE MaDH = ?`,
            [id]
        )
        return rows[0] || null
    },

    async getDetailById(id) {
        const [rows] = await pool.query(
            `SELECT s.TenSach , ct.SoLuong , ct.DonGia , dh.TongTien, s.MaSach
            FROM DonHang dh
            JOIN CTDonHang ct  ON dh.MaDH = ct.MaDH 
            JOIN Sach s ON ct.MaSach  = s.MaSach 
            WHERE dh.MaDH = ?`,
            [id]
        )
        return rows
    },

    async updateState(id, TrangThai = 'CHO_XAC_NHAN') {
        const connection = await pool.getConnection()
        try {
            await connection.beginTransaction()
            
            // Update order status
            const [result] = await connection.query(
                'UPDATE DonHang SET TrangThai = ? WHERE MaDH = ?',
                [TrangThai, id]
            )
            
            // If status changes to 'DA_GIAO', create invoice automatically
            if (TrangThai === 'DA_GIAO') {
                const [order] = await connection.query(
                    'SELECT MaDH, TenNguoiNhan, SDT, DiaChiNhan, TongTien, GhiChu FROM DonHang WHERE MaDH = ?',
                    [id]
                )
                
                if (order.length > 0) {
                    const donHang = order[0]
                    
                    // Create invoice based on order info
                    const [invoiceResult] = await connection.query(
                        `INSERT INTO HoaDon (MaDH, NgayTaoHoaDon, TongTien, TenKhachHang, SDTKhachHang, GhiChu, HinhThucThanhToan, TrangThai)
                        VALUES (?, NOW(), ?, ?, ?, ?, 'BANK_TRANSFER', 'DA_THANH_TOAN')`,
                        [donHang.MaDH, donHang.TongTien, donHang.TenNguoiNhan, donHang.SDT, donHang.GhiChu]
                    )
                    
                    const MaHD = invoiceResult.insertId
                    
                    // Copy invoice details from order
                    await connection.query(
                        `INSERT INTO CTHoaDon (MaHD, MaSach, SoLuong, DonGia)
                        SELECT ?, MaSach, SoLuong, DonGia FROM CTDonHang WHERE MaDH = ?`,
                        [MaHD, id]
                    )
                }
            }
            
            await connection.commit()
            return result.affectedRows > 0
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },

    async delete(id) {
        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            const details = await this.getDetailById(id)

            await connection.query('DELETE FROM CTDonHang WHERE MaDH = ?', [id])

            const stockUpdatePromises = details.map((detail) => {
                return connection.query('UPDATE Sach SET SoLuongTon = SoLuongTon + ? WHERE MaSach = ?', [detail.SoLuong, detail.MaSach])
            })

            const deleteOrder = connection.query('DELETE FROM DonHang WHERE MaDH = ?', [id])

            // chạy song song
            await Promise.all([...stockUpdatePromises, deleteOrder])
            await connection.commit()

            return true
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },
}

export default OrderModel
