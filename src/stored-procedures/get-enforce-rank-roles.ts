import { ConnectionPool, Transaction, Request, Bit } from "mssql"
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

async function getEnforceRankRoles(con: ConnectionPool, guildId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetEnforceRankRoles") as BaseDBError;
    if (!guildId) return new NullArgError(["GuildId"], "GetEnforceRankRoles") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("GuildId", guildId)
        .output("Enforce", Bit)
        .execute("GetEnforceRankRoles");

    switch (result.returnValue) {
        case 0:
            return result.output.Enforce as boolean;
        case 1:
            return new NullArgError(["GuildId"], "GetEnforceRankRoles") as BaseDBError;
    }
    return new BaseDBError("An unknown error has occurred", GCADBErrorCode.UNKNOWN_ERROR);

}

export default getEnforceRankRoles;