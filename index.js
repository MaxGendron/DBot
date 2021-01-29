const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const cooldowns = new Discord.Collection();

// Commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'));
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

client.on('message', (message) => {
  // If the given message doesn't start with our prefix or if its a bot that posted the message, return
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Allow aliases for command
  const command =
    client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
  // If no command match the asked command, return
  if (!command) return;

  // If the command is flagged as guildOnly and the message came from a dm, return an error
  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply("I can't execute that command inside DMs!");
  }

  // If the command has permissions for it, verify the requester has it
  if (command.permissions) {
    const authorPerms = message.channel.permissionsFor(message.author);
    if (!authorPerms || !authorPerms.has(command.permissions)) {
      return message.reply('You can not do this!');
    }
  }

  // If command need args but no args was passed, return an error
  if (command.args && !args.length) {
    let reply = `You didn't provide any arguments, ${message.author}!`;
    // If the command has a usage defined, show it to the user
    if (command.usage) {
      reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
    }

    return message.channel.send(reply);
  }

  // If the cooldowns collection don't have the command, add it
  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 3) * 1000;

  // Verify that the timestamps contains the author id (to deal with multiple users)
  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
    // If the expirtationTime hasn't passed, return an error
    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        `please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
      );
    }
  }

  // If the timestamps didn't have the author Id, add it and set a auto-delete with a cooldown
  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

client.login(process.env.TOKEN);
