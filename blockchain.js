const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec
const ec = new EC('secp256k1');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    //returns the sha256 of the transaction. this will be signed with our private key
    calculateHash(){
        return SHA256(this.fromAddress + this.toAddress + this.amount).toString()
    }

    //method used to sign a transaction
    signTransaction(signingKey){

        //check if the public key equals your wallet address
        if(signingKey.getPublic('hex') !== this.fromAddress){
            throw new Error('Signing transactions is only available for your wallet')
        }

        const transactionHash = this.calculateHash(); //hash of the transaction
        const signature = signingKey.sign(transactionHash, 'base64'); //signature for the transaction
        this.signature = signature.toDER('hex'); //store the signing key
    }

    //check if the transaction is valid
    isValid(){
        if(this.fromAddress === null) return true;

        //check if there is a signature and extract the public key
        if(!this.signature || this.signature.length === 0){
            throw new Error('No singature in this transaction');
        }

        const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
        return publicKey.verify(this.calculateHash(), this.signature);

    }
}

class Block{
    constructor(timestamp, transactions, previousHash=""){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash(); //calculate the hash of the current block
        this.nonce = 0; //random number used to calculate the hash of a block
    }

    //returns the hash using sha256 for the currentBlock
    calculateHash(){
        return SHA256(this.index + this.timestamp + this.previousHash + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    //mine the block. Ensures that the hash begins with 'difficulty' amount of zeros.
    mineBlock(difficulty){
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash(); //calculate the hash of the mined block
        }

        console.log("Block mined: " + this.hash);
    }

    //make sure all the transactions are valid
    hasValidTransactions(){
        for(const transaction in this.transactions){
            if(!transaction.isValid()){
                return false
            }
        }

        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock]; //array of blocks. initialize with the genesis Block;
        this.difficulty = 4; //difficulty for mining a block
        this.pendingTransactions = []; //pending transactions array
        this.miningReward = 100; //mining reward in coins, for the miner that mines a new block
    }

    //creates the genesis block -- the first block
    createGenesisBlock(){
        return new Block("22/01/2022", "Gensis block", "0");
    }

    //return the latest block in the chain
    getLatestBlock(){
        return this.chain[this.chain.length-1];
    }

    //mine the pending transactions and receive reward
    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log("Block succesfully mined!");
        this.chain.push(block);

        //create a new transaction to reward the miner after block has been successfully mined
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    //add a pending transaction to the pending transactions array
    addTransaction(transaction){

        //check if the fromAddress and the toAddress is nil
        if(!transaction.fromAddress || !transaction.toAddress){
            throw new Error('Transaction must have a from and to address!');
        }

        //check if the transaction is not valid
        if(!transaction.isValid()){
            throw new Error("Cannot add invalid transaction!");
        }

        this.pendingTransactions.push(transaction);
    }

    //return the balance of a address
    getBalanceOfAddress(address){
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                //if you transfer coins to some address, decrease the balance
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                //if you receive coins from some address, increase the balance
                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    //verifiy the integity of the blockchain
    //return true if the blockchain is valid, otherwise false
    isChainValid(){
        for(let i = 1; i < this.chain.length-1; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];

            //ckeck if the block has invalid transactions
            if(!currentBlock.hasValidTransactions()){
                return false;
            }

            //check if the hash of the current block is still valid
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            //check if our block points to the correct previous block
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;