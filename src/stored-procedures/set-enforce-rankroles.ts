import { ConnectionPool, IRecordSet, NVarChar, Transaction } from "mssql";
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

async function setEnforceRankRoles(con: ConnectionPool, guildId: string, enforce: boolean, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("SetEnforceRankRoles") as BaseDBError;
    if (!guildId || enforce == null) return new NullArgError(["GuildId", "Enforce"], "SetEnforceRankRoles") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("GuildId", guildId)
        .input("Enforce", enforce)
        .execute("SetEnforceRankRoles");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["GuildId", "Enforce"], "SetEnforceRankRoles") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default setEnforceRankRoles;