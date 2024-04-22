import { InstallGlobalCommands } from "./utils";

const STATUS_COMMAND = {
  name: "status",
  description: "Check server status",
  type: 1,
};

const ALL_COMMANDS = [STATUS_COMMAND];

const generateDiscordCommands = (appId) => {
  InstallGlobalCommands(appId, ALL_COMMANDS);
};

generateDiscordCommands(process.env.DISCORD_APP_ID);

export default generateDiscordCommands;
