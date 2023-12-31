import { Client, Collection } from "discord.js"
import { REST } from "@discordjs/rest"
import { Routes } from "discord-api-types/v10"
import * as fs from "fs"
import * as path from "path"
import { config, secret } from "../../index"

export class BotClient extends Client {
    constructor(cfg) {
        super(cfg)
    }

    async handleEvents(eventFiles:Array<string>,path:string) {
        for (const file of eventFiles) {
            const event = require(`${path}/${file}`)
            const filename = file.replace(".ts","")
            if (event.once) {
                this.once(filename, (...args) => event.default.execute(this,...args))
            } else {
                this.on(filename, (...args) => event.default.execute(this,...args))
            }
        }
    }

    async handleCommands(commandFolders:Array<{}>,fpath:string) {
        this.commandArray = []
        for (const folder of commandFolders) {
            const commandFiles = fs.readdirSync(`${fpath}/${folder}`).filter(file => file.endsWith(".ts"))
            for (const file of commandFiles) {
                const command = require(`${fpath}/${folder}/${file}`).default
                if (command.disabled) continue
                const filename = path.parse(file).name
                if (file[0] === "!") {
					if (folder === "prefix") {
						this.prefixCommands[`${config.COMMAND_PREFIX}${filename.replace("!","")}`] = command
						continue
					}
                    this.developerCommands[`${config.DEV_COMMAND_PREFIX}${folder} ${filename.replace("!","")}`] = command
                    continue
                }
                this.commands.set(filename, command)
                this.commandArray.push(command.data.toJSON())
            }
        }

        const rest:REST = new REST({
            version: "10"
        }).setToken(secret.TOKEN)

        {(async () => {
            try {
                console.log("Started refreshing application (/) commands.")

                await rest.put(
                    Routes.applicationCommands(secret.CLIENT_ID), {
                        body: this.commandArray
                    },
                )

                console.log("Successfully reloaded application (/) commands.")
            } catch (error) {
                console.error(error)
            }
        })()}
    }

    isWhitelisted(userId:string):boolean {
        return Object.values(config.WHITELIST).includes(userId) == true
    }

    isDeveloper(userId:string):boolean {
        const whitelistedUserIds = Object.values(config.WHITELIST);
        const whitelistedUserNames = Object.keys(config.WHITELIST);
        const index = whitelistedUserIds.indexOf(userId);
        if (index !== -1) {
            const userName = whitelistedUserNames[index];
            return (config.DEVELOPERS as string[]).includes(userName);
        } else {
            return false;
        }
    }

    public commands:Collection<any,any>
    public commandArray:Array<[]>
    public developerCommands:Object
	public prefixCommands:Object
}
