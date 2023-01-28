import { ConnectionPool } from "mssql";



class GCADB {

    con: ConnectionPool

    constructor(conPool: ConnectionPool) {
        this.con = conPool;        
    }

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
}



export default GCADB.GetConnection;