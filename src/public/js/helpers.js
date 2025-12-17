const formatPrice = (price) => {
    const numericPrice = Number(price)

    if (isNaN(numericPrice)) {
        return '0 ₫'
    }

    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    })

    return formatter.format(numericPrice)
}

const formatTime7 = (time) => {
    const dateObject = new Date(time)

    const options = {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }
    return dateObject.toLocaleString('vi-VN', options)
}

const getCurTime7 = () => {
    const vnTime = new Date().toLocaleString('sv-SE', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    })

    return vnTime.replace(' ', 'T');
}

export default { formatPrice, formatTime7, getCurTime7 }
