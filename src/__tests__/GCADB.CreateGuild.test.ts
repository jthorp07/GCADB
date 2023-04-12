import {getConnection} from "../index"
import env from "../env-vars.config"

test("CreateGuild", async () => {

    let db = await getConnection(env.SQL);

    if (!db) {
        expect(false).toBeTruthy();
        return;
    }

    try {

        let trans = await db.beginTransaction(async () => { 
            expect(false).toBeTruthy();
            return;
        });

        if (!trans) {
            expect(false).toBeTruthy();
            return;
        }

        await db.commitTransaction(trans);
        await db.closeConnection();

    } catch (err) {
        console.error(err);
        expect(true).toBeTruthy();
    }

});