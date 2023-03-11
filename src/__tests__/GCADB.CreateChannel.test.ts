import GetConnection from "../index"
import env from "../env-vars.config"

test("Simple", async () => {
    try {

        // Get a connection
        let db = await GetConnection(env.SQL);
        if (!db) {
            expect(false).toBe(true);
            return;
        }

        // TODO: Validate connection

        // Test createChannel
        await db.createChannel("guildId", "channelid", "channelname", "channelType", true /* Triggerable */, undefined);

    } catch (err) {
        console.log(err);
        expect(false).toBe(true);
    }
});