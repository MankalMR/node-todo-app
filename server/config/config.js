const env = process.env.NODE_ENV || 'dev'; // setting the appropriate environment

process.env.PORT = process.env.PORT || 3000; // setting the appropriate PORT which is used by Heroku

if (env === 'dev' || env === 'test') {
  const config = require('./config.json');
  const envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}
