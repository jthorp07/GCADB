import { Transaction, ConnectionPool, Request } from "mssql";

import createChannel from "./create-channel";
import createGuild from "./create-guild";
import createGuildMember from "./create-guild-member";
import createQueue from "./create-queue";
import deleteChannelById from "./delete-channel-by-id";
import deleteChannelByName from "./delete-channel-by-name";
import draftPlayer from "./draft-player";
import endQueue from "./end-queue";
import getChannel from "./get-channel";
import getEnforceRankRoles from "./get-enforce-rank-roles";
import getPrefs from "./get-prefs";
import getProfile from "./get-profile";
import getQueue from "./get-queue";
import getRankRoles from "./get-rank-roles";
import imManuallyStartingDraft from "./im-manually-starting-draft";
import imStartingDraft from "./im-starting-draft copy";
import joinQueue from "./join-queue";
import leaveTenmans from "./leave-tenmans";
import pickMap from "./pick-map";
import pickSide from "./pick-side";
import replaceCaptain from "./replace-captain";
import setCanBeCaptain from "./set-can-be-captain";
import setCaptain from "./set-captains";
import setEnforceRankRoles from "./set-enforce-rankroles";
import setRole from "./set-role";
import setValName from "./set-val-name";
import setValorantRank from "./set-valorant-rank";
import updateDiscordProfile from "./update-discord-profile";
import updateValorantProfile from "./update-valorant-profile";

export default {
    createChannel,
    createGuild,
    createGuildMember,
    createQueue,
    deleteChannelById,
    deleteChannelByName,
    draftPlayer,
    endQueue,
    getChannel,
    getEnforceRankRoles,
    getPrefs,
    getProfile,
    getQueue,
    getRankRoles,
    imManuallyStartingDraft,
    imStartingDraft,
    joinQueue,
    leaveTenmans,
    pickMap,
    pickSide,
    replaceCaptain,
    setCanBeCaptain,
    setCaptain,
    setEnforceRankRoles,
    setRole,
    setValName,
    setValorantRank,
    updateDiscordProfile,
    updateValorantProfile
};

export function initReq(con: ConnectionPool, trans?: Transaction) {
    return trans ? new Request(trans) : new Request(con);
};