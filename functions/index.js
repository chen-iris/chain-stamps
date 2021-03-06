const functions = require('firebase-functions');

const algosdk = require('algosdk');
const encode = require('algosdk/src/encoding/address');
const axios = require('axios');
//Retrieve the token, server and port values for your installation in the algod.net
//and algod.token files within the data directory
const atoken = {'X-API-Key':"<>"};
const aserver = "https://testnet-algorand.api.purestake.io/ps1";

const account = {
  'addr': '<>',
  'sk': Uint8Array.from([
   <>
  ])
}

const algodclient = new algosdk.Algod(atoken, aserver, "");

const post_txn_token = {    
    'X-API-Key': '<>',
    'content-type' : 'application/x-binary'
}
const post_algodclient = new algosdk.Algod(post_txn_token, aserver, ""); // Use only for sendRawTransaction() 

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//

async function sendTransaction(data){
	//Get the relevant params from the algod
    let params = await algodclient.getTransactionParams();
    let endRound = params.lastRound + parseInt(1000);

    let txn = {
        "from": account.addr,
        "to": account.addr,
        "fee": 1000,
        "amount": 1000,
        "firstRound": params.lastRound,
        "lastRound": endRound,
        "genesisID": params.genesisID,
        "genesisHash": params.genesishashb64,
        "note": new Uint8Array(Buffer.from(data, 'base64')),
    };
    //sign the transaction
    let signedTxn = algosdk.signTransaction(txn, account.sk);
    //submit the transaction
    let tx = (await post_algodclient.sendRawTransaction(signedTxn.blob));
    return tx
}

exports.getHash = functions.https.onCall(async () => {
	let lastround = (await algodclient.status()).lastRound;
	let block = (await algodclient.block(lastround));
	return {payload:block.round+"|"+block.hash};
});

exports.verifyQr = functions.https.onCall(async (data) => {
	console.log(data)
	let code = data.split("|");
	let round = parseInt(code[0]);
	let block = (await algodclient.block(round));
	if (block.hash !== code[1]) throw new Error("bad hash")
	return {status:0, time:block.timestamp};
});

exports.findHash = functions.https.onCall(async (data) => {
	let transactions = (await axios(`https://api.testnet.algoexplorer.io/v1/account/${account.addr}/transactions/latest/100`)).data
	let hash = Buffer.from(data, "hex").toString("base64");
	for(var i =0;i<transactions.length;i++){
		if(transactions[i].noteb64 === hash) return {status:0, time:transactions[i].timestamp};
	}
	throw new Error("bad hash")
});


exports.commitImage = functions.storage.object().onFinalize(async (object) => {
	return sendTransaction(object.md5Hash)
});
