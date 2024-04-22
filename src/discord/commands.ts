import { InstallGlobalCommands } from "./utils";

// Simple test command
const TEST_COMMAND = {
  name: "test",
  description: "Basic command",
  type: 1,
};

const ALL_COMMANDS = [TEST_COMMAND];

const generateDiscordCommands = (appId) => {
  InstallGlobalCommands(appId, ALL_COMMANDS);
};

export default generateDiscordCommands;
