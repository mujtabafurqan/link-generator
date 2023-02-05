import Redis from 'ioredis'

let redis = new Redis(process.env.REDIS_URL)


export default async (req, res) => {
    const {phoneNo} = req.query;
    const randomNumber = Math.floor(100000 + Math.random() * 900000); 
    await redis.set(phoneNo, randomNumber);
    res.status(200).json({ otp : randomNumber })
}