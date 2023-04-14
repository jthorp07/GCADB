import { ConnectionPool, Transaction, Request, VarChar, Bit } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { DiscordChannelName, DiscordChannelType } from "../enums";
import { initReq } from ".";

async function getChannel(con: ConnectionPool, guildId: string, channelName: DiscordChannelName, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetChannel") as BaseDBError;
    if (!channelName || !guildId) return new NullArgError(["GuildId", "ChannelName"], "GetChannel") as BaseDBError;

    let req = initReq(con, trans);

    let result = await req.input("GuildId", guildId)
        .input("ChannelName", channelName)
        .output("ChannelId", VarChar(22))
        .output("Triggerable", Bit)
        .output("Type", VarChar(20))
        .execute("GetChannel");

    switch (result.returnValue) {
        case 0:
            return {
                channelId: result.output.ChannelId as string,
                triggerable: result.output.Triggerable as boolean,
                channelType: result.output.Type as DiscordChannelType
            }
        case 1:
            return new NullArgError(["GuildId", "ChannelName"], "GetChannel") as BaseDBError;
        case 2:
            return new DoesNotExistError("GetChannel") as BaseDBError;
    }

    return new BaseDBError("An unknown error has occurred", -99);

}

export default getChannel;