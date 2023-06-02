import { ConnectionPool, Transaction, VarChar, NVarChar } from "mssql"
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode, ValorantRank } from "../enums";

async function getUserValRank(con: ConnectionPool, guildId: string, userId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetUserValRank") as BaseDBError;
    if (!userId || !guildId) return new NullArgError(["UserId", "GuildId"], "GetUserValRank") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("GuildId", guildId)
        .input("UserId", userId)
        .output("RoleIcon", VarChar(255))
        .output("RoleEmote", VarChar(57))
        .output("RoleName", NVarChar(100))
        .execute('GetUserValRank');

    switch (result.returnValue) {
        case 0:
            return {
                roleEmote: result.output.RoleEmote || null,
                roleIcon: result.output.RoleIcon || null,
                roleName: result.output.RoleName || null
            } as {
                roleEmote: string | null,
                roleIcon: string | null,
                roleName: ValorantRank | null
            }
        case 1:
            return new NullArgError(["UserId", "GuildId"], "GetUserValRank") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default getUserValRank;