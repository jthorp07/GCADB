import { Transaction, ConnectionPool, Request } from "mssql";

import createChannel from "./create-channel"
import createGuild from "./create-guild"
import createGuildMember from "./create-guild-member"
import createQueue from "./create-queue"
import deleteChannelById from "./delete-channel-by-id"
import draftPlayer from "./draft-player"
import endQueue from "./end-queue"
import getChannel from "./get-channel"
import getEnforceRankRoles from "./get-enforce-rank-roles"
import getPrefs from "./get-prefs"
import getProfile from "./get-profile"
import getQueue from "./get-queue"
import getRankRoles from "./get-rank-roles"

export default {
    createChannel,
    createGuild,
    createGuildMember,
    createQueue,
    deleteChannelById,
    draftPlayer,
    endQueue,
    getChannel,
    getEnforceRankRoles,
    getPrefs,
    getProfile,
    getQueue,
    getRankRoles
}

export function initReq(con: ConnectionPool, trans?: Transaction) {
    return trans ? new Request(trans) : new Request(con);
}