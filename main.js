const SHA256 = require('crypto-js/sha256');

class Block{
    constructor(index, timestamp, data, previousHash=""){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = this.calculateHash(); //calculate the hash of the current block
    }

    //returns the hash using sha256 for the currentBlock
    calculateHash(){
        return SHA256(this.index + this.timestamp + this.previousHash + JSON.stringify(this.data)).toString();
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock]; //array of blocks. initialize with the genesis Block;
    }

    //creates the genesis block -- the first block
    createGenesisBlock(){
        return new Block(0, "22/01/2022", "Gensis block", "0");
    }

    //return the latest block in the chain
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;  //hash of the last block in the chain
        newBlock.hash = newBlock.calculateHash(); //calculate the hash of the new block
        this.chain.push(newBlock); //add the new block to the chain
    }
}

let swiftCoin = new Blockchain();
swiftCoin.addBlock(new Block(1, "22/01/2022", {amount: 4}));
swiftCoin.addBlock(new Block(2, "22/01/2022", {amount: 10}));

console.log(JSON.stringify(swiftCoin, null, 4));
