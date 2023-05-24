import { ConnectionPool, Transaction } from "mssql"
import { NullArgError, DoesNotExistError, NotConnectedError, DataConstraintError, AlreadyExistsError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";

/**
 * Writes a new guild to the GCA Database
 * 
 * @param con ConnectionPool connected to the GCA Database
 * @param guildId Discord ID of target guild
 * @param guildName Name of target guild
 * @param trans Database transaction to run this procedure against
 * @returns BaseDBError upon failure, void upon success
 */
async function createGuild(con: ConnectionPool, guildId: string, guildName: string, trans?: Transaction) {

    if (guildName.length > 32 || guildName.length < 3 || guildId.length > 21 || guildId.length < 17) return new DataConstraintError(["GuildName", "GuildId"],["Must be greater than 2 and less than 33 characters in length", "Must be greater than 17 and less than 22 characters in length"],"CreateGuild");
    if (!con.connected) return new NotConnectedError("CreateGuild");
    
    let req = initReq(con, trans);

    let result = await req.input("GuildId", guildId)
        .input("GuildName", guildName)
        .execute("CreateGuild");

    let ret: number = result.returnValue;


    switch (ret) {
        case 0:
            return;
        case 1:
            return new NullArgError(["GuildId"], "CreateGuild") as BaseDBError;
        case 2:
            return new DoesNotExistError("CreateGuild") as BaseDBError;
        case 3:
            return new AlreadyExistsError("CreateGuild");
    }

    return new BaseDBError("An unknown error occurred", -99);
}

export default createGuild;