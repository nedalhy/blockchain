var SHA256 = require('crypto-js/sha256');


class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.timeStamp = Date.now();
    }
}

class Block {
        
    constructor(timeStamp, previousHash='', transactions){
        this.timeStamp = timeStamp;
        this.previousHash = previousHash;
        this.hash = this.generateHash();
        this.transactions = transactions;
        this.nonce = 0;
    }

    generateHash() {
        return SHA256(
            JSON.stringify(this.timeStamp) + 
            JSON.stringify(this.previousHash) + 
            JSON.stringify(this.nonce) +
            JSON.stringify(this.transactions)).toString();
    }

    mineBlock(dificulty){
        while(this._proofOfWork(this.hash, dificulty)) {
            this.nonce++;
            this.hash = this.generateHash();
        }
    }

    _proofOfWork(hash, difficulty){
        return hash.substring(0, difficulty) !== Array(difficulty + 1).join('0');
    }
}



class BlockChain {

    constructor() {
        this.chain = [
            this.createGenesisBlock()
        ];
        this.difficulty = 4;
        this.reward = 100;
        this.pendingTransactions = [];
    }

    createGenesisBlock() {
        return new Block(Date.now(), null, []);
    }

    getLastBlock (){
        return this.chain[this.chain.length - 1];
    }

    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.getLastBlock().hash, this.pendingTransactions);

        console.log('Starting mining');

        block.mineBlock(this.difficulty);

        console.log('The block is mined successfully');

        this.chain.push(block);

        // Initialize the pending trascations with the reward transaction
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.reward)
        ]
    }

    isValid(){
      for(let i=1; i < this.chain.length; i++){
          currentBlock = this.chain[i];
          previousBlock = this.chain[i - 1];

          if (currentBlock.generateHash() !== currentBlock.hash) {
            return false;
          }

          if (previousBlock.hash !== currentBlock.previousHash) {
            return false;
          }
      }
      return true;
    }

    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    getBalance(address){
        let balance = 0;

        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
}

let blockChain = new BlockChain();

blockChain.createTransaction(new Transaction('address1', 'address2', 50));
blockChain.createTransaction(new Transaction('address2', 'address1', 20));


blockChain.minePendingTransactions('address3');


console.log('address1 balance is:', blockChain.getBalance('address1'));
console.log('address2 balance is:', blockChain.getBalance('address2'));
console.log('address3 balance is:', blockChain.getBalance('address3'));


blockChain.minePendingTransactions('address3');

console.log('address1 balance is:', blockChain.getBalance('address1'));
console.log('address2 balance is:', blockChain.getBalance('address2'));
console.log('address3 balance is:', blockChain.getBalance('address3'));

// console.log(JSON.stringify(blockChain, undefined, 4));