import { ConnectionPool, Transaction, Request } from "mssql";
import { NullArgError, DoesNotExistError, NotConnectedError, DataConstraintError } from "../errors";
import BaseDBError from "../errors/base-db-error";

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
        return new NotConnectedError();
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
        case 3:
            retErr;
    }

}

export default createGuildMember;