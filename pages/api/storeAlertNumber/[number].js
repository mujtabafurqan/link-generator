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
    if(number.startsWith('+')){
        db.collection('alertNumbers').insertOne({number: number, created_at: new Date()}, async (err, result) => {
            if(err){
                res.status(500).json({error: err});
            }
            else{
                try {
                    const TOLL_FREE_NUMBER = '+18336529396';
              
                    const status = await client.send({
                        context: "test",
                        from: TOLL_FREE_NUMBER, 
                        to: number,
                        body: "Welcome to the OTP Cloud Demo. You have been subscribed to receive alerts for the next 15 mins",
                        direction: 'outbound'
                    });
                    console.log(" New Outbound Message from " + TOLL_FREE_NUMBER + " to " + mobile + " with status " + status.data);
                } catch (error) {
                  console.log("Error sending message " + error);
                }
                res.status(200).json({message: "success"});
            }
        }
        )
    }
}