import { BotClient } from "../classes/BotClient"
import { config } from "../../index"

const READY_MESSAGE = "Ready!"

export default {
    once: true,
    async execute(client:BotClient) {
        console.log(READY_MESSAGE);

        // Bot Activity
        if (config.STATUS.inDev) {
            client.user.setActivity(config.ACTIVITY.inDev)
        } else {
            client.user.setActivity(config.ACTIVITY.normal)
        }
    },
};
