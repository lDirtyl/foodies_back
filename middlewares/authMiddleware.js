import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";
import "dotenv/config";

const secret = process.env.JWT_SECRET;

// Кастомна функція для отримання токена з cookie або з Authorization header
function extractToken(req) {
  if (req && req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  // Якщо немає cookie — пробуємо з Authorization header
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

const params = {
  secretOrKey: secret,
  jwtFromRequest: extractToken,
  passReqToCallback: true,
};

passport.use(
  new JwtStrategy(params, async (req, payload, done) => {
    try {
      const user = await User.findByPk(payload.id);
      const incomingToken = extractToken(req);
      if (!user || user.token !== incomingToken) {
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

const authMiddleware = (req, res, next) => {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: "Not authorized" });
    }
    req.user = user;
    next();
  })(req, res, next);
};

console.log("AUTH MIDDLEWARE LOADED"); 
export default authMiddleware;