const functions = require('firebase-functions');

const algosdk = require('algosdk');

//Retrieve the token, server and port values for your installation in the algod.net
//and algod.token files within the data directory
const atoken = {'X-API-Key':"SYnCl5Mzrt3H2k6OoN9ca5IJcQ7pe9MMAk3t7uPh"};
const aserver = "https://testnet-algorand.api.purestake.io/ps1";

const algodclient = new algosdk.Algod(atoken, aserver, "");


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.getHash = functions.https.onRequest(async (request, response) => {
	let lastround = (await algodclient.status()).lastRound;
	let block = (await algodclient.block(lastround));
	response.send(block)
});
