import pool from '../configs/db.js'

const PublisherBanModel = {
    async getAll() {
        const [rows] = await pool.query('SELECT * FROM NhaXuatBan')
        return rows
    },

    async getById(id) {
        const [rows] = await pool.query('SELECT * FROM NhaXuatBan WHERE MaNXB = ?', [id])
        return rows[0] || null
    },

    async create({ TenNXB, MoTa }) {
        const [result] = await pool.query('INSERT INTO NhaXuatBan (TenNXB, MoTa) VALUES (?, ?)', [TenNXB, MoTa])
        return result.insertId
    },

    async update(id, { TenNXB, MoTa }) {
        const [result] = await pool.query('UPDATE NhaXuatBan SET TenNXB = ?, MoTa = ? WHERE MaNXB = ?', [TenNXB, MoTa, id])
        return result.affectedRows > 0
    },

    async delete(id) {
        const [result] = await pool.query('DELETE FROM NhaXuatBan WHERE MaNXB = ?', [id])
        return result.affectedRows > 0
    },
}

export default PublisherBanModel
