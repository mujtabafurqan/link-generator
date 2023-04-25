import { getDb } from '../../../lib/mongodb';
const {Messaging} = require("@signalwire/realtime-api");

const dbName = process.env.WEBAUTHN_DBNAME;
const client = new Messaging.Client({
    project: process.env.SIGNALWIRE_PROJECT_ID,
    token: process.env.SIGNALWIRE_TOKEN,
    contexts: ["test"],
  });
export default async (req, res) => {

    const db = await getDb(dbName);
    const {number} = req.query;
    const timestamp = new Date(Date.now() - 15 * 60 * 1000);

    db.collection('alertNumbers').find({created_at: {$gte: timestamp, $lt: new Date()}})
    .toArray(function(err, result) {
      if (err) throw err;
      
      const uniqueNumbers = new Set();
      result.forEach((record) => {
        uniqueNumbers.add(record.number);
      });

      uniqueNumbers.forEach(async (no) => {
        try {
          const TOLL_FREE_NUMBER = '+18336529396';

          const status = await client.send({
              context: "test",
              from: TOLL_FREE_NUMBER,
              to: no,
              body: "The OTP Cloud Demo has detected a possible phishing attack on the number " + number,
              direction: 'outbound'
          });
          console.log(" New Outbound Message from " + TOLL_FREE_NUMBER + " to " + no + " with status " + status.data);
        } catch (error) {
          console.log("Error sending message " + error);
        }
      });


      res.status(200).json({message: "success"});
    });
}