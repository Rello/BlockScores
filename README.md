# BlockScores
Store your game scores in the blockchain

Functions:
- register new game (hash)
- add players
- register (unconfirmed) scores per player
- confirm scores of others (4-eye-principle)
- remove players

### Non-Wallet Version
This version is recommended to be run on a private blockchain with web3 access to one node.

All interaction can be performed without wallet integration (besides smart contract deployment).
This makes the integration into an existing web frontend straight forward.
One existing master account + password needs to be maintained in JS which is used for every contract call.

### Wallet Version
This version can be used on a private or on the main net.

...to be done

## Installation
- compile and upload smart contract with e.g. Ethereum Wallet
- maintain address in js source
- create master account (non-wallet)
- maintain account + password in js source (non-wallet)
