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

contract(`SUCCESSFULL JOB DELIVERY`, (accounts) => {

  let HeyMatePayTokenInstance, HeyMateReputationTokenInstance, HeyMateJobEscrowInstance;

  const OWNER = `0x627306090abab3a6e1400e9345bc60c78a8bef57`;
  const CLIENT = `0xf17f52151ebef6c7334fad080c5704d77216b732`;
  const WORKER = `0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef`;
  let ESCROW;

  const INITIAL_BALLANCE_HEY = 100;
  const INITIAL_BALLANCE_HMR = 100;

  const TRANSFER_AMOUNT_HEY = 100;
  const TRANSFER_AMOUNT_HMR = 100;

  const JOB_SUCCESS_MULTIPLIER = 2;

  before(() => Promise.all([
      HeyMatePayToken.deployed(),
      HeyMateReputationToken.deployed(),
      // HeyMateJobEscrow.deployed()
    ])
    .then(([
      HeyMatePayTokenDeployed,
      HeyMateReputationTokenDeployed,
      // HeyMateJobEscrowDeployed
    ]) => {
      HeyMatePayTokenInstance = HeyMatePayTokenDeployed;
      HeyMateReputationTokenInstance = HeyMateReputationTokenDeployed;
      // HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
      return true;
    })
    .then(_ => HeyMatePayTokenInstance.transfer(CLIENT, INITIAL_BALLANCE_HEY), { from: OWNER })
    .then(_ => HeyMateReputationTokenInstance.mint(WORKER, INITIAL_BALLANCE_HMR), { from: OWNER })
  );

  it(`should have ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ballance`, () => HeyMatePayTokenInstance.balanceOf(CLIENT)
    .then(balance => assert.equal(balance.valueOf(), INITIAL_BALLANCE_HEY, `NO ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ballance`)));

  it(`should have ${INITIAL_BALLANCE_HMR} HMR on WORKER'S ballance`, () => HeyMateReputationTokenInstance.balanceOf(WORKER)
    .then(balance => assert.equal(balance.valueOf(), INITIAL_BALLANCE_HMR, `NO ${INITIAL_BALLANCE_HMR} HMR on WORKER'S ballance`)));

  it(`should deploy a new JOB ESCROW CONTRACT from the OWNER'S ADDRESS`, () => {
    return HeyMateJobEscrow.new(HeyMatePayTokenInstance.address, HeyMateReputationTokenInstance.address, { from: OWNER })
      .then(HeyMateJobEscrowDeployed => {
        HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
        ESCROW = HeyMateJobEscrowDeployed.address;
        return assert.isOk(HeyMateJobEscrowInstance.address, `everything is ok ${ESCROW}`);
      });
  })

  it(`should approve HeyMatePayToken CONTRACT to transfer ${TRANSFER_AMOUNT_HEY} HEY from CLIENT to HeyMateJobEscrow CONTRACT`, () =>
    HeyMatePayTokenInstance.approve(ESCROW, TRANSFER_AMOUNT_HEY, { from: CLIENT })
    .then(_ => HeyMatePayTokenInstance.allowance(CLIENT, ESCROW))
    .then(allowance => assert.equal(allowance.valueOf(), TRANSFER_AMOUNT_HEY, `DIDN'T approve HeyMatePayToken CONTRACT to transfer ${TRANSFER_AMOUNT_HEY} HEY from CLIENT to HeyMateJobEscrow CONTRACT`))
  );

  it(`should approve HeyMateReputationToken CONTRACT to transfer ${TRANSFER_AMOUNT_HMR} HMR from WORKER to HeyMateJobEscrow CONTRACT`, () =>
    HeyMateReputationTokenInstance.approve(ESCROW, TRANSFER_AMOUNT_HMR, { from: WORKER })
    .then(_ => HeyMateReputationTokenInstance.allowance(WORKER, ESCROW))
    .then(allowance => assert.equal(allowance.valueOf(), TRANSFER_AMOUNT_HMR, `DIDN'T approve HeyMateReputationToken CONTRACT to transfer ${TRANSFER_AMOUNT_HMR} HMR from WORKER to HeyMateJobEscrow CONTRACT`))
  );

  it(`should create a new JOB on HeyMateJobEscrow CONTRACT`, () =>
    HeyMateJobEscrowInstance.createEscrow(CLIENT, WORKER, TRANSFER_AMOUNT_HEY, TRANSFER_AMOUNT_HMR, { from: OWNER }));

  it(`should have ${TRANSFER_AMOUNT_HEY} HEY on the new JOB`, () =>
    HeyMateJobEscrowInstance.getJob.call()
    .then(job => assert.equal(job[2], TRANSFER_AMOUNT_HEY, `DOES NOT have ${TRANSFER_AMOUNT_HEY} HEY on the new JOB`))
  );

  it(`should have ${TRANSFER_AMOUNT_HMR} HMR on the new JOB`, () =>
    HeyMateJobEscrowInstance.getJob.call()
    .then(job => assert.equal(job[3], TRANSFER_AMOUNT_HMR, `DOES NOT have ${TRANSFER_AMOUNT_HMR} HMR on the new JOB`))
  );

  it(`should have ${TRANSFER_AMOUNT_HEY} HEY on the new JOB on HeyMateJobEscrow CONTRACT`, () =>
    HeyMatePayTokenInstance.balanceOf(ESCROW)
    .then(balance => assert.equal(balance.valueOf(), TRANSFER_AMOUNT_HEY, `NO ${TRANSFER_AMOUNT_HEY} HEY on HeyMateJobEscrow CONTRACT'S ballance`)));

  it(`should have ${TRANSFER_AMOUNT_HMR} HMR on the new JOB on HeyMateJobEscrow CONTRACT`, () =>
    HeyMateReputationTokenInstance.balanceOf(ESCROW)
    .then(balance => assert.equal(balance.valueOf(), TRANSFER_AMOUNT_HMR, `NO ${TRANSFER_AMOUNT_HMR} HEY on HeyMateJobEscrow CONTRACT'S ballance`)));

  it(`should COMPLETE the JOB`, () =>
    HeyMateJobEscrowInstance.releaseEscrow({ from: OWNER })
    .then(_ => HeyMateJobEscrowInstance.getJob.call())
    .then(job => assert.equal(job[5], true, `DID NOT COMPLETE the JOB`))
  );

  it(`should COMPLETE the JOB SUCCESSFULLY`, () =>
    HeyMateJobEscrowInstance.getJob.call()
    .then(job => assert.equal(job[4], true, `DID NOT COMPLETE the JOB SUCCESSFULLY`))
  );

  it(`should mint ${TRANSFER_AMOUNT_HMR * JOB_SUCCESS_MULTIPLIER} HMR to WORKER`, () =>
    HeyMateReputationTokenInstance.mint(WORKER, TRANSFER_AMOUNT_HMR * JOB_SUCCESS_MULTIPLIER, { from: OWNER }));

  it(`should have ${TRANSFER_AMOUNT_HEY} HEY on WORKER'S ADDRESS upon SUCCESSFULL JOB DELIVERY`, () =>
    HeyMatePayTokenInstance.balanceOf(WORKER)
    .then(ballance => assert.equal(ballance.valueOf(), TRANSFER_AMOUNT_HEY, `DOES NOT have ${TRANSFER_AMOUNT_HEY} HEY on WORKER'S ADDRESS upon SUCCESSFULL JOB DELIVERY`))
  );

  it(`should have ${TRANSFER_AMOUNT_HMR * JOB_SUCCESS_MULTIPLIER} HMR on WORKER'S ADDRESS upon SUCCESSFULL JOB DELIVERY`, () =>
    HeyMateReputationTokenInstance.balanceOf(WORKER)
    .then(ballance => assert.equal(ballance.valueOf(), TRANSFER_AMOUNT_HMR * JOB_SUCCESS_MULTIPLIER, `DOES NOT have ${TRANSFER_AMOUNT_HMR * JOB_SUCCESS_MULTIPLIER} HMR on WORKER'S ADDRESS upon SUCCESSFULL JOB DELIVERY`))
  );

  it(`should have ${INITIAL_BALLANCE_HEY - TRANSFER_AMOUNT_HEY} HEY on CLIENT'S ADDRESS upon SUCCESSFULL JOB DELIVERY`, () =>
    HeyMatePayTokenInstance.balanceOf(CLIENT)
    .then(ballance => assert.equal(ballance.valueOf(), INITIAL_BALLANCE_HEY - TRANSFER_AMOUNT_HEY, `DOES NOT have ${INITIAL_BALLANCE_HEY - TRANSFER_AMOUNT_HEY} HEY on CLIENT'S ADDRESS upon SUCCESSFULL JOB DELIVERY`))
  );
});

