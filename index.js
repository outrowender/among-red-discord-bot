// Load up the discord.js library
const Discord = require("discord.js");

const client = new Discord.Client();

const config = require("./config.json");

client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );

  const updateMessage = () => {
    client.user.setActivity(`Among Us com ${client.users.cache.size} ඞ`);
    console.log("Bot status updated");
  };

  updateMessage()

  while (true) {
    setInterval(updateMessage, 60000);
  } 
});

const channels = config.channels;

client.on("voiceStateUpdate", function (oldMember, newMember) {
  //clean all roles
  oldMember.member.roles.cache.forEach((role) => {
    if (Object.values(channels).includes(role.id))
      oldMember.member.roles.remove(role.id);
  });

  if (!newMember.channelID)
    return console.log(`removing roles from ${oldMember.member.displayName}`);

  const role = oldMember.guild.roles.cache.find(
    (r) => r.id == channels[newMember.channelID]
  );

  if (role) {
    newMember.member.roles.add(role);
    console.log(`set ${role.name} to user ${oldMember.member.displayName}`);
  } else console.log(`no role for ${oldMember.member.displayName}`);
});

client.on("message", async (message) => {
  if (message.author.bot) return;

  if (message.member.roles.cache.find((r) => r.id === config["mod-role"])) {
    message.channel.send(message);
    setTimeout(() => {
      message.delete();
    }, 1000);
  }

  if (!message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    const m = await message.channel.send("Ping?");
    m.edit(
      `Pong! Latency is ${
        m.createdTimestamp - message.createdTimestamp
      }ms. API Latency is ${Math.round(client.ws.ping)}ms`
    );
  }
});

client.login(config.token);
