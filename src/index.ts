import { IntentsBitField, Collection, Partials } from "discord.js"
import { BotClient } from "./core/classes/BotClient"
import * as fs from "fs"
import * as path from "path"

import config from "./cfg/config.json"
import secret from "./cfg/secret.json"

const client:BotClient = new BotClient({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.DirectMessages
  ],
  partials: [
    Partials.Channel
  ]
})

client.commands = new Collection()
client.developerCommands = new Object()
client.prefixCommands = new Object()

const dir = {
  events:fs.readdirSync("./src/events").filter(file => file.endsWith(".ts")),
  commands:fs.readdirSync("./src/commands")
}

const core = {
  events:fs.readdirSync("./src/core/events").filter(file => file.endsWith(".ts"))
}

// custom
client.handleEvents(dir.events,path.resolve("./src/events"))
client.handleCommands(dir.commands,path.resolve("./src/commands"))
// core
client.handleEvents(core.events,path.resolve("./src/core/events"))

client.login(secret.TOKEN)

export { client, config, secret }
