import { ConnectionPool, Transaction } from "mssql";
import Procedures from "./stored-procedures";
import NonProcedures from "./non-procedure-functions";
import { BaseDBError } from "./errors/base-db-error";
import { DiscordChannelName, DiscordChannelType, DiscordMemberRole, DiscordStaffRole, GCADBErrorCode, QueuePool, QueueState, QueueType, ValorantRank } from "./enums";
import env from "./env-vars.config";
import { EventEmitter } from "events"
import { GetProfileRecord } from "./stored-procedures/get-profile";
import { TenmansClassicRecords } from "./stored-procedures/get-queue";
import { ValorantRankedRolesRecord } from "./stored-procedures/get-rank-roles";

export class GCADB extends EventEmitter {

  con: ConnectionPool;
  reconnecting: boolean;

  private constructor(conPool: ConnectionPool) {
    super();
    this.reconnecting = false;
    this.con = conPool;
  }

  /**
   * Takes a SQL login config object and returns a connection
   * to a SQL database.
   * 
   * **WARNING** This can log in to any SQL database and therefore may connect to an
   * invalid database, which would cause the library to error upon attempting to call a query.
   * 
   * @param sql SQL login options for target database
   * @returns GCADB Connection
   */
  public static async GetConnection(sql: {
    user: string,
    password: string,
    database: string,
    server: string,
    pool: {
      max: number,
      min: number,
      idleTimeoutMillis: number
    },
    options: {
      encrypt: boolean,
      trustServerCertificate: boolean
    }
  }) {

    try {
      let initCon = new ConnectionPool(sql);
      let db = new GCADB(await initCon.connect());
      db.addListener("reconnect", async () => {
        let newCon = new ConnectionPool(sql);
        await newCon.connect();
        db.con = newCon;
        db.reconnecting = false;
        console.log("  [GCADB]: Reconnected");
      });
      return db;
    } catch (err) {
      return;
    }
  }

  /*
    =======================================================================================================
    Utility Methods
    =======================================================================================================
  */

  /**
   * Begins a transaction against the database
   * 
   * @param onError Error handler in case of an error when beginning the transaction
   * @returns 
   */
  public async beginTransaction(onError?: (error: Error) => Promise<void>) {

      let trans = await this.con.transaction().begin().catch(async (err) => {

        if (onError) {
          await onError(err);
        }
        return new BaseDBError("An error occurred creating a transaction", GCADBErrorCode.TRANSACTION_ERROR);
      });


        if (trans instanceof Transaction) {
          // DBMS error handling
          let rolledBack = false;
          trans.on("rollback", (aborted) => {
            if (aborted) {
              console.log("This rollback was triggered by SQL server");
            }
            rolledBack = true;
            return;
          });
        }

        return trans;
  }

  /**
   * Commits a transaction to the database
   * 
   * @param transaction 
   */
  public async commitTransaction(transaction: Transaction) {

    try {
      transaction.commit();
    } catch (err) {
      return new BaseDBError("The transaction failed to commit", -50);
    }

  }

  /**
   * Closes the connection to the database for graceful exit
   */
  public async closeConnection() {
    await this.con.close();
  }

  /**
   * Wraps a stored procedure call and handles retries in the event
   * of connectivity errors
   * 
   * @param proc Procedure to be called
   * @param args Arguments to give the procedure
   * @returns The result of the procedure
   */
  private async callProcedure(proc: (...args: any[]) => Promise<any>, args: any[]) {

    let attempt = 0;
    while (this.reconnecting && attempt <= 10) {
      if (attempt > 0) console.log("  [GCADB]: Retrying...");
      await waitOneSecond();
      attempt++;
    }

    while (attempt <= 10) {

      if (attempt > 0) console.log("  [GCADB]: Retrying...");

      try {
        return await proc.apply(this, args);
      } catch (err) {
        console.log(err);

        if (!this.reconnecting) {
          console.log("  [GCADB]: Reconnecting...");
          this.reconnecting = true;
          this.emit("reconnect");
          await waitOneSecond();
          attempt++;
        } else {
          await waitOneSecond();
          attempt++;
        }
      }
    }
    return new BaseDBError("Database connection failed or exceeded maximum attempts", -100);
  }

  /*
    =======================================================================================================
    Stored Procedure Calls
    =======================================================================================================
  */

  /**
   * Writes a Discord channel to the GCA Database.
   * Returns void on success; BaseDBError on failure
   * 
   * @param guildId The ID of the Discord server the request is coming from
   * @param channelId The ID of the created Discord channel
   * @param channelName The name of the created Discord channel
   * @param channelType The type of the created Discord channel
   * @param triggerable Whether or not VoiceState changes on the channel should be reacted to
   * @param transaction A Transaction on the GCA Database, if this request should be part of one
   */
  public async createChannel(guildId: string, channelId: string, channelName: string, channelType: DiscordChannelType, triggerable: boolean, transaction?: Transaction) {
    return this.callProcedure(Procedures.createChannel, [this.con, guildId, channelId, channelName, channelType, triggerable, transaction]) as Promise<BaseDBError | undefined>;
  };


