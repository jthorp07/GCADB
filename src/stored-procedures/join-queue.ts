import { ConnectionPool, Transaction, Bit, Int, NVarChar, IRecordSet } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { QueueState } from "../enums";
import { parseGetQueueRecordsets } from "./get-queue";

async function joinQueue(con: ConnectionPool, userId: string, guildId: string, queueId: number, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("JoinQueue") as BaseDBError;
    if (!userId || !guildId || !queueId) return new NullArgError(["UserId", "GuildId", "QueueId"], "JoinQueue") as BaseDBError;

    let req = initReq(con, trans);
    let result = await req.input("UserId", userId)
        .input("GuildId", guildId)
        .input("QueueId", queueId)
        .output("NumPlayers", Int)
        .output("NumCaptains", Int)
        .output("QueueStatus", NVarChar(100))
        .execute("JoinQueue");

    switch (result.returnValue) {
        case 0:
            return {
                numPlayers: result.output.NumPlayers as number,
                numCaptains: result.output.NumCaptains as number,
                queueStatus: result.output.QueueStatus as QueueState,
                records: parseGetQueueRecordsets(result.recordsets as IRecordSet<any>)
            };
        case 1:
            return new NullArgError(["UserId", "GuildId", "QueueId"], "JoinQueue") as BaseDBError;
        case 2:
            return new DoesNotExistError("JoinQueue");
        case 5:
            return new BaseDBError("Target user is missing required rank role", 5);
        case 6:
            return new BaseDBError("Target user is already in queue", 6);
    }
    return new BaseDBError("An unknown error occurred", -99);
}

export default joinQueue;