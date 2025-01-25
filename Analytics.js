const { Log, LogColors } = require('./Log')
const fs = require('fs').promises
const path = require('path')

const GetIP = (Request) => {
    let TempIP = Request.headers['x-forwarded-for'] || Request.socket.remoteAddress.replace("::ffff:", "");
    return (TempIP.includes("127.0.0.1") ? ("Localhost (" + TempIP + ")") : TempIP.toString().split(",")[0])
}

const Middleware = (Request, Response, Next) => {
    const IP = GetIP(Request)
    //console.log(path.join(__dirname, "../ips"), IP)
    fs.appendFile(path.join(__dirname, "../ips"), `${IP}\n`, {encoding: "utf-8"})
    Next()
}
module.exports = { Middleware }