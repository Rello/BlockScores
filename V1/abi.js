var abiArray = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "name",
                "type": "string"
            },
            {
                "name": "gameDescription",
                "type": "string"
            },
            {
                "name": "numPlayers",
                "type": "uint256"
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
        "constant": true,
        "inputs": [
            {
                "name": "name",
                "type": "string"
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
                "type": "string"
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
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "name",
                "type": "string"
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
        "constant": false,
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerName",
                "type": "string"
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
                "type": "string"
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
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerID",
                "type": "uint256"
            }
        ],
        "name": "getPlayerByGame",
        "outputs": [
            {
                "name": "",
                "type": "string"
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
        "inputs": [
            {
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "name": "playerName",
                "type": "string"
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
                "name": "playerName",
                "type": "string"
            }
        ],
        "name": "addPlayerToGame",
        "outputs": [
            {
                "name": "newPlayerID",
                "type": "uint256"
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
                "name": "name",
                "type": "string"
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
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "name": "gameHash",
                "type": "bytes32"
            },
            {
                "indexed": false,
                "name": "name",
                "type": "string"
            }
        ],
        "name": "newGameCreated",
        "type": "event"
    }
];