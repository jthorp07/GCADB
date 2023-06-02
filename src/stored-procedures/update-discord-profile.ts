import { ConnectionPool, Transaction } from "mssql";
import { NullArgError, NotConnectedError, DoesNotExistError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { GCADBErrorCode, ValorantRank } from "../enums";

async function updateDiscordProfile(con: ConnectionPool, guildId: string, userId: string, username: string, isOwner: boolean, guildDisplayName: string, currentRank: ValorantRank | null, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("UpdateDiscordProfile") as BaseDBError;
    if (!guildId || !userId || !username || isOwner == null || !guildDisplayName) return new NullArgError(["GuildId", "UserId", "Username", "IsOwner", "GuildDisplayName"], "UpdateDiscordProfile");

    let req = initReq(con, trans);

    if (req instanceof BaseDBError) {
        return req;
    }

    let result = await req.input("GuildId", guildId)
        .input("UserId", userId)
        .input("Username", username)
        .input("IsOwner", isOwner)
        .input("GuildDisplayName", guildDisplayName)
        .input("CurrentRank", currentRank)
        .input("HasRank", currentRank ? true : false)
        .execute("UpdateDiscordProfile");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["GuildId", "UserId", "Username", "IsOwner", "GuildDisplayName"], "UpdateDiscordProfile");
        case 2:
            return new DoesNotExistError("UpdateDiscordProfile");
        case 3:
            return new DataConstraintError(["Username", "GuildDisplayName", "CurrentRank"], 
                ["Must be a string between 3 and 32 characters", "Must be a string between 3 and 32 characters", "Must be of type 'ValorantRank' (see import ValorantRank)"], 
                "UpdateDiscordProfile");
    }
    return new BaseDBError("An unknown error occurred", GCADBErrorCode.UNKNOWN_ERROR);
}

export default updateDiscordProfile;