import AuthService from '../services/auth.service.js'

const AuthController = {
    // --- LOGIN / REGISTER ---
    loginPage(req, res) {
        if (req.session.user) return res.redirect('/')
        res.render('user/login', {
            title: 'Đăng nhập - BookStore',
            path: '/login',
            error: null,
        })
    },

    registerPage(req, res) {
        if (req.session.user) return res.redirect('/')
        res.render('user/register', {
            title: 'Đăng ký - BookStore',
            path: '/register',
            error: null,
        })
    },

    // ✅ HÀM ĐĂNG KÝ ĐÃ CẬP NHẬT
    async handleRegister(req, res) {
        try {
            const { fullname, email, password, confirmPassword } = req.body
            
            // Validate cơ bản tại Controller
            if (password !== confirmPassword) {
                 return res.render('user/register', {
                    title: 'Đăng ký - BookStore',
                    path: '/register',
                    error: 'Mật khẩu nhập lại không khớp!',
                })
            }

            // Gọi Service và nhận kết quả
            const result = await AuthService.register({ fullname, email, password })
            
            if (result.success) {
                // THÀNH CÔNG: Chuyển sang trang Login + Popup thông báo
                res.render('user/login', {
                    title: 'Đăng nhập - BookStore',
                    path: '/login',
                    error: null,
                    alert: {
                        type: 'success',
                        title: 'Đăng ký thành công!',
                        message: result.message
                    }
                })
            } else {
                // THẤT BẠI: Ở lại trang Đăng ký + Báo lỗi
                res.render('user/register', {
                    title: 'Đăng ký - BookStore',
                    path: '/register',
                    error: result.message,
                })
            }

        } catch (err) {
            // Phòng hờ lỗi crash server
            res.render('user/register', {
                title: 'Đăng ký - BookStore',
                path: '/register',
                error: 'Đã có lỗi xảy ra: ' + err.message,
            })
        }
    },

    // --- CÁC HÀM DƯỚI GIỮ NGUYÊN ---
    async handleLogin(req, res) {
        try {
            const { email, password, remember } = req.body
            const user = await AuthService.login(email, password)

            req.session.user = user

            if (remember === 'on') {
                req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000
            } else {
                req.session.cookie.expires = null
            }

            res.redirect('/')
        } catch (err) {
            res.render('user/login', {
                title: 'Đăng nhập - BookStore',
                path: '/login',
                error: err.message,
            })
        }
    },

    logout(req, res) {
        req.session.destroy(() => {
            res.clearCookie('connect.sid')
            res.redirect('/')
        })
    },

    async logoutAdmin(req, res) {
        req.session.destroy((err) => {
            if (err) {
                console.error(err)
                return res.status(500).send('Logout failed')
            }
            res.redirect('/login/admin')
        })
    },

    forgotPasswordPage(req, res) {
        res.render('user/forgot-password', { title: 'Quên mật khẩu', path: '/login', error: null })
    },

    async handleForgotPassword(req, res) {
        try {
            const { email } = req.body
            await AuthService.sendOtp(email)

            res.render('user/verify-code', {
                title: 'Nhập mã xác minh',
                path: '/login',
                email,
                error: null,
            })
        } catch (error) {
            res.render('user/forgot-password', { title: 'Quên mật khẩu', path: '/login', error: error.message })
        }
    },

    async handleVerifyCode(req, res) {
        const { email, otp } = req.body
        try {
            const isValid = await AuthService.verifyOtp(email, otp)
            if (!isValid) throw new Error('Mã xác minh không đúng hoặc đã hết hạn')

            res.render('user/reset-password', {
                title: 'Đặt lại mật khẩu',
                path: '/login',
                email,
                error: null,
            })
        } catch (error) {
            res.render('user/verify-code', {
                title: 'Nhập mã xác minh',
                path: '/login',
                email,
                error: error.message,
            })
        }
    },

    async handleResetPassword(req, res) {
        const { email, password, confirmPassword } = req.body
        try {
            if (password !== confirmPassword) throw new Error('Mật khẩu không khớp')

            await AuthService.resetPassword(email, password)
            
            res.render('user/login', {
                title: 'Đăng nhập - BookStore',
                path: '/login',
                error: null,
                alert: {
                    type: 'success',
                    title: 'Đổi mật khẩu thành công!',
                    message: 'Vui lòng đăng nhập bằng mật khẩu mới.'
                }
            })
        } catch (error) {
            res.render('user/reset-password', {
                title: 'Đặt lại mật khẩu',
                path: '/login',
                email,
                error: error.message,
            })
        }
    },

    async loginAdminPage(req, res, next) {
        try {
            res.render('admin/login', {
                layout: false,
            })
        } catch (error) {
            next(error)
        }
    },

    async loginAdmin(req, res, next) {
        try {
            const { email, password } = req.body
            const account = await AuthService.loginAdmin(email, password)
            if (account) req.session.account = account
            res.json(account)
        } catch (error) {
            next(error)
        }
    },
}

export default AuthController