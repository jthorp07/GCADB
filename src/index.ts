import { ConnectionPool } from "mssql";
import Procedures from "./stored-procedures"

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
    Stored Procedure Calls
    =======================================================================================================
  */

  /**
   * Logs a newly created Discord channel in the GCA Database
   * 
   * @param con A ConnectionPool that is connected to the GCA Database
   * @param guildId The ID of the Discord server the request is coming from
   * @param channelId The ID of the created Discord channel
   * @param channelName The name of the created Discord channel
   * @param channelType The type of the created Discord channel
   * @param triggerable Whether or not VoiceState changes on the channel should be reacted to
   * @param trans A Transaction on the GCA Database, if this request should be part of one
   */
  public createChannel = Procedures.createChannel;


  public createGuild = Procedures.createGuild;

}



export default GCADB.GetConnection;