const { User } = require('../model/user');

const authenticate = (req, res, next) => {
  const token = req.header('x-auth');

  User.fetchByToken(token).then((user) => {
    if (!user) {
      return Promise.reject(new Error('No User found'));
    }

    req.user = user;
    req.token = token;

    next();
  })
    .catch((e) => {
      res.status(401).send(e);
    });
};

module.exports = { authenticate };
