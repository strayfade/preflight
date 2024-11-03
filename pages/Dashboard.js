const HTML = require('../components/HTML').HTML
const Head = require('../components/Head').Head
const Body = require('../components/Body').Body
const Footer = require('../components/Footer').Footer
const Header = require('../components/Header').Header

const Dashboard = async (Request, BuildData) => {
    return `
        ${await HTML(Request)}
        ${await Head(Request, 'preflight', '', BuildData)}
        ${await Body(
        Request,
        `
            ${await Header(Request)}
            <div class="block">
                <style>
                    .icon {
                        font-family: "Material Symbols Outlined";
                        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    }
                </style>
                <div class="servers-container">
                    <div class="servers-container-inner" id="servers">

                    </div>
                </div>
                <script>
                let sessionToken = null
                if (document.cookie) {
                    let allCookies = document.cookie.split("; ")
                    for (const i of allCookies) {
                        if (i.includes("session=")) {
                            sessionToken = i.replace("session=", "")
                        }
                    }
                }
                fetch('/services')
                .then(response => {
                    return response.json();
                })
                .then((data) => {
                    for (const i of data) {
                        let NewServer = document.createElement("div")
                        NewServer.className = "server"

                        let NewServerChevron = document.createElement("span")
                        NewServerChevron.className = "icon chevron"
                        NewServerChevron.textContent = "chevron_right"
                        NewServer.appendChild(NewServerChevron)

                        let NewServerName = document.createElement("span")
                        NewServerName.className = "server-name"
                        NewServerName.textContent = i.name
                        NewServer.appendChild(NewServerName)

                        let NewServerId = document.createElement("span")
                        NewServerId.className = "server-name server-id"
                        NewServerId.textContent = i.id
                        NewServer.appendChild(NewServerId)

                        // Add to DOM
                        document.getElementById("servers").appendChild(NewServer)

                        let NewServerInfoContainer = document.createElement("div")
                        NewServerInfoContainer.className = "server-info server-info-collapsed"

                        let NewServerLabel1 = document.createElement("p")
                        NewServerLabel1.className = "server-info-label"
                        NewServerLabel1.textContent = "Command Lines"
                        NewServerInfoContainer.appendChild(NewServerLabel1)

                        for (const x of i.commandLines) {
                            let ServerCommandContainer = document.createElement("p")
                            ServerCommandContainer.className = "server-command-container"

                            let ServerCommandWorkingDir = document.createElement("span")
                            ServerCommandWorkingDir.className = "server-command-dir"
                            ServerCommandWorkingDir.textContent = x.relativeWorkingDir + " %"
                            ServerCommandContainer.appendChild(ServerCommandWorkingDir)

                            let ServerCommand = document.createElement("span")
                            ServerCommand.className = "server-command"
                            ServerCommand.textContent = x.command
                            ServerCommandContainer.appendChild(ServerCommand)

                            // Add to DOM
                            NewServerInfoContainer.appendChild(ServerCommandContainer)
                        }

                        let NewServerLabel2 = document.createElement("p")
                        NewServerLabel2.className = "server-info-label"
                        NewServerLabel2.textContent = "Rewrites"
                        NewServerInfoContainer.appendChild(NewServerLabel2)

                        for (const x of i.rewrites) {
                            let ServerRewriteContainer = document.createElement("p")
                            ServerRewriteContainer.className = "server-rewrite-container"

                            let ServerRewritePortContainer = document.createElement("p")
                            ServerRewritePortContainer.className = "server-rewrite-port-container"
                            let ServerRewritePortLabel = document.createElement("span")
                            ServerRewritePortLabel.className = "server-rewrite-port-label"
                            ServerRewritePortLabel.textContent = "Port"
                            ServerRewritePortContainer.appendChild(ServerRewritePortLabel)
                            let ServerRewritePort = document.createElement("span")
                            ServerRewritePort.className = "server-rewrite-port"
                            ServerRewritePort.textContent = x.port
                            ServerRewritePortContainer.appendChild(ServerRewritePort)
                            ServerRewriteContainer.appendChild(ServerRewritePortContainer)

                            let NewServerLabel3 = document.createElement("p")
                            NewServerLabel3.className = "server-info-label server-info-conditions-label"
                            NewServerLabel3.textContent = "Conditions"
                            ServerRewriteContainer.appendChild(NewServerLabel3)

                            for (const y in x.requestHeadersRegex) {
                                let ServerRewriteCondContainer = document.createElement("p")
                                ServerRewriteCondContainer.className = "server-rewrite-conditions-container"
                                let ServerRewriteHeaderLabel = document.createElement("span")
                                ServerRewriteHeaderLabel.className = "server-rewrite-header-label"
                                ServerRewriteHeaderLabel.textContent = "(Expression) " + y
                                ServerRewriteCondContainer.appendChild(ServerRewriteHeaderLabel)
                                let ServerRewriteCond = document.createElement("span")
                                ServerRewriteCond.className = "server-rewrite-condition"
                                ServerRewriteCond.textContent = x.requestHeadersRegex[y]
                                ServerRewriteCondContainer.appendChild(ServerRewriteCond)
                                ServerRewriteContainer.appendChild(ServerRewriteCondContainer)
                            }

                            for (const y in x.requestHeadersExact) {
                                let ServerRewriteCondContainer = document.createElement("p")
                                ServerRewriteCondContainer.className = "server-rewrite-conditions-container"
                                let ServerRewriteHeaderLabel = document.createElement("span")
                                ServerRewriteHeaderLabel.className = "server-rewrite-header-label"
                                ServerRewriteHeaderLabel.textContent = "(Exact) " + y
                                ServerRewriteCondContainer.appendChild(ServerRewriteHeaderLabel)
                                let ServerRewriteCond = document.createElement("span")
                                ServerRewriteCond.className = "server-rewrite-condition"
                                ServerRewriteCond.textContent = x.requestHeadersExact[y]
                                ServerRewriteCondContainer.appendChild(ServerRewriteCond)
                                ServerRewriteContainer.appendChild(ServerRewriteCondContainer)
                            }

                            // Add to DOM
                            NewServerInfoContainer.appendChild(ServerRewriteContainer)
                        }

                        let NewServerLabel4 = document.createElement("p")
                        NewServerLabel4.className = "server-info-label"
                        NewServerLabel4.textContent = "Log"
                        NewServerInfoContainer.appendChild(NewServerLabel4)

                        let ServerLogContainer = document.createElement("p")
                        ServerLogContainer.className = "server-command-container"
                        for (const x of i.logLines) {
                            let ServerLogLine = document.createElement("p")
                            ServerLogLine.className = "server-log-line"
                            ServerLogLine.textContent = x
                            ServerLogContainer.appendChild(ServerLogLine)
                        }
                        NewServerInfoContainer.appendChild(ServerLogContainer)

                        // Add to DOM
                        document.getElementById("servers").appendChild(NewServerInfoContainer)

                        NewServer.addEventListener("click", () => {
                            if (NewServer.classList.contains("server-expanded")) {
                                NewServer.classList.remove("server-expanded")
                                NewServerInfoContainer.classList.add("server-info-collapsed")
                            }
                            else {
                                NewServer.classList.add("server-expanded")
                                NewServerInfoContainer.classList.remove("server-info-collapsed")
                            }
                        })
                    }
                })
                .catch(error => console.error('Error:', error));
                </script>
            </div>
            <div style="position: absolute; bottom: 0; width: 100vw;">
                ${await Footer(Request)}
            </div>
            `
    , BuildData)}
    `
}
module.exports = { Dashboard }
