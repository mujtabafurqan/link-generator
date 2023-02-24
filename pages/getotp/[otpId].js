import { useSession } from "next-auth/react"
import Redis from 'ioredis'
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import { CopyToClipboard } from 'react-copy-to-clipboard';

const {Messaging} = require("@signalwire/realtime-api");


let redis = new Redis(process.env.REDIS_URL)

const client = new Messaging.Client({
  project: process.env.SIGNALWIRE_PROJECT_ID,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ["test"],
});

function handleCopy() {
  console.log("copied")
}
export default function Getotp({otp, ttl, authorized}){
  const { data: session } = useSession()
  

  console.log("authorized", authorized)
  console.log("session", session)

  if (session == undefined && authorized == 'true') {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }
  if(otp != null){
    return (
      <Layout showHeader={!authorized}>
        <h1>OTP Verification</h1>
        <p>
          Your Otp is: 
          <CopyToClipboard text={url} onCopy={handleCopy}>
             <span style={{ cursor: 'pointer' }}>{url}</span>
          </CopyToClipboard>
        </p>
        <p>
          And it expires in {ttl} seconds
        </p>
      </Layout>
    )
  }
  else{
    return (
      <Layout showHeader={!authorized}>
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
  const {authorized, mobile}  = context.query;
  const ip = context.req.headers['x-forwarded-for'];
  console.log("ip when getting otp",ip)
  const otpAndIp = await redis.get(otpId);
  const ttl = await redis.ttl(otpId);


  if(otpAndIp === null) {
    return { props: { otp : null, ttl: null, authorized} }
  }else{
    const otpFromRedis = otpAndIp.split(":")[0];
    const ipFromRedis = otpAndIp.split(":")[1];
    if(ipFromRedis != ip) {
      return { props: { otp : otpFromRedis, ttl: ttl, authorized} }
    }else{
      const newOtpAndIp = otpFromRedis + ":true";
      await redis.set(otpId, newOtpAndIp, 'EX', 20*60);
      return { props: { otp : otpFromRedis, ttl: ttl, authorized} }
    }
  }
}