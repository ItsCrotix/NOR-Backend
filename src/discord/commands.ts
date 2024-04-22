import { InstallGlobalCommands } from "./utils";

// Simple test command
const STATUS_COMMAND = {
  name: "status",
  description: "Check the server status",
  type: 1,
};

const ALL_COMMANDS = [STATUS_COMMAND];

const generateDiscordCommands = (appId) => {
  InstallGlobalCommands(appId, ALL_COMMANDS);
};

generateDiscordCommands(process.env.DISCORD_APP_ID);

export default generateDiscordCommands;
