const HTML = require('../components/HTML').HTML
const Head = require('../components/Head').Head
const Body = require('../components/Body').Body
const Footer = require('../components/Footer').Footer
const Header = require('../components/Header').Header

const Homepage = async (Request, BuildData) => {
    return `
        ${await HTML(Request)}
        ${await Head(Request, 'preflight', '', BuildData)}
        ${await Body(
        Request,
        `
            ${await Header(Request)}
            <div class="block">
                <div class="hero-container">
                    <h1 class="hero">preflight<h1>
                    <p class="hero-subtitle">Node-based web app management software</p>
                </div>
            </div>
            <div style="position: absolute; bottom: 0; width: 100vw;">
                ${await Footer(Request)}
            </div>
            `
    , BuildData)}
    `
}
module.exports = { Homepage }
