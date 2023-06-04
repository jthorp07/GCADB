import { ConnectionPool, Transaction, PreparedStatement, VarChar, Int } from "mssql"
import { NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";


// TODO: No procedure for this
async function getDraftPickId(con: ConnectionPool, userId: string, queueId: number, trans?: Transaction) {
    
    if (!con.connected) {
        return new NotConnectedError("GetDraftPickId");
    }

    if (userId.length > 21 || userId.length < 17) {
        return new DataConstraintError(["UserId"],["Must be greater than 17 and less than 22 characters in length"],"GetDraftPickId") as BaseDBError;
    }

    // Request will either be made against a transaction or the connection pool
    let req: PreparedStatement;
    if (trans) {
        req = new PreparedStatement(trans);
    } else {
        req = new PreparedStatement(con);
    }

    await req.input("UserId", VarChar(21))
        .input("QueueId", Int)
        .prepare("SELECT DraftPickId FROM Queues WHERE [Id]=@QueueId");
        
    let result = await req.execute({QueueId: queueId});
    let pickId = result.recordset[0].DraftPickId as string;
    await req.unprepare();
    return {
        yourTurn: pickId==userId,
        pickId: pickId
    };

}

export default getDraftPickId