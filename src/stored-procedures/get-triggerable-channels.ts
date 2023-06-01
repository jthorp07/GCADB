import { ConnectionPool, Transaction, Bit } from "mssql"
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

async function getTriggerableChannels(con: ConnectionPool, guildId: string, channelId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetTriggerableChannels") as BaseDBError;
    if (!channelId || !guildId) return new NullArgError(["ChannelId", "GuildId"], "GetTriggerableChannels") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input('GuildId', guildId)
        .input('ChannelId', channelId)
        .output("IsTriggerable", Bit)
        .execute('GetTriggerableChannels');

    switch (result.returnValue) {
        case 0:
            return result.output.IsTriggerable as boolean
        case 1:
            return new NullArgError(["UserId", "GuildId"], "GetTriggerableChannels") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default getTriggerableChannels;