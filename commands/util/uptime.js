module.exports = {
    name: 'uptime',
    description: 'Get how long the bot has been up for',
    category: 'Utility',
    execute(message, args, client) {
        let uptime = []
        let ms = client.uptime
        let s = ms / 1000
        let m = s / 60
        let h = m  / 60
        let d = h / 24
        let w = d / 7
        if (w >= 1) {
            uptime.push(Math.trunc(w) > 1 ? w + ' weeks' : w + ' week')
            d -= (Math.trunc(w) * 7)
            h -= (Math.trunc(w) * 7 * 24)
            m -= (Math.trunc(w) * 7 * 24 * 60)
            s -= (Math.trunc(w) * 7 * 24 * 60 * 60)
        }
        if (d >= 1) {
            uptime.push(Math.trunc(d) > 1 ? d + ' days' : d + ' day')
            h -= (Math.trunc(d) * 24)
            m -= (Math.trunc(d) * 24 * 60)
            s -= (Math.trunc(d) * 24 * 60 * 60)
        }
        if (h >= 1) {
            uptime.push(Math.trunc(h) > 1 ? h + ' hours' : h + ' hour')
            m -= (Math.trunc(h) * 60)
            s -= (Math.trunc(h) * 3600)
        }
        if (m >= 1) {
            uptime.push(Math.trunc(m) > 1 ? m + ' mins' : m + ' min')
            s -= (Math.trunc(m) * 60)
            ms -= (Math.trunc(s) * 1000)
        }
        if (s >= 1) {
            uptime.push(s > 1 ? s + ' seconds' : s + ' second')
            ms -= (Math.trunc(s) * 1000)
        }
        uptime.forEach(element => {
            const time = element.split(/ +/g)
            uptime[uptime.indexOf(element)] = Math.trunc(time[0]) + ' ' + time[1]
        })
            message.channel.send(`I have been up for: ${uptime.join(', ')}`)
    }
}
