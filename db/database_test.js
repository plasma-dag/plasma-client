'use-strict';
const { Block, Header } = require('../core/block');
const { Database } = require('./database');

let newHeader = new Header(
    'dddddddddd',
    null,
    null,
    0,
    12,
    12314124,
    152,
    null
);

let newBlock = new Block(newHeader, 'signature', []);

const db = new Database();

db.writeBlock(newBlock).then( res => console.log(res) );
db.readBlock(newBlock.hash()).then(res => console.log(res));
