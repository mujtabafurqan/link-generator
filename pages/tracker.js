import Layout from "../components/layout"
import Redis from 'ioredis'
const {Messaging} = require("@signalwire/realtime-api");

let redis = new Redis(process.env.REDIS_URL)

const client = new Messaging.Client({
  project: process.env.SIGNALWIRE_PROJECT_ID,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ["test"],
});

export default function Tracker() {
    if(otp != null){
        return (
            <Layout showHeader={false}>
            <h1>Please check your phone for your otp</h1>
            </Layout>
        )
    }else{
        return (
            <Layout showHeader={false}>
            <h1>OTP Verification</h1>
            <p>
                Your Otp has expired
            </p>
            </Layout>
        )
    }
}

export async function getServerSideProps(context) {

    const {otpId} = context.params;
    const {mobile}  = context.query;
    const otpAndIp = await redis.get(otpId);
    if(otpAndIp == null){
        return {
            props: {
                otp: null,
            }
        }
    }
    try {
        const TOLL_FREE_NUMBER = '+18336529396';
  
        const status = await client.send({
            context: "test",
            from: TOLL_FREE_NUMBER, 
            to: mobile,
            body: otpAndIp.split(":")[0],
            direction: 'outbound'
        });
        console.log(" New Outbound Message from " + TOLL_FREE_NUMBER + " to " + mobile + " with status " + status.data);
        return {
            props: {
                otp: otpAndIp.split(":")[0],
            }  
        }
    } catch (error) {
      console.log("Error sending message " + error);
    }
}