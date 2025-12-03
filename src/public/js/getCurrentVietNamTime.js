function getCurrentVietNamTime() {
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

export default getCurrentVietNamTime
