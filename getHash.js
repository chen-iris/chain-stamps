const algosdk = require('algosdk');

//Retrieve the token, server and port values for your installation in the algod.net
//and algod.token files within the data directory
const atoken = {'X-API-Key':"SYnCl5Mzrt3H2k6OoN9ca5IJcQ7pe9MMAk3t7uPh"};
const aserver = "https://testnet-algorand.api.purestake.io/ps1";

const algodclient = new algosdk.Algod(atoken, aserver, "");

(async () => {
    let lastround = (await algodclient.status()).lastRound;
    let block = (await algodclient.block(lastround));
    console.log( block.hash );
})().catch(e => {
    console.log(e);
});