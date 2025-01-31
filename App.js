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

// Basic Security
require('./security/Security').Setup(App)

const { spawn } = require('child_process')
const SpawnInstance = async (CommandLine, ParentServer, index) => {
    const Args = CommandLine.command.split(" ")
    const FirstArg = Args[0]
    Args.splice(0, 1)
    const WorkingDir = path.join(__dirname, CommandLine.relativeWorkingDir)
    const Process = spawn(FirstArg, Args, {
        cwd: WorkingDir
    })
    let ServerName = ParentServer.commandLines[index].relativeWorkingDir.split("/")[1]
    Process.on('spawn', async () => {
        Log(`Instance "${ServerName}" spawned using command ${WorkingDir} % ${CommandLine.command}`)
    })
    Process.on('error', (data) => {
        console.log(`[${ServerName}] ${data}`)
    })
    Process.on('message', (data) => {
        console.log(`[${ServerName}] ${data}`)
    })
    Process.stdout.on('data', (data) => {
        console.log(`[${ServerName}] ${data.toString().replace("\n", "")}`)
    })
    Process.stderr.on('data', (data) => {
        console.log(`[${ServerName}] ${data.toString()}`)
    })
}

const { createProxyMiddleware } = require('http-proxy-middleware')

const SpawnAllInstances = async () => {

    Log(`Spawning instances!`, LogColors.SuccessVisible)

    const Instances = JSON.parse(await fs.readFile("Config.json", { encoding: "utf-8" }))
    for (const Instance of Instances) {
        for (const CommandLine of Instance.commandLines) {
            await SpawnInstance(CommandLine, Instance, Instance.commandLines.indexOf(CommandLine))
        }
        for (const Rewrite of Instance.rewrites) {
            App.use(createProxyMiddleware({
                target: `http://127.0.0.1:${Rewrite.port}`,
                pathFilter: (Path, Request) => {
                    return Rewrite.domains.includes(Request.get("Host"))
                }
            }))
            Log(`Created proxy to ${`http://127.0.0.1:${Rewrite.port}`}`)
        }
    }

    App.get("/api/analytics", WrapAsync(async (Request, Response) => {
        Response.status(200).sendFile(path.join(__dirname, "../ips"))
    }))

    App.get("*", WrapAsync(async (Request, Response) => {
	    Response.sendStatus(403)
    }))
}
SpawnAllInstances()

// Request Logging
const Analytics = require('./Analytics')
App.use(Analytics.Middleware)
const RequestBlocking = require('./RequestBlocking')
App.use(RequestBlocking.Middleware)
App.use(WrapAsync(async (Request, Response, Next) => {
    Log(`[LogURL] ${Request.path}`, LogColors.Success)
    Next()
}))

module.exports = { App }
