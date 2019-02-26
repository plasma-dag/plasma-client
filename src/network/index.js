"use strict";
const WebSocket = require("ws");

const bc = require("../core/blockchain");

// set environment variable
const p2p_port = process.env.P2P_PORT || 6001; // > $env:P2P_PORT=6003 (windows) || export P2P_PORT=3003 (mac)

const MessageType = {
  QUERY_LATEST: 0,
  QUERY_ALL: 1,
  RESPONSE_BLOCKCHAIN: 2,
  PROCESS_BLOCK: 3,
  CONFIRM_SEND: 4,
  CONFIRM_RECEIVE: 5
};

// sockets
var sockets = [];

var websockets = {};
var userTransfers = {};
var operator;
var opAddr;

function getSockets() {
  return sockets;
}

function getSubmittedBlocks(ws) {
  return operator.submittedBlocks[ws];
}

function getCheckpoints(ws) {
  return userTransfers[ws].checkpoints;
}

function getCofirmedCheckpoints(ws) {
  return userTransfers[ws].confirmedCheckpoints;
}

function initP2PServer() {
  const server = new WebSocket.Server({ port: p2p_port });
  server.on("connection", function(ws) {
    initConnection(ws);
  });
  console.log("Listening websocket p2p port on: " + p2p_port);
}

function initConnection(ws) {
  sockets.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryChainLengthMsg());
}

function initSet(ws, addr, userTransfer) {
  websockets[addr] = ws;
  userTransfers[ws] = userTransfer;
}

function initOpSet(operator, addr) {
  opAddr = addr;
  operator = operator;
}

function initMessageHandler(ws) {
  ws.on("message", function(data) {
    const message = JSON.parse(data);
    console.log("Received message" + JSON.stringify(message));
    switch (message.type) {
      case MessageType.QUERY_LATEST:
        write(ws, responseLatestMsg());
        break;
      case MessageType.QUERY_ALL:
        write(ws, responseChainMsg());
        break;
      case MessageType.RESPONSE_BLOCKCHAIN:
        handleBlockchainResponse(message);
        break;
      case MessageType.PROCESS_BLOCK:
        if (ws === sockets[0]) {
          processBlock(message, prvKey, operator); // TODO: should receive private key
          operator.submittedBlocks.push(message.data);
        }
        break;
      case MessageType.CONFIRM_SEND:
        confirmSend(message, userTransfers[ws]);
        userTransfer[ws].checkpoints.push(message.data);
        break;
      case MessageType.CONFIRM_RECEIVE:
        confirmReceive(message, userTransfers[ws]);
        userTransfer[ws].confirmedCheckpoints.push(message.data);
        break;
    }
  });
}

function closeConnection(ws) {
  console.log("Connection failed to peer: " + ws.url);
  sockets.splice(sockets.indexOf(ws), 1);
}

function initErrorHandler(ws) {
  ws.on("close", function() {
    closeConnection(ws);
  });
  ws.on("error", function() {
    closeConnection(ws);
  });
}

function connectToPeers(newPeers) {
  newPeers.forEach(function(peer) {
    const ws = new WebSocket(peer);
    ws.on("open", function() {
      initConnection(ws);
    });
    ws.on("error", function() {
      console.log("Connection failed");
    });
  });
}

function handleBlockchainResponse(message) {
  const receivedBlocks = JSON.parse(message.data);
  const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
  const latestBlockHeld = bc.getLatestBlock();

  if (latestBlockReceived.index > latestBlockHeld.index) {
    console.log(
      "Blockchain possibly behind. We got: " +
        latestBlockHeld.index +
        " Peer got: " +
        latestBlockReceived.index
    );
    if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
      console.log("We can append the received block to our chain");
      if (bc.addBlock(latestBlockReceived)) {
        broadcast(responseLatestMsg());
      }
    } else if (receivedBlocks.length === 1) {
      console.log("We have to query the chain from our peer");
      broadcast(queryAllMsg());
    } else {
      console.log("Received blockchain is longer than current blockchain");
      bc.replaceChain(receivedBlocks);
    }
  } else {
    console.log(
      "Received blockchain is not longer than current blockchain. Do nothing"
    );
  }
}

function queryAllMsg() {
  return { type: MessageType.QUERY_ALL };
}
function queryChainLengthMsg() {
  return { type: MessageType.QUERY_LATEST };
}
function responseChainMsg() {
  return {
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify(bc.getBlockchain())
  };
}
function responseLatestMsg() {
  return {
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([bc.getLatestBlock()])
  };
}

function write(ws, message) {
  ws.send(JSON.stringify(message));
}
function broadcast(message) {
  sockets.forEach(socket => write(socket, message));
}

function processBlock(message, prvKey, operator) {
  const block = message.data.block;
  const checkpoint = operator.processBlock(block, prvKey);
  if (checkpoint.error) return { error: true };

  const ws = getWebsocket(block.header.state.address);
  const message = {
    type: CONFIRM_SEND,
    data: {
      checkpoint: checkpoint
    }
  };
  write(ws, message);

  return { error: false };
}

function confirmSend(message, userTransfer) {
  const checkpoint = message.data.checkpoint;
  const opAddr = getOpAddr();
  const block = userTransfer.confirmSend(checkpoint, opAddr);
  if (block.error) return { error: true };

  const deps = block.transactions.length;
  block.transactions.forEach((tx, index) => {
    let ws = getWebsocket(tx.receiver);
    let message = {
      type: CONFIRM_RECEIVE,
      data: {
        checkpoint: checkpoint,
        header: block.header,
        deps: deps,
        proof: merkleProof(userTransfer.leaves, index),
        root: block.header.merkleHash,
        tx: tx
      }
    };
    write(ws, message);
  });

  return { error: false };
}

function confirmReceive(message, userTransfer) {
  const data = message.data;
  const opAddr = getOpAddr();
  const result = userTransfer.confirmReceive(
    data.checkpoint,
    data.header,
    data.deps,
    data.proof,
    data.root,
    data.tx,
    opAddr
  );
  if (result.error) return { error: true };
  return { error: false };
}

function getWebsocket(addr) {
  return websockets[addr];
}

function getOpAddr() {
  return opAddr;
}

module.exports = {
  connectToPeers,
  getSockets,
  broadcast,
  responseLatestMsg,
  initP2PServer,
  initSet,
  initOpSet,
  getWebsocket,
  getOpAddr,
  getSubmittedBlocks,
  getCheckpoints,
  getCofirmedCheckpoints
};
