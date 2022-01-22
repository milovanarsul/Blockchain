const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
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
    createTransaction(transaction){
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

let swiftCoin = new Blockchain();
swiftCoin.createTransaction(new Transaction('address1', 'address2', 100));
swiftCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log("Starting the miner...");
swiftCoin.minePendingTransactions('marianAddress');

console.log("Balance of marianAddress is: " + swiftCoin.getBalanceOfAddress('marianAddress'));
