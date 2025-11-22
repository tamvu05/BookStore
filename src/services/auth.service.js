import pool from '../configs/db.js';
import bcrypt from 'bcrypt';

const AuthService = {
    // ĐĂNG KÝ TÀI KHOẢN MỚI
    async register({ fullname, email, password }) {
        let connection;
        try {
            // 1. Kiểm tra xem Email đã tồn tại chưa
            const [existingUser] = await pool.query('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?', [email]);
            if (existingUser.length > 0) {
                throw new Error('Email này đã được sử dụng!');
            }

            // 2. Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 3. Bắt đầu Transaction (Để đảm bảo lưu cả 2 bảng thành công cùng lúc)
            connection = await pool.getConnection();
            await connection.beginTransaction();

            // 4. Tạo TaiKhoan (Mặc định MaVT = 2 là Khách hàng)
            const [userResult] = await connection.query(
                `INSERT INTO TaiKhoan (TenDangNhap, MatKhauHash, TrangThai, MaVT) 
                 VALUES (?, ?, 'ACTIVE', 2)`,
                [email, hashedPassword]
            );
            const newUserId = userResult.insertId; // Lấy ID vừa tạo (MaTK)

            // 5. Tạo KhachHang (Liên kết với MaTK vừa tạo)
            await connection.query(
                `INSERT INTO KhachHang (HoTen, Email, MaTK) VALUES (?, ?, ?)`,
                [fullname, email, newUserId]
            );

            // 6. Chốt đơn (Commit)
            await connection.commit();
            return true;

        } catch (error) {
            // Nếu lỗi thì hoàn tác (Rollback) sạch sẽ
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    },

    // ĐĂNG NHẬP (Viết sẵn luôn để tý dùng)
    async login(email, password) {
        // Tìm tài khoản theo Email
        const [users] = await pool.query('SELECT * FROM TaiKhoan WHERE TenDangNhap = ?', [email]);
        const user = users[0];

        if (!user) throw new Error('Tài khoản không tồn tại');
        if (user.TrangThai !== 'ACTIVE') throw new Error('Tài khoản đã bị khóa');

        // So sánh mật khẩu
        const isMatch = await bcrypt.compare(password, user.MatKhauHash);
        if (!isMatch) throw new Error('Mật khẩu không đúng');

        // Lấy thêm thông tin Họ tên khách hàng để hiển thị
        const [customers] = await pool.query('SELECT * FROM KhachHang WHERE MaTK = ?', [user.MaTK]);
        const customer = customers[0];

        // Trả về thông tin user (để lưu vào Session)
        return {
            id: user.MaTK,
            email: user.TenDangNhap,
            roleId: user.MaVT,
            fullname: customer ? customer.HoTen : 'Khách hàng'
        };
    }
};

export default AuthService;