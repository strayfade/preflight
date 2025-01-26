const { Log, LogColors } = require('./Log')
const BlacklistedPaths = [
    '.env',
    'wp-',
    'php',
    'config',
    'xss',
    'sendgrid',
    'feeds',
    'daemon',
    'boaform',
    'portal',
    'autodiscover',
    'vendor',
    'www',
    'telescope',
    'misc',
    'shell',
]

const Middleware = (Request, Response, Next) => {
    let Blocked = false
    for (let x = 0; x < BlacklistedPaths.length; x++) {
        if (Request.path.toString().toLowerCase().includes(BlacklistedPaths[x].toLowerCase())) {
            Log(`[LogURL] Blocked URL ${Request.path} with flag "${BlacklistedPaths[x]}"`, LogColors.Error)
            Response.sendStatus(404)
            Blocked = true
            break
        }
    }

    if (!Blocked)
        Next()
}
module.exports = { Middleware }