import { ConnectionPool, Transaction, Bit, NVarChar, IRecordSet } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { ValorantRank } from "../enums";

async function getRankRoles(con: ConnectionPool, guildId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetRankRoles") as BaseDBError;
    if (!guildId) return new NullArgError(["GuildId"], "GetRankRoles") as BaseDBError;

    let req = initReq(con, trans);
    let result = await req.input("GuildId", guildId)
        .execute("GetRankRoles");

    return parseRankRoles(result.recordset);
}

function parseRankRoles(datum: IRecordSet<any>) {

    let parsedRoles: {
        roleId: string,
        roleName: ValorantRank,
        orderBy: number,
        roleIcon: string,
        roleEmote: string
    }[] = [];

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