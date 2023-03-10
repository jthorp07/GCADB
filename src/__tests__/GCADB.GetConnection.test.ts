import GetConnection from "../index"
import env from "../env-vars.config"


test("Connect", async () => {
    try {
        let con = await GetConnection(env.SQL);
        if (con) {
            expect(con.con.connected).toBeTruthy();
        } else {
            expect(false).toBeTruthy();
        }
    } catch (err) {
        console.log(err);
        expect(false).toBeTruthy();
    }
});

