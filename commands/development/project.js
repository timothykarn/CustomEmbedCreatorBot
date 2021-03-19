const gamesSchema = require('../../models/games')
const {
    MessageEmbed
} = require('discord.js')
module.exports = {
    name: 'project',
    description: 'Set up a developer project',
    category: 'Information',
    permissions: ['EMBED_LINKS'],
    async execute(message, args) {
        //Returns if there is no message to specify a sub-command
        if (args.length < 1) return message.channel.send('Type to add, edit, or delete a project next time!')

        //Check whether a user is attempting to add, edit, or delete to get their developer data; create if there is none
        let newDeveloper
        let developer
        developer = await gamesSchema.findOne({
            userId: message.author.id
        }, (error, game) => {
            if (error) console.error(error)

            //If no user is found, create a new one
            if (!game) newDeveloper = new gamesSchema({
                userId: message.author.id,
                games: []
            })
        })
        if (newDeveloper) developer = newDeveloper



        //if user wants to add a game
        if (args[0].toLowerCase() === 'add') {
            //Base object to add to for data
            const baseGame = { fields: [] }

            //Loop through the data sets
            await askForData(baseGame, 'title', 'What is the title of your project?')
            await askForData(baseGame, 'description', 'What is the description of your project?')

            //Ask for optional data
            const boolForThumb = await askForData(baseGame, 'bool', 'Do you want to add a thumbnail? (yes/no)')
            if (boolForThumb === 'yes') await askForData(baseGame, 'thumbnail', 'Send a link for your thumbnail')
            const boolForImage = await askForData(baseGame, 'bool', 'Do you want to add an image? (yes/no)')
            if (boolForImage === 'yes') await askForData(baseGame, 'image', 'Send a link for your image')

            //Ask if the user wants fields
            let fieldsWanted = true
            while (fieldsWanted && baseGame.fields.length < 10) {
                const boolForFields = await askForData(baseGame, 'bool', 'Do you want to add a field? (yes/no)')
                if (boolForFields === 'yes') {
                    const key = await askForData(baseGame.fields, 'array', 'What is the title of your field?')
                    const value = await askForData(baseGame.fields, 'array', 'What is the content of your field?')
                    let isInline = await askForData(baseGame, 'bool', 'Do you want it to be inline? (yes/no)')
                    if (isInline === 'yes') isInline = true
                    else false
                    await baseGame.fields.push({
                        title: key,
                        description: value,
                        inline: isInline
                    })
                } else {
                    fieldsWanted = false
                }
            }
            await developer.games.push(baseGame)
            developer.markModified('games')
            await developer.save()
            await message.channel.send('Your Project has been made!')
        }
        //if user wants to edit
        else if (args[0].toLowerCase() === 'edit') {

        }

        //if user wants to delete
        else if (args[0].toLowerCase() === 'delete') {
            const gameName = args.slice(1).join(' ')
            if (developer.games.some(game => game.title === gameName)) {
                const index = developer.games.indexOf({
                    title: gameName
                })
                developer.games.splice(index, 1)
                message.channel.send(`Deleted game ${gameName}`)
                developer.markModified('games')
                await developer.save()
            } else {
                message.channel.send(`There is no game by the Title of **${gameName}**`)
            }
        }
        async function askForData(objectToAddTo, data, question) {
            const extraFilter = (msg) => (msg.content === 'yes' || msg.content === 'no') && msg.author.id === message.author.id 
            await message.channel.send(question)
            let response
            try {
            response = await message.channel.awaitMessages(msg => data === 'bool' ? extraFilter(msg) : msg.author.id === message.author.id , {
                max: 1,
                time: 180000
            })
        } catch (error) {
            return await message.channel.send('You took too long to respond!')
        }
        if (data === 'bool') return await response.first().content.toLowerCase()
        else if (data === 'array') return await response.first().content
        else objectToAddTo[data] = await response.first().content
        }
    }
}