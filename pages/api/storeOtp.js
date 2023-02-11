import Redis from 'ioredis'
import uuid from 'react-uuid';

let redis = new Redis(process.env.REDIS_URL)

export default async (req, res) => {

    const {
        query: { ipaddress, authorized, mobile },
        method,
      } = req;

    const otpId = uuid();
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpRedis = await redis.set(otpId, otp + ":" + ipaddress, 'EX', 20*60);
    console.log(otpRedis);
    
    let link;
    if(authorized == 'true'){
      link= `${process.env.NEXTAUTH_URL}/getotp/${otpId}?authorized=true`
      res.status(200).json({ link, otp, otpId })
    }
    else{
      link= `${process.env.NEXTAUTH_URL}/getotp/${otpId}?authorized=false`

      if(await redis.get(mobile) == null){
        await redis.set(mobile, 1);
        res.status(200).json({ link, otp, otpId })
      }else if(await redis.get(mobile)% 3 == 0 ){
        await redis.incr(mobile);
        res.status(200).json({ link, otp, otpId })
      }else{
        await redis.incr(mobile);
        res.status(200).json({ link :null,otp, otpId })
      }
    }
    
}