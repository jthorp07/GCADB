import * as dotenv from "dotenv"

dotenv.config();

export default {
    SQL: {
        user: process.env.PROD_MSSQL_USER ?? '',
        password: process.env.PROD_MSSQL_PASSWORD ?? '',
        database: process.env.PROD_MSSQL_DATABASE ?? '',
        server: process.env.PROD_MSSQL_SERVER ?? '',
        pool: {
            max: 5,
            min: 2,
            idleTimeoutMillis: Number.MAX_SAFE_INTEGER,
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