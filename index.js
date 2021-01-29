const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

// Commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  // Get the command file and add it to the collection
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

// Env variable
const dotenv = require('dotenv');
dotenv.config();
const prefix = process.env.PREFIX;

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
  // If the given message doesn't start with our prefix or if its a bot that posted the message, return
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // If no command match the asked command, return
  if (!client.commands.has(command)) return;

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

client.login(process.env.TOKEN);