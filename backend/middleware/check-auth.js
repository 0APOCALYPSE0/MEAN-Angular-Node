const jwt = require('jsonwebtoken');
const passport = require('passport');

const normalAuth = (req, res, next) => {
  try{
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { email: decodedToken.email, userId: decodedToken.userId };
    next();
  }catch(error){
    res.status(401).json({ message: "You are not authenticated!" });
  }
}

const passportAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({ message: 'You are not authenticated!' });
    }
    req.userData = {
      email: user.email,
      userId: user.id
    };
    next();
  })(req, res, next);
}

module.exports = {
  passportAuth,
  normalAuth
}
