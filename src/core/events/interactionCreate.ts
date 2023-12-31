import { Interaction, InteractionType } from "discord.js"
import { BotClient } from "../classes/BotClient"
import { config } from "../../index"

export default {
    async execute(client:BotClient, interaction:Interaction) {
        if (!interaction.isCommand()) return
        const command = client.commands.get(interaction.commandName)
        if (!command) return

        try{
            if (config.STATUS.inDev && !client.isDeveloper(interaction.user.id)) {
                await interaction.reply({ content: config.IN_DEV_MESSAGE, ephemeral: true })
                return
            }
            await command.execute(client, interaction)
        } catch (error) {
            console.log(error)
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true
            })
        }
    },
}
