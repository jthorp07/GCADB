import { ConnectionPool, Transaction } from "mssql"
import { NullArgError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

async function deleteChannelById(con: ConnectionPool, guildId: string, channelId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("DeleteChannelById") as BaseDBError;
    if (guildId.length > 21 || guildId.length < 17) return new DataConstraintError(["GuildId", "ChannelId"],
                                                                    ["Must be greater than 17 and less than 22 characters in length", "Must be greater than 17 and less than 22 characters in length"],
                                                                    "DeleteChannelById") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("GuildId", guildId)
        .input("ChannelId", channelId)
        .execute("DeleteChannelById");

    switch (result.returnValue) {
        case 0: return;
        case 1: return new NullArgError(["GuildId", "ChannelId"], "DeleteChannelById") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);

}

export default deleteChannelById;