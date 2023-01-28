import * as dotenv from "dotenv"

dotenv.config();

export default {
    SQL: {
        user: process.env.MSSQL_USER ?? '',
        password: process.env.MSSQL_PASSWORD ?? '',
        database: process.env.MSSQL_DATABASE ?? '',
        server: process.env.MSSQL_SERVER ?? '',
        pool: {
            max: 10,
            min: 0,
            idleTimeoutMillis: 30000,
        },
        options: {
            encrypt: true,
            trustServerCertificate: true,
        },
    },
    ADMINS: [
        process.env.JACK ?? '',
        process.env.UNI ?? '',
        process.env.ANIMUZ ?? ''
    ]
}