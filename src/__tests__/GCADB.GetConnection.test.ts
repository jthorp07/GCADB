import GetConnection from "../index"
import env from "../env-vars.config"


test("Connect", async () => {
    let pass: boolean;
    try {
        let con = await GetConnection(env.SQL);
        expect(con).toBeTruthy();
    } catch (err) {
        console.log(err);
        expect(false).toBeTruthy();
    }
});

