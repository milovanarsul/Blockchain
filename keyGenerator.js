const EC = require('elliptic').ec
const ec = new EC('secp256k1');

const key = ec.genKeyPair(); //generate public and private key pair
const publicKey = key.getPublic('hex'); //generate public key
const privateKey = key.getPrivate('hex'); //generate private key

console.log();
console.log('Private key: ' + privateKey);

console.log();
console.log('Public key: ' + publicKey);

