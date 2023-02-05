import Redis from 'ioredis'

let redis = new Redis(process.env.REDIS_URL)

export default function Otp({otp}){
  return (
    <div>
      <p>Otp: {otp}</p>
    </div>
  )
  
}

export async function getServerSideProps(context) {
  
  const {otpId} = context.params;
  const otp = await redis.get(otpId);
  return { props: { otp } }
}