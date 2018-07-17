# heymateBlockchain

MVP Smart contracts for the Heymate Project powered by openzeppelin-solidity (https://github.com/OpenZeppelin/openzeppelin-solidity) and https://truffleframework.com/

1. HeyMatePayToken (HEY) contract - ERC20, StandardToken
2. HeyMateReputationToken (HMR) contract - ERC20, MintableToken, BurnableToken token
3. HeyMateJobEscrow contract - Ownable

# Testing
1. cd path/to/project
2. truffle test

# Roles
1. Owner - Heymate Address
2. Worker - Worker Address
3. Client - Worker Address

# Owerview
1. HeyMateJobEscrow Contract is based of HeyMatePayToken and HeyMateReputationToken and deployed by Owner.
2. HeyMateJobEscrow Contract is owned soley by the Owner.
2.1. Job Escrow is created by the Owner.
3. Client escrows HEY token to HeyMateJobEscrow.
4. Worker escrows HMR token to HeyMateJobEscrow.
5. If the Job is delivered successfully, the Owner will *release* the Escrow (HEY and HMR tokens) to the Worker.
5.1. If the Job is NOT delivered successfully, the Owner will *refund* the Escrow (HEY tokens) to the Client and burn the HMR tokens.
