import { ConnectionPool, Transaction, Request } from "mssql";
import { NullArgError, DoesNotExistError, AlreadyExistsError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";

/**
 * Writes a Discord GuildMember's information on the GCA Database.
 * A GuildMember represents a Discord user and their unique profile
 * within a target Discord guild.
 * 
 * Returns void on success; BaseDBError on failure
 * 
 * @param con ConnectionPool connected to the GCA Database
 * @param guildId Discord ID of target guild
 * @param userId Discord ID of target Discord user
 * @param isOwner True if target Discord user is the owner of the target Guild
 * @param username Username of target Discord user
 * @param guildDisplayName Display name of target Discord user in target guild
 * @param valorantRankRoleName Likely to be deprecated
 * @param trans Database transaction to run this request against
 * @returns 
 */
async function createGuildMember(con: ConnectionPool, guildId: string, userId: string, isOwner: boolean, username: string, guildDisplayName: string, valorantRankRoleName: string, trans?: Transaction) {

    // Validate
    if (guildId.length > 21 || userId.length > 21) {
        return new DataConstraintError(['GuildId', 'UserId', 'GuildDisplayName'],
            ['Must be between 17 and 21 characters', 'Must be between 17 and 21 characters', 'Must be between 3 and 32 characters'],
            'CreateGuildMember');
    }

    if (guildDisplayName.length > 32 || guildDisplayName.length < 3) {
        return new DataConstraintError(['GuildId', 'UserId', 'GuildDisplayName'],
            ['Must be between 17 and 21 characters', 'Must be between 17 and 21 characters', 'Must be between 3 and 32 characters'],
            'CreateGuildMember');
    }

    if (!con.connected) {
        return new NotConnectedError("CreateGuildMember");
    }

    let req: Request;
    if (trans) {
        req = new Request(trans);
    } else {
        req = new Request(con);
    }

    let result = await req.input('GuildId', guildId)
        .input('UserId', userId)
        .input('Username', username)
        .input('IsOwner', isOwner)
        .input('GuildDisplayName', guildDisplayName)
        .input('ValorantRankRoleName', valorantRankRoleName)
        .execute('CreateGuildMember');

    let retVal = result.returnValue;
    let retErr: BaseDBError;

    switch (retVal) {
        case 1:
            retErr = new NullArgError(['GuildId', 'UserId', 'GuildDisplayName', 'IsOwner'], 'CreateGuildMember');
            break;
        case 2:
            retErr = new DoesNotExistError('CreateGuildMember');
            break;
        case 3:
            retErr = new AlreadyExistsError('CreateGuildMember');
            break;
    }

    if (retErr) return retErr;

}

export default createGuildMember;