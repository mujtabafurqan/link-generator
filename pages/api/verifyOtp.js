import Redis from 'ioredis'

let redis = new Redis(process.env.REDIS_URL)

export default async (req, res) => {

    const {
        query: { otpId, otp },
        method,
      } = req;

    const otpAndIp = await redis.get(otpId);
    
    if(otpAndIp === null) {
        res.status(200).json({ status : 'failure', message: 'OTP expired' })
    }else{
        const otpFromRedis = otpAndIp.split(":")[0];
        const ipFromRedis = otpAndIp.split(":")[1];
        console.log(otpFromRedis, otp);
        if(otpFromRedis != otp) {
            res.status(200).json({ status : 'failure', message: 'OTP does not match' })
        }
        else if(ipFromRedis != (req.connection.remoteAddress)) {
            res.status(200).json({ status : 'failure', message: 'IP does not match' + ipFromRedis + " " + req.connection.remoteAddress })
        }else{
            res.status(200).json({ status : 'success'})
        }
    }
}