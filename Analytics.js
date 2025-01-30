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
    try {let TempIP = Request.headers['x-forwarded-for'] || Request.socket.remoteAddress.replace("::ffff:", "");
        if (TempIP.includes("127.0.0.1")) return;
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
                let response = await axios.get(`https://freeipapi.com/api/json/${IP}`)
                try {
                    response = response.data
                    const encodedLine = `${IP}\t${response.countryName}\t${response.regionName}\t${response.cityName}\t${response.latitude},${response.longitude}`
                    await fs.appendFile(csvPath, `${encodedLine}\n`, { encoding: "utf-8" })
                    Log(`Saved new IP ${IP}`, LogColors.Success)
                }
                catch {
                    console.error(response.data)
                }
            }
            catch (error) {
                Log(`Failed to save IP (1) ${IP}`, LogColors.ErrorVisible)
                Log(`${error}`, LogColors.Error)
            }
        }
    }
    catch (error) {
        Log(`Failed to save IP (2)`, LogColors.ErrorVisible)
        Log(`${error}`, LogColors.Error)
    }
}

const Middleware = wrapAsync(async (Request, Response, Next) => {
    await saveIp(Request)
    Next()
})
module.exports = { Middleware }