import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");
    
    // Add user id to request
    req.userId = decoded.id;
    
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};