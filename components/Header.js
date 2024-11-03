const Header = async (Request, Author = "", LastEdited = "") => {
    return `
    <header>
        <div class="header-inner">
            <a href="/">preflight</a>
            <a href="/dashboard">dashboard</a>
            <a class="header-right" id="button-login" href="/login">log in</a>
            <a class="header-right" id="button-logout" style="display: none;" href="/logout">log out</a>
            <script>
                if (document.cookie.split('; ').some(cookie => cookie.startsWith('session='))) {
                    document.getElementById("button-login").style.display = "none"
                    document.getElementById("button-logout").style.display = "inherit"
                }
            </script>
        </div>
    </header>
    `
}
module.exports = { Header }