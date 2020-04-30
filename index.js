const Discord = require('discord.js');
const client = new Discord.Client();

const ytdl = require("ytdl-core");

const config = require("./config.json");

const queue = new Map();


client.on("ready", ()=> {});

client.on("message", (message) => {
    if(message.content.startsWith(config.prefix))
    {
        const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if(command == "help")
        {
            const embed = new Discord.MessageEmbed().setTitle("Help").setAuthor(client.user.username, client.user.avatarURL).addField(config.prefix + "help", "Shows this menu").addField(config.prefix + "Ping", "Pong!").setColor(0x00FFFF);
            message.channel.send({embed});
        } else if(command == "ping")
        {
            const embed = new Discord.MessageEmbed().setTitle("Pong!").setAuthor(client.user.username, client.user.avatarURL).setColor(0x00FFFF);
            message.channel.send({embed});
        } else if(command == "ban")
        {
            if(message.guild.member(message.author).roles.cache.has("699866053479759876"))
            {
                var member = message.mentions.members.first();
                member.ban().then((member) => {
                    const embed = new Discord.MessageEmbed().setTitle("Banned " + member.displayName);
                    message.channel.send({embed});
                }).catch(() => {
                    const embed = new Discord.MessageEmbed().setTitle("Access Denied");
                    message.channel.send({embed});
                });
            } else
            {
                const embed = new Discord.MessageEmbed().setTitle("Access Denied");
                message.channel.send({embed});
            }
        } else if(command == "kick")
        {
            if(message.guild.member(message.author).roles.cache.has("699866053479759876"))
            {
                var member = message.mentions.members.first();
                member.kick().then((member) => {
                    const embed = new Discord.MessageEmbed().setTitle("Kicked " + member.displayName);
                    message.channel.send({embed});
                }).catch(() => {
                    const embed = new Discord.MessageEmbed().setTitle("Access Denied");
                    message.channel.send({embed});
                });
            } else
            {
                const embed = new Discord.MessageEmbed().setTitle("Access Denied");
                message.channel.send({embed});
            }
        } else if(command == "play")
        {
            if(message.guild.member(message.author).roles.cache.has("705252868076077076"))
            {
                const serverQueue = queue.get(message.guild.id);
                
                execute(message, serverQueue);
            }
        }
    }
});

async function execute(message, serverQueue)
{
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const channel = message.member.voice.channel;
                if(!channel)
                {
                    const embed = new Discord.MessageEmbed().setTitle("Join a voice channel!");
                    message.channel.send({embed});
                } else
                {
                    const songInfo = await ytdl.getInfo(args[0]);
                    const song = {
                        title: songInfo.title,
                        url: songInfo.video_url
                    };

                    if(!serverQueue)
                    {
                        const queueContruct = {
                            textChannel: message.channel,
                            voiceChannel: channel,
                            connection: null,
                            songs: [],
                            volume: 5,
                            playing: true
                        };

                        queue.set(message.guild.id, queueContruct);
                        queueContruct.songs.push(song);
                        try
                        {
                            var connection = await channel.join();
                            queueContruct.connection = connection;

                            play(message.guild, queueContruct.songs[0]);
                        } catch (err)
                        {
                            console.log(err);
                            queue.delete(message.guild.id);
                            const embed = new Discord.MessageEmbed().setTitle(err);
                            return message.channel.send({embed});
                        }
                    } else
                    {
                        serverQueue.songs.push(song);
                        console.log(serverQueue.songs);
                        const embed = new Discord.MessageEmbed().setTitle("${song.title} has been added to the queue!").setImage(songInfo.thumbnail_url);
                        message.channel.send({embed});
                    }
                }
}

function play(guild, song)
{
    const serverQueue = queue.get(guild.id);
    if(!song)
    {
        serverQueue.voiceChannel.leave();
        queue.delete(guild.id);
        return;
    }
    const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  const embed = new Discord.MessageEmbed().setTitle("Playing song ${song.title}");
  serverQueue.textChannel.send({embed});
}

client.login(config.token);