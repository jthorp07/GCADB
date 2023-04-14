import { ConnectionPool, Transaction, Request, NVarChar, VarChar, IRecordSet } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { QueueState, QueuePool } from "../enums";
import { parseGetQueueRecordsets } from "./get-queue";
import { initReq } from ".";

async function draftPlayer(con: ConnectionPool, playerId: string, guildId: string, queueId: number, queueStatus: string, hostId: string, team: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("DraftPlayer") as BaseDBError;
    if (!playerId || !guildId || !queueId) return new NullArgError(["PlayerId", "GuildId", "QueueId"], "DraftPlayer") as BaseDBError;
    
    let req = initReq(con, trans);

    let result = await req.input("PlayerId", playerId)
        .input("GuildId", guildId)
        .input("QueueId", queueId)
        .output("QueueStatus", NVarChar(100))
        .output("HostId", VarChar(22))
        .output("Team", NVarChar(100))
        .execute("DraftPlayer");

    switch (result.returnValue) {
        case 0:
            return {
                queueStatus: result.output.QueueStatus as QueueState,
                hostId: result.output.HostId as string,
                team: result.output.Team as QueuePool,
                records: parseGetQueueRecordsets(result.recordsets as IRecordSet<any>[])
            }
        case 1:
            return new NullArgError(["PlayerId", "GuildId", "QueueId"], "DraftPlayer") as BaseDBError;
        case 2:
            return new DoesNotExistError("DraftPlayer") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", -99);
}

export default draftPlayer;