const moment = require('moment')
const mongoose = require('mongoose')
const { prefix } = require('../config.json')
module.exports = async (client, message) => {
    try {
        //Returns for no command or if bot/dms
        if (message.author.bot || !message.guild) return;
        if (!message.content.startsWith(prefix)) return


        //Split words into arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/g);

        //For if a user forgets the prefix
        if (message.mentions.users.first() === client.user && !args[1]) await message.reply('My prefix is: ' + prefix)

        //Ensures there is no erroring
        if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) return

        //Gets command
        const cmd = args.shift().toLowerCase()
        if (cmd.length === 0) return;
        let command = client.commands.get(cmd)
        if (!command) command = client.commands.get(client.aliases.get(cmd))
        if (!command) return

        //Ensures that permisions allow for completion of the command
        if (!message.channel.permissionsFor(message.guild.me).has(command.permissions)) return message.channel.send(`I cannot complete that command, please make sure I have the \`${command.permissions.join(' ').toLowerCase().replace(/_/g, ' ')}\` permissions!`)

        const icn = message.author.id + command.name
        if (command.cooldown) {
            if (client.userCooldowns.get(icn)) {
                const timer = Math.round((client.userCooldowns.get(icn) - moment.now()) / 1000)
                const msg = await message.channel.send(`You cannot use that command so fast. Please wait ${timer} seconds`)
                if (message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) return await msg.delete({
                    timeout: (timer < 1 ? 1000 : timer * 1000)
                })
            }
        }
        if (client.userCooldowns.get(message.author.id) > moment.now()) return message.channel.send(`Please wait two seconds between commands!`)
        try {
            if (command.cooldown) {
                let timer = command.cooldown * 1000
                client.userCooldowns.set(icn, moment.now() + timer)
                setTimeout(() => client.userCooldowns.delete(icn), timer)
            }
            await command.execute(message, args, client)
        } catch (e) {
            console.error(e)
            return message.channel.send(`There was an issue with ${command.name}!`)
        }
        client.userCooldowns.set(message.author.id, 'now')
        setTimeout(() => client.userCooldowns.delete(message.author.id), 2000)
    } catch (e) {
        console.error(e)
    }
}