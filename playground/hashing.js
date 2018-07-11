const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/**
 * Password Hashing using bcrypt lib
 */
let password = '123abc!';

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash);
//   });
// });
let hashedPwd = '$2a$10$as/p03h2ijJbV4r9tIXcxuHRMdzS9B4yBAwd7SSpQvdJTsVWOH2bm';
bcrypt.compare(password, hashedPwd, (err, res) => {
  console.log(res);
});

/**
 * Data Hashing/Encryption using jsonwebtoken lib
 */
// let data = {
//   id: 1
// };

// let token = jwt.sign(data, 'hash_secret');
// console.log(token);

// let decoded = jwt.verify(token, 'hash_secret');
// console.log('decoded: ', decoded);


/**
 * Data Hashing/Encryption using crypto-js lib
 */
// let msg = 'I am user number 3';
// let hash = SHA256(msg).toString();

// console.log(`message: ${msg}`);
// console.log(`hash: ${hash}`);

// let data = {
//   id: 4
// };
// let token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'hash_secret').toString() // hashing + salting
// };

// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString(); // hacker does not know salting we used

// let resultHash = SHA256(JSON.stringify(data) + 'hash_secret').toString();
// if (resultHash === token.hash) {
//   console.log('data was changed');
// } else {
//   console.log('Data was changed. DO NOT TRUST!');
// }