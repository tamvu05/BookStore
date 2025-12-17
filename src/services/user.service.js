import pool from '../configs/db.js';

const UserService = {
    // Lấy thông tin
    async getProfile(userId) {
        try {
            const [rows] = await pool.query(
                'SELECT k.*, t.TenDangNhap FROM KhachHang k JOIN TaiKhoan t ON k.MaTK = t.MaTK WHERE t.MaTK = ?', 
                [userId]
            );
            return rows[0] || null;
        } catch (error) {
            console.error('Lỗi getProfile:', error);
            return null;
        }
    },

    // Cập nhật (Trả về Object kết quả)
    async updateProfile(userId, data) {
        try {
            const { HoTen, SDT, DiaChi } = data;
            await pool.query(
                'UPDATE KhachHang SET HoTen = ?, SDT = ?, DiaChi = ? WHERE MaTK = ?',
                [HoTen, SDT, DiaChi, userId]
            );

            // ✅ Báo cáo thành công
            return { success: true, message: 'Đã lưu thay đổi hồ sơ!' };
        } catch (error) {
            console.error('Lỗi updateProfile:', error);
            // ❌ Báo cáo thất bại
            return { success: false, message: 'Lỗi hệ thống, thử lại sau.' };
        }
    }
};

export default UserService;