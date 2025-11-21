import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import compression from 'compression'
import router from './routers/index.js'
import dotenv from 'dotenv'
import path from 'path'
import expressEjsLayouts from 'express-ejs-layouts'

dotenv.config()
const app = express()
const __dirname = import.meta.dirname

// init middlewares
app.use(express.json()) // For parsing application/json
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(morgan('dev'))

// --- SỬA ĐOẠN NÀY ---
// Tắt CSP để thoải mái load link CDN (Bootstrap, FontAwesome, Google Fonts...)
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
)
// --------------------

app.use(compression())

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(expressEjsLayouts)
app.set('layout', 'layouts/adminLayout') // Đặt layout mặc định là adminLayout

// init routers
app.use(router)

export default app