contract(`UNSUCCESSFULL JOB DELIVERY`, (accounts) => {

  let HeyMatePayTokenInstance, HeyMateReputationTokenInstance, HeyMateJobEscrowInstance;

  const OWNER = `0x627306090abab3a6e1400e9345bc60c78a8bef57`;
  const CLIENT = `0xf17f52151ebef6c7334fad080c5704d77216b732`;
  const WORKER = `0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef`;
  let ESCROW;

  const INITIAL_BALLANCE_HEY = 100;
  const INITIAL_BALLANCE_HMR = 100;

  const TRANSFER_AMOUNT_HEY = 100;
  const TRANSFER_AMOUNT_HMR = 100;

  const JOB_SUCCESS_MULTIPLIER = 2;

  before(() => Promise.all([
      HeyMatePayToken.deployed(),
      HeyMateReputationToken.deployed(),
      // HeyMateJobEscrow.deployed()
    ])
    .then(([
      HeyMatePayTokenDeployed,
      HeyMateReputationTokenDeployed,
      // HeyMateJobEscrowDeployed
    ]) => {
      HeyMatePayTokenInstance = HeyMatePayTokenDeployed;
      HeyMateReputationTokenInstance = HeyMateReputationTokenDeployed;
      // HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
      return true;
    })
    .then(_ => HeyMatePayTokenInstance.transfer(CLIENT, INITIAL_BALLANCE_HEY), { from: OWNER })
    .then(_ => HeyMateReputationTokenInstance.mint(WORKER, INITIAL_BALLANCE_HMR), { from: OWNER })
  );

  it(`should have ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ballance`, () => HeyMatePayTokenInstance.balanceOf(CLIENT)
    .then(balance => assert.equal(balance.valueOf(), INITIAL_BALLANCE_HEY, `NO ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ballance`)));

  it(`should have ${INITIAL_BALLANCE_HMR} HMR on WORKER'S ballance`, () => HeyMateReputationTokenInstance.balanceOf(WORKER)
    .then(balance => assert.equal(balance.valueOf(), INITIAL_BALLANCE_HMR, `NO ${INITIAL_BALLANCE_HMR} HMR on WORKER'S ballance`)));

  it(`should deploy a new JOB ESCROW CONTRACT from the OWNER'S ADDRESS`, () => {
    return HeyMateJobEscrow.new(HeyMatePayTokenInstance.address, HeyMateReputationTokenInstance.address, { from: OWNER })
      .then(HeyMateJobEscrowDeployed => {
        HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
        ESCROW = HeyMateJobEscrowDeployed.address;
        return assert.isOk(HeyMateJobEscrowInstance.address, `everything is ok ${ESCROW}`);
      });
  })

  it(`should approve HeyMatePayToken CONTRACT to transfer ${TRANSFER_AMOUNT_HEY} HEY from CLIENT to HeyMateJobEscrow CONTRACT`, () =>
    HeyMatePayTokenInstance.approve(ESCROW, TRANSFER_AMOUNT_HEY, { from: CLIENT })
    .then(_ => HeyMatePayTokenInstance.allowance(CLIENT, ESCROW))
    .then(allowance => assert.equal(allowance.valueOf(), TRANSFER_AMOUNT_HEY, `DIDN'T approve HeyMatePayToken CONTRACT to transfer ${TRANSFER_AMOUNT_HEY} HEY from CLIENT to HeyMateJobEscrow CONTRACT`))
  );

  it(`should approve HeyMateReputationToken CONTRACT to transfer ${TRANSFER_AMOUNT_HMR} HMR from WORKER to HeyMateJobEscrow CONTRACT`, () =>
    HeyMateReputationTokenInstance.approve(ESCROW, TRANSFER_AMOUNT_HMR, { from: WORKER })
    .then(_ => HeyMateReputationTokenInstance.allowance(WORKER, ESCROW))
    .then(allowance => assert.equal(allowance.valueOf(), TRANSFER_AMOUNT_HMR, `DIDN'T approve HeyMateReputationToken CONTRACT to transfer ${TRANSFER_AMOUNT_HMR} HMR from WORKER to HeyMateJobEscrow CONTRACT`))
  );

  it(`should create a new JOB on HeyMateJobEscrow CONTRACT`, () =>
    HeyMateJobEscrowInstance.createEscrow(CLIENT, WORKER, TRANSFER_AMOUNT_HEY, TRANSFER_AMOUNT_HMR, { from: OWNER }));

  it(`should have ${TRANSFER_AMOUNT_HEY} HEY on the new JOB`, () =>
    HeyMateJobEscrowInstance.getJob.call()
    .then(job => assert.equal(job[2], TRANSFER_AMOUNT_HEY, `DOES NOT have ${TRANSFER_AMOUNT_HEY} HEY on the new JOB`))
  );

  it(`should have ${TRANSFER_AMOUNT_HMR} HMR on the new JOB`, () =>
    HeyMateJobEscrowInstance.getJob.call()
    .then(job => assert.equal(job[3], TRANSFER_AMOUNT_HMR, `DOES NOT have ${TRANSFER_AMOUNT_HMR} HMR on the new JOB`))
  );

  it(`should have ${TRANSFER_AMOUNT_HEY} HEY on the new JOB on HeyMateJobEscrow CONTRACT`, () =>
    HeyMatePayTokenInstance.balanceOf(ESCROW)
    .then(balance => assert.equal(balance.valueOf(), TRANSFER_AMOUNT_HEY, `NO ${TRANSFER_AMOUNT_HEY} HEY on HeyMateJobEscrow CONTRACT'S ballance`)));

  it(`should have ${TRANSFER_AMOUNT_HMR} HMR on the new JOB on HeyMateJobEscrow CONTRACT`, () =>
    HeyMateReputationTokenInstance.balanceOf(ESCROW)
    .then(balance => assert.equal(balance.valueOf(), TRANSFER_AMOUNT_HMR, `NO ${TRANSFER_AMOUNT_HMR} HEY on HeyMateJobEscrow CONTRACT'S ballance`)));

  it(`should COMPLETE the JOB`, () =>
    HeyMateJobEscrowInstance.refundEscrow({ from: OWNER })
    .then(_ => HeyMateJobEscrowInstance.getJob.call())
    .then(job => assert.equal(job[5], true, `DID NOT COMPLETE the JOB`))
  );

  it(`should COMPLETE the JOB UNSUCCESSFULLY`, () =>
    HeyMateJobEscrowInstance.getJob.call()
    .then(job => assert.equal(job[4], false, `DID NOT COMPLETE the JOB UNSUCCESSFULLY`))
  );

  it(`should have ${INITIAL_BALLANCE_HEY - TRANSFER_AMOUNT_HEY} HEY on WORKER'S ADDRESS upon UNSUCCESSFULL JOB DELIVERY`, () =>
    HeyMatePayTokenInstance.balanceOf(WORKER)
    .then(ballance => assert.equal(ballance.valueOf(), INITIAL_BALLANCE_HEY - TRANSFER_AMOUNT_HEY, `DOES NOT have ${INITIAL_BALLANCE_HEY - TRANSFER_AMOUNT_HEY} HEY on WORKER'S ADDRESS upon UNSUCCESSFULL JOB DELIVERY`))
  );

  it(`should have ${INITIAL_BALLANCE_HMR - TRANSFER_AMOUNT_HMR} HMR on WORKER'S ADDRESS upon UNSUCCESSFULL JOB DELIVERY`, () =>
    HeyMateReputationTokenInstance.balanceOf(WORKER)
    .then(ballance => assert.equal(ballance.valueOf(), INITIAL_BALLANCE_HMR - TRANSFER_AMOUNT_HMR, `DOES NOT have ${INITIAL_BALLANCE_HMR - TRANSFER_AMOUNT_HMR} HMR on WORKER'S ADDRESS upon UNSUCCESSFULL JOB DELIVERY`))
  );

  it(`should have ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ADDRESS upon UNSUCCESSFULL JOB DELIVERY`, () =>
    HeyMatePayTokenInstance.balanceOf(CLIENT)
    .then(ballance => assert.equal(ballance.valueOf(), INITIAL_BALLANCE_HEY, `DOES NOT have ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ADDRESS upon UNSUCCESSFULL JOB DELIVERY`))
  );
});

