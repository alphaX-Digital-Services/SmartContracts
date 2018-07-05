var HeyMatePayToken = artifacts.require("HeyMatePayToken.sol");
var HeyMateReputationToken = artifacts.require("HeyMateReputationToken.sol");
var HeyMateJobEscrow = artifacts.require("HeyMateJobEscrow.sol");

contract('HeyMateJobEscrow test', (accounts) => {

  it("HeyMatePayToken should have in the first account", function() {
    return HeyMatePayToken.deployed()
      .then(function(instance) {
        return instance.balanceOf.call(accounts[0]);
      })
      .then(function(balance) {
        assert.equal(balance.valueOf(), 1e+22, "100000000 wasn't in the first account");
      });
  });

  it("HeyMateReputationToken should not have in the first account", function() {
    return HeyMateReputationToken.deployed()
      .then(function(instance) {
        return instance.balanceOf.call(accounts[0]);
      })
      .then(function(balance) {
        assert.equal(balance.valueOf(), 0, "100000000 wasn't in the first account");
      });
  });

});