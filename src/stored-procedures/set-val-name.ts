import { ConnectionPool, Transaction } from "mssql";
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

async function setValName(con: ConnectionPool, valName: string, userId: string, guildId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("SetValName") as BaseDBError;
    if (!valName || !userId || !guildId) return new NullArgError(["ValName", "UserId", "GuildId"], "SetValName") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("ValName", valName)
        .input("UserId", userId)
        .input("GuildId", guildId)
        .execute("SetValName");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["ValName", "UserId", "GuildId"], "SetValName") as BaseDBError;
        case 2:
            return new DoesNotExistError("SetValName") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default setValName;