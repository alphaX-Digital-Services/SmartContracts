pragma solidity ^0.4.23;

import "./HeyMatePayToken.sol";
import "./HeyMateReputationToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract HeyMateJobEscrow is Ownable {

    struct Job {
        address client;
        address worker;
        uint256 escrow;
        uint256 reputation;
        bool success;
        bool complete;
    }

    Job public job;

    HeyMatePayToken public currency;
    HeyMateReputationToken public reputation;

    constructor(HeyMatePayToken _currency, HeyMateReputationToken _reputation) public {
        currency = _currency;
        reputation = _reputation;
    }

    function createEscrow(address _client, address _worker, uint256 _escrow, uint256 _reputation) onlyOwner public {
        job = Job(_client, _worker, _escrow, _reputation, false, false);
        currency.transferFrom(job.client, address(this), job.escrow);
        reputation.transferFrom(job.worker, address(this), job.escrow);
    }

    function releaseEscrow() onlyOwner public {
        job.complete = true;
        job.success = true;
        currency.transfer(job.worker, job.escrow);
        //need to mint some more from the backend
        reputation.transfer(job.worker, job.reputation);
        //reputation.burn(job.reputation);
        // mint more tokens to the worker
        // burn whatever is on the Escrows contract acct
    }
    
    function refundEscrow() onlyOwner public {
        job.complete = true;
        currency.transfer(owner, job.escrow);
        reputation.burn(job.reputation);
    }

}