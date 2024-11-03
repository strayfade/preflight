// Import Packages
const path = require('path')
const express = require('express')
const fs = require('fs').promises
const { Log, LogColors } = require('./Log')

console.log()

// Create App
const App = express()

const WrapAsync = (Function) => {
    return (Request, Response, Next) => {
        const FunctionOut = Function(Request, Response, Next)
        return Promise.resolve(FunctionOut).catch(Next)
    }
}

// Run build
const { CurrentStylesheet, CurrentScript } = require('./Build')

// Basic Security
require('./security/Security').Setup(App)

const { spawn } = require('child_process')
const SpawnInstance = async (CommandLine, ParentServer, OutSpawnedRef) => {
    const Args = CommandLine.command.split(" ")
    const FirstArg = Args[0]
    Args.splice(0, 1)
    const WorkingDir = path.join(__dirname, CommandLine.relativeWorkingDir)
    const Process = spawn(FirstArg, Args, {
        cwd: WorkingDir
    })
    Process.on('spawn', async () => {
        Log(`Instance "${ParentServer.name}" spawned using command ${WorkingDir} % ${CommandLine.command}`)
    })
    Process.on('error', (data) => {
        console.log(`[${ParentServer.name}] ${data}`)
    })
    Process.on('message', (data) => {
        console.log(`[${ParentServer.name}] ${data}`)
    })
    Process.stdout.on('data', (data) => {
        console.log(`[${ParentServer.name}] ${data.toString().replace("\n", "")}`)
    })
    Process.stderr.on('data', (data) => {
        console.log(`[${ParentServer.name}] ${data.toString()}`)
    })
}

const { createProxyMiddleware } = require('http-proxy-middleware')

