var abiArray = [
    {
        "constant": true,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerID",
                "type": "uint8"
            }
        ],
        "name": "getPlayerByGame",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            },
            {
                "name": "",
                "type": "uint256"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [],
        "name": "withdraw",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerName",
                "type": "bytes32"
            }
        ],
        "name": "addPlayerToGame",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerName",
                "type": "bytes32"
            },
            {
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "addGameScore",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerName",
                "type": "bytes32"
            }
        ],
        "name": "removePlayerFromGame",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "playerCost",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "name",
                "type": "bytes32"
            },
            {
                "name": "admin",
                "type": "address"
            }
        ],
        "name": "createGameHash",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            }
        ],
        "payable": false,
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerName",
                "type": "bytes32"
            }
        ],
        "name": "confirmGameScore",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "name",
                "type": "bytes32"
            },
            {
                "name": "gameDescription",
                "type": "string"
            }
        ],
        "name": "changeGameMetadata",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "balance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            }
        ],
        "name": "getGameByHash",
        "outputs": [
            {
                "name": "",
                "type": "bytes32"
            },
            {
                "name": "",
                "type": "string"
            },
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "numGames",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "gameCost",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "name",
                "type": "bytes32"
            },
            {
                "name": "gameDescription",
                "type": "string"
            }
        ],
        "name": "addNewGame",
        "outputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            }
        ],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "costGame",
                "type": "uint256"
            },
            {
                "name": "costPlayer",
                "type": "uint256"
            }
        ],
        "name": "setCosts",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "name",
                "type": "bytes32"
            },
            {
                "name": "gameDescription",
                "type": "string"
            },
            {
                "name": "numPlayers",
                "type": "uint8"
            },
            {
                "name": "gameOwner",
                "type": "address"
            }
        ],
        "name": "setGameMetadata",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "name": "_from",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Withdrawal",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "gameHash",
                "type": "bytes32"
            }
        ],
        "name": "newGameCreated",
        "type": "event"
    }
];