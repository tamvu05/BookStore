import UserService from '../services/user.service.js';

const UserController = {
    async getProfile(req, res) {
        if (!req.session.user) return res.redirect('/login');
        const userId = req.session.user.id;
        const userProfile = await UserService.getProfile(userId);

        res.render('user/profile', {
            title: 'Thông tin tài khoản',
            profile: userProfile,
            path: '/profile'
        });
    },

    async updateProfile(req, res) {
        if (!req.session.user) return res.redirect('/login');
        const userId = req.session.user.id;

        // 1. Gọi Service
        const result = await UserService.updateProfile(userId, req.body);
        
        // 2. Cập nhật session nếu cần
        if (result.success) req.session.user.fullname = req.body.HoTen;

        // 3. Lấy lại dữ liệu mới để hiển thị
        const userProfile = await UserService.getProfile(userId);
        
        // 4. Render lại trang kèm gói 'alert'
        res.render('user/profile', {
            title: 'Thông tin tài khoản',
            profile: userProfile,
            path: '/profile',
            
            // 👇 Tạo gói tin thông báo gửi sang EJS
            alert: {
                type: result.success ? 'success' : 'error',
                title: result.success ? 'Thành công' : 'Thất bại',
                message: result.message
            }
        });
    }
};

export default UserController;