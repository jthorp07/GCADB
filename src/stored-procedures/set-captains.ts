import { ConnectionPool, IRecordSet, NVarChar, Transaction } from "mssql";
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode, QueueState } from "../enums";
import { parseGetQueueRecordsets } from "./get-queue";

async function setCaptain(con: ConnectionPool, queueId: number, capOne: string, capTwo: string, guildId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("SetCaptain") as BaseDBError;
    if (!queueId || !capOne || !capTwo || !guildId) return new NullArgError(["QueueId", "CapOne", "CapTwo", "GuildId"], "SetCaptain") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("QueueId", queueId)
        .input("CapOne", capOne)
        .input("CapTwo", capTwo)
        .input("GuildId", guildId)
        .output("QueueStatus", NVarChar(100))
        .execute("SetCaptains");

    switch (result.returnValue) {
        case 0:
            return {
                queueStatus: result.output.QueueStatus as QueueState,
                records: parseGetQueueRecordsets(result.recordsets as IRecordSet<any>)
            }
        case 1:
            return new NullArgError(["QueueId", "CapOne", "CapTwo", "GuildId"], "SetCaptain") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default setCaptain;