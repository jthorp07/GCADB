import { ConnectionPool, Transaction, NVarChar, IRecordSet } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode, ValorantRank } from "../enums";

async function getProfile(con: ConnectionPool, userId: string, guildId: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetProfile") as BaseDBError;
    if (!userId || !guildId) return new NullArgError(["UserId", "GuildId"], "GetProfile") as BaseDBError;

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("UserId", userId)
        .input("GuildId", guildId)
        .output("CurrentRank", NVarChar(100))
        .execute("GetProfile");

    switch (result.returnValue) {
        case 0:
            return {
                currentRank: result.output.CurrentRank as ValorantRank,
                records: parseGetProfileRecords(result.recordset)
            }
        case 1:
            return new NullArgError(["UserId", "GuildId"], "GetProfile") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

function parseGetProfileRecords(recordset: IRecordSet<any>) {
    return {
        isPremium: recordset[0].IsPremium as boolean,
        isOwner: recordset[0].IsOwner as boolean,
        discordUsername: recordset[0].Username as string,
        discordGuildName: recordset[0].GuildName as string,
        discordDisplayName: recordset[0].DisplayName as string,
        valorantDisplayName: recordset[0].ValorantName as string,
        valorantRoleName: recordset[0].ValorantRoleName as string,
        hasValorantRank: recordset[0].Ranked as boolean,
        canBeCaptain: recordset[0].CanBeCaptain as boolean
    } as GetProfileRecord;
}

export default getProfile;
export type GetProfileRecord = {
    isPremium: boolean,
    isOwner: boolean,
    discordUsername: string,
    discordGuildName: string,
    discordDisplayName: string,
    valorantDisplayName: string,
    valorantRoleName: string,
    hasValorantRank: boolean,
    canBeCaptain: boolean
}