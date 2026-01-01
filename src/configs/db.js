import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import config from './db.config.js'

const { host, port, user, pass, name } = config

// Lấy đường dẫn thư mục hiện tại (thư mục src/configs)
const rootDir = process.cwd();

const pool = mysql.createPool({
    host: host,
    port: port,
    user: user,
    password: pass,
    database: name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    // CẤU HÌNH SSL CHUẨN (Dùng chứng chỉ)
    ssl: {
        ca: fs.readFileSync(path.join(rootDir, 'ca.pem')),
    },
})

console.log('---------------------------------------------------')
console.log('🔐 ĐANG KẾT NỐI CLOUD DATABASE (CÓ SSL)')
console.log('---------------------------------------------------')

export default pool
