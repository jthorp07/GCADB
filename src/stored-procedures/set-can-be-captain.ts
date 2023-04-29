import { ConnectionPool, Transaction, Bit, Int, NVarChar, IRecordSet, VarChar } from "mssql";
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";

async function setCanBeCaptain(con: ConnectionPool, userId: string, guildId: string, canBeCaptain: boolean, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("SetCanBeCaptain") as BaseDBError;
    if (!userId || !guildId || !canBeCaptain) return new NullArgError(["UserId", "GuildId", "CanBeCaptain"], "SetCanBeCaptain") as BaseDBError;

    let req = initReq(con, trans);
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
    return new BaseDBError("An unknown error has occurred", -99);

}

export default setCanBeCaptain;