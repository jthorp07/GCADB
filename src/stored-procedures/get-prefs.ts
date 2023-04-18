import { ConnectionPool, Transaction, Bit } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";

async function getPrefs(con: ConnectionPool, userId: string, guildId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetPrefs") as BaseDBError;
    if (!userId || !guildId) return new NullArgError(["UserId", "GuildId"], "GetPrefs") as BaseDBError;

    let req = initReq(con, trans);
    let result = await req.input("UserId", userId)
        .input("GuildId", guildId)
        .output("CanBeCaptain", Bit)
        .execute("GetPrefs");

    switch (result.returnValue) {
        case 0:
            return {
                canBeCaptain: result.output.CanBeCaptain as boolean
            }
        case 1:
            return new NullArgError(["UserId", "GuildId"], "GetPrefs") as BaseDBError;
        case 2:
            return new DoesNotExistError("GetPrefs") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", -99);
}

export default getPrefs;