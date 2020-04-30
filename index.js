const Discord = require('discord.js');
const client = new Discord.Client();

const ytdl = require("ytdl-core");

const search = require("youtube-search");

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
			if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "Moderator").id) && message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "DJ").id))
			{
				const embed = new Discord.MessageEmbed().setTitle("Help").setAuthor(client.user.username, client.user.avatarURL).addField(config.prefix + "help", "Shows this menu").addField(config.prefix + "Ping", "Pong!").setColor(0x00FFFF).addField(config.prefix + "play", "Play some music!").addField(config.prefix + "stop", "Stop the music").addField(config.prefix + "skip", "Skip the currently playing song").addField(config.prefix + "ban", "Ban the mentioned user").addField(config.prefix + "kick", "Kick the mentioned user");
				message.channel.send({embed});
			} else
			if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "Moderator").id))
			{
				const embed = new Discord.MessageEmbed().setTitle("Help").setAuthor(client.user.username, client.user.avatarURL).addField(config.prefix + "help", "Shows this menu").addField(config.prefix + "Ping", "Pong!").setColor(0x00FFFF).addField(config.prefix + "ban", "Ban the mentioned user").addField(config.prefix + "kick", "Kick the mentioned user");
				message.channel.send({embed});
			} else if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "DJ").id))
			{
				const embed = new Discord.MessageEmbed().setTitle("Help").setAuthor(client.user.username, client.user.avatarURL).addField(config.prefix + "help", "Shows this menu").addField(config.prefix + "Ping", "Pong!").setColor(0x00FFFF).addField(config.prefix + "play", "Play some music!").addField(config.prefix + "stop", "Stop the music").addField(config.prefix + "skip", "Skip the currently playing song");
				message.channel.send({embed});
			} else 
			{
				const embed = new Discord.MessageEmbed().setTitle("Help").setAuthor(client.user.username, client.user.avatarURL).addField(config.prefix + "help", "Shows this menu").addField(config.prefix + "Ping", "Pong!").setColor(0x00FFFF);
				message.channel.send({embed});
			}
        } else if(command == "ping")
        {
            const embed = new Discord.MessageEmbed().setTitle("Pong!").setAuthor(client.user.username, client.user.avatarURL).setColor(0x00FFFF);
            message.channel.send({embed});
        } else if(command == "ban")
        {
            if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "Moderator")))
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
            if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "Moderator").id))
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
            if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "DJ").id))
            {
                const serverQueue = queue.get(message.guild.id);
                
                execute(message, serverQueue);
            }
        }else if(command == "stop")
        {

            if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "DJ").id))

            {
                const serverQueue = queue.get(message.guild.id);
                
                stop(message, serverQueue);
            }
        } else if(command == "skip")
        {
            if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "DJ").id))
            {

                const serverQueue = queue.get(message.guild.id);
                
                skip(message, serverQueue);
            }
        } else if(command == "queue")
        {
            if(message.guild.member(message.author).roles.cache.has(message.guild.roles.cache.find(r => r.name === "DJ").id))
            {
                const serverQueue = queue.get(message.guild.id);
                
                const embed = new Discord.MessageEmbed().setTitle("Queue");
                const serverqueue = queue[message.guild.id];
                for(song in serverqueue.songs)
                {
                    embed = embed.addField(song.title);
                    console.log(song.title);
                }
                message.channel.send({embed});
            }
        }
    }
    
});

async function execute(message, serverQueue)
{
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const arguments = message.content.slice(config.prefix).trim();
    if(!arguments.startsWith("http"))
    {
        var opts = {
            maxResults: 1,
            key: 'AIzaSyD7ORC0fm6lAnzkDLGNAdXA2BAI10UBcj0'
        };
        search(arguments, opts, async function(err, results) {
            if(err) return console.log(err);

            console.dir(results);
            var link = results[0].link;
            console.log(args[0]);
            const channel = message.member.voice.channel;
                if(!channel)
                {
                    const embed = new Discord.MessageEmbed().setTitle("Join a voice channel!");
                    message.channel.send({embed});
                } else
                {
                    const songInfo = await ytdl.getInfo(link);
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
                            volume: 2,
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
                        const embed = new Discord.MessageEmbed().setTitle(song.title + " has been added to the queue!").setURL(link);
                        message.channel.send({embed});
                    }
                }
        })
    } else
    {
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
                    volume: 2,
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
                        const embed = new Discord.MessageEmbed().setTitle(song.title + " has been added to the queue!").setURL(args[0]);
                        message.channel.send({embed});
                    }
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
  const embed = new Discord.MessageEmbed().setTitle("Playing song " + song.title);
  serverQueue.textChannel.send({embed});
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

client.login(config.token);
