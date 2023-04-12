import { ConnectionPool, Transaction, Request } from "mssql"
import { NullArgError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";

async function deleteChannelByName(con: ConnectionPool, guildId: string, channelId: string, trans?: Transaction) {

    if (!con.connected) {
        return new NotConnectedError("DeleteChannelById") as BaseDBError;
    }

    if (guildId.length > 21 || guildId.length < 17) {
        return new DataConstraintError(["GuildId", "ChannelId"],["Must be greater than 17 and less than 22 characters in length", "Must be greater than 17 and less than 22 characters in length"],"DeleteChannelById") as BaseDBError;
    }

    let req: Request;
    if (trans) {
        req = new Request(trans);
    } else {
        req = new Request(con);
    }

    let result = await req.input("GuildId", guildId)
        .input("ChannelName", channelId)
        .execute("DeleteChannelById");

    switch (result.returnValue) {
        case 0: return;
        case 1: return new NullArgError(["GuildId", "ChannelId"], "DeleteChannelById") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", -99);

}

export default deleteChannelByName;