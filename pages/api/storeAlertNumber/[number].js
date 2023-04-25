import { getDb } from '../../../lib/mongodb';
import { getClient } from '../../../lib/signalwire';

const dbName = process.env.WEBAUTHN_DBNAME;

export default async (req, res) => {

    const db = await getDb(dbName);
    const {number} = req.query;
    let mobileplus = number;
    console.log(" wivfbuwfieuiwfbuiwfebu"+number);
    if(!number.startsWith('+')){
        mobileplus = number.replace(" ", "+");
    }
    if(number.startsWith('+')){
        db.collection('alertNumbers').insertOne({number: number, created_at: new Date()}, async (err, result) => {
            if(err){
                res.status(500).json({error: err});
            }
            else{
                try {
                    const TOLL_FREE_NUMBER = '+18336529396';
                    const client = await getClient();
                    const status = await client.send({
                        context: "test",
                        from: TOLL_FREE_NUMBER, 
                        to: mobileplus,
                        body: "Welcome to the OTP Cloud Demo. You have been subscribed to receive alerts for the next 15 mins",
                        direction: 'outbound'
                    });
                    console.log(" New Outbound Message from " + TOLL_FREE_NUMBER + " to " + mobileplus + " with status " + status.data);
                } catch (error) {
                  console.log("Error sending message " + error);
                }
                res.status(200).json({message: "success"});
            }
        }
        )
    }
}