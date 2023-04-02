import {getConnection, BaseDBError} from "../index"
import env from "../env-vars.config"

test("Simple", async () => {

    try {
        let db = await getConnection(env.SQL);

        // No connection: Auto fail
        if (!db) {
            expect(false).toBeTruthy();
            return;
        }

        let trans = await db.beginTransaction(async (err) => {
            console.log(err);
        });

        if (!trans) {
           return; 
        }

        let result = await db.createChannel("","","","",true, trans);

        if (result instanceof BaseDBError) {
            result.log();
            await trans.rollback();
            expect(true).toBeTruthy();

        } else {
            db.commitTransaction(trans);
            expect(false).toBeTruthy();
        }    

    } catch (err) {
        console.error(err);
        expect(false).toBeTruthy();
    }

});