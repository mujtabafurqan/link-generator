import Redis from 'ioredis'
import uuid from 'react-uuid';
const request = require('request');

let redis = new Redis(process.env.REDIS_URL)

const shortenUrl = async (url) => {

  const options = {
    url: `https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`,
    json: true
  };

  request.get(options, (err, res, body) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("short URL",body.shorturl);
    return body.shorturl;
  });
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
      const urlShort = await shortenUrl(link);
      res.status(200).json({ urlShort, otp, otpId })
    }
    else if(authorized == 'vanilla'){
      res.status(200).json({ link, otp, otpId })
      const otpRedis = await redis.set(otpId, otp + ":true", 'EX', 20*60);
    }
    else{
      link= `${process.env.NEXTAUTH_URL}/tracker/${otpId}`
      let linkWithMobile;
      if(mobile.startsWith("+")){
        console.log("mobile starts with +", mobile)
        const mobileInProperFormat = mobile.replace("+", "%2B")
        console.log("mobileInProperFormat", mobileInProperFormat)
        linkWithMobile = link+"?&&mobile="+mobileInProperFormat
      }else{
        console.log("mobile does not start with +", mobile)
        linkWithMobile = link+"?&&mobile=%2B"+mobile
      }

      const urlShort = await shortenUrl(linkWithMobile);

      if(await redis.get(mobile) == null){
        await redis.set(mobile, 1);
        res.status(200).json({ link:urlShort, otp, otpId })
      }else if(await redis.get(mobile)% 3 == 0 ){
        await redis.incr(mobile);
        res.status(200).json({ link:urlShort, otp, otpId })
      }else{
        await redis.incr(mobile);
        res.status(200).json({ link :null,otp, otpId })
        const otpRedis = await redis.set(otpId, otp + ":true", 'EX', 20*60);
      }
    }
    
}