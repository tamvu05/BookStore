import app from './src/app.js'
import config from './src/configs/app.config.js'

const PORT = config.port || 3055

const server = app.listen(PORT, () => {
    console.log(`WSV start with PORT ${PORT}`)
})

process.on('SIGINT', () => {
    server.close(() => {
        console.log('Exit Server Express')
    })
})