import  jwt from "jsonwebtoken";
import User from '../models/user.js';


//check
export const auth = async(req,res,next)=>{
    let token;
    token=req.cookies.jwt;
    // console.log(req.cookies);
    if(token){
        try {
            //const { password, user } = User._doc
            const decode=jwt.verify(token,process.env.JWT_SECRET);
            req.user=await User.findById(decode.userId).select("-password");
            next();
        } catch (error) {
            res.status(401).json({error:"Not authorized, token is invalid"});
        }
    }else{
        res.status(401).json("Not authorized, no token found");
    }
};