const SpawnAllInstances = async () => {

    Log(`Spawning instances!`, LogColors.SuccessVisible)

    const Instances = JSON.parse(await fs.readFile("Config.json", { encoding: "utf-8" }))
    for (const Instance of Instances) {
        for (const CommandLine of Instance.commandLines) {
            await SpawnInstance(CommandLine, Instance)
        }
        for (const Rewrite of Instance.rewrites) {
            App.use(createProxyMiddleware({
                target: `http://127.0.0.1:${Rewrite.port}`,
                pathFilter: (Path, Request) => {
                    let Returns = true
                    for (const HeaderName in Rewrite.requestHeadersRegex) {
                        if (!(new RegExp(Rewrite.requestHeadersRegex[HeaderName]).test(Request.get(HeaderName)))) {
                            Returns = false
                        }
                    }
                    for (const HeaderName in Rewrite.requestHeadersExact) {
                        if (Rewrite.requestHeadersExact[HeaderName] != Request.get(HeaderName)) {
                            Returns = false
                        }
                    }
                    return Returns
                }
            }))
            Log(`Created proxy to ${`http://127.0.0.1:${Rewrite.port}`} with the following conditions:`)
            for (const HeaderName in Rewrite.requestHeadersRegex) {
                Log(`    Header "${HeaderName}" matches regular expression "${Rewrite.requestHeadersRegex[HeaderName]}"`)
            }
            for (const HeaderName in Rewrite.requestHeadersExact) {
                Log(`    Header "${HeaderName}" exactly matches "${Rewrite.requestHeadersExact[HeaderName]}"`)
            }
        }
    }

    Log(`Spawning management server!`, LogColors.SuccessVisible)

    const generateToken = (len = 64) => {
        const charset = `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890`
        let out = ""
        for (let i = 0; i < len; i++) {
            out += charset[Math.floor(Math.random() * charset.length)]
        }
        return out
    }

    // Static Directories
    App.use('/assets', express.static('assets'))
    App.use('/', express.static('build'))

    // Sources
    App.get('/favicon.ico', WrapAsync(async (Request, Response) => {
        Response.sendFile(path.resolve(__dirname, 'assets/Icon.ico'))
    }))
    App.get('/robots.txt', WrapAsync(async (Request, Response) => {
        Response.sendFile(path.resolve(__dirname, 'assets/robots.txt'))
    }))

    // Routing
    const Homepage = require('./pages/Homepage').Homepage
    App.get('/', WrapAsync(async (Request, Response) => {
        Response.send(await Homepage(Request, {
            stylesheet: CurrentStylesheet,
            script: CurrentScript
        }))
    }))

    const bcrypt = require('bcrypt');
    let salt = "$2b$10$3Xn5ABp0oguBANXHcv696u"
    const allUsers = Object.freeze([
        {
            id: Date.now(),
            username: "strayfade",
            email: "admin@strayfade.com",
            passwordHash: "$2b$10$3Xn5ABp0oguBANXHcv696u4mmCUgNFEwpeD2dP7ODID7XmXMuPMju",
            activeTokens: [
                generateToken()
            ]
        }
    ])
    let allUsersDynamic = allUsers
    const loginUser = async (user, pass) => {

        const hash = await bcrypt.hash(pass, salt);

        let foundIdx = -1;
        for (const [idx, value] of allUsersDynamic.entries()) {
            if ((value.username == user || value.email == user) && value.passwordHash == hash) {
                foundIdx = idx
            }
        }

        if (foundIdx != -1) {
            const sessionToken = generateToken()
            allUsersDynamic[foundIdx].activeTokens.push(sessionToken)
            return {
                status: 200,
                token: sessionToken
            }
        }
        else {
            return {
                status: 403,
                message: "Invalid username or password!"
            }
        }
    }

    App.use(express.json());
    const session = require('express-session');
    const sessionConfig = {
        secret: generateToken(),
        name: 'preflight.strayfade.com',
        resave: false,
        saveUninitialized: false,
        cookie: {
            sameSite: 'strict',
            secure: true
        }
    };
    App.use(session(sessionConfig));
    App.post('/clientLogin', WrapAsync(async (Request, Response) => {
        const loginResult = await loginUser(Request.body.user, Request.body.pass)
        if (loginResult.token) {
            Response.cookie("session", loginResult.token, {

            })
            Response.status(200).send(JSON.stringify({
                status: 200
            }))
        }
        else
            Response.status(403).send(JSON.stringify(loginResult))
    }))

    const validSession = (sessionToken) => {
        for (const user of allUsersDynamic) {
            if (user.activeTokens.includes(sessionToken))
                return user
        }
    }

    App.get("/services", WrapAsync(async (Request, Response) => {
        let sessionToken = null
        if (Request.headers.cookie) {
            let allCookies = Request.headers.cookie.split("; ")
            for (const i of allCookies) {
                if (i.includes("session=")) {
                    sessionToken = i.replace("session=", "")
                }
            }
        }
        const sessionResult = validSession(sessionToken)
        if (!sessionResult)
            Response.redirect(`/login?redir=${encodeURIComponent(`/dashboard`)}`)
        else {
            Response.status(200).send(JSON.parse(await fs.readFile("Config.json", { encoding: "utf-8" })))
        }
    }))

    const Login = require('./pages/Login').Login
    App.get('/login', WrapAsync(async (Request, Response) => {
        Response.send(await Login(Request, {
            stylesheet: CurrentStylesheet,
            script: CurrentScript
        }))
    }))
    App.get('/logout', WrapAsync(async (Request, Response) => {
        Response.clearCookie("session")
        Response.redirect("/")
    }))

    const Dashboard = require('./pages/Dashboard').Dashboard
    App.get('/dashboard', WrapAsync(async (Request, Response) => {
        let sessionToken = null
        if (Request.headers.cookie) {
            let allCookies = Request.headers.cookie.split("; ")
            for (const i of allCookies) {
                if (i.includes("session=")) {
                    sessionToken = i.replace("session=", "")
                }
            }
        }
        const sessionResult = validSession(sessionToken)
        if (!sessionResult)
            Response.redirect(`/login?redir=${encodeURIComponent(Request.path)}`)
        else
            Response.status(200).send(await Dashboard(Request, {
                stylesheet: CurrentStylesheet,
                script: CurrentScript
            }))
    }))

    // Error Handling
    App.use((Error, Request, Response, Next) => {
        Log('Error: ')
        console.log(Error)
        Next(Error)
    })

    App.get('*', WrapAsync(async (Request, Response) => {
        Response.send(await Homepage(Request, {
            stylesheet: CurrentStylesheet,
            script: CurrentScript
        }))
    }))

    App.use((err, req, res, next) => {
        console.error(err.stack)
        res.sendStatus(404)
    })


}
SpawnAllInstances()

// Request Logging
const RequestBlocking = require('./RequestBlocking')
App.use(RequestBlocking.Middleware)
App.use(WrapAsync(async (Request, Response, Next) => {
    Log(`[LogURL] ${Request.path}`, LogColors.Success)
    Next()
}))

module.exports = { App }
