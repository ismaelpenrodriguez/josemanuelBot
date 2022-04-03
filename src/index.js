const Discord = require('discord.js');
const config = require('./config');
const fs = require('fs');
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const emtconfig = require('./config/emtconfig');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MEMBERS, Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILD_VOICE_STATES] });
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
const talkedRecently = new Set();


client.on('ready', () => {

  // EMT login
  fetch(emtconfig.url + 'mobilitylabs/user/login/', { method: 'GET', headers: emtconfig.headers })
    .then((res) => {
      if (!res.ok) {
        console.log('There was an error connecting to de MobilityLabs API' + res.status);
      } else { return res.json(); }
    })
    .then((json) => {
      if (!json) { return; }
      emtconfig.headers.accessToken = json.data[0].accessToken;
      console.log('Successfully logged in to EMT API with token: ' + emtconfig.headers.accessToken);
    })
    .catch((err) => console.error(err));

  client.user.setPresence({ activities:  [{ name: 'Hawaii: Part II', type: 'LISTENING' }] });


  commandFiles.forEach((file) => {
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
    for (const index in command.aliases) {
      client.commands.set(command.aliases[index], command);
    }
  });

  const gatoChannel = client.channels.cache.get('595718884288495759');
  schedule.scheduleJob('5 45 * * * *', () => { gatoPicha(gatoChannel); });

  console.log('Connected');

});

client.on('messageCreate', (msg) => {

  if (!msg.content.toLowerCase().startsWith(config.prefix) || msg.author.bot) return;

  const args = msg.content.slice(config.prefix.length).split(/ +/);
  const command = args[0].toLowerCase();

  if (!client.commands.has(command)) return;

  if (talkedRecently.has(msg.author)) return msg.channel.send('Hay cooldown XD (te jode)');

  try {
    msg.channel.sendTyping().then(() => {
      client.commands.get(command).execute(msg, args, client);
      messageCooldown(msg.author, client.commands.get(command).cooldown);
    });
  } catch (error) {
    msg.channel.send('Ha habido un error x.x');
    console.log(error);
  }

});


function gatoPicha(gatoChannel) {
  const gatoChance = Math.floor(Math.random() * 10000) + 1;

  console.log(`[gatoconlapichatiesa] gatoChance = ${gatoChance}`);

  switch (gatoChance) {
  case 1:
    sendMsgWithAttachment(gatoChannel, 'gatoAlt1.png');
    break;
  case 2:
    sendMsgWithAttachment(gatoChannel, 'gatoAlt2.png');
    break;
  default:
    sendMsgWithAttachment(gatoChannel, 'gatoOriginal.png');
  }
}

function sendMsgWithAttachment(channel, imageName) {
  channel.send({ files: [`../multimedia/img/${imageName}`] });
}

function messageCooldown(user, cooldownTime) {
  talkedRecently.add(user);
  setTimeout(() => {
    talkedRecently.delete(user);
  }, cooldownTime);
}

client.login(config.token);
