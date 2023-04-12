import {getConnection} from "../index"
import env from "../env-vars.config"
import { DiscordChannelType } from "../enums";

test("Simple", async () => {
    try {

        // Get a connection
        let db = await getConnection(env.SQL);
        if (!db) {
            expect(false).toBe(true);
            return;
        }

        // TODO: Validate connection

        // Test createChannel
        await db.createChannel("guildId", "channelid", "channelname", DiscordChannelType.CATEGORY, true /* Triggerable */, undefined);

        await db.closeConnection();

    } catch (err) {
        console.log(err);
        expect(false).toBe(true);
    }
});