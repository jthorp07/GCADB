import { ConnectionPool, Transaction, Bit, Int, NVarChar, IRecordSet } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { QueuePool } from "../enums";

async function leaveTenmans(con: ConnectionPool, queueId: number, guildId: string, userId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("LeaveTenmans") as BaseDBError;
    if (!queueId || !guildId) return new NullArgError(["QueueId", "GuildId"], "LeaveTenmans") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("QueueId", queueId)
        .input("GuildId", guildId)
        .input("UserId", userId)
        .output("WasCaptain", Bit)
        .output("QueuePool", NVarChar(100))
        .execute("LeaveTenmans");

    switch (result.returnValue) {
        case 0:
            return {
                wasCaptain: result.output.WasCaptain as boolean,
                queuePool: result.output.QueuePool as QueuePool
            }
        case 1:
            return new NullArgError(["QueueId", "GuildId"], "LeaveTenmans") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", -99);
}

export default leaveTenmans;