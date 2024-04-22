import { InstallGlobalCommands } from "../src/discord/utils";

const STATUS_COMMAND = {
  name: "status",
  description: "Check server status",
  type: 1,
};

const ALL_COMMANDS = [STATUS_COMMAND];

InstallGlobalCommands(process.env.DISCORD_APP_ID, ALL_COMMANDS);
