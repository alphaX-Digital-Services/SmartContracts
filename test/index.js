var HeyMatePayToken = artifacts.require('HeyMatePayToken.sol');
var HeyMateReputationToken = artifacts.require('HeyMateReputationToken.sol');
var HeyMateJobEscrow = artifacts.require('HeyMateJobEscrow.sol');

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

contract(`Job Delivered Successfully`, (accounts) => {

  let HeyMatePayTokenInstance, HeyMateReputationTokenInstance, HeyMateJobEscrowInstance;

  before(() => Promise.all([
      HeyMatePayToken.deployed(),
      HeyMateReputationToken.deployed(),
      // HeyMateJobEscrow.deployed()
    ])
    .then(([HeyMatePayTokenDeployed, HeyMateReputationTokenDeployed, HeyMateJobEscrowDeployed]) => {
      HeyMatePayTokenInstance = HeyMatePayTokenDeployed;
      HeyMateReputationTokenInstance = HeyMateReputationTokenDeployed;
      // HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;

      // console.log('HeyMatePayTokenInstance.address', HeyMatePayTokenInstance.address);
      // console.log('HeyMateReputationTokenDeployed.address', HeyMateReputationTokenDeployed.address);
      // console.log('HeyMateJobEscrowInstance.address', HeyMateJobEscrowInstance.address);
      return true;
    })
    .then(_ => HeyMatePayTokenInstance.transfer(accounts[1], 100), { from: accounts[0] })
    .then(_ => HeyMateReputationTokenInstance.mint(accounts[2], 100), { from: accounts[0] }));

  it(`should have 100HEY on Client's ballance`, () => HeyMatePayTokenInstance.balanceOf(accounts[1])
    .then(balance => assert.equal(balance.valueOf(), 100, `NO 100HEY on Client's ballance`)));

  it(`should have 100HMR on Worker's ballance`, () => HeyMateReputationTokenInstance.balanceOf(accounts[2])
    .then(balance => assert.equal(balance.valueOf(), 100, `NO 100HMR on Worker's ballance`)));

  it(`should deploy a new Escrow Contract from the Owners Address`, () => {
    return HeyMateJobEscrow.new(HeyMatePayTokenInstance.address, HeyMateReputationTokenInstance.address, { from: accounts[0] })
      .then(HeyMateJobEscrowDeployed => {
        HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
        return assert.isOk(HeyMateJobEscrowInstance.address, `everything is ok ${HeyMateJobEscrowDeployed.address}`);
      });
  })

  it(`should approve HeyMatePayTokenInstance to transfer 100HEY from Client to Escrow`, () =>
    HeyMatePayTokenInstance.approve(HeyMateJobEscrowInstance.address, 100, { from: accounts[1] })
    .then(_ => HeyMatePayTokenInstance.allowance(accounts[1], HeyMateJobEscrowInstance.address))
    .then(allowance => assert.equal(allowance.valueOf(), 100, `DIDN'T approve HeyMatePayTokenInstance to transfer 100HEY from Client to Escrow`))
  );

  it(`should approve HeyMateReputationTokenInstance to transfer 100HEY from Worker to Escrow`, () =>
    HeyMateReputationTokenInstance.approve(HeyMateJobEscrowInstance.address, 100, { from: accounts[2] })
    .then(_ => HeyMateReputationTokenInstance.allowance(accounts[2], HeyMateJobEscrowInstance.address))
    .then(allowance => assert.equal(allowance.valueOf(), 100, `DIDN'T approve HeyMateReputationTokenInstance to transfer 100HEY from Worker to Escrow`))
  );

  it(`should create a new Job on Escrow Contract`, () =>
    HeyMateJobEscrowInstance.createEscrow(accounts[1], accounts[2], 100, 100, { from: accounts[0] }));

  it(`should have 100HEY on the new Job on Escrow Contract`, () =>
    HeyMateJobEscrowInstance.job.call()
    .then(job => assert.equal(job[2], 100, `NO 100HEY on the new Job on Escrow Contract`))
  );

  it(`should have 100HMR on the new Job on Escrow Contract`, () =>
    HeyMateJobEscrowInstance.job.call()
    .then(job => assert.equal(job[3], 100, `NO 100HMR on the new Job on Escrow Contract`))
  );

  it(`should deliver the Job`, () =>
    HeyMateJobEscrowInstance.releaseEscrow({ from: accounts[0] })
    .then(_ => HeyMateJobEscrowInstance.job.call())
    .then(job => assert.equal(job[5], true, `Did NOT deliver the Job`))
  );

  it(`should mint 200HMR to Worker`, () => HeyMateReputationTokenInstance.mint(accounts[2], 200, { from: accounts[0] }));

  it(`should deliver the Job Successfully`, () =>
    HeyMateJobEscrowInstance.job.call()
    .then(job => assert.equal(job[4], true, `Did NOT deliver the Job Successfully`))
  );

  it(`should have 100HEY on Worker upon Successfull Job Delivery`, () =>
    HeyMatePayTokenInstance.balanceOf(accounts[2])
    .then(ballance => assert.equal(ballance.valueOf(), 100, `DOES NOT have 100HEY on Worker upon Successfull Job Delivery`))
  );

  it(`should have 200HMR on Worker upon Successfull Job Delivery`, () =>
    HeyMateReputationTokenInstance.balanceOf(accounts[2])
    .then(ballance => assert.equal(ballance.valueOf(), 200, `DOES NOT have 200HMR on Worker upon Successfull Job Delivery`))
  );
});

