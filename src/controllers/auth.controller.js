import AuthService from '../services/auth.service.js';

const AuthController = {
    // GET /login - Hiện form đăng nhập
    loginPage(req, res) {
        // Nếu đã đăng nhập rồi thì đá về trang chủ, không cho vào trang login nữa
        if (req.session.user) return res.redirect('/');
        
        res.render('user/login', {
            title: 'Đăng nhập - BookStore',
            path: '/login',
            error: null // Biến này để hiện thông báo lỗi nếu đăng nhập sai
        });
    },

    // GET /register - Hiện form đăng ký
    registerPage(req, res) {
        if (req.session.user) return res.redirect('/');

        res.render('user/register', {
            title: 'Đăng ký - BookStore',
            path: '/register',
            error: null
        });
    },

    // POST /register - Xử lý đăng ký
    async handleRegister(req, res) {
        try {
            const { fullname, email, password, confirmPassword } = req.body;

            // 1. Validate cơ bản
            if (password !== confirmPassword) {
                throw new Error('Mật khẩu nhập lại không khớp!');
            }

            // 2. Gọi Service tạo tài khoản
            await AuthService.register({ fullname, email, password });

            // 3. Thành công -> Chuyển sang trang Login
            res.redirect('/login');

        } catch (err) {
            // 4. Lỗi -> Hiện lại form đăng ký kèm dòng thông báo lỗi
            res.render('user/register', {
                title: 'Đăng ký - BookStore',
                path: '/register',
                error: err.message
            });
        }
    },

    // POST /login - Xử lý đăng nhập
    async handleLogin(req, res) {
        try {
            const { email, password } = req.body;

            // 1. Gọi Service kiểm tra
            const user = await AuthService.login(email, password);

            // 2. Lưu thông tin user vào Session (Đây là bước quan trọng nhất!)
            // Server sẽ nhớ ông này là ai thông qua cái session này
            req.session.user = user;

            // 3. Đăng nhập xong -> Về trang chủ
            res.redirect('/');

        } catch (err) {
            // 4. Lỗi -> Hiện lại form login kèm thông báo
            res.render('user/login', {
                title: 'Đăng nhập - BookStore',
                path: '/login',
                error: err.message
            });
        }
    },

    // GET /logout - Đăng xuất
    logout(req, res) {
        // Xóa session
        req.session.destroy(() => {
            res.redirect('/'); // Về trang chủ
        });
    }
};

export default AuthController;