// src/utils/mailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// 1. Tạo Transporter (người vận chuyển)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // Hoặc 587
    secure: true, // true cho cổng 465, false cho cổng 587
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, // Đảm bảo đây là App Password
    },
    // Thêm các tùy chọn này để tăng tính ổn định trên Render
    connectionTimeout: 10000, // 10 giây
    greetingTimeout: 10000,
    socketTimeout: 10000,
});

// 2. Hàm gửi mail
export const sendMail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"BookStore Support" <${process.env.MAIL_USER}>`, // Tên người gửi
            to: to, // Gửi đến ai?
            subject: subject, // Tiêu đề
            html: htmlContent // Nội dung (dạng HTML)
        };

        await transporter.sendMail(mailOptions);
        console.log('📧 Email đã được gửi thành công đến: ' + to);
        return true;
    } catch (error) {
        console.error('❌ Lỗi gửi email:', error);
        return false;
    }
};