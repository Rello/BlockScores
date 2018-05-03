/**
 * BlockScores
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <blockscores@scherello.de>
 * @copyright 2018 Marcel Scherello
 */

window.addEventListener('load', function () {

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        // Use Mist/MetaMask's provider
        web3js = new Web3(web3.currentProvider);
    } else {
        console.log('No web3? You should consider trying MetaMask!');
        alert('No web3? You should consider trying MetaMask!');
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        //web3js = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    // instantiate by address
    MyContract = web3.eth.contract(abiArray);
    contractInstance = MyContract.at(contract_address);
    var gameHash = window.location.href.substring(window.location.href.lastIndexOf("?") + 1).split("&")[0];
    if (gameHash != location.protocol + '//' + location.host + location.pathname) {
        document.getElementById('gameHash').value = gameHash;
        getGame();
    } else {
        document.getElementById("activeGameSection").hidden = true;
    }

    contractInstance.gameCost(function (err, transactionHash) {
        gameCost = transactionHash;
        console.log('GameCost: ', transactionHash);
    })

    contractInstance.playerCost(function (err, transactionHash) {
        playerCost = transactionHash;
        console.log('PlayerCost: ', transactionHash);
    })

    priceForGas = '3000000000';

})

document.addEventListener("DOMContentLoaded", function () {
});

function createGame() {
    var button = document.getElementById('createGame_button');
    button.innerHTML = 'in progress';
    button.disabled = true;
    var gameName = document.getElementById('newGameName').value;
    var gameAscii = web3.fromAscii(gameName);
    var gameDescription = document.getElementById('newGameDescription').value;

    var getData = contractInstance.addNewGame.getData(gameAscii, gameDescription);
    web3.eth.sendTransaction({
            to: contract_address,
            from: web3.eth.accounts[0],
            gasPrice: priceForGas,
            value: gameCost,
            data: getData
        }, function (err, transactionHash) {
            if (err) return console.log('Oh no!: ' + err.message);
            console.log('Tx: ', transactionHash);
        }
    );
    contractInstance.createGameHash(gameName, web3.eth.accounts[0], function (err, transactionHash) {
        document.getElementById('gameHash').value = transactionHash;
        console.log('Game Hash: ', transactionHash);
    })
};

function getGame() {

    document.getElementById("existingGameSection").hidden = true;
    document.getElementById("newGameSection").hidden = true;
    document.getElementById("activeGameSection").hidden = false;
    var gameHash = document.getElementById('gameHash').value;

    contractInstance.getGameByHash(gameHash, function (err, transactionHash) {
        console.log('Game Details: ', transactionHash);
        displayGame(transactionHash,'');
    });

};

function displayGame(gameData, demo) {
    var gameTitle = web3.toAscii(gameData[0]);
    var gameDescrtiption = gameData[1];
    var numPlayers = gameData[2]['c'][0];
    var divPlayers = document.getElementById("gamePlayers");
    divPlayers.innerHTML = "";

    console.log(JSON.stringify(gameData));
    document.getElementById("gameTitle").innerText = gameTitle;
    document.getElementById("gameDescription").innerText = gameDescrtiption;

    html = '<table class="u-full-width" id="gameTable"><thead><tr>';
    html += '<th>Player</th><th>Total</th><th>pend.</th><th>add score</th>';
    html += '</tr></thead><tbody></tbody></table>';
    document.getElementById("gamePlayers").innerHTML = html;

    if (!demo) getGamePlayers(numPlayers);
};


function addPlayer() {

    var button = document.getElementById('addPlayer_button');
    button.innerHTML = 'in progress';
    button.disabled = true;

    var playerName = document.getElementById('playerName').value;
    var playerAscii = web3.fromAscii(playerName);
    var gameHash = document.getElementById('gameHash').value;

    var getData = contractInstance.addPlayerToGame.getData(gameHash, playerAscii);
    web3.eth.sendTransaction({
            to: contract_address,
            from: web3.eth.accounts[0],
            gasPrice: priceForGas,
            value: playerCost,
            data: getData
        }, function (err, transactionHash) {
            if (err) return renderMessage('Oh no!: ' + err.message)
            console.log('Tx: ', transactionHash);
            document.getElementById('playerName').value = "Player Name";
            //$('#addPlayerSlider').slideUp();
        }
    );
};

