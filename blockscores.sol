pragma solidity ^0.4.18;
/// @title Store your GameScores in the Blockchain
/// @author Marcel Scherello gamescores@scherello.de
/// @notice Create a custom game and start counting the scores
/// @dev All function calls are currently implement without side effects
contract GameScores {
    struct Player {
        string  playerName;
        bytes32 playerPwHash;
        uint    score;
        uint    score_unconfirmed;
        uint    isActive;
    }
    struct Game {
        string  gameName;
        string  gameDescription;
        uint    numPlayers;
        bytes32  adminPwHash;
        mapping (uint => Player) players;
    }    
    mapping (bytes32 => Game) games;
    uint public numGames;
    address owner = msg.sender;
    
    modifier isOwner {
        assert(owner == msg.sender);
        _;
    }


    /// @notice Fill the empty contract with some test data
    /// @return gamehash of the new game
    function init() isOwner public returns(bytes32 gameHash) {
        gameHash = addNewGame("Testgame", "Testdescription", "TestPw");
        addPlayerToGame(gameHash, "Player1", "Player1");
        addPlayerToGame(gameHash, "Player2", "Player2");
        addPlayerToGame(gameHash, "Player3", "Player3");
        addGameScore(gameHash, "Player1", 1);
        addGameScore(gameHash, "Player2", 2);
        addGameScore(gameHash, "Player3", 3);
   }
   
/** 
Game Functions 
*/

    /// @notice Add a new Scoreboard. Game hash will be created by name and admin password
    /// @param name The name of the game
    /// @param gameDescription A subtitle for the game
    /// @param adminPw The admin password to remove players
    /// @return The hash of the newly created game
    function addNewGame(string name, string gameDescription, string adminPw) public returns(bytes32 gameHash){
        gameHash = createGameHash(name, adminPw);
        numGames++;
        games[gameHash] = Game(name, gameDescription, 0, keccak256(adminPw));
        newGameCreated(gameHash, name);
    }

    /// @notice Simulate the creation of a game hash
    /// @param name The name of the game
    /// @param adminPw The admin password to remove players
    /// @return The possible hash of the game
    function createGameHash(string name, string adminPw) pure public returns (bytes32){
        return keccak256(name, adminPw);
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
    /// @param adminPw The new admin password for the game
    /// @return true
    function setGameMetadata(bytes32 gameHash, string name, string gameDescription, uint numPlayers, string adminPw) isOwner public returns(bool) {
        games[gameHash].gameName = name;
        games[gameHash].gameDescription = gameDescription;
        games[gameHash].numPlayers = numPlayers;
        games[gameHash].adminPwHash = keccak256(adminPw);
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
    /// @param playerPw The player password
    /// @return Player ID
    function addPlayerToGame(bytes32 gameHash, string playerName, string playerPw) public returns (uint newPlayerID){
        Game storage g = games[gameHash];
        newPlayerID = g.numPlayers++;
        g.players[newPlayerID] = Player(playerName, keccak256(playerPw),0,0,1);
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

    /// @notice The game admin can remove a player using the admin password
    /// @param gameHash The hash of the game
    /// @param playerName The name of the player to be removed
    /// @param adminPw The game admin password
    /// @return true/false
    function removePlayerFromGame(bytes32 gameHash, string playerName, string adminPw) public returns (bool){
        Game storage g = games[gameHash];
        if (g.adminPwHash == keccak256(adminPw)){
            uint playerID = getPlayerId (gameHash, playerName, "");
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

    /// @notice Get the player id either by player Name or password
    /// @param gameHash The hash of the game
    /// @param playerName The name of the player
    /// @param playerPw The player password
    /// @return ID or 999 in case of false
    function getPlayerId (bytes32 gameHash, string playerName, string playerPw) constant internal returns (uint) {
        Game storage g = games[gameHash];
        for (uint i = 0; i <= g.numPlayers; i++) {
            if ((keccak256(g.players[i].playerName) == keccak256(playerName) || keccak256(playerPw) == g.players[i].playerPwHash) && g.players[i].isActive == 1) {
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
        uint playerID = getPlayerId (gameHash, playerName, "");
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
    /// @param playerPw The password of the confirming player
    /// @return true/false
    function confirmGameScore(bytes32 gameHash, string playerName, string playerPw) public returns (bool){
        uint playerID = getPlayerId (gameHash, playerName, "");
        uint confirmerID = getPlayerId (gameHash, "", playerPw);
       if (playerID < 999 && confirmerID < 999 && playerID != confirmerID) { //confirm only score of other player
            games[gameHash].players[playerID].score += games[gameHash].players[playerID].score_unconfirmed;
            games[gameHash].players[playerID].score_unconfirmed = 0;
            return true;
        } else {
            return false;
        }
    }
}
