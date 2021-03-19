const Discord = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
    name: 'help',
    description: 'Get help on all the commands',
    cooldown: 5,
    usage: '<command>',
    permissions: ['EMBED_LINKS'],
    category: 'Utility',
    execute(message, args, client) {
        const embed = new Discord.MessageEmbed()
            .setColor('07e619');

        const cmd = message.client.commands.get(args[0]);
        if (cmd) {
            const data = [];

            data.push(`**Command:** ${cmd.name}`);
            if (cmd.description) data.push(`**Description:** ${cmd.description}`)
            if (cmd.aliases ? cmd.aliases.length : null) data.push(`**Aliases:** ${cmd.aliases.map(a => `\`${a}\``).join(', ')}`)
            if (cmd.usage) data.push(`**Usage:** ${prefix}${cmd.name} ${cmd.usage}`)
            if (cmd.cooldown) data.push(`**Cooldown:** ${cmd.cooldown}`)
            if (cmd.guildOnly) data.push(`**Guild Only:** ${cmd.guildOnly ? 'Yes' : 'No'}`)
            if (cmd.category) data.push(`**Category:** ${cmd.category}`);

            embed.setDescription(data.join('\n'))
        } else {
            const categories = new Discord.Collection()

            message.client.commands.forEach(command => {
                const category = categories.get(command.category)
                if (category) {
                    category.set(command.name, command)
                } else {
                    categories.set(command.category, new Discord.Collection().set(command.name, command))
                }
            })
            categories.forEach((category, name) => {
                if (name !== 'hidden') embed.addField(name, category.map(command => `\`${command.name}\``).join(' '))
            })
        }
        embed.setFooter(`To get specific info on a command, do ${prefix}help <command>`)
        message.channel.send(embed)
    }
};