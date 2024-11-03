const { version } = require("../Version")

const Footer = async (Request, Author = `preflight v${version}`, LastEdited = `© Copyright preflight 2024. All rights reserved.`) => {
    return `
    <footer>
        <div class="footer-inner">
            <p class="footer-top">${Author}</p>
            <p style="margin: 0px 10px;"> | </p>
            <p class="footer-bottom">${LastEdited}</p>
        </div>
    </footer>
    `
}
module.exports = { Footer }