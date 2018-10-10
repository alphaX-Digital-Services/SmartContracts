pragma solidity ^0.4.23;

import "./HeyMatePayToken.sol";
import "./HeyMateReputationToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * HeyMateJobEscrow Contract
 * created by the Owner - HeyMate Backend
 */
contract HeyMateJobEscrow is Ownable {

    struct Job {
        address client;
        address worker;
        uint256 escrow;
        uint256 reputation;
        bool success;
        bool complete;
    }

    Job private job;

    HeyMatePayToken private currency;
    HeyMateReputationToken private reputation;

    /**
    * should have HEY token ERC20 Contract address and HMR token ERC20 Contract address
    */
    constructor(HeyMatePayToken _currency, HeyMateReputationToken _reputation) public {
        require(_currency != address(0), "Error: HEY token address is 0x0");
        require(_reputation != address(0), "Error: HMR token address is 0x0");
        currency = _currency;
        reputation = _reputation;
    }

    /**
    * once the contract created the job is visible to the worker and anyone on the blockchain
    */
    function getJob() public returns(address, address, uint256, uint256, bool, bool) {
        return (job.client, job.worker, job.escrow, job.reputation, job.success, job.complete);
    }

    /**
    * only the Owner - HeyMate Backend is allowed to create the job
    */
    function createEscrow(address _client, address _worker, uint256 _escrow, uint256 _reputation) onlyOwner public {
        require(_client != address(0), "Error: Client address is 0x0");
        require(_worker != address(0), "Error: Worker address is 0x0");

        require(_escrow > 0, "Error: Escrow HEY amount has to be more than zero");
        require(_escrow < 1000, "Error: Escrow HEY amount has to be less than 1000");

        require(_reputation > 0, "Error: Reputation HMR amount has to be more than zero");
        require(_reputation < 1000, "Error: Reputation HMR amount has to be less than 1000");

        job = Job(_client, _worker, _escrow, _reputation, false, false);
        currency.transferFrom(job.client, address(this), job.escrow);
        reputation.transferFrom(job.worker, address(this), job.reputation);
    }

    /**
    * only the Owner - HeyMate Backend is allowed to complete the job and release and burn tokens
    */
    function releaseEscrow() onlyOwner public {
        job.complete = true;
        job.success = true;
        currency.transfer(job.worker, job.escrow);
        reputation.burn(job.reputation);
    }
    
    /**
    * only the Owner - HeyMate Backend is allowed to complete the job and release and burn tokens
    */
    function refundEscrow() onlyOwner public {
        job.complete = true;
        currency.transfer(job.client, job.escrow);
        reputation.burn(job.reputation);
    }

}