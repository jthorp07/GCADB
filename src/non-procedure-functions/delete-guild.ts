import { ConnectionPool, Transaction, PreparedStatement, VarChar } from "mssql"
import { NullArgError, DoesNotExistError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";


// TODO: No procedure for this
async function deleteGuild(con: ConnectionPool, guildId: string, trans?: Transaction) {
    
    if (!con.connected) {
        return new NotConnectedError("DeleteGuild");
    }

    if (guildId.length > 21 || guildId.length < 17) {
        return new DataConstraintError(["GuildId"],["Must be greater than 17 and less than 22 characters in length"],"DeleteGuild") as BaseDBError;
    }

    // Request will either be made against a transaction or the connection pool
    let req: PreparedStatement;
    if (trans) {
        req = new PreparedStatement(trans);
    } else {
        req = new PreparedStatement(con);
    }

    await req.input("GuildId", VarChar(21))
        .prepare("DELETE FROM Guild WHERE [Id]=@GuildId");
        
    let result = await req.execute({GuildId:guildId});
    await req.unprepare();
    return result;

}

export default deleteGuild