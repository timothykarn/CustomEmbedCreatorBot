const {Collection, Client} = require('discord.js');
const config = require('./config.json');
const fs = require('fs');
const client = new Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'], disableMentions: "everyone" })
client.commands = new Collection()
client.aliases = new Collection()
client.mongoose = require('./utils/mongoose');
client.userCooldowns = new Map();

//Command Handler
['command'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

//Event Handler
fs.readdir('./events/', (err, files) => {
    if (err) return console.error;
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const event = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)]
    });
})

//Initiate Mongodb and Discord API connection
try {
    client.mongoose.init()
    client.login(config.token).then()
} catch (e) {
    console.error(e)
}