function getGamePlayers(numPlayers) {
    var gameHash = document.getElementById('gameHash').value;
    for (i = 0; i < numPlayers; i++) {
        contractInstance.getPlayerByGame(gameHash, i, function (err, transactionHash) {
            console.log(transactionHash);
            displayPlayer(transactionHash,'');
        });
    }
};

function displayPlayer(playerData, demo) {
    var score = playerData[1]['c'][0];
    var score_unconfirmed = playerData[2]['c'][0];
    var playerName = web3.toAscii(playerData[0]);
    var table = document.getElementById("gameTable").getElementsByTagName('tbody')[0];
    if (playerName != '') {
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        cell1.innerHTML = playerName;
        cell1.className = 'playerName';
        cell2.innerHTML = score;

        if (score_unconfirmed != 0) {
            cell3.innerHTML = '(+' + score_unconfirmed + ')&nbsp;<button class="button-primary small" type="button" onClick="confirmGameScorePopup(\'' + playerName + '\')\"><i>&#10003;</i></button>';
        } else {
            cell3.innerHTML = '';
        }
        cell4.innerHTML = '<input size="2" class="form-control" id="' + playerName + '_value" value="0"><button class="button-primary small" type="button" id="' + playerName + '_button" onClick="addScore(\'' + playerName + '\');"><i>+</i></button>';
    }
};

function addScore(playerName) {

    lastTx = playerName;
    var button = document.getElementById(playerName + '_button');
    button.innerHTML = '&#8634';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    var scoreValue = document.getElementById(playerName + '_value').value;

    var getData = contractInstance.addGameScore.getData(gameHash, playerName, scoreValue);
    web3.eth.estimateGas({
        from: web3.eth.accounts[0],
        data: getData,
        to: contract_address
    }, function(err, estimatedGas) {
        if (err) console.log(err);
        console.log('gas:'+estimatedGas);
        gas = estimatedGas;
        web3.eth.sendTransaction({
                to: contract_address,
                from: web3.eth.accounts[0],
                gasPrice: priceForGas,
                gas: gas,
                data: getData
            }, function (err, transactionHash) {
                if (err) return console.log('Oh no!: ' + err.message);
                console.log('Tx: ', transactionHash);
                button.innerHTML = 'sent';
                button.disabled = false;
                if (lastTx === playerName) getGame();
            }
        );

    });

};

function confirmGameScore(playerName, confPW) {

    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = 'in progress';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    //var confPW = document.getElementById(playerName + '_confPW').value;

    web3.personal.unlockAccount(send_acct, send_acct_pw);
    var txHash = contractInstance.confirmGameScore(gameHash, playerName, confPW, {
        from: send_acct,
        gas: gas,
        gasPrice: gasPrice
    });

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

function removePlayer() {

    var button = document.getElementById('removePlayer_button');
    button.innerHTML = 'in progress';
    button.disabled = true;

    var playerName = document.getElementById('removePlayerName').value;
    var adminPw = document.getElementById('removeAdminPw').value;
    var gameHash = document.getElementById('gameHash').value;


    web3.personal.unlockAccount(send_acct, send_acct_pw);
    var txHash = contractInstance.removePlayerFromGame(gameHash, playerName, adminPw, {
        from: send_acct,
        gas: gas,
        gasPrice: gasPrice
    });

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
    var playerPW = prompt("A player can only conform the scores of " + playerName + ".\nYou can not confirm your own socres.\n\nPlease enter your password");
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

function newGameSection() {
    if (document.getElementById("newGameSection").hidden == true) {
        document.getElementById("newGameSection").hidden = false;
    } else {
        document.getElementById("newGameSection").hidden = true;
    }
};

function existingGameSection() {
    if (document.getElementById("existingGameSection").hidden == true) {
        document.getElementById("existingGameSection").hidden = false;
    } else {
        document.getElementById("existingGameSection").hidden = true;
    }
};

function demoGame() {
    document.getElementById("existingGameSection").hidden = true;
    document.getElementById("newGameSection").hidden = true;
    document.getElementById("activeGameSection").hidden = false;

    var gameArray = ["Demo Scoreboard", "Demo without blockchain interaction",  {c : [ "2"]}];
    displayGame(gameArray, true);

    var playerArray = ["Player 1", {c : [ "1"]},  {c : [ "1"]}];
    displayPlayer(playerArray, true);

    var playerArray = ["Player 2", {c : [ "2"]},  {c : [ "2"]}];
    displayPlayer(playerArray, true);
};
