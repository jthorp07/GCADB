import { ConnectionPool, Transaction } from "mssql";
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

async function setCanBeCaptain(con: ConnectionPool, userId: string, guildId: string, canBeCaptain: boolean, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("SetCanBeCaptain") as BaseDBError;
    if (!userId || !guildId || canBeCaptain == null) return new NullArgError(["UserId", "GuildId", "CanBeCaptain"], "SetCanBeCaptain") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("UserId", userId)
        .input("GuildId", guildId)
        .input("CanBeCaptain", canBeCaptain)
        .execute("SetCanBeCaptain");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["UserId", "GuildId", "CanBeCaptain"], "SetCanBeCaptain") as BaseDBError;
    }
    return new BaseDBError("An unknown error has occurred", GCADBErrorCode.UNKNOWN_ERROR);

}

export default setCanBeCaptain;