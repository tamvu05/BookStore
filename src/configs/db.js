import dotenv from 'dotenv'
dotenv.config()

import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'

const __dirname = import.meta.dirname

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { ca: fs.readFileSync(path.join(__dirname, 'ca.pem')) },
})

export default pool
