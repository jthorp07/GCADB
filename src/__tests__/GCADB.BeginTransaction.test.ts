import GetConnection from "../index"
import env from "../env-vars.config"

test("Simple", async () => {

    try {
        let db = await GetConnection(env.SQL);

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

        await db.createChannel("","","","",true, trans);

        db.commitTransaction(trans);

    } catch (err) {
        console.error(err);
        expect(false).toBeTruthy();
    }

});