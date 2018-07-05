const env = process.env.NODE_ENV || 'dev'; // setting the appropriate environment

process.env.PORT = process.env.PORT || 3000; // setting the appropriate PORT which is used by Heroku

if (env === 'dev') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
} else if (env === 'test') {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
