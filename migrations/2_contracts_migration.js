var HeyMatePayToken = artifacts.require("./HeyMatePayToken.sol");
var HeyMateReputationToken = artifacts.require("./HeyMateReputationToken.sol");
var HeyMateJobEscrow = artifacts.require("./HeyMateJobEscrow.sol");

module.exports = function(deployer) {
  deployer.deploy([
    HeyMatePayToken,
    HeyMateReputationToken
  ]).then(([HeyMatePayTokenDeployed, HeyMateReputationTokenDeployed]) => deployer.deploy(HeyMateJobEscrow, HeyMatePayTokenDeployed.address, HeyMateReputationTokenDeployed.address));
};