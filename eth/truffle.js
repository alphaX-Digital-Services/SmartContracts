/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require('truffle-hdwallet-provider');
var mnemonic = 'direct initial citizen senior achieve main december physical bubble apology curtain wonder';
module.exports = {
 // See <http://truffleframework.com/docs/advanced/configuration>
 // to customize your Truffle configuration!
 networks: {
   rinkeby: {
     provider: function() {
       return new HDWalletProvider(mnemonic, 'https://rinkeby.infura.io/87b775211d854ccf8e34857d484376e887b775211d854ccf8e34857d484376e8');
     },
     network_id: 1
   }
 }
};
