import Redis from 'ioredis'
import uuid from 'react-uuid';

let redis = new Redis(process.env.REDIS_URL)

export default async (req, res) => {

    const {
        query: { ipaddress, authorized },
        method,
      } = req;

    const otpId = uuid();
    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpRedis = await redis.set(otpId, otp + ":" + ipaddress, 'EX', 20*60);
    console.log(otpRedis);
    let link;
    if(authorized)
      link= `${process.env.NEXTAUTH_URL}/getotp/${otpId}?authorized=true`
    else
      link= `${process.env.NEXTAUTH_URL}/getotp/${otpId}?authorized=false`
    res.status(200).json({ link, otp, otpId })
}