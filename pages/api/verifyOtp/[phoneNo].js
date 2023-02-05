import Redis from 'ioredis'

let redis = new Redis(process.env.REDIS_URL)


export default async (req, res) => {
    const {phoneNo} = req.query;
    const {otp} = req.body;
    const otpFromRedis = await redis.get(phoneNo);
    if (otpFromRedis === otp) {
        res.status(200).json({ status : 'success' })
    }
    else {
        res.status(200).json({ status : 'failure' })
    }
}