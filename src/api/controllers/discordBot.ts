import { DiscordRequest } from "../../lib/discordUtils";
import discordCommands from "../../lib/discordCommands";
import { InteractionType, InteractionResponseType } from "discord-interactions";
import { Request, Response, NextFunction } from "express";
import { characterSheetBotCommandResponse } from "./botChar";

const appId = process.env.BOT_APP_ID;
const globalEndpoint = `applications/${appId}/commands`;

async function getCommands(_req: Request, res: Response, _next: NextFunction) {
  try {
    const discordRes = await DiscordRequest(globalEndpoint, {
      method: "GET",
    });
    const result = await discordRes;
    return res.send(result);
  } catch (err) {
    return res.send({ message: "Failed to get slash commands", error: err });
  }
}

async function deleteCommand(req: Request, res: Response, _next: NextFunction) {
  try {
    const discordRes = await DiscordRequest(
      `${globalEndpoint}/${req.params.id}`,
      {
        method: "DELETE",
      }
    );

    const resJson = await discordRes;

    return res.send({ message: "deleted", details: resJson });
  } catch (err) {
    return res.send({ message: "Failed to get delete command", error: err });
  }
}

interface CreateCommandsResponseObject {
  slashCommandName: string;
  res?: Response | unknown;
  message: string;
  error?: any;
}

async function createCommands(
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const slashCommandsList = [
    // "help",
    "character_sheet",
  ];

  const responseList: CreateCommandsResponseObject[] = [];

  await Promise.all(
    slashCommandsList.map(async (slashCommandName: string) => {
      const commandBody = await discordCommands(slashCommandName);

      try {
        if (!commandBody) throw { message: "missing command body" };
        // Send HTTP request with bot token
        const res = await DiscordRequest(globalEndpoint, {
          method: "POST",
          body: commandBody,
        });

        responseList.push({ slashCommandName, res, message: "success" });
      } catch (err) {
        console.log(err);
        responseList.push({ slashCommandName, error: err, message: "Failed" });
      }
    })
  );
  return res.send({ list: responseList });
}

async function interactionsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Interaction type and data
    const { type, data } = req.body;
    // handle verification
    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }
    // Handle slash command requests
    if (type === InteractionType.APPLICATION_COMMAND) {
      switch (data.name) {
        case "help":
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content:
                "Please visit this documentation site to better understand the usage of the commands",
            },
          });
        case "cs":
          return characterSheetBotCommandResponse(req, res);
        default:
          throw { message: "Missing command name" };
      }
    } else return;
  } catch (err) {
    console.log(err);
    return next(err);
  }
}

export { getCommands, deleteCommand, createCommands, interactionsController };
