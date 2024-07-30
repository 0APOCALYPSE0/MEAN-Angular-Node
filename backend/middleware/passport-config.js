const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
const User = require('../models/user')
const passport = require('passport')

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_KEY;

passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
  User.findOne({ id: jwt_payload.userId }, function (err, user) {
        if (err) {
            return done(err, false, { message: "Not authorized" });
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false, { message: "Not authorized" });
            // or you could create a new account
        }
    });
}));