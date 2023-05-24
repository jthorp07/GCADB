import {BaseDBError, getConnection} from "../index"
import env from "../env-vars.config"
import { QueueState, QueueType } from "../enums";
import { testData } from "./_test_data_/testData";

jest.setTimeout(60000)

test("CreateDeleteQueue", async () => {

        // Connect to the database
        let db = await getConnection(env.SQL);
        if (!db) {
            expect(false).toBeTruthy();
            return;
        }

        // First, register all guilds
        for (let guild of testData.guilds) {
            let result = await db.createGuild(guild.id, guild.name);
            if (result) {
                result.log();
                expect(false).toBeTruthy();
                return;
            }
            console.log("guild created");
        }

        // Next, register Users/GuildMembers to Guilds
        for (let i = 0; i < 200; i++) {
            let gm = testData.guildMembers[i];
            let user = testData.users[i];

            let result = await db.createGuildMember(gm.guildId, gm.memberId, gm.isOwner, user.username, gm.discordDisplayName, gm.valorantRankRoleName);
            if (result) {
                result.log();
                console.log(`Index: ${i}, GiD: ${gm.guildId}, MiD: ${gm.memberId}`);
                expect(false).toBeTruthy();
                return;
            }
            console.log("member created");
        }

        // Now, create the queues that people will be joining
        let queueIds: {guild: string, qId: number, numPlayers: number}[] = [];
        for (let queue of testData.queues) {
            let result = await db.createQueue(queue.guildId, queue.hostId, queue.queueType);
            if (result instanceof BaseDBError) {
                result.log();
                expect(false).toBeTruthy();
                return;
            } else {
                queueIds.push({guild: queue.guildId, qId: result, numPlayers: 0});
            }
            console.log("queue created");
        }

        // Let's start joining people to the queues!
        for (let member of testData.guildMembers) {

            // Get the queueId that should be used & increment number of players in queue
            let queueToJoin: number = 0;
            let queueFound = false;
            for (let i = 0; i < queueIds.length; i++) {
                
                let queue = queueIds[i];
                if (queue.guild == member.guildId && queue.numPlayers < 10) {
                    queueToJoin = queue.qId;
                    queueFound = true;
                    break;
                }
                queueIds[i].numPlayers = queueIds[i].numPlayers + 1;
            }

            if (!queueFound) break; // all queues full

            // Join player to queue
            let result = await db.joinQueue(member.memberId, member.guildId, queueToJoin);
            if (result instanceof BaseDBError) {
                result.log();
            } else {

                // If status = STARTING_DRAFT, trigger start
                if (result.queueStatus == QueueState.STARTING_DRAFT) {
                    let result = await db.imStartingDraft(queueToJoin);
                    if (result instanceof BaseDBError) {
                        result.log();
                    } else {
                        
                        // Fuck it we'll just stop here
                        console.log("Queue filled and starting! (WOOHOO)");                       
                    }
                }
            }
        }

        // Close database connection when finished
        await db.closeConnection();

});