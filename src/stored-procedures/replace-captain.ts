import { ConnectionPool, Transaction, Bit, Int, NVarChar, IRecordSet, VarChar } from "mssql";
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";

async function replaceCaptain(con: ConnectionPool, queueId: number, queuePool: number, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("ReplaceCaptain") as BaseDBError;
    if (!queueId || !queuePool) return new NullArgError(["QueueId", "QueuePool"], "ReplaceCaptain") as BaseDBError;

    let req = initReq(con, trans);
    let result = await req.input("QueueId", queueId)
        .input("QueuePool", queuePool)
        .execute("ReplaceCaptain");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["QueueId", "QueuePool"], "ReplaceCaptain") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", -99);
}

export default replaceCaptain;