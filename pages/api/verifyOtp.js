import Redis from 'ioredis'

let redis = new Redis(process.env.REDIS_URL)

export default async (req, res) => {

    const {
        query: { otpId, otp, mobile },
        method,
      } = req;
    let mobileplus = mobile.replace(" ", "+")
    console.log("mobile", mobileplus)
    const otpAndIp = await redis.get(otpId);
    console.log("aigsdjshdsagd"+ await redis.get(`${mobileplus}-status`)); 
    if(otpAndIp === null) {
        res.status(200).json({ status : 'failure', message: 'OTP expired' })
    }else if(await redis.get(`${mobileplus}-status`) == 'false'){
        fetch('/api/sendAlerts/'+mobile)
        res.status(200).json({ status : 'failure', message: 'IP Mismatch. Please request a tracker Link to verify again'})
    }
    else{
        const otpFromRedis = otpAndIp.split(":")[0];
        const ipFromRedis = otpAndIp.split(":")[1];
        console.log(otpFromRedis, otp);
        if(otpFromRedis != otp) {
            res.status(200).json({ status : 'failure', message: 'OTP does not match' })
        }
        else if(ipFromRedis != 'true') {
            res.status(200).json({ status : 'failure', message: 'IP does not match'})
        }else{
            res.status(200).json({ status : 'success'})
        }
    }
    await redis.del(otpId)
}