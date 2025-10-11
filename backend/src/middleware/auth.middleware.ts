import jwt from "jsonwebtoken"

const protect = (req : any,res : any ,next : any) => {
   let token;
   if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
    try{
     
     token = req.headers.authorization.split(" ")[1];
     if (!process.env.JWT_SECRET_KEY) {
       return res.status(500).json({ message: "JWT_SECRET not configured" });
     }
     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY) as jwt.JwtPayload;
     req.user = { id : decoded.id }
     next()
   }catch(err){
      console.error(err);
      return res.status(401).json({ message : "No Auth , Token invalid"});
   }

    if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
   }
 }
}

module.exports = { protect };