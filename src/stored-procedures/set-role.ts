import { ConnectionPool, Transaction } from "mssql";
import { NullArgError, NotConnectedError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { DiscordMemberRole, DiscordStaffRole, ValorantRank } from "../enums";

async function setRole(con: ConnectionPool, guildId: string, roleId: string, roleName: DiscordMemberRole | DiscordStaffRole | ValorantRank, orderBy: number, roleIcon: string, roleEmote: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("SetRole") as BaseDBError;
    if (!guildId || !roleId || !roleName) return new NullArgError(["GuildId", "RoleId", "RoleName"], "SetRole") as BaseDBError;

    let req = initReq(con, trans);
    let result = await req.input("GuildId", guildId)
        .input("RoleId", roleId)
        .input("RoleName", roleName)
        .input("OrderBy", orderBy)
        .input("RoleIcon", roleIcon)
        .input("RoleEmote", roleEmote)
        .execute("SetRole");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["GuildId", "RoleId", "RoleName"], "SetRole") as BaseDBError;
    }
    return new BaseDBError("An unknown error has occurred", -99);
}

export default setRole;