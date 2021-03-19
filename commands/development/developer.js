const gamesSchema = require('../../models/games')
const {
    MessageEmbed
} = require('discord.js')
const DiscordPages = require('discord-pages')

module.exports = {
    name: 'developer',
    description: 'Look at other developer\'s projects',
    category: 'Information',
    permissions: ['EMBED_LINKS'],
    async execute(message, args) {
        //Returns if there is no message to specify a user
        if (args.length < 1) return message.channel.send('Tell me who to find next time!')

        //Attempts to find a user associated with the string
        let user 
        user = message.guild.members.cache.get(args[0])?.user
        if (!user) user = message.guild.members.cache.find(m => m.user.username == args[0])?.user
        if (!user && message.mentions.users.first()) user = message.mentions.users.first()

        //If there is no user found, return
        if (!user) return message.channel.send('No user found!')

        //If user is found, pull their developer data
        const developer = await gamesSchema.findOne({
            userId: user.id
        })

        //If no user is found in schema, return that the developer hasn't set their game project
        if (!developer || developer.games?.length < 1) return message.channel.send(`I could not find any developer info on ${user.username}`)

        //Loop through all projects
        const allGames = []
        developer.games.forEach(game => {

            //Set up basic embed information
            const devEmbed = new MessageEmbed()
                .setAuthor(user.username, user.displayAvatarURL())
                .setTitle(game.title)
                .setDescription(game.description)
            game.thumbnail && (game.thumbnail.endsWith('.jpg') || game.thumbnail.endsWith('.png')) ? devEmbed.setThumbnail(game.thumbnail) : null
            game.image && (game.image.endsWith('.jpg') || game.image.endsWith('.png')) ? devEmbed.setImage(game.image) : null

            //If the developer has fields, check and add all fields to the embed
            if (Object.keys(game.fields)?.length > 0) {
                Object.entries(game.fields).forEach(([key, field]) => {
                    devEmbed.addField(field.title, field.description, field.inline)
                })
            }
            allGames.push(devEmbed)
        })

        //Send embed pages
        new DiscordPages({
            pages: allGames,
            channel: message.channel,
            pageFooter: true,
        }).createPages();
    }
}