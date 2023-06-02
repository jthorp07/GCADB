import { ConnectionPool, Transaction, Bit, NVarChar, IRecordSet } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { ValorantRank } from "../enums";

async function getRankRoles(con: ConnectionPool, guildId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetRankRoles") as BaseDBError;
    if (!guildId) return new NullArgError(["GuildId"], "GetRankRoles") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("GuildId", guildId)
        .execute("GetRankRoles");

    switch (result.returnValue) {
        case 0:
            return parseRankRoles(result.recordset);
    }

}

/**
 * Type returned by parseRankRoles:
 * A set of records that represent the VALORANT Ranked
 * Roles set in a Discord server
 */
export type ValorantRankedRolesRecord = {
    roleId: string,
    roleName: ValorantRank,
    orderBy: number,
    roleIcon: string,
    roleEmote: string
}

function parseRankRoles(datum: IRecordSet<any>) {

    let parsedRoles: ValorantRankedRolesRecord[] = [];

    for (let row of datum) {
        parsedRoles.push({
            roleId: row.RoleId,
            roleName: row.RoleName,
            orderBy: row.OrderBy,
            roleIcon: row.RoleIcon,
            roleEmote: row.RoleEmote
        });
    }

    return (parsedRoles.length > 0 ? parsedRoles : null)
}

export default getRankRoles;