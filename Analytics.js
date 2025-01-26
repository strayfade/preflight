const { Log, LogColors } = require('./Log')
const fs = require('fs').promises
const path = require('path')
const axios = require('axios')

const wrapAsync = (Function) => {
    return (Request, Response, Next) => {
        const FunctionOut = Function(Request, Response, Next)
        return Promise.resolve(FunctionOut).catch(Next)
    }
}

const saveIp = async (Request) => {
    let TempIP = Request.headers['x-forwarded-for'] || Request.socket.remoteAddress.replace("::ffff:", "");
    const IP = (TempIP.includes("127.0.0.1") ? ("Localhost (" + TempIP + ")") : TempIP.toString().split(",")[0])

    const csvPath = path.join(__dirname, "../ips")

    let ipExists = false;
    const fileIn = await fs.readFile(csvPath, { encoding: "utf-8" })
    const lines = fileIn.split("\n")
    for (const line of lines) {
        if (line.includes(IP)) {
            ipExists = true;
            break;
        }
    }
    if (!ipExists) {
        try {
            const api_key = atob(`YjUwY2EzMmE2ZTgzNDZiZjliYjQ3ZGFmMmUyNGJlYWE=`)
            let response = await axios.get(`https://api.ipgeolocation.io/ipgeo?apiKey=${api_key}&ip=${IP}&fields=geo`)
            try {
                response = JSON.parse(response.data)
                const encodedLine = response
                await fs.appendFile(csvPath, `${encodedLine}\n`, { encoding: "utf-8" })
                Log(`Saved new IP ${IP}`, LogColors.Success)
            }
            catch {
                console.error(response.data)
            }
        }
        catch (error) {
            Log(`Failed to save IP ${IP}`, LogColors.ErrorVisible)
            Log(`${error}`, LogColors.Error)
        }
    }

}

const Middleware = wrapAsync(async (Request, Response, Next) => {
    await saveIp(Request)
    Next()
})
module.exports = { Middleware }