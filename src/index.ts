import { ConnectionPool, Transaction } from "mssql";
import Procedures from "./stored-procedures";
import NonProcedures from "./non-procedure-functions";
import { BaseDBError } from "./errors/base-db-error";
import { DiscordChannelName, DiscordChannelType, DiscordMemberRole, DiscordStaffRole, ValorantRank } from "./enums";
import env from "./env-vars.config";
import { EventEmitter } from "events"

export class GCADB extends EventEmitter {

  con: ConnectionPool;
  reconnecting: boolean;

  private constructor(conPool: ConnectionPool) {
    super();
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
      });
      return db;
    } catch (err) {
      return null;
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
  public async beginTransaction(onError: (error: Error) => Promise<void>) {
    let trans = await this.con.transaction().begin().catch(async (err) => await onError(err));

    if (trans) {
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

    let attempt = 0;
    while (this.reconnecting && attempt <= 10) {
      await waitOneSecond();
      attempt++;
    }

    try {
      return Procedures.createChannel(this.con, guildId, channelId, channelName, channelType, triggerable, transaction);
    } catch (err) {
      if ((err.code == 'ETIMEOUT' || err.code == 'EREQUEST') && !this.reconnecting) {
        this.reconnecting = true;
        this.emit("reconnect");
        return new BaseDBError("Database connection failed or exceeded maximum attempts", -100);
      }
    }
 
  };


  /**
   * Writes a new guild to the GCA Database
   * 
   * @param guildId Discord ID of target guild
   * @param guildName Name of target guild
   * @param trans Database transaction to run this procedure against
   * @returns BaseDBError upon failure, void upon success
   */
  public async createGuild(guildId: string, guildName: string, transaction?: Transaction) {
    return Procedures.createGuild(this.con, guildId, guildName, transaction);
  }

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
   * @returns Void if successful, BaseDBError if failed
   */
  public async createGuildMember(guildId: string, userId: string, isOwner: boolean, username: string, guildDisplayName: string, valorantRankRoleName: string, transaction?: Transaction) {
    return Procedures.createGuildMember(this.con, guildId, userId, isOwner, username, guildDisplayName, valorantRankRoleName, transaction);
  }

  public async createQueue(guildId: string, hostId: string, queueType: string, queueId: number, transaction?: Transaction) {
    return Procedures.createQueue(this.con, guildId, hostId, queueType, queueId, transaction);
  }

  public async deleteChannelById(guildId: string, channelId: string, transaction?: Transaction) {
    return Procedures.deleteChannelById(this.con, guildId, channelId, transaction);
  }

  public async deleteChannelByName(guildId: string, channelName: DiscordChannelName, transaction?: Transaction) {
    return Procedures.deleteChannelByName(this.con, guildId, channelName, transaction);
  }

  public async draftPlayer(playerId: string, guildId: string, queueId: number, transaction?: Transaction) {
    return Procedures.draftPlayer(this.con, playerId, guildId, queueId, transaction)
  }

  public async endQueue(queueId: number, transaction?: Transaction) {
    return Procedures.endQueue(this.con, queueId, transaction);
  }

  public async getChannel(guildId: string, channelName: DiscordChannelName, transaction?: Transaction) {
    return Procedures.getChannel(this.con, guildId, channelName, transaction);
  }

  public async getEnforceRankRoles(guildId: string, transaction?: Transaction) {
    return Procedures.getEnforceRankRoles(this.con, guildId, transaction);
  }

  public async getPrefs(userId: string, guildId: string, transaction?: Transaction) {
    return Procedures.getPrefs(this.con, userId, guildId, transaction);
  }

  public async getProfile(userId: string, guildId: string, transaction?: Transaction) {
    return Procedures.getProfile(this.con, userId, guildId, transaction);
  }

  public async getQueue(queueId: number, transaction?: Transaction) {
    return Procedures.getQueue(this.con, queueId, transaction);
  }

  public async getRankRoles(guildId: string, transaction?: Transaction) {
    return Procedures.getRankRoles(this.con, guildId, transaction)
  }

  public async imManuallyStartingDraft(queueId: number, transaction?: Transaction) {
    return Procedures.imManuallyStartingDraft(this.con, queueId, transaction);
  }

  public async imStartingDraft(queueId: number, transaction?: Transaction) {
    return Procedures.imStartingDraft(this.con, queueId, transaction);
  }

  public async joinQueue(userId: string, guildId: string, queueId: number, transaction?: Transaction) {
    return Procedures.joinQueue(this.con, userId, guildId, queueId, transaction);
  }

  public async leaveTenmans(queueId: number, guildId: string, transaction?: Transaction) {
    return Procedures.leaveTenmans(this.con, queueId, guildId, transaction);
  }

  public async pickMap(queueId: number, transaction?: Transaction) {
    return Procedures.pickMap(this.con, queueId, transaction);
  }

  public async pickSide(queueId: number, transaction?: Transaction) {
    return Procedures.pickSide(this.con, queueId, transaction);
  }

  public async replaceCaptain(queueId: number, queuePool: number, transaction?: Transaction) {
    return Procedures.replaceCaptain(this.con, queueId, queuePool, transaction)
  }

  public async setCanBeCaptain(userId: string, guildId: string, canBeCaptain: boolean, transaction?: Transaction) {
    return Procedures.setCanBeCaptain(this.con, userId, guildId, canBeCaptain, transaction)
  }

  public async setCaptain(queueId: number, capOne: string, capTwo: string, guildId: string, transaction?: Transaction) {
    return Procedures.setCaptain(this.con, queueId, capOne, capTwo, guildId, transaction)
  }

  public async setEnforceRankRoles(guildId: string, enforce: boolean, transaction?: Transaction) {
    return Procedures.setEnforceRankRoles(this.con, guildId, enforce, transaction);
  }

  public async setRole(guildId: string, roleId: string, roleName: ValorantRank | DiscordMemberRole | DiscordStaffRole, orderBy: number, roleIcon: string, roleEmote: string, transaction?: Transaction) {
    return Procedures.setRole(this.con, guildId, roleId, roleName, orderBy, roleIcon, roleEmote, transaction);
  }

  public async setValName(valName: string, userId: string, guildId: string, transaction?: Transaction) {
    return Procedures.setValName(this.con, valName, userId, guildId, transaction);
  }

  public async setValorantRank(guildId: string, userId: string, rank: ValorantRank, transaction?: Transaction) {
    return Procedures.setValorantRank(this.con, guildId, userId, rank, transaction);
  }

  public async updateDiscordProfile(guildId: string, userId: string, username: string, isOwner: boolean, guildDisplayName: string, currentRank: ValorantRank, hasRank: boolean, transaction: Transaction) {
    return Procedures.updateDiscordProfile(this.con, guildId, userId, username, isOwner, guildDisplayName, currentRank, hasRank, transaction);
  }

  public async updateValorantProfile(guildId: string, userId: string, valorantDisplayName: string, transaction?: Transaction) {
    return Procedures.updateValorantProfile(this.con, guildId, userId, valorantDisplayName, transaction);
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