contract(`SECURITY TESTS`, (accounts) => {

  let HeyMatePayTokenInstance, HeyMateReputationTokenInstance, HeyMateJobEscrowInstance;

  const OWNER = `0x627306090abab3a6e1400e9345bc60c78a8bef57`;
  const CLIENT = `0xf17f52151ebef6c7334fad080c5704d77216b732`;
  const WORKER = `0xc5fdf4076b8f3a5357c5e395ab970b5b54098fef`;
  let ESCROW;

  const INITIAL_BALLANCE_HEY = 100;
  const INITIAL_BALLANCE_HMR = 100;

  const TRANSFER_AMOUNT_HEY = 100;
  const TRANSFER_AMOUNT_HMR = 100;

  const JOB_SUCCESS_MULTIPLIER = 2;

  before(() => Promise.all([
      HeyMatePayToken.deployed(),
      HeyMateReputationToken.deployed(),
      // HeyMateJobEscrow.deployed()
    ])
    .then(([
      HeyMatePayTokenDeployed,
      HeyMateReputationTokenDeployed,
      // HeyMateJobEscrowDeployed
    ]) => {
      HeyMatePayTokenInstance = HeyMatePayTokenDeployed;
      HeyMateReputationTokenInstance = HeyMateReputationTokenDeployed;
      // HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
      return true;
    })
    .then(_ => HeyMatePayTokenInstance.transfer(CLIENT, INITIAL_BALLANCE_HEY), { from: OWNER })
    .then(_ => HeyMateReputationTokenInstance.mint(WORKER, INITIAL_BALLANCE_HMR), { from: OWNER })
  );

  it(`should have ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ballance`, () => HeyMatePayTokenInstance.balanceOf(CLIENT)
    .then(balance => assert.equal(balance.valueOf(), INITIAL_BALLANCE_HEY, `NO ${INITIAL_BALLANCE_HEY} HEY on CLIENT'S ballance`)));

  it(`should have ${INITIAL_BALLANCE_HMR} HMR on WORKER'S ballance`, () => HeyMateReputationTokenInstance.balanceOf(WORKER)
    .then(balance => assert.equal(balance.valueOf(), INITIAL_BALLANCE_HMR, `NO ${INITIAL_BALLANCE_HMR} HMR on WORKER'S ballance`)));

  it(`should deploy a new JOB ESCROW CONTRACT from the OWNER'S ADDRESS`, () => {
    return HeyMateJobEscrow.new(HeyMatePayTokenInstance.address, HeyMateReputationTokenInstance.address, { from: OWNER })
      .then(HeyMateJobEscrowDeployed => {
        HeyMateJobEscrowInstance = HeyMateJobEscrowDeployed;
        ESCROW = HeyMateJobEscrowDeployed.address;
        return assert.isOk(HeyMateJobEscrowInstance.address, `everything is ok ${ESCROW}`);
      });
  })

  it(`CLIENT should NOT be able to CREATE A JOB`, () =>
    HeyMateJobEscrowInstance.createEscrow(CLIENT, WORKER, TRANSFER_AMOUNT_HEY, TRANSFER_AMOUNT_HMR, { from: CLIENT })
    .catch(error => assert.ok(true, "Passed")));

  it(`WORKER should NOT be able to CREATE A JOB`, () =>
    HeyMateJobEscrowInstance.createEscrow(CLIENT, WORKER, TRANSFER_AMOUNT_HEY, TRANSFER_AMOUNT_HMR, { from: WORKER })
    .catch(error => assert.ok(true, "Passed")));

  it(`CLIENT should NOT be able to COMPLETE A JOB SUCCESSFULLY`, () =>
    HeyMateJobEscrowInstance.releaseEscrow({ from: CLIENT })
    .catch(error => assert.ok(true, "Passed")));

  it(`WORKER should NOT be able to COMPLETE A JOB SUCCESSFULLY`, () =>
    HeyMateJobEscrowInstance.releaseEscrow({ from: WORKER })
    .catch(error => assert.ok(true, "Passed")));

  it(`CLIENT should NOT be able to COMPLETE A JOB UNSUCCESSFULLY`, () =>
    HeyMateJobEscrowInstance.refundEscrow({ from: CLIENT })
    .catch(error => assert.ok(true, "Passed")));

  it(`WORKER should NOT be able to COMPLETE A JOB UNSUCCESSFULLY`, () =>
    HeyMateJobEscrowInstance.refundEscrow({ from: WORKER })
    .catch(error => assert.ok(true, "Passed")));

});