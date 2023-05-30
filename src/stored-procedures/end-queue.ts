import { ConnectionPool, Transaction, Request } from "mssql"
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

async function endQueue(con: ConnectionPool, queueId: number, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("EndQueue") as BaseDBError;
    if (!queueId) return new NullArgError(["QueueId"], "EndQueue") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("QueueId", queueId)
        .execute("EndQueue");

    if (result.returnValue != 0) return new BaseDBError("An unknown error has occured", GCADBErrorCode.UNKNOWN_ERROR);

}

export default endQueue;