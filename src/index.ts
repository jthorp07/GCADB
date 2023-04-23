import { ConnectionPool, Transaction } from "mssql";
import Procedures from "./stored-procedures";
import NonProcedures from "./non-procedure-functions";
import { BaseDBError } from "./errors/base-db-error";
import { DiscordChannelName, DiscordChannelType } from "./enums";
import env from "./env-vars.config";

class GCADB {

  con: ConnectionPool

  constructor(conPool: ConnectionPool) {
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
  public async commitTransaction(transaction: Transaction,) {

    transaction.commit()

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
   * @param trans A Transaction on the GCA Database, if this request should be part of one
   */
  public async createChannel(guildId: string, channelId: string, channelName: string, channelType: DiscordChannelType, triggerable: boolean, transaction?: Transaction) {
    return Procedures.createChannel(this.con, guildId, channelId, channelName, channelType, triggerable, transaction);
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
   * @returns 
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

export { BaseDBError, env }
export const getConnection = GCADB.GetConnection;