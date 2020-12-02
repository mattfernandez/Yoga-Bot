require("dotenv").config();
const ytdl = require('ytdl-core')
const { Client } = require("discord.js");
const client = new Client();
const prefix = "!";
var msg;
const queue = new Map();
const poses = ["ReverseWarrior", "Eagle", "HighLunge", "Chair", "LordofDance", "SideAngle", "Child", "BoundAngle", "Boat", "DownwardDog", "Marichis", "Heron", "CowFace", "SeatedBend", "Lotus"]

client.on("ready", () => {
  console.log("The bot has logged in");
});

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(prefix)) {
    const [command, ...args] = message.content // Takes our message and seperates it into command and args and spreads the args into an array
      .trim() // Removes leading and trailing whitespace
      .substring(prefix.length) // Cuts the prefix from the length
      .split(/\s+/); // RegEx to cut out extra spaces if there are more than 1 in a row
    
      const serverQueue = queue.get(message.guild.id)
      const sendPose = async (pose) =>{
        const connection = await message.member.voice.channel.join();
        message.channel.send(`${pose}:`)
        message.channel.send({files: [`./images/${pose}.jpg`]})
        connection.play(`./sounds/${pose}.mp3`);
      }
      const timer = async (timer, measurement) =>{
        if (measurement === "minutes" || measurement === "minute" || measurement === "min"){ timer = timer * 60000 }
        else if(measurement === "hours" || measurement === "hour"){ timer = timer * 3600000  }
        else if(measurement === undefined || measurement != 'seconds'){ measurement = 'seconds'}
        let msg = await message.channel.send(`your timer has been set for ${args[0]} ${measurement}`);
        setTimeout(() => message.channel.send("Ding! your timer has expired"), timer*1000 );
      }

       const playSong = async (guild, song) => {
        let serverQueue = queue.get(guild.id);
    
        if(!song){
            serverQueue.voiceChannel.leave();
            queue.delete(guild.id);
            return;
        }
    
        const dispatcher = serverQueue.connection.play(ytdl(song.url)).on('end', () => {
            serverQueue.songs.shift();
            playSong(guild, serverQueue.songs[0]);
        })
        .on('error', () => {
            console.log(error)
        })
    
        dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
    }

    const stop = async (message, serverQueue) => {
      if (!message.member.voice.channel)
        return message.channel.send(
          "You have to be in a voice channel to stop the music!"
        );
      serverQueue.songs = [];
      serverQueue.connection.dispatcher.end();
    }


      var i = 0;
      const posesLoop = async (length) => {
        var loops;
        if(length === "short"){
          loops = 5; 
        } else if( length === "medium"){
          loops = 10;
        } else if(length ===  "long"){
          loops = 15;
        }
        setTimeout(() =>{
          sendPose(poses[i]);
          i++;
          if(i < loops){
            posesLoop(length);
          }
        }, 60000)
      }


    if (command === "join"){
      if(message.member.voice.channel){
        const connection = await message.member.voice.channel.join();
      }
      else{
        message.reply("You have to be in a voice channel first!")
      }
    }
    if (command === "leave") {
      const connection = await message.member.voice.channel.join();
      connection.disconnect();
    }


    if (command === "timer") {
      timer(args[0], args[1]);

    }

    if(command === "yoga"){
      const connection = await message.member.voice.channel.join();
      connection.play('./sounds/Start.mp3')
      setTimeout(() => connection.play('./sounds/OneMinute.mp3'), 5000)
      posesLoop(args[0]);
      
    }
    if(command === 'stop'){
      stop(message, serverQueue)
    }
    if(command === 'play'){
      if(!args[0]) return;
      let url = args[0];
      if(!url.match(/(youtube.com|youtu.be)\/(watch)?(\?v=)?(\S+)?/)) return message.channel.send("Please provide a valid Youtube link!");

      let serverQueue = queue.get(message.guild.id);

      if(message.member.voice.channel){
        const connection = await message.member.voice.channel.join();
      }
      else{
        message.reply("You have to be in a voice channel first!")
      }
      
      let songinfo = await ytdl.getInfo(url);
      let song = {
          title: songinfo.videoDetails.title,
          url: songinfo.videoDetails.video_url
      }

      if(!serverQueue) {
          let queueConst = {
              textChannel: message.channel,
              voiceChannel: message.member.voice.channel,
              connection: null,
              songs: [],
              volume: 5,
              playing: true
          };

          queue.set(message.guild.id, queueConst);
          queueConst.songs.push(song);

          try {
              let connection = await message.member.voice.channel.join();
              queueConst.connection = connection
              playSong(message.guild, queueConst.songs[0])
          } catch (error) {
              console.log(error);
              queue.delete(message.guild.id);
              return message.channel.send("There was an error playing the song! Error: " + error);
          }
      } else {
          serverQueue.songs.push(song);
          return message.channel.send(`${song.title} has been added to the queue!`)
      }


    }
  }
});

client.login(process.env.DISCORDJS_BOT_TOKEN);




















