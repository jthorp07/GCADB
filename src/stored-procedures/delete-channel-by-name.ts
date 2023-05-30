import { ConnectionPool, Transaction } from "mssql"
import { NullArgError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { DiscordChannelName, GCADBErrorCode } from "../enums";

async function deleteChannelByName(con: ConnectionPool, guildId: string, channelName: DiscordChannelName, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("DeleteChannelByName") as BaseDBError;
    if (guildId.length > 21 || guildId.length < 17) 
        return new DataConstraintError(["GuildId", "ChannelName"],["Must be greater than 17 and less than 22 characters in length", "Must be greater than 17 and less than 22 characters in length"],"DeleteChannelById") as BaseDBError;
    

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("GuildId", guildId)
        .input("ChannelName", channelName)
        .execute("DeleteChannelByName");

    switch (result.returnValue) {
        case 0: return;
        case 1: return new NullArgError(["GuildId", "ChannelName"], "DeleteChannelByName") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);

}

export default deleteChannelByName;