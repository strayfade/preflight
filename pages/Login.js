const HTML = require('../components/HTML').HTML
const Head = require('../components/Head').Head
const Body = require('../components/Body').Body
const Footer = require('../components/Footer').Footer
const Header = require('../components/Header').Header

const Login = async (Request, BuildData) => {
    return `
        ${await HTML(Request)}
        ${await Head(Request, 'preflight', '', BuildData)}
        ${await Body(
        Request,
        `
            ${await Header(Request)}
            <div class="block">
                <div class="hero-container">
                    <style>
                        input, input:focus, button {
                            display: block;
                            width: 75vw;
                            max-width: 300px;
                            margin: 5px auto;
                            outline: none;
                            border: 1px solid black;
                            border-radius: 0px;
                            padding: 10px;
                            font-family: var(--font-family);
                        }
                        button {
                            width: 50vw;
                            max-width: 100px;
                            margin-top: 50px;
                        }
                        .input-label {
                            width: 75vw;
                            max-width: 300px;
                            margin: 5px auto;
                            padding-top: 10px;
                            text-transform: lowercase;
                            font-size: 12px;
                        }
                        #login-result {
                            font-size: 12px;
                            text-align: center;
                            font-style: italic;
                            text-transform: lowercase;
                        }
                    </style>
                    <p class="input-label">Username or Email Address</p>
                    <input type="text" placeholder="you@strayfade.com" id="field-email" />
                    <p class="input-label">Password</p>
                    <input type="password" placeholder="" id="field-password" />
                    <button id="field-submit">log in</button>
                    <p id="login-result" style="opacity: 0;">Loading...</p>

                    <script>
                        document.getElementById("field-submit").addEventListener("click", () => {
                            const loginInfo = {
                                user: document.getElementById("field-email").value,
                                pass: document.getElementById("field-password").value
                            }
                            fetch("/clientLogin", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"    
                                },
                                body: JSON.stringify(loginInfo)
                            })
                            .then(response => {
                                return response.json()
                            })
                            .then(data => {
                                if (data.message) {
                                    document.getElementById("login-result").style.opacity = "1"
                                    document.getElementById("login-result").textContent = data.message
                                }
                                else {
                                    window.location.href = decodeURIComponent(window.location.toString().split("redir=")[1])
                                }
                            })
                            .catch(error => {
                                console.error(error)    
                            })
                        })
                    </script>
                </div>
            </div>
            <div style="position: absolute; bottom: 0; width: 100vw;">
                ${await Footer(Request)}
            </div>
            `
    , BuildData)}
    `
}
module.exports = { Login }
