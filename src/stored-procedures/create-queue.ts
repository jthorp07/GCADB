import { ConnectionPool, Transaction, Request, Int } from "mssql"
import { NullArgError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";

/**
 * 
 * @param con ConnectionPool
 * @param guildId 
 * @param hostId 
 * @param queueType 
 * @param queueId 
 * @param trans 
 * @returns 
 */
async function createQueue(con: ConnectionPool, guildId: string, hostId: string, queueType: string, queueId: number, trans?: Transaction) {

    // Validate
    if (!con.connected) {
        return new NotConnectedError("CreateQueue") as BaseDBError;
    }

    if (guildId.length < 17 || guildId.length > 21 || hostId.length < 17 || hostId.length > 21) {
        return new DataConstraintError(["GuildId","HostId"],["Must be greater than 16 characters and less than 22 characters","Must be greater than 16 characters and less than 22 characters"],"CreateQueue") as BaseDBError;
    }

    let req: Request;
    if (trans) {
        req = new Request(trans);
    } else {
        req = new Request(con);
    }

    let result = await req.input("GuildId", guildId)
        .input("HostId", hostId)
        .input("QueueType", queueType)
        .output("QueueId", Int)
        .execute("CreateQueue");

    switch (result.returnValue) {
        case 0:
            return parseInt(result.output.QueueId);
        case 1:
            return new NullArgError(["HostId", "QueueId"], "CreateQueue");
        case 5: 
            return new BaseDBError("For the type of queue provided, procedure argument HostId cannot be null", 5);
    }
    return new BaseDBError("An unknown error occured", -99);

}

export default createQueue