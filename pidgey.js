#!/bin/env node

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const strings = require("./strings.json");
const process = require("process");
const fs=require('fs');

const poifinder = require("./poifind.js");
poifinder.loadPois(config.poifile);

// Discord limitation
const MAX_MESSAGE_SIZE = 2000;
// Number of hits to show in guild
const MAX_HITS_CHANNEL = 10;
// Number if hits to show in DM
const MAX_HITS_DM = 25;

function writeLog(logfile, message) {
  if(config.logdir == null) {
    return;
  }
  if(!fs.existsSync(config.logdir)) {
    fs.mkdirSync(config.logdir);
  }

  fs.appendFile(config.logdir  + "/" + logfile, (new Date()).toISOString() + "\t" + message + "\n", function(err) {});
}

client.on("message", async message => {

  // Ignore bots and messages not starting with !
  if (message.author.bot || message.content.indexOf(config.prefix) !== 0) {
    return;
  }

  // Get command and argument if given.
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  const isDirectMessage = ( message.guild === null );

  if (command === config.map_command) {

    let poiType = "";
    let clientMessage;
    let matches = null;
    let query;
    let showHelp = false;

    // Show up to 10 matches in chats, 25 hits in dm's
    let maxHits = isDirectMessage ? MAX_HITS_DM  : MAX_HITS_CHANNEL;

    // If no arguments, or single argument pokestop|gym, show help text
    if (args === undefined || args.length == 0) {
      showHelp = true;
    }
    if (!showHelp && poifinder.isPoiType(args[0].toLowerCase())) {
      poiType = args.shift().toLowerCase();
    }

    if (!showHelp) {
      // If numeric query, return poi by number
      // If nothing is found, search by name
      query = args.join(" ");
      if (/^[0-9]+$/.test(query)) {
        matches = poifinder.getByNumber(query);
      }
      if (!matches || matches.length == 0) {
        matches = poifinder.find(query, poiType);
      }
    }

    if (showHelp) {
      const embed = new Discord.RichEmbed();
      let usage = config.prefix + config.map_command + ' ' + strings[config.language]["searchstring"];

      embed.setTitle('Usage:').setDescription(usage);
      clientMessage = {embed};

    } else if (!matches || matches.length == 0) {
      clientMessage = strings[config.language]["nomatches"].replace('{term}',query);

    } else if (singleMatch = poifinder.singleMatch(matches, query, poiType)) {
      let coord = singleMatch[2] + "%2C" + singleMatch[3];
      const embed = new Discord.RichEmbed();

      embed.setTitle(singleMatch[0])
           .setDescription("[Link to Google Maps](https://www.google.com/maps/search/?api=1&query="+ coord + ")");

      clientMessage = {embed};

    } else if (matches.length <= maxHits) {
      clientMessage = strings[config.language]["selectmap"];
      clientMessage += "\n";
      clientMessage += poifinder.listResults(matches).join("\n");

      // Too long messages will be rejected by server
      if (clientMessage.length > MAX_MESSAGE_SIZE) {
        clientMessage = strings[config.language]["toomany"].replace('{num}', matches.length);
        clientMessage += strings[config.language]["refinequery"];
      }
    } else {
      clientMessage = strings[config.language]["toomany"].replace('{num}', matches.length);

      if (!isDirectMessage &&  matches.length <  MAX_HITS_DM) {
        clientMessage += strings[config.language]["senddm"];
      } else {
        clientMessage += strings[config.language]["refinequery"];
      }
    }

    message.channel.send(clientMessage).then(function(msg) {
      writeLog("searches.log",  " " + message.channel.name +": ["+ matches.length + "] " + message);
    }).catch(function(error) {
      writeLog("error.log", "ERROR:  " + message.channel.name +":" + message);
    });
  }
});

client.on("ready", () => {
  client.user.setActivity(config.prefix + config.map_command);
});

client.on('error', (error) => {
  writeLog("error.log", error);
});

client.login(config.token);

