import {BaseDBError, getConnection} from "../index"
import env from "../env-vars.config"
import { QueueType } from "../enums";

test("CreateDeleteQueue", async () => {

    try {

        // Connect to the database
        let db = await getConnection(env.SQL);
        if (!db) {
            expect(false).toBeTruthy();
            return;
        }

        // Close database connection when finished
        await db.closeConnection();

    } catch (error) {

        console.error(error);
        return;

    }

});

test("FullQueueSimulation", async () => {

    try {

        // Connect to the database
        let db = await getConnection(env.SQL);
        if (!db) {
            expect(false).toBeTruthy();
            return;
        }

        // Start a transaction 
        let trans = await db.beginTransaction(async (err) => {
            console.log(err);
        });

        if (!trans) {
            expect(false).toBeTruthy();
            return;
        }

        // Step 1: Create the queue
        let result = await db.createQueue("","",QueueType.TENMANS_CLASSIC,1,trans);
        if (result instanceof BaseDBError) {
            result.log();
        }

        // Commit transaction for queue creation
        await db.commitTransaction(trans);

        // Close database connection when finished
        await db.closeConnection();

    } catch (error) {

        console.error(error);
        return;

    }

});