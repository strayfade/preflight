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

    App.get("*", WrapAsync(async (Request, Response) => {
	Response.sendStatus(403)
    }))
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
