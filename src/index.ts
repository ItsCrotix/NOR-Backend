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
import generateDiscordCommands from "./discord/commands";
import { VerifyDiscordRequest } from "./discord/utils";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(`/api-docs`, swaggerUI.serve, swaggerUI.setup(swaggerSpec));
const apiRouter = express.Router();
const discordApiRouter = express.Router();

app.use("/api", apiRouter);
app.use("/discord", discordApiRouter);

app.use(cors());
app.use(cookieParser());

apiRouter.use(express.json());
apiRouter.use("/drivers", authUser, driverRouter);
apiRouter.use("/results", resultsRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/admin", authAdmin, adminRouter);
apiRouter.use("/competitions", competitionRouter);
apiRouter.use("/status", statusRouter);

discordApiRouter.use(
  express.json({ verify: VerifyDiscordRequest(process.env.DISCORD_PUBLIC_KEY) })
);

discordApiRouter.use(discordRouter);

generateDiscordCommands(process.env.DISCORD_APP_ID);

app.listen(PORT, () => {
  subscribeToServerStatus();
  console.log("Server is running on port 3000");
});
