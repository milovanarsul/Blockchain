const {Blockchain, Transaction} = require('./blockchain');
const EC = require('elliptic').ec
const ec = new EC('secp256k1');

const myPrivateKey = ec.keyFromPrivate('82153bba379dd7644fd71c5afc49605bc7bcd2ff984a1cdc91abd170cdc910ac');
const myWalletAddress = myPrivateKey.getPublic('hex');

let swiftCoin = new Blockchain();

const transaction1 = new Transaction(myWalletAddress, 'some public key', 10);
transaction1.signTransaction(myPrivateKey); //sign the transaction with my private key

console.log("Starting the miner...");
swiftCoin.minePendingTransactions(myWalletAddress);

//console.log("Balance of marianAddress is: " + swiftCoin.getBalanceOfAddress(myWalletAddress));
