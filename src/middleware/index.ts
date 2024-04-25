import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import config from "../utils/config";

export const verifyToken = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        // Handle expired JWT errors
        return res.status(403).send("Forbidden (token expired)");
      } else if (err.name === "JsonWebTokenError") {
        // Handle invalid JWT errors (e.g., expired token)
        return res.status(403).send("Forbidden (invalid token)");
      }
      // Handle other JWT verification errors
      return res.status(500).send("Error verifying token");
    }

    req.uid = (decoded as { uid: string }).uid;
    next();
  });
};

// Rate limiting middleware
export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 5, // Limit 5 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).send("Too many requests. Please try again later.");
  },
});
