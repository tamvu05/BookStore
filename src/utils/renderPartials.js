const renderPartial = (view, data) => {
    return new Promise((resolve, reject) => {
        req.app.render(view, data, (err, html) => {
            if (err) {
                console.error(`Lỗi render EJS cho view ${view}:`, err)
                return reject(err)
            }
            resolve(html)
        })
    })
}

export default renderPartial