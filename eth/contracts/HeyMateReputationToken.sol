pragma solidity ^0.4.23;

import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/MintableToken.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/BurnableToken.sol";

contract HeyMateReputationToken is MintableToken, BurnableToken {

    string public constant name = "HeyMateReputationToken"; // solium-disable-line uppercase
    string public constant symbol = "HMR"; // solium-disable-line uppercase
    uint8 public constant decimals = 18; // solium-disable-line uppercase

    /**
    * @dev Constructor that gives msg.sender all of existing tokens.
    */
    constructor() public {}

}
