var HeyMatePayToken = artifacts.require("HeyMatePayToken.sol");
var HeyMateReputationToken = artifacts.require("HeyMateReputationToken.sol");
var HeyMateJobEscrow = artifacts.require("HeyMateJobEscrow.sol");

/**
 * Accounts:
(0) 0x627306090abab3a6e1400e9345bc60c78a8bef57 - owner
(1) 0xf17f52151ebef6c7334fad080c5704d77216b732 - client
(2) 0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef - worker
(3) 0x821aea9a577a9b44299b9c15c88cf3087f3b5544
(4) 0x0d1d4e623d10f9fba5db95830f7d3839406c6af2
(5) 0x2932b7a2355d6fecc4b5c0b6bd44cc31df247a2e
(6) 0x2191ef87e392377ec08e7c08eb105ef5448eced5
(7) 0x0f4f2ac550a1b4e2280d04c21cea7ebd822934b5
(8) 0x6330a553fc93768f612722bb8c2ec78ac90b3bbc
(9) 0x5aeda56215b167893e80b4fe645ba6d5bab767de
 */

contract('HeyMateJobEscrow test', (accounts) => {

  let HeyMatePayTokenInstance, HeyMateReputationTokenInstance, HeyMateJobEscrowInstance;

  before(function() {
    Promise.all([
        HeyMatePayToken.deployed(),
        HeyMateReputationToken.deployed(),
        HeyMateJobEscrow.deployed()
      ])
      .then(([HeyMatePayTokenDeployed, HeyMateReputationTokenDeployed, HeyMateJobEscrowDeployed]) => {
        HeyMatePayTokenInstance = HeyMatePayTokenDeployed;
        HeyMateReputationTokenInstance = HeyMateReputationTokenDeployed;
        HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;

        console.log('HeyMatePayTokenInstance.address', HeyMatePayTokenInstance.address);
        console.log('HeyMateReputationTokenDeployed.address', HeyMateReputationTokenDeployed.address);
        console.log('HeyMateJobEscrowInstance.address', HeyMateJobEscrowInstance.address);
        return true;
      })
      .then(_ => HeyMatePayTokenInstance.transfer(accounts[1], 10000), { from: accounts[0] })
      .then(_ => HeyMateReputationTokenInstance.mint(accounts[2], 10000), { from: accounts[0] });
  });

  it("HeyMatePayToken should have 10000 HEY in the Client account", function() {
    HeyMatePayTokenInstance.balanceOf(accounts[1])
      .then(balance => assert.equal(balance.valueOf(), 10000, "10000 wasn't in the Client account"));
  });

  it("HeyMateReputationToken should have 10000 HMR in the Worker account", function() {
    HeyMateReputationTokenInstance.balanceOf(accounts[2])
      .then(balance => assert.equal(balance.valueOf(), 10000, "10000 wasn't in the Worker account"));
  });

  it("Escrow Contract should receive 100HEY tokens from Client and 100HMR tokens from Worker", function() {
    HeyMatePayTokenInstance.approve(HeyMateJobEscrowInstance.address, 100, { from: accounts[1] })
      .then(_ => HeyMateReputationTokenInstance.approve(HeyMateJobEscrowInstance.address, 100, { from: accounts[2] }))
      .then(_ => HeyMateJobEscrowInstance.createEscrow(accounts[1], accounts[2], 100, 100, { from: accounts[0] }))
      .then(_ => Promise.all([
        HeyMatePayTokenInstance.balanceOf(HeyMateJobEscrowInstance.address),
        HeyMateReputationTokenInstance.balanceOf(HeyMateJobEscrowInstance.address)
      ]))
      .then(([HEYTokenBallance, HMRTokenBallance]) => assert.deepEqual([HEYTokenBallance.valueOf(), HMRTokenBallance.valueOf()].valueOf(), ['100', '100'], "100HEY OR 100HMR wasn't in the HeyMateJobEscrow account"));
  });

});