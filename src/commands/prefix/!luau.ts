import { EmbedBuilder, Message } from "discord.js"
import { BotClient } from "../../core/classes/BotClient"

function filterArrayBetweenMarkers(array, startMarker, endMarker) {
	const startIndex = array.indexOf(startMarker);
	const endIndex = array.lastIndexOf(endMarker);

	if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
		return array.slice(startIndex + 1, endIndex).join(';');
	}
}

export default {
	async execute(client:BotClient,args,message:Message) {
		console.log("luau!",args);
		let repliedTo
		if (message.reference) {
			repliedTo = await message.channel.messages.fetch(message.reference.messageId)
		}
		//console.log("REFERENCE:",repliedTo)
		let msg
		const sendError = async function(output,version?:string) {
			let ansi:string[] = []
			for (const line of output.split("\n")) {
				if (ansi.length == 0) {
					ansi.push(`[2;31m[1;31m${line}[0m[2;31m[0m`)
				} else {
					ansi.push(`[2;34m${line}[0m`)
				}
			}
			output = ansi.join("\n")
			const embed = new EmbedBuilder()
				.setColor("Red")
				.setTitle("Luau Error")
				.setDescription(`\`\`\`ansi\n${output}\n\`\`\``)
				.setThumbnail('https://www.freeiconspng.com/thumbs/error-icon/orange-error-icon-0.png')
				.setTimestamp()
				.setFooter({ text: version || "unknown version or an error occurred", iconURL: 'https://static.wikia.nocookie.net/roblox/images/a/af/Luau.png/revision/latest?cb=20230210233439' })
			await msg.edit({ content: "", embeds: [embed]})
		}
		try {
			const runLuau = async(source:string) => {
				msg = await message.reply({ content: "Executing please wait.." })
				const encodedSource = Buffer.from(source).toString('base64')
				fetch(`http://localhost:3004/?source=${encodedSource}`).then(async (response) => {
					if (!response.ok) {
						await sendError("Luau Server Response was not OK")
					}
					return response.json();
				})
					.then(async (data) => {
						//console.log('Response from localhost:', data);
						const output = data.output
						//console.log(`luau output: ${output}`);
						if (data.status == "OK") {
							const embed = new EmbedBuilder()
							.setColor("#00a2ff")
							.setTitle("Luau Output")
							.setDescription(`\`\`\`ansi\n${output}\n\`\`\``)
							.setThumbnail('https://static.wikia.nocookie.net/roblox/images/b/b0/ExplorerImageIndex_6.png/revision/latest?cb=20190302221747')
							.setTimestamp()
							.setFooter({ text: data.version, iconURL: 'https://static.wikia.nocookie.net/roblox/images/a/af/Luau.png/revision/latest?cb=20230210233439' })
							await msg.edit({ content: "", embeds: [embed] })
						} else if (data.status == "ERR") {
							await sendError(output,data.version)
						}
					})
					.catch(async (error) => {
						await sendError("Luau Server Fetch Failure")
					});
			}

			const content = repliedTo && repliedTo.content || message.content
			let match = content.match(/[\s\S]*?```([\s\S]*?)```/)
			//console.log(match)
			if (match && match[1]) {
				console.log(match[1].replace(/^lua\n/, '').trim()) //.replace("\n"," ")
				runLuau(`${match[1].replace(/^lua\n/, '').trim()}\n`) //.replace(/\r?\n/g, " ")
				return
			}
			args = repliedTo && repliedTo.content.split(" ").map(item => item.split('\n')).flat().splice(0,1) || args
			if (args[0] != null)
				runLuau(`${args.join(" ")}\n`)
		} catch(err) {
			await sendError(err)
		}
	}
}
