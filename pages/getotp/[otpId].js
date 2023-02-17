import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import Redis from 'ioredis'
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import { useEffect } from "react";

const {Messaging} = require("@signalwire/realtime-api");


let redis = new Redis(process.env.REDIS_URL)

const client = new Messaging.Client({
  project: process.env.SIGNALWIRE_PROJECT_ID,
  token: process.env.SIGNALWIRE_TOKEN,
  contexts: ["test"],
});

export default function Getotp({otp, ttl, authorized}){
  const { data: session } = useSession()
  
  // useEffect(()=>{
  //   if (session == undefined || session == null){
  //     if(authorized=='true'){
  //       signIn()
  //     }
  //   }
  // },[])

  console.log("authorized", authorized)
  console.log("session", session)
  if(authorized=='false'){
    return (
      <Layout showHeader={authorized=='true'}>
        <h1>Please check your phone for your otp</h1>
      </Layout>
    )
  }
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
          Your Otp is: {otp}
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

  console.log("mobile", mobile)
  if(authorized == 'false'){
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
    } catch (error) {
      console.log("Error sending message " + error);
    }
  }

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