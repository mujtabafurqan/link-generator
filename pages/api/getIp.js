export default async (req, res) => {
    res.status(200).json({ ipaddress:   req.headers['x-forwarded-for'] || req.connection.remoteAddress })
}