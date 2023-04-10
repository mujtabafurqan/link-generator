import Redis from 'ioredis'
import uuid from 'react-uuid';
const axios = require('axios');

let redis = new Redis(process.env.REDIS_URL)

const shortenUrl = async (url) => {

  const resp = await axios.get(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`);
  return resp.data.shorturl;
}


export default async (req, res) => {

    const {
        query: { ipaddress, authorized, mobile },
        method,
      } = req;
    console.log("mobile", mobile)
    const otpId = uuid();
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpRedis = await redis.set(otpId, otp + ":" + ipaddress, 'EX', 20*60);
    console.log(otpRedis);
    
    let link;
    if(authorized == 'true'){
      link= `${process.env.NEXTAUTH_URL}/getotp/${otpId}?authorized=true`
      if( !mobile.startsWith("+")){ mobile = "+"+mobile}
      await redis.set(mobile+"-status", true);
      res.status(200).json({ link, otp, otpId })
    }
    else if(authorized == 'vanilla'){
      res.status(200).json({ link, otp, otpId })
      const otpRedis = await redis.set(otpId, otp + ":true", 'EX', 20*60);
      await redis.set(mobile+"-status", true);
    }
    else{
      link= `${process.env.NEXTAUTH_URL}/tracker/${otpId}`
      let linkWithMobile;
      if(mobile.startsWith("+")){
        console.log("mobile starts with +", mobile)
        const mobileInProperFormat = mobile.replace("+", "%2B")
        console.log("mobileInProperFormat", mobileInProperFormat)
        linkWithMobile = link+"?mobile="+mobileInProperFormat
      }else{
        console.log("mobile does not start with +", mobile)
        linkWithMobile = link+"?mobile=%2B"+mobile
      }

      // const urlShort = await shortenUrl(linkWithMobile);
      // console.log("urlShort", urlShort)
      if(await redis.get(mobile) == null){
        await redis.set(mobile, 1);
        res.status(200).json({ link:linkWithMobile, otp, otpId })
      }else if(await redis.get(mobile)% 2 == 0 ){
        await redis.incr(mobile);
        res.status(200).json({ link:linkWithMobile, otp, otpId })
      }else{
        await redis.incr(mobile);
        res.status(200).json({ link :null,otp, otpId })
        await redis.set(otpId, otp + ":true", 'EX', 20*60);
        if(await redis.get(mobile+"-status") == null){
          await redis.set(mobile+"-status", true);
        }
      }
    }
    
}