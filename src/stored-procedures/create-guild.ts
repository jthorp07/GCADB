import { ConnectionPool, Transaction, Request } from "mssql"
import { NullArgError, DoesNotExistError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";

async function createGuild(con: ConnectionPool, guildId: string, guildName: string, trans?: Transaction) {

    if (guildName.length > 32 || guildName.length < 3) {
        throw new DataConstraintError(["GuildName"],["Must be greater than 2 and less than 32 characters in length"],"CreateGuild");
    }

    if (!con.connected) {
        throw new NotConnectedError("CreateGuild");
    }

    let req: Request;

    if (trans) {
        req = new Request(trans);
    } else {
        req = new Request(con);
    }

    let result = await req.input("GuildId", guildId)
        .input("GuildId", guildId)
        .input("GuildName", guildName)
        .execute("CreateGuild");

    let ret: number = result.returnValue;
    let err: BaseDBError;

    switch (ret) {
        case 1:
            err = new NullArgError(["GuildId"], "CreateGuild");
        case 2:
            err = new DoesNotExistError("CreateGuild");
    }
}

export default createGuild;