contract(`Job NOT Delivered Successfully`, (accounts) => {

  let HeyMatePayTokenInstance, HeyMateReputationTokenInstance, HeyMateJobEscrowInstance;

  before(() => Promise.all([
      HeyMatePayToken.deployed(),
      HeyMateReputationToken.deployed(),
      // HeyMateJobEscrow.deployed()
    ])
    .then(([HeyMatePayTokenDeployed, HeyMateReputationTokenDeployed, HeyMateJobEscrowDeployed]) => {
      HeyMatePayTokenInstance = HeyMatePayTokenDeployed;
      HeyMateReputationTokenInstance = HeyMateReputationTokenDeployed;
      // HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;

      // console.log('HeyMatePayTokenInstance.address', HeyMatePayTokenInstance.address);
      // console.log('HeyMateReputationTokenDeployed.address', HeyMateReputationTokenDeployed.address);
      // console.log('HeyMateJobEscrowInstance.address', HeyMateJobEscrowInstance.address);
      return true;
    })
    .then(_ => HeyMatePayTokenInstance.transfer(accounts[1], 100), { from: accounts[0] })
    .then(_ => HeyMateReputationTokenInstance.mint(accounts[2], 100), { from: accounts[0] }));

  it(`should have 100HEY on Client's ballance`, () => HeyMatePayTokenInstance.balanceOf(accounts[1])
    .then(balance => assert.equal(balance.valueOf(), 100, `NO 100HEY on Client's ballance`)));

  it(`should have 100HMR on Worker's ballance`, () => HeyMateReputationTokenInstance.balanceOf(accounts[2])
    .then(balance => assert.equal(balance.valueOf(), 100, `NO 100HMR on Worker's ballance`)));

  it(`should deploy a new Escrow Contract from the Owners Address`, () => {
    return HeyMateJobEscrow.new(HeyMatePayTokenInstance.address, HeyMateReputationTokenInstance.address, { from: accounts[0] })
      .then(HeyMateJobEscrowDeployed => {
        HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
        return assert.isOk(HeyMateJobEscrowInstance.address, `everything is ok ${HeyMateJobEscrowDeployed.address}`);
      });
  })

  it(`should approve HeyMatePayTokenInstance to transfer 100HEY from Client to Escrow`, () =>
    HeyMatePayTokenInstance.approve(HeyMateJobEscrowInstance.address, 100, { from: accounts[1] })
    .then(_ => HeyMatePayTokenInstance.allowance(accounts[1], HeyMateJobEscrowInstance.address))
    .then(allowance => assert.equal(allowance.valueOf(), 100, `DIDN'T approve HeyMatePayTokenInstance to transfer 100HEY from Client to Escrow`))
  );

  it(`should approve HeyMateReputationTokenInstance to transfer 100HEY from Worker to Escrow`, () =>
    HeyMateReputationTokenInstance.approve(HeyMateJobEscrowInstance.address, 100, { from: accounts[2] })
    .then(_ => HeyMateReputationTokenInstance.allowance(accounts[2], HeyMateJobEscrowInstance.address))
    .then(allowance => assert.equal(allowance.valueOf(), 100, `DIDN'T approve HeyMateReputationTokenInstance to transfer 100HEY from Worker to Escrow`))
  );

  it(`should create a new Job on Escrow Contract`, () =>
    HeyMateJobEscrowInstance.createEscrow(accounts[1], accounts[2], 100, 100, { from: accounts[0] }));

  it(`should have 100HEY on the new Job on Escrow Contract`, () =>
    HeyMateJobEscrowInstance.job.call()
    .then(job => assert.equal(job[2], 100, `NO 100HEY on the new Job on Escrow Contract`))
  );

  it(`should have 100HMR on the new Job on Escrow Contract`, () =>
    HeyMateJobEscrowInstance.job.call()
    .then(job => assert.equal(job[3], 100, `NO 100HMR on the new Job on Escrow Contract`))
  );

  it(`should deliver the Job`, () =>
    HeyMateJobEscrowInstance.refundEscrow({ from: accounts[0] })
    .then(_ => HeyMateJobEscrowInstance.job.call())
    .then(job => assert.equal(job[5], true, `Did NOT deliver the Job`))
  );

  // it(`should mint 200HMR to Worker`, () => HeyMateReputationTokenInstance.mint(accounts[2], 200, { from: accounts[0] }));

  it(`should NOT deliver the Job`, () =>
    HeyMateJobEscrowInstance.job.call()
    .then(job => assert.equal(job[4], false, `Did deliver the Job Successfully`))
  );

  it(`should have 100HEY on Client upon Bad Job Delivery`, () =>
    HeyMatePayTokenInstance.balanceOf(accounts[1])
    .then(ballance => assert.equal(ballance.valueOf(), 100, `DOES NOT have 100HEY on Client upon Bad Job Delivery`))
  );

  it(`should have 0HMR on Worker upon Bad Job Delivery`, () =>
    HeyMateReputationTokenInstance.balanceOf(accounts[2])
    .then(ballance => assert.equal(ballance.valueOf(), 0, `DOES NOT have 0HMR on Worker upon Bad Job Delivery`))
  );
});