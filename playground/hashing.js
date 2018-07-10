const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

let data = {
  id: 1
};

let token = jwt.sign(data, 'hash_secret');
console.log(token);

let decoded = jwt.verify(token, 'hash_secret');
console.log('decoded: ', decoded);

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