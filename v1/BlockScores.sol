pragma solidity ^0.4.20;
/// @title Store your game scores in the Blockchain
/// @author Marcel Scherello blockscores@scherello.de
/// @notice Create a custom game and start counting the scores
/// @dev All function calls are currently implement without side effects
contract BlockScores {
    struct Player {
        string  playerName;
        address playerAddress;
        uint    score;
        uint    score_unconfirmed;
        uint    isActive;
    }
    struct Game {
        string  gameName;
        string  gameDescription;
        uint    numPlayers;
        address gameOwner;
        mapping (uint => Player) players;
    }
    mapping (bytes32 => Game) games;
    uint public numGames;
    address owner = msg.sender;

    modifier isOwner {
        assert(owner == msg.sender);
        _;
    }

    /**
    Game Functions
    */

    /// @notice Add a new Scoreboard. Game hash will be created by name and creator
    /// @param name The name of the game
    /// @param gameDescription A subtitle for the game
    /// @return The hash of the newly created game
    function addNewGame(string name, string gameDescription) public returns(bytes32 gameHash){
        gameHash = createGameHash(name, msg.sender);
        numGames++;
        games[gameHash] = Game(name, gameDescription, 0, msg.sender);
        emit newGameCreated(gameHash, name);
    }

    /// @notice Simulate the creation of a game hash
    /// @param name The name of the game
    /// @param admin The address of the admin address
    /// @return The possible hash of the game
    function createGameHash(string name, address admin) pure public returns (bytes32){
        return keccak256(name, admin);
    }

    /// @notice Get the metadata of a game
    /// @param gameHash The hash of the game
    /// @return Game name, desctiption and number of players
    function getGameByHash(bytes32 gameHash) constant public returns(string,string,uint){
        return (games[gameHash].gameName, games[gameHash].gameDescription, games[gameHash].numPlayers);
    }

    /// @notice Overwrite game metadata as contract owner only
    /// @param gameHash The hash of the game to be modified
    /// @param name The new name of the game
    /// @param gameDescription The new subtitle for the game
    /// @param gameOwner The address for the gameowner
    /// @return true
    function setGameMetadata(bytes32 gameHash, string name, string gameDescription, uint numPlayers, address gameOwner) isOwner public returns(bool) {
        games[gameHash].gameName = name;
        games[gameHash].gameDescription = gameDescription;
        games[gameHash].numPlayers = numPlayers;
        games[gameHash].gameOwner = gameOwner;
        return true;
    }

    /// @notice Overwrite game name and desctiption as game owner only
    /// @param gameHash The hash of the game to be modified
    /// @param name The new name of the game
    /// @param gameDescription The new subtitle for the game
    /// @return true
    function changeGameMetadata(bytes32 gameHash, string name, string gameDescription) public returns(bool) {
        if (games[gameHash].gameOwner == msg.sender){
            games[gameHash].gameName = name;
            games[gameHash].gameDescription = gameDescription;
        }
        return true;
    }

    /// @notice  event for newly created game
    event newGameCreated(bytes32 gameHash, string name);


    /**
    Player Functions
    */

    /// @notice Add a new player to an existing game
    /// @param gameHash The hash of the game
    /// @param playerName The name of the player
    /// @return Player ID
    function addPlayerToGame(bytes32 gameHash, string playerName) public returns (uint newPlayerID){
        Game storage g = games[gameHash];
        newPlayerID = g.numPlayers++;
        g.players[newPlayerID] = Player(playerName, msg.sender,0,0,1);
    }

    /// @notice Get player data by game hash and player id/index
    /// @param gameHash The hash of the game
    /// @param playerID Index number of the player
    /// @return Player name, confirmed score, unconfirmed score
    function getPlayerByGame(bytes32 gameHash, uint playerID) constant public returns (string, uint, uint){
        Player storage p = games[gameHash].players[playerID];
        if (p.isActive == 1){
            return (p.playerName, p.score, p.score_unconfirmed);
        }
    }

    /// @notice The game owner can remove a player
    /// @param gameHash The hash of the game
    /// @param playerName The name of the player to be removed
    /// @return true/false
    function removePlayerFromGame(bytes32 gameHash, string playerName) public returns (bool){
        Game storage g = games[gameHash];
        if (g.gameOwner == msg.sender){
            uint playerID = getPlayerId (gameHash, playerName, 0);
            if (playerID < 999 ) {
                g.players[playerID].isActive = 0;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /// @notice Get the player id either by player Name or address
    /// @param gameHash The hash of the game
    /// @param playerName The name of the player
    /// @param playerAddress The player address
    /// @return ID or 999 in case of false
    function getPlayerId (bytes32 gameHash, string playerName, address playerAddress) constant internal returns (uint) {
        Game storage g = games[gameHash];
        for (uint i = 0; i <= g.numPlayers; i++) {
            if ((keccak256(g.players[i].playerName) == keccak256(playerName) || playerAddress == g.players[i].playerAddress) && g.players[i].isActive == 1) {
                return i;
                break;
            }
        }
        return 999;
    }

    /**
    Score Functions
    */

    /// @notice Add a unconfirmed score to game/player. Overwrites an existing unconfirmed score
    /// @param gameHash The hash of the game
    /// @param playerName The name of the player
    /// @param score Integer
    /// @return true/false
    function addGameScore(bytes32 gameHash, string playerName, uint score) public returns (bool){
        uint playerID = getPlayerId (gameHash, playerName, 0);
        if (playerID < 999 ) {
            games[gameHash].players[playerID].score_unconfirmed = score;
            return true;
        } else {
            return false;
        }
    }

    /// @notice Confirm an unconfirmed score to game/player. Adds unconfirmed to existing score. Player can not confirm his own score
    /// @param gameHash The hash of the game
    /// @param playerName The name of the player who's score should be confirmed
    /// @return true/false
    function confirmGameScore(bytes32 gameHash, string playerName) public returns (bool){
        uint playerID = getPlayerId (gameHash, playerName, 0);
        uint confirmerID = getPlayerId (gameHash, "", msg.sender);
        if (playerID < 999 && confirmerID < 999 && playerID != confirmerID) { //confirm only score of other player
            games[gameHash].players[playerID].score += games[gameHash].players[playerID].score_unconfirmed;
            games[gameHash].players[playerID].score_unconfirmed = 0;
            return true;
        } else {
            return false;
        }
    }
}