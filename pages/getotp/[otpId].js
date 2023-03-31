import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Redis from 'ioredis'
import Layout from "../../components/layout"
import AccessDenied from "../../components/access-denied"
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaCopy, FaCheck } from 'react-icons/fa';
import { signIn } from "next-auth/react"


let redis = new Redis(process.env.REDIS_URL)


export default function Getotp({otp, ttl, authorized, mobile}){
  const { data: session } = useSession()
  const [isCopied, setIsCopied] = useState(false);


  function handleCopy() {
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  }

  if (session == undefined && authorized == 'true') {
    return (
      <Layout>
        <AccessDenied mobile={mobile}/>
      </Layout>
    )
  }
  if(otp != null){
    return (
      <Layout showHeader={!authorized}>
        <h3>OTP Verification</h3>
        <p>
          Your Otp is: 
          <CopyToClipboard text={otp} onCopy={handleCopy} >
          <div style={{ display: 'flex', alignItems: 'center'}}>
          <span style={{ marginRight: '10px', fontSize: '35px'}}>{otp}</span>
          {isCopied ? (
            <FaCheck style={{ color: 'black' }} />
          ) : (
            <FaCopy
              data-tip="Copy to clipboard"
              style={{ cursor: 'pointer', color: 'black' }}
            />
          )}
        </div>
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
  const {authorized}  = context.query;
  let mobile = "";
  if(context.query.mobile !== undefined){
    mobile  = context.query.mobile;
  }
  const ip = context.req.headers['x-forwarded-for'];
  console.log("ip when getting otp",ip)
  const otpAndIp = await redis.get(otpId);
  const ttl = await redis.ttl(otpId);

  console.log("mobile----", mobile)
  if(otpAndIp === null) {
    return { props: { otp : null, ttl: null, authorized, mobile} }
  }else{
    const otpFromRedis = otpAndIp.split(":")[0];
    const ipFromRedis = otpAndIp.split(":")[1];
    if(ipFromRedis != ip) {
      return { props: { otp : otpFromRedis, ttl: ttl, authorized, mobile} }
    }else{
      const newOtpAndIp = otpFromRedis + ":true";
      await redis.set(otpId, newOtpAndIp, 'EX', 20*60);
      return { props: { otp : otpFromRedis, ttl: ttl, authorized, mobile} }
    }
  }
}