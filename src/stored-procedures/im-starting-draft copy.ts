import { ConnectionPool, Transaction, Bit } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode } from "../enums";

// returns OUTPUT.EnforceRankRoles
async function imStartingDraft(con: ConnectionPool, queueId: number, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("ImManuallyStartingDraft") as BaseDBError;
    if (!queueId) return new NullArgError(["QueueId"], "ImManuallyStartingDraft") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }
    let result = await req.input("QueueId", queueId)
        .output("EnforceRankRoles", Bit)
        .execute("ImManuallyStartingDraft");

    switch (result.returnValue) {
        case 0:
            return {success: true, enforce: result.output.EnforceRankRoles as boolean};
        case 1:
            return new NotConnectedError("ImManuallyStartingDraft") as BaseDBError;
        case 2:
            return new DoesNotExistError("ImManuallyStartingDraft");
        case -1:
            return {success: false, enforce: false};
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default imStartingDraft;