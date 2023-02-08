import Redis from 'ioredis'
import requestIp from 'request-ip'

let redis = new Redis(process.env.REDIS_URL)

export default async (req, res) => {

    const {
        query: { otpId, otp },
        method,
      } = req;

    const otpAndIp = await redis.get(otpId);
    const detectedIp = requestIp.getClientIp(req)
    if(otpAndIp === null) {
        res.status(200).json({ status : 'failure', message: 'OTP expired' })
    }else{
        const otpFromRedis = otpAndIp.split(" : ")[0];
        const ipFromRedis = otpAndIp.split(" : ")[1];
        console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress)
        if(otpFromRedis !== otp) {
            res.status(200).json({ status : 'failure', message: 'OTP does not match' })
        }
        else if(ipFromRedis !== detectedIp) {

            res.status(200).json({ status : 'failure', message: 'IP does not match' })
        }else{
            res.status(200).json({ status : 'success'})
        }
    }
}