import jwt from "jsonwebtoken";

export const createToken=(res,userId)=> {
    const token =jwt.sign({userId},process.env.JWT_SECRET, {
        expiresIn: "10h",
    });
    // console.log("Token generated",token);
    // set jwt as http-only cookie
    res.cookie("jwt",token,{
        // httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 10*60*60*1000,
    });

    return token;
};