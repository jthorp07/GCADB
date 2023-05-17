import { ConnectionPool, Transaction } from "mssql";
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";

async function updateValorantProfile(con: ConnectionPool, guildId: string, userId: string, valorantDisplayName: string, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("UpdateValorantProfile") as BaseDBError;
    if (!guildId || !userId || !valorantDisplayName) return new NullArgError(["GuildId", "UserId", "ValorantDisplayName"], "UpdateValorantProfile");

    let req = initReq(con, trans);
    let result = await req.input("GuildId", guildId)
        .input("UserId", userId)
        .input("ValorantDisplayName", valorantDisplayName)
        .execute("UpdateValorantProfile");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["GuildId", "UserId", "ValorantDisplayName"], "UpdateValorantProfile");
        case 2:
            return new DoesNotExistError("UpdateValorantProfile");
    }
    return new BaseDBError("An unknown error has occurred", -99);
}

export default updateValorantProfile