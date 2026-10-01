const jwt=require('jsonwebtoken');
const {User}=require('../models');

async function checkforAuth(req,res,next) {
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"Unauthorized"
        })
    }
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        console.log(decoded);
        req.user=decoded; // attaching user to request
        next()  
    } catch (error) {
        res.status(401).json({
            message:"Unauthorized"
        })
    }
}

module.exports={checkforAuth}