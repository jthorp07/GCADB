import { Transaction, ConnectionPool, Request } from "mssql";

import createChannel from "./create-channel"
import createGuild from "./create-guild"
import createGuildMember from "./create-guild-member"
import createQueue from "./create-queue"
import deleteChannelById from "./delete-channel-by-id"
import draftPlayer from "./draft-player"

export default {
    createChannel,
    createGuild,
    createGuildMember,
    createQueue,
    deleteChannelById,
    draftPlayer
}

export function initReq(con: ConnectionPool, trans?: Transaction) {
    return trans ? new Request(trans) : new Request(con);
}