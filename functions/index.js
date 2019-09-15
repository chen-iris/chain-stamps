const functions = require('firebase-functions');

const algosdk = require('algosdk');
const encode = require('algosdk/src/encoding/address');

//Retrieve the token, server and port values for your installation in the algod.net
//and algod.token files within the data directory
const atoken = {'X-API-Key':"SYnCl5Mzrt3H2k6OoN9ca5IJcQ7pe9MMAk3t7uPh"};
const aserver = "https://testnet-algorand.api.purestake.io/ps1";

const account = {
  'addr': 'YVNVFBHSQBFXCICTOGNSRXH5HDJGDI7ZX5UV7GOHPUO2EYFZFY4VHIGORE',
  'sk': Uint8Array.from([
    208, 211, 194, 143,  58, 118, 105, 199, 216,  46, 223,
    209,  11, 144,  53, 138,  34, 111, 102, 228,  44,  60,
     46,  33, 120, 238, 122, 224,  43,  91, 154, 218, 197,
     91,  82, 132, 242, 128,  75, 113,  32,  83, 113, 155,
     40, 220, 253,  56, 210,  97, 163, 249, 191, 105,  95,
    153, 199, 125,  29, 162,  96, 185,  46,  57
  ])
}

const algodclient = new algosdk.Algod(atoken, aserver, "");

const post_txn_token = {    
    'X-API-Key': 'SYnCl5Mzrt3H2k6OoN9ca5IJcQ7pe9MMAk3t7uPh',
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

exports.getHash = functions.https.onRequest(async (request, response) => {
	let lastround = (await algodclient.status()).lastRound;
	let block = (await algodclient.block(lastround));
	response.send({payload:block.round+"|"+block.hash});
});

exports.verifyQr = functions.https.onRequest(async (request, response) => {
	try{
	let code = request.body.code.split("|");
	let round = parseInt(code[0]);
	let block = (await algodclient.block(round));
	if (block.hash !== code[1]) throw new Error("bad hash")
		response.send({status:0, time:block.timestamp});
	}catch(e){
		response.send({status:1});
	}
});

exports.findHash = functions.https.onRequest(async (request, response) => {
	try{
	let code = request.body.code.split("|");
	let round = parseInt(code[0]);
	let block = (await algodclient.block(round));
	if (block.hash !== code[1]) throw new Error("bad hash")
		response.send({status:0, time:block.timestamp});
	}catch(e){
		response.send({status:1});
	}
});


exports.commitImage = functions.storage.object().onFinalize(async (object) => {
	return sendTransaction(object.md5Hash)
});
