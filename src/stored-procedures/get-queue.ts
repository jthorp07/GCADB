import { ConnectionPool, Transaction, Request, NVarChar, VarChar, Int, IRecordSet } from "mssql"
import { NullArgError, NotConnectedError, DoesNotExistError } from "../errors";
import BaseDBError from "../errors/base-db-error";
import { QueueState } from "../enums";
import { initReq } from ".";

async function getQueue(con: ConnectionPool, queueId: number, trans?: Transaction) {

    if (!con.connected) return new NotConnectedError("GetQueue") as BaseDBError;
    if (!queueId) return new NullArgError(["QueueId"], "GetQueue") as BaseDBError;
    
    let req = initReq(con, trans);

    let result = await req.input("QueueId", queueId)
        .output("NumCaptains", Int)
        .output("PlayerCount", Int)
        .output("QueueStatus", NVarChar(100))
        .output("HostId", VarChar(22))
        .execute("GetQueue");

    switch (result.returnValue) {
        case 0:
            return {
                captainCount: result.output.NumCaptains as number,
                playerCount: result.output.PlayerCount as number,
                queueStatus: result.output.QueueStatus as QueueState,
                hostId: result.output.hostId as string,
                records: parseGetQueueRecordsets(result.recordsets as IRecordSet<any>[])
            }
        case 1:
            return new NullArgError(["QueueId"], "GetQueue") as BaseDBError;
        case 2:
            return new DoesNotExistError("GetQueue") as BaseDBError;
    }
    return new BaseDBError("An unknown error has occurred", -99);

}

/**
 * This function WILL crash if given a recordset from any
 * request that is not the GetQueue procedure
 * 
 * @param datum The mssql recordsets from a call to the GetQueue procedure
 */
export function parseGetQueueRecordsets(datum: IRecordSet<any>[]) {

    // Index 0: All players in queue AS: {PlayerId, GuildId, CanBeCaptain, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon}
    let allPlayers = [] as {playerId: string, canBeCaptain: boolean, guildId: string, discordDisplayName: string, valorantDisplayName: string, roleName: string, roleEmote: string, roleIcon: string}[];
    for (let i = 0; i < datum[0].length; i++) {
        allPlayers.push({
            playerId: datum[0][i].PlayerId,
            canBeCaptain: datum[0][i].CanBeCaptain,
            guildId: datum[0][i].GuildId,
            discordDisplayName: datum[0][i].DiscordDisplayName,
            valorantDisplayName: datum[0][i].ValorantDisplayName,
            roleName: datum[0][i].RoleName,
            roleEmote: datum[0][i].RoleEmote,
            roleIcon: datum[0][i].RoleIcon,
        });
    }

    // Index 1: Available players in queue AS { PlayerId, GuildId, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon }
    let availablePlayers = [] as {playerId: string, guildId: string, discordDisplayName: string, valorantDisplayName: string, roleName: string, roleEmote: string, roleIcon: string}[];
    for (let i = 0; i < datum[0].length; i++) {
        availablePlayers.push({
            playerId: datum[0][i].PlayerId,
            guildId: datum[0][i].GuildId,
            discordDisplayName: datum[0][i].DiscordDisplayName,
            valorantDisplayName: datum[0][i].ValorantDisplayName,
            roleName: datum[0][i].RoleName,
            roleEmote: datum[0][i].RoleEmote,
            roleIcon: datum[0][i].RoleIcon,
        });
    }

    // Index 2: Team One roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon }
    let teamOne = [] as {playerId: string, isCaptain: boolean, guildId: string, discordDisplayName: string, valorantDisplayName: string, roleName: string, roleEmote: string, roleIcon: string}[];
    for (let i = 0; i < datum[2].length; i++) {
        teamOne.push({
            playerId: datum[2][i].PlayerId,
            isCaptain: datum[2][i].IsCaptain,
            guildId: datum[2][i].GuildId,
            discordDisplayName: datum[2][i].DiscordDisplayName,
            valorantDisplayName: datum[2][i].ValorantDisplayName,
            roleName: datum[2][i].RoleName,
            roleEmote: datum[2][i].RoleEmote,
            roleIcon: datum[2][i].RoleIcon,
        });
    }

    // Index 3: Team Two roster AS { PlayerId, GuildId, IsCaptain, DiscordDisplayName, ValorantDisplayName, RoleName, RoleEmote, RoleIcon }   
    let teamTwo = [] as {playerId: string, isCaptain: boolean, guildId: string, discordDisplayName: string, valorantDisplayName: string, roleName: string, roleEmote: string, roleIcon: string}[];
    for (let i = 0; i < datum[3].length; i++) {
        teamTwo.push({
            playerId: datum[3][i].PlayerId,
            isCaptain: datum[3][i].IsCaptain,
            guildId: datum[3][i].GuildId,
            discordDisplayName: datum[3][i].DiscordDisplayName,
            valorantDisplayName: datum[3][i].ValorantDisplayName,
            roleName: datum[3][i].RoleName,
            roleEmote: datum[3][i].RoleEmote,
            roleIcon: datum[3][i].RoleIcon,
        });
    }

    return {
        allPlayers: allPlayers,
        availablePlayers: availablePlayers,
        teamOne: teamOne,
        teamTwo: teamTwo
    };
}

export default getQueue;