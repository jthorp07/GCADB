import { ConnectionPool, Transaction, Request } from "mssql"
import { NullArgError, DoesNotExistError, NotConnectedError } from "../errors";
import { DiscordChannelType } from "../enums";
import BaseDBError from "../errors/base-db-error";

/**
 * Writes a newly created Discord channel to the GCA Database
 * 
 * @param con A ConnectionPool that is connected to the GCA Database
 * @param guildId The ID of the Discord server the request is coming from
 * @param channelId The ID of the created Discord channel
 * @param channelName The name of the created Discord channel
 * @param channelType The type of the created Discord channel
 * @param triggerable Whether or not VoiceState changes on the channel should be reacted to
 * @param trans A Transaction on the GCA Database, if this request should be part of one
 */
async function createChannel(con: ConnectionPool, guildId: string, channelId: string, channelName: string, channelType: DiscordChannelType, triggerable?: boolean, trans?: Transaction) {

    if (!con.connected) {
        throw new NotConnectedError("CreateChannel");
    }

    let req: Request;

    if (trans) {
        req = new Request(trans);
    } else {
        req = new Request(con);
    }

    let result = await req.input("GuildId", guildId)
        .input("ChannelId", channelId)
        .input("ChannelName", channelName)
        .input("ChannelType", channelType)
        .input("Triggerable", triggerable)
        .execute("CreateChannel");

    let ret: number = result.returnValue;

    let err: BaseDBError | null;
    err = null;
    switch (ret) {
        case 1:
            err = new NullArgError(["GuildId", "ChannelId", "ChannelName", "ChannelType"], "CreateChannel");
        case 2:
            err = new DoesNotExistError("CreateChannel");
    }

    if (err) return err;
}

export default createChannel;