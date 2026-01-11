exports.getDate = (delimitier) => {
    let date = new Date()
    date = `${date.getDate().toString().length - 1 ? date.getDate() : '0' + date.getDate()}` +
           `${delimitier}${date.getMonth().toString().length - 1 ? date.getMonth() + 1: '0' + (date.getMonth() + 1)}` +
           `${delimitier}${date.getFullYear().toString().length - 1 ? date.getFullYear() : '0' + date.getFullYear()}`
    return date
}

exports.getTime = (delimitier) => {
    let date = new Date()
    let time = `${date.getHours().toString().length - 1 ? date.getHours() : '0' + date.getHours()}` +
               `${delimitier}${date.getMinutes().toString().length - 1 ? date.getMinutes() : '0' + date.getMinutes()}` +
               `${delimitier}${date.getSeconds().toString().length - 1 ? date.getSeconds() : '0' + date.getSeconds()}`
    return time
}