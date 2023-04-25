const {Messaging} = require("@signalwire/realtime-api");

export async function getClient() {
    const client = new Messaging.Client({
        project: process.env.SIGNALWIRE_PROJECT_ID,
        token: process.env.SIGNALWIRE_TOKEN,
        contexts: ["test"],
      });
    return client;
}