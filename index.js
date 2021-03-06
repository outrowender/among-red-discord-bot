// Load up the discord.js library
const Discord = require("discord.js");

const client = new Discord.Client();

const config = require("./config.json");

const updateUsersCount = () => {
  const channels = client.channels.cache.filter((x) => x.type == "voice");

  let membersCount = 0;

  for (const [channelID, channel] of channels) {
    for (const [memberID, member] of channel.members) {
      membersCount++;
    }
  }

  if (membersCount == 0) {
    client.user.setActivity('ඞ')
  }else{
    client.user.setActivity(`com ${membersCount} tripulantes`);
  }
};

client.on("ready", () => {
  console.log(
    `Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
  );

  updateUsersCount();
});

client.on("guildMemberAdd", (member) => updateUsersCount());

const channels = config.channels;

client.on("voiceStateUpdate", function (oldMember, newMember) {

  updateUsersCount()

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
