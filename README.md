#heymate-blockchain

>Blockchain smart contracts for HeyMate project

##About

This project uses [EOSIO](https://developers.eos.io/) is a free, open-source blockchain software protocol that provides developers and entrepreneurs with a platform on which to build, deploy and run high-performing decentralized applications (DAPPs)

##For compile smart contracts

In contract folder run this command for compile dev version:
```
eosio-cpp escrow.cpp -o escrow.wasm --abigen
```

In contract folder run this command for compile staging version:
```
eosio-cpp escrow.cpp -o escrow.wasm --abigen -D=STAGING
```