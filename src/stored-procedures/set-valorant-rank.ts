import { ConnectionPool, Transaction } from "mssql";
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { initReq } from ".";
import { ValorantRank } from "../enums";

async function setValorantRank(con: ConnectionPool, guildId: string, userId: string, rank: ValorantRank, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("SetValorantRank") as BaseDBError;
    if (!userId || !guildId || !rank) return new NullArgError(["GuildId", "UserId", "Rank"], "SetValorantRank") as BaseDBError;

    let req = initReq(con, trans);
    let result = await req.input("GuildId", guildId)
        .input("UserId", userId)
        .input("Rank", rank)
        .execute("SetValorantRank");

    switch (result.returnValue) {
        case 0:
            return;
        case 1:
            return new NullArgError(["GuildId", "UserId", "Rank"], "SetValorantRank") as BaseDBError;
        case 2:
            return new DoesNotExistError("SetValorantRank") as BaseDBError;
    }
    return new BaseDBError("An unknown error occurred", -99);
}

export default setValorantRank;