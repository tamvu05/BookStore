import pool from '../configs/db.js'

const CategoryService = {
    // Lấy tất cả thể loại (Dùng cho cả User và Admin)
    async getAll() {
        try {
            // Query trực tiếp bảng TheLoai
            const [rows] = await pool.query('SELECT * FROM TheLoai');
            return rows;
        } catch (error) {
            console.error('❌ Lỗi lấy danh sách thể loại:', error);
            return [];
        }
    },

    // Lấy chi tiết 1 thể loại
    async getById(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM TheLoai WHERE MaTL = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('❌ Lỗi lấy chi tiết thể loại:', error);
            return null;
        }
    },

    // --- CÁC HÀM ADMIN (Tạm thời giữ khung, chưa implement logic sâu) ---
    async create(payload) {
        return null; 
    },

    async update(id, payload) {
        return null;
    },

    async delete(id) {
        return null;
    },

    async checkUnique(TenTL) {
        return true;
    },
}

export default CategoryService