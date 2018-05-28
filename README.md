# BlockScores - securing the world of scores
[![Version](https://img.shields.io/github/release/rello/blockscores.svg)](https://github.com/rello/blockscores/blob/master/CHANGELOG.md)&#160;[![License: AGPLv3](https://img.shields.io/badge/license-AGPLv3-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

Functions:
- register new game
- add players
- add scores per player
- confirm scores of others (4-eye-principle)
- manage players
- royalty program

## Demo & playground version
- contract available at rospen at 0xd6Fa1748596CB03DF43f773568bCa537b7Cd9DBA
- DApp direcetly available at http://blockscores.com/t/v1/index.html

DApp stores:
- [State of the DApps](https://www.stateofthedapps.com/dapps/blockscores)
- Toshi (soon)
- Cipher (soon)

## Non-Wallet Version
This version is recommended to be run on a private blockchain with web3 access to one node.

All interaction can be performed without wallet integration (besides smart contract deployment).
This makes the integration into an existing web frontend straight forward.
One existing master account + password needs to be maintained in JS which is used for every contract call.

### Installation
- compile and upload smart contract with e.g. Ethereum Wallet
- maintain address in js source
- create master account (non-wallet)
- maintain account + password in js source (non-wallet)
