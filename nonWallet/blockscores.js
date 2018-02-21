
var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("xxxxx"));

var abiArray = [{ "constant": false, "inputs": [{ "name": "gameHash", "type": "bytes32" }, { "name": "playerName", "type": "string" }, { "name": "playerPw", "type": "string" }], "name": "confirmGameScore", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "gameHash", "type": "bytes32" }, { "name": "playerName", "type": "string" }, { "name": "adminPw", "type": "string" }], "name": "removePlayerFromGame", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "name", "type": "string" }, { "name": "adminPw", "type": "string" }], "name": "createGameHash", "outputs": [{ "name": "", "type": "bytes32" }], "payable": false, "stateMutability": "pure", "type": "function" }, { "constant": false, "inputs": [{ "name": "name", "type": "string" }, { "name": "gameDescription", "type": "string" }, { "name": "adminPw", "type": "string" }], "name": "addNewGame", "outputs": [{ "name": "gameHash", "type": "bytes32" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "gameHash", "type": "bytes32" }, { "name": "playerName", "type": "string" }, { "name": "score", "type": "uint256" }], "name": "addGameScore", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "gameHash", "type": "bytes32" }], "name": "getGameByHash", "outputs": [{ "name": "", "type": "string" }, { "name": "", "type": "string" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "gameHash", "type": "bytes32" }, { "name": "playerID", "type": "uint256" }], "name": "getPlayerByGame", "outputs": [{ "name": "", "type": "string" }, { "name": "", "type": "uint256" }, { "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "gameHash", "type": "bytes32" }, { "name": "playerName", "type": "string" }, { "name": "playerPw", "type": "string" }], "name": "addPlayerToGame", "outputs": [{ "name": "newPlayerID", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "init", "outputs": [{ "name": "gameHash", "type": "bytes32" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "gameHash", "type": "bytes32" }, { "indexed": false, "name": "name", "type": "string" }], "name": "newGameCreated", "type": "event" }];

// Access the smart contract
var contract_address = "0x277263883C1D59a00619C7b018B93544c42aEAb1";

// instantiate by address
var MyContract = web3.eth.contract(abiArray);
var contractInstance = MyContract.at(contract_address);
var gas = '300000';
var gasPrice = '18000000000';

// anonymous account mapping
var send_acct = "0xcbaFF6F49ee16b78264F82B0338CCFf380c1D357";
var send_acct_pw = "BlockScores";
var lastTx;

document.addEventListener("DOMContentLoaded", function () {

    var gameHash = window.location.href.substring(window.location.href.lastIndexOf("?") + 1).split("&")[0];

    if (gameHash != location.protocol + '//' + location.host + location.pathname) {

        document.getElementById('gameHash').value = gameHash;

        getGame();

    } else {

        $("#activeGameSection").hide();

    }

});



function getGame() {

    $("#newGameSection").hide();

    var gameHash = document.getElementById('gameHash').value;
    var result = contractInstance.getGameByHash(gameHash);

    var gameTitle = result[0];
    var gameDescrtiption = result[1];
    var numPlayers = result[2]['c'][0];
    var divPlayers = document.getElementById("gamePlayers");

    divPlayers.innerHTML = "";

    console.log(JSON.stringify(result));
    document.getElementById("gameTitle").innerText = gameTitle;
    document.getElementById("gameDescrtiption").innerText = gameDescrtiption;
    //document.getElementById("numPlayers").innerText = " (" + numPlayers + " Players)";

    var html = '<table class="table"><thead><tr><th>Player</th>';

    html += '<th>Total Score</th>';

    html += '<th>unconfirmed plays</th>';
    html += '<th>add score</th>';
    html += '</tr></thead';

    for (i = 0; i < numPlayers; i++) {
        var result = contractInstance.getPlayerByGame(gameHash, i);
        var score = result[1]['c'][0];
        var score_unconfirmed = result[2]['c'][0];
        var playerName = result[0];
        if (playerName != '') {
            html += '<tbody><tr><td>' + playerName + '</td>';
            html += '<td>' + score + '</td>';

            if (score_unconfirmed != 0) {
                html += '<td>(+' + score_unconfirmed + ')&nbsp;<i onClick="confirmGameScorePopup(\'' + playerName + '\')"class="fa fa-check-circle-o" style="cursor: pointer; color: #5cb85c;font-size: 20px;font-color: green;" aria-hidden="true" title="Confirm Play Scores"></i></td>';
            } else {
                html += '<td></td>';
            }

            html += '<td><div class="col-md-4" style="padding-left: 0"><input class="form-control" id="' + playerName + '_value" value="0"></div>';
            html += '<div class="col-md-8" style="padding-left: 0"><button class="btn btn-default" type="button" id="' + playerName + '_button" onClick="addScore(\'' + playerName + '\');" style="min-width: 20px;"><i class="fa fa-plus-circle" aria-hidden="true"></i></button></div></td>';
            html += '</tr></tbody>';
        }
    }
    divPlayers.innerHTML += html;
    divPlayers.innerHTML += "</table>";

};

function createGame() {
    var button = document.getElementById('createGame_button');
    button.innerHTML = 'in progress';
    button.disabled = true;
    var gameName = document.getElementById('gameName').value;
    var gameDescription = document.getElementById('gameDescription').value;
    var adminPw = document.getElementById('adminPw').value;

    web3.personal.unlockAccount(send_acct, send_acct_pw);
    var txHash = contractInstance.addNewGame(gameName, gameDescription, adminPw, { from: send_acct, gas: gas, gasPrice: gasPrice });

    console.log(txHash);
    filter = web3.eth.filter('latest', function (error, result) {
        if (!error) {
            console.log(web3.eth.getTransaction(txHash).blockNumber);
            button.innerHTML = 'sent';
            button.disabled = false;
            filter.stopWatching();
            var gameHash = contractInstance.createGameHash(gameName, adminPw);
            document.getElementById('gameHash').value = gameHash
            getGame();
            alert('Please bookmark the following URL to access your game: \n\n' + location.protocol + '//' + location.host + location.pathname + "?" + gameHash);
            window.location.href = location.protocol + '//' + location.host + location.pathname + "?" + gameHash;
        } else {
            console.error(error)
        }
    });
};

function addScore(playerName) {
	
	lastTx = playerName;
    var button = document.getElementById(playerName + '_button');
    button.innerHTML = 'in progress';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    var scoreValue = document.getElementById(playerName + '_value').value;

    var a = web3.personal.unlockAccount(send_acct, send_acct_pw,  function (error, result) {
		if (!error) {
			var txHash = contractInstance.addGameScore(gameHash, playerName, scoreValue, { from: send_acct, gas: gas, gasPrice: gasPrice },  function (error, result) {
				txHash = result;
				console.log(txHash);
				var filter = web3.eth.filter('latest', function (error, result) {
					if (!error) {
						console.log(web3.eth.getTransaction(txHash).blockNumber);
						button.innerHTML = 'sent';
						button.disabled = false;
						filter.stopWatching();
				console.log(playerName + '-' + lastTx);
						if (lastTx === playerName) getGame();
					} else {
						console.error(error);
					}
				});
		});
		} else {
			console.error(error);
		}
	
	});

};

function confirmGameScore(playerName, confPW) {

    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = 'in progress';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    //var confPW = document.getElementById(playerName + '_confPW').value;

    web3.personal.unlockAccount(send_acct, send_acct_pw);
    var txHash = contractInstance.confirmGameScore(gameHash, playerName, confPW, { from: send_acct, gas: gas, gasPrice: gasPrice });

    console.log(txHash);
    filter = web3.eth.filter('latest', function (error, result) {

        if (!error) {

            console.log(web3.eth.getTransaction(txHash).blockNumber);

            button.innerHTML = 'sent';

            button.disabled = false;

            filter.stopWatching();

            getGame();

        } else {

            console.error(error)

        }

    });

};

function addPlayer() {

    var button = document.getElementById('addPlayer_button');

    button.innerHTML = 'in progress';

    button.disabled = true;


    var playerName = document.getElementById('playerName').value;

    var playerPw = document.getElementById('playerPw').value;

    var gameHash = document.getElementById('gameHash').value;


    web3.personal.unlockAccount(send_acct, send_acct_pw);

    var txHash = contractInstance.addPlayerToGame(gameHash, playerName, playerPw, { from: send_acct, gas: gas, gasPrice: gasPrice });

    console.log(txHash);


    filter = web3.eth.filter('latest', function (error, result) {

        if (!error) {
            console.log(web3.eth.getTransaction(txHash).blockNumber);
            button.innerHTML = 'sent';
            button.disabled = false;

            filter.stopWatching();

            getGame();

            document.getElementById('playerName').value = "Player Name";

            document.getElementById('playerPw').value = "Player PW";

            $('#addPlayerSlider').slideUp();
        } else {

            console.error(error)

        }

    });


};

function removePlayer() {

    var button = document.getElementById('removePlayer_button');
    button.innerHTML = 'in progress';
    button.disabled = true;

    var playerName = document.getElementById('removePlayerName').value;
    var adminPw = document.getElementById('removeAdminPw').value;
    var gameHash = document.getElementById('gameHash').value;


    web3.personal.unlockAccount(send_acct, send_acct_pw);
    var txHash = contractInstance.removePlayerFromGame(gameHash, playerName, adminPw, { from: send_acct, gas: gas, gasPrice: gasPrice });

    console.log(txHash);


    filter = web3.eth.filter('latest', function (error, result) {

        if (!error) {

            console.log(web3.eth.getTransaction(txHash).blockNumber);

            button.innerHTML = 'sent';

            button.disabled = false;

            filter.stopWatching();

            getGame();
            document.getElementById('removePlayerName').value = "Player Name";

            document.getElementById('removeAdminPw').value = "Admin PW";

            $('#removePlayerSlider').slideUp();
        } else {

            console.error(error)

        }

    });


};

function getGamePopup() {
    var gameHash = prompt("Please enter your game key", "0x364317d077d3b41c0ecb76e0d9099d38289c9f47dd6fcb94c84041df519b034e");
    window.location.href = location.protocol + '//' + location.host + location.pathname + "?" + gameHash;
};

function createGamePopup() {
   $("#newGameSection").show();
   $("#activeGameSection").hide();
};

function confirmGameScorePopup(playerName) {
    var playerPW = prompt("A player can only conform the scores of "+playerName+".\nYou can not confirm your own socres.\n\nPlease enter your password");
	if (playerPW !== null) confirmGameScore(playerName, playerPW);
};

function removePlayerSlideDown() {
    if ($("#removePlayerSlider").is(":visible")) {
		$('#removePlayerSlider').slideUp();
    } else {
		$("#removePlayerSlider").slideDown();
	}
};

function addPlayerSlideDown() {
    if ($("#addPlayerSlider").is(":visible")) {
		$('#addPlayerSlider').slideUp();
    } else {
		$("#addPlayerSlider").slideDown();
	}
};
