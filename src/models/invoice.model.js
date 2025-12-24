import pool from '../configs/db.js'

const InvoiceModel = {
    async getWithParam(limit, offset, sortBy = 'MaHD', sortOrder = 'DESC', keyword = '', status = '') {
        const SDT = `%${keyword}%`
        const TrangThai = `%${status}%`

        const [rows] = await pool.query(
            `SELECT *
            FROM HoaDon
            WHERE SDTKhachHang like ? AND TrangThai like ?
            ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
            [SDT, TrangThai, limit, offset]
        )

        return rows
    },

    async getTotal(keyword = '') {
        const SDT = `%${keyword}%`
        const [result] = await pool.query(
            `SELECT COUNT(*) AS total
            FROM HoaDon
            WHERE SDTKhachHang like ?`,
            [SDT]
        )
        return result[0].total
    },

    async getById(id) {
        const [rows] = await pool.query(
            `SELECT *
            FROM HoaDon
            WHERE MaHD = ?`,
            [id]
        )
        return rows[0] || null
    },

    async getDetailById(id) {
        const [rows] = await pool.query(
            `SELECT s.TenSach , ct.SoLuong , ct.DonGia , hd.TongTien, s.MaSach
            FROM HoaDon hd
            JOIN CTHoaDon ct  ON hd.MaHD = ct.MaHD 
            JOIN Sach s ON ct.MaSach  = s.MaSach 
            WHERE hd.MaHD = ?`,
            [id]
        )
        return rows
    },

    async create({ TenKhachHang, SDTKhachHang, NgayTao, GhiChu, ChiTietHD, MaNV, HinhThucThanhToan = 'CASH', MaDH = null }) {
        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            // Create invoice (for direct sales, MaDH is null; for online orders, MaDH is provided)
            const [result] = await connection.query(
                `INSERT INTO HoaDon(MaDH, MaNV, NgayTaoHoaDon, TenKhachHang, SDTKhachHang, GhiChu, HinhThucThanhToan, TrangThai) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'CHO_THANH_TOAN')`,
                [MaDH || null, MaNV || null, NgayTao, TenKhachHang, SDTKhachHang, GhiChu, HinhThucThanhToan]
            )

            const MaHD = result.insertId
            let total = 0

            const detailPromise = ChiTietHD.map(async (chiTiet) => {
                const insertCTPromise = connection.query(
                    `INSERT INTO CTHoaDon(MaHD, MaSach, SoLuong, DonGia) VALUES (?, ?, ?, ?)`,
                    [MaHD, chiTiet.MaSach, chiTiet.SoLuong, chiTiet.DonGia]
                )

                const updateSachPromise = connection.query(
                    'UPDATE Sach SET SoLuongTon = SoLuongTon - ? WHERE MaSach = ?',
                    [chiTiet.SoLuong, chiTiet.MaSach]
                )

                total += Number(chiTiet.DonGia) * Number(chiTiet.SoLuong)

                await Promise.all([insertCTPromise, updateSachPromise])
                return true
            })

            await Promise.all(detailPromise)

            await connection.query(`UPDATE HoaDon SET TongTien = ? WHERE MaHD = ?`, [total, MaHD])

            await connection.commit()

            return MaHD
        } catch (error) {
            await connection.rollback()
            throw error
        } finally {
            connection.release()
        }
    },

    async updateStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE HoaDon SET TrangThai = ? WHERE MaHD = ?',
            [status, id]
        )
        return result.affectedRows > 0
    },

    async cancelInvoice(id) {
        const connection = await pool.getConnection()

        try {
            await connection.beginTransaction()

            // Get invoice info
            const [invoiceRows] = await connection.query(
                'SELECT MaDH FROM HoaDon WHERE MaHD = ?',
                [id]
            )

            if (invoiceRows.length === 0) {
                throw new Error('Hóa đơn không tồn tại')
            }

            const invoice = invoiceRows[0]

            // Get invoice details to restore inventory
            const [details] = await connection.query(
                'SELECT MaSach, SoLuong FROM CTHoaDon WHERE MaHD = ?',
                [id]
            )

            // Restore inventory for each book
            const restorePromises = details.map(detail => 
                connection.query(
                    'UPDATE Sach SET SoLuongTon = SoLuongTon + ? WHERE MaSach = ?',
                    [detail.SoLuong, detail.MaSach]
                )
            )
            await Promise.all(restorePromises)

            // Update invoice status to DA_HUY
            await connection.query(
                'UPDATE HoaDon SET TrangThai = ? WHERE MaHD = ?',
                ['DA_HUY', id]
            )

            // If invoice is linked to an order, cancel the order too
            if (invoice.MaDH) {
                await connection.query(
                    'UPDATE DonHang SET TrangThai = ? WHERE MaDH = ?',
                    ['DA_HUY', invoice.MaDH]
                )
            }

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
export default InvoiceModel