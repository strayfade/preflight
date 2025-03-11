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
    const FullUrl = `${Request.protocol}://${Request.headers["host"]}${Request.originalUrl}`
    for (let x = 0; x < BlacklistedPaths.length; x++) {
        if (FullUrl.toString().toLowerCase().includes(BlacklistedPaths[x].toLowerCase())) {
            Log(`[LogURL] Blocked URL ${FullUrl} with flag "${BlacklistedPaths[x]}"`, LogColors.Error)
            Response.sendStatus(404)
            Blocked = true
            break
        }
    }

    if (!Blocked)
        Next()
}
module.exports = { Middleware }