  /**
   * Writes a new guild to the GCA Database
   * 
   * @param guildId Discord ID of target guild
   * @param guildName Name of target guild
   * @param transaction Database transaction to run this procedure against
   * @returns BaseDBError upon failure, void upon success
   */
  public async createGuild(guildId: string, guildName: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.createGuild, [this.con, guildId, guildName, transaction]) as Promise<BaseDBError>;
  }

  /**
   * Writes a Discord GuildMember's information on the GCA Database.
   * A GuildMember represents a Discord user and their unique profile
   * within a target Discord guild.
   * 
   * Returns void on success; BaseDBError on failure
   * 
   * @param guildId Discord ID of target guild
   * @param userId Discord ID of target Discord user
   * @param isOwner True if target Discord user is the owner of the target Guild
   * @param username Username of target Discord user
   * @param guildDisplayName Display name of target Discord user in target guild
   * @param valorantRankRoleName Likely to be deprecated
   * @param transaction Database transaction to run this request against
   * @returns Void if successful, BaseDBError if failed
   */
  public async createGuildMember(guildId: string, userId: string, isOwner: boolean, username: string, guildDisplayName: string, valorantRankRoleName: ValorantRank | null, transaction?: Transaction) {
    return this.callProcedure(Procedures.createGuildMember, [this.con, guildId, userId, isOwner, username, guildDisplayName, valorantRankRoleName, transaction]) as Promise<BaseDBError>;
  }

  public async createQueue(guildId: string, hostId: string, queueType: QueueType, transaction?: Transaction) {
    return this.callProcedure(Procedures.createQueue, [this.con, guildId, hostId, queueType, transaction]) as Promise<number | BaseDBError>;
  }

  public async deleteChannelById(guildId: string, channelId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.deleteChannelById, [this.con, guildId, channelId, transaction]) as Promise<BaseDBError>;
  }

  public async deleteChannelByName(guildId: string, channelName: DiscordChannelName, transaction?: Transaction) {
    return this.callProcedure(Procedures.deleteChannelByName, [this.con, guildId, channelName, transaction]) as Promise<BaseDBError>;
  }

  public async draftPlayer(playerId: string, guildId: string, queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.draftPlayer, [this.con, playerId, guildId, queueId, transaction]) as Promise<BaseDBError | { queueStatus: QueueState, hostId: string, team: QueuePool, records: TenmansClassicRecords }>;
  }

  public async endQueue(queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.endQueue, [this.con, queueId, transaction]) as Promise<BaseDBError>;
  }

  public async getChannel(guildId: string, channelName: DiscordChannelName, transaction?: Transaction) {
    return this.callProcedure(Procedures.getChannel, [this.con, guildId, channelName, transaction]) as Promise<BaseDBError | { channelId: string, triggerable: boolean, channelType: DiscordChannelType }>;
  }

  public async getEnforceRankRoles(guildId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.getEnforceRankRoles, [this.con, guildId, transaction]) as Promise<BaseDBError | boolean>;
  }

  public async getPrefs(userId: string, guildId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.getPrefs, [this.con, userId, guildId, transaction]) as Promise<BaseDBError | { canBeCaptain: boolean }>;
  }

  public async getProfile(userId: string, guildId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.getProfile, [this.con, userId, guildId, transaction]) as Promise<BaseDBError | { currentRank: ValorantRank | null, records: GetProfileRecord }>;
  }

  public async getQueue(queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.getQueue, [this.con, queueId, transaction]) as Promise<BaseDBError | { captainCount: number, playerCount: number, queueStatus: QueueState, hostId: string, records: TenmansClassicRecords }>;
  }

  public async getRankRoles(guildId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.getRankRoles, [this.con, guildId, transaction]) as Promise<BaseDBError | ValorantRankedRolesRecord[]>
  }

  public async getTriggerableChannels(guildId: string, channelId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.getTriggerableChannels, [this.con, guildId, channelId, transaction]) as Promise<boolean | BaseDBError>;
  }

  public async getUserValRank(userId: string, guildId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.getUserValRank, [this.con, guildId, userId, transaction]) as Promise<BaseDBError | {roleEmote: string | null, roleIcon: string | null, roleName: ValorantRank | null}>;
  }

  public async imManuallyStartingDraft(queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.imManuallyStartingDraft, [this.con, queueId, transaction]) as Promise<BaseDBError | { success: boolean, enforce: boolean }>;
  }

  public async imStartingDraft(queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.imStartingDraft, [this.con, queueId, transaction]) as Promise<BaseDBError | { success: boolean, enforce: boolean }>;
  }

  public async joinQueue(userId: string, guildId: string, queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.joinQueue, [this.con, userId, guildId, queueId, transaction]) as Promise<BaseDBError | { numPlayers: number, numCaptains: number, queueStatus: QueueState, hostId: string, records: TenmansClassicRecords }>;
  }

  public async leaveTenmans(queueId: number, guildId: string, userId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.leaveTenmans, [this.con, queueId, guildId, userId, transaction]) as Promise<BaseDBError | { wasCaptain: boolean, queuePool: QueuePool }>;
  }

  public async pickMap(queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.pickMap, [this.con, queueId, transaction]) as Promise<BaseDBError | { numCaptains: number, playerCount: number, queueStatus: QueueState, hostId: string, records: TenmansClassicRecords }>;
  }

  public async pickSide(queueId: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.pickSide, [this.con, queueId, transaction]) as Promise<BaseDBError | { numCaptains: number, playerCount: number, queueStatus: QueueState, hostId: string, records: TenmansClassicRecords }>;
  }

  public async replaceCaptain(queueId: number, queuePool: number, transaction?: Transaction) {
    return this.callProcedure(Procedures.replaceCaptain, [this.con, queueId, queuePool, transaction]) as Promise<BaseDBError>;
  }

  public async setCanBeCaptain(userId: string, guildId: string, canBeCaptain: boolean, transaction?: Transaction) {
    return this.callProcedure(Procedures.setCanBeCaptain, [this.con, userId, guildId, canBeCaptain, transaction]) as Promise<BaseDBError>;
  }

  public async setCaptain(queueId: number, capOne: string, capTwo: string, guildId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.setCaptain, [this.con, queueId, capOne, capTwo, guildId, transaction]) as Promise<BaseDBError | { queueStatus: QueueState, records: TenmansClassicRecords }>;
  }

  public async setEnforceRankRoles(guildId: string, enforce: boolean, transaction?: Transaction) {
    return this.callProcedure(Procedures.setEnforceRankRoles, [this.con, guildId, enforce, transaction]) as Promise<BaseDBError>;
  }

  public async setRole(guildId: string, roleId: string, roleName: ValorantRank | DiscordMemberRole | DiscordStaffRole, orderBy: number, roleIcon: string, roleEmote: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.setRole, [this.con, guildId, roleId, roleName, orderBy, roleIcon, roleEmote, transaction]) as Promise<BaseDBError>;
  }

  public async setValName(valName: string, userId: string, guildId: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.setValName, [this.con, valName, userId, guildId, transaction]) as Promise<BaseDBError>;
  }

  public async setValorantRank(guildId: string, userId: string, rank: ValorantRank, transaction?: Transaction) {
    return this.callProcedure(Procedures.setValorantRank, [this.con, guildId, userId, rank, transaction]) as Promise<BaseDBError>;
  }

  public async updateDiscordProfile(guildId: string, userId: string, username: string, isOwner: boolean, guildDisplayName: string, currentRank: ValorantRank | null, transaction: Transaction) {
    return this.callProcedure(Procedures.updateDiscordProfile, [this.con, guildId, userId, username, isOwner, guildDisplayName, currentRank, transaction]) as Promise<BaseDBError>;
  }

  public async updateValorantProfile(guildId: string, userId: string, valorantDisplayName: string, transaction?: Transaction) {
    return this.callProcedure(Procedures.updateValorantProfile, [this.con, guildId, userId, valorantDisplayName, transaction]) as Promise<BaseDBError>;
  }

  /*
    =======================================================================================================
    Non-Stored Procedure Calls
    =======================================================================================================
  */

  /**
   * Deletes a guild from the GCA Database. A guild represents
   * a Discord server.
   * 
   * Returns node-mssql.IProcedureResult<any> on success; BaseDBError on failure
   * 
   * @param guildId Discord ID of target guild
   * @param trans Database transaction to run this request against
   * @returns 
   */
  public async deleteGuild(guildId: string, trans?: Transaction) {
    return NonProcedures.deleteGuild(this.con, guildId, trans);
  }

  public async getDraftPickId(userId: string, queueId: number, transaction?: Transaction) {
    return NonProcedures.getDraftPickId(this.con, userId, queueId, transaction);
  }

  public async getMapSidePickId(userId: string, queueId: number, transaction?: Transaction) {
    return NonProcedures.getMapSidePickId(this.con, userId, queueId, transaction);
  }

}

async function waitOneSecond() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, 1000);
  })
}

export { BaseDBError, env, DiscordChannelName, DiscordChannelType, DiscordMemberRole, DiscordStaffRole, ValorantRank }
export const getConnection = GCADB.GetConnection;