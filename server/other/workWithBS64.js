const fs = require('fs')


exports.writeFile = (filepath, photoBS64) =>
    fs.writeFile(filepath, photoBS64, 'base64', (err) => {
        if (err) throw err
    })


exports.readFile = (filepath) => {
    let photo = fs.readFileSync(filepath, (err) => {
        if (err) throw err
    })
    let resString = `data:image/png;base64,${Buffer.from(photo).toString('base64')}`
    return resString
}

