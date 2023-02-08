import { useSession } from "next-auth/react"
import Redis from 'ioredis'
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"


let redis = new Redis(process.env.REDIS_URL)

export default function Getotp({otp, ttl}){
  const { data: session } = useSession()

  if (!session) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    )
  }
  if(otp != null){
    return (
      <Layout>
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
      <Layout>
        <h1>OTP Verification</h1>
        <p>
          Your Otp has expired
        </p>
        <p>
          Your IP is: {ip}
        </p>
      </Layout>
    )
  }
  
}

export async function getServerSideProps(context) {
  
  const {otpId} = context.params;
  const ip = context.req.headers['x-forwarded-for'];
  const otpAndIp = await redis.get(otpId);
  const ttl = await redis.ttl(otpId);

  if(otpAndIp === null) {
    return { props: { otp : null, ttl: null} }
  }else{
    const otpFromRedis = otpAndIp.split(":")[0];
    const ipFromRedis = otpAndIp.split(":")[1];
    if(ipFromRedis != ip) {
      return { props: { otp : otpFromRedis, ttl: ttl} }
    }else{
      const newOtpAndIp = otpFromRedis + ":true";
      await redis.set(otpId, newOtpAndIp, 'EX', 20*60);
      return { props: { otp : otpFromRedis, ttl: ttl} }
    }
  }
}