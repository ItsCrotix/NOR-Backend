import "dotenv/config";
import express from "express";
import cors from "cors";
import {
  driverRouter,
  resultsRouter,
  userRouter,
  adminRouter,
  authRouter,
  competitionRouter,
  statusRouter,
  discordRouter,
} from "./routes";
import cookieParser from "cookie-parser";
import { authAdmin, authUser } from "./middleware/authMiddleware";
import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./swagger_output.json";
import subscribeToServerStatus from "./subscribers/serverStatusSubscriber";
import { VerifyDiscordRequest } from "./discord/utils";
import generateDiscordCommands from "./discord/commands";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(`/api-docs`, swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.use("/drivers", authUser, driverRouter);
app.use("/results", resultsRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/admin", authAdmin, adminRouter);
app.use("/competitions", competitionRouter);
app.use("/status", statusRouter);
app.use("/discord", discordRouter);

generateDiscordCommands(process.env.DISCORD_APP_ID);

app.listen(PORT, () => {
  subscribeToServerStatus();
  console.log("Server is running on port 3000");
});
