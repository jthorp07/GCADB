import { ConnectionPool, Transaction, Bit, Int, NVarChar, IRecordSet, VarChar } from "mssql"
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode, QueueState } from "../enums";
import { parseGetQueueRecordsets } from "./get-queue";

async function pickMap(con: ConnectionPool, queueId: number, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("PickMap") as BaseDBError;
    if (!queueId) return new NullArgError(["QueueId"], "PickMap") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("QueueId", queueId)
        .output("NumCaptains", Int)
        .output("PlayerCount", Int)
        .output("QueueStatus", NVarChar(100))
        .output("HostId", VarChar(22))
        .execute("PickMap");

    switch (result.returnValue) {
        case 0:
            return {
                numCaptains: result.output.NumCaptains as number,
                playerCount: result.output.PlayerCount as number,
                queueStatus: result.output.QueueStatus as QueueState,
                hostId: result.output.HostId as string,
                records: parseGetQueueRecordsets(result.recordsets as IRecordSet<any>)
            };
        case 1:
            return new NullArgError(["QueueId"], "PickMap") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default pickMap;