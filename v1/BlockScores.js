/**
 * BlockScores
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <blockscores@scherello.de>
 * @copyright 2018 Marcel Scherello
 */

var abiArray;
var contract_address;
var priceForGas;
var playerCost;
var gameCost;
var timerState = [];
var demogame = false;

/** init Functions */

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        var web3js = new Web3(web3.currentProvider);
        document.getElementById("warning").hidden = true;
        getNetworkId();
    } else {
        console.log('No web3? You should consider trying MetaMask!');

        var button = document.getElementById('newGame_button');
        button.innerHTML = 'offline';
        button.disabled = true;

        button = document.getElementById('existingGame_button');
        button.innerHTML = 'offline';
        button.disabled = true;
    }
});

function checkLoggedIn() {
    if (typeof web3.eth.accounts[0] !== 'undefined') return true;
    else {
        console.log ('not signed in');
        alert("Please sign in to your wallet");
        return false;
    }
}

function getNetworkId() {
    web3.version.getNetwork((err, netId) => {
        switch (netId) {
        case "1":
            console.log('This is mainnet');
            demoGame();
            break
        case "2":
            console.log('This is the deprecated Morden test network.');
            demoGame();
            break
        case "3":
            console.log('This is the ropsten test network.');
            abiArray = abiArray;
            contract_address = contract_address;
            initContract();
            break
        default:
            console.log('This is an unknown network.');
            demoGame();
        }
    });
}

function initContract() {
    // instantiate by address
    MyContract = web3.eth.contract(abiArray);
    contractInstance = MyContract.at(contract_address);
    var gameHash = window.location.href.substring(window.location.href.lastIndexOf("?") + 1).split("&")[0];
    if (gameHash !== location.protocol + '//' + location.host + location.pathname) {
        document.getElementById('gameHash').value = gameHash;
        getGame();
    } else {
        document.getElementById("activeGameSection").hidden = true;
    }

    contractInstance.gameCost(function (err, transactionHash) {
        gameCost = transactionHash;
        document.getElementById("introGameCost").innerHTML = web3.fromWei(gameCost,'ether');
    });

    contractInstance.playerCost(function (err, transactionHash) {
        playerCost = transactionHash;
        document.getElementById("introPlayerCost").innerHTML = web3.fromWei(playerCost,'ether') / 2;
    });
    priceForGas = '60000000000';
}

function web3request(getData, value, returndata, callback, callbackTxDone) {
    web3.eth.estimateGas({
        from: web3.eth.accounts[0],
        data: getData,
        value: value,
        to: contract_address
    }, function(err, estimatedGas) {
        if (err) {
            console.log(err);
            callbackTxDone(returndata,false);
            return;
        }
        console.log('gas:'+estimatedGas);
        gas = estimatedGas;
        web3.eth.sendTransaction({
                to: contract_address,
                from: web3.eth.accounts[0],
                gasPrice: priceForGas,
                gas: gas,
                value: value,
                data: getData
            }, function (err, transactionHash) {
                if (err) {
                    callbackTxDone(returndata,false);
                    console.log('Oh no!: ' + err.message);
                    return;
                }
                console.log('Tx: ', transactionHash);
                timerState[transactionHash] = false;
                timer(transactionHash, returndata, callbackTxDone);
                callback(returndata);
            }
        );

    });
}


/** Game Functions */

function addGame() {

    if (checkLoggedIn() === false) return;

    var button = document.getElementById('newGame_button');
    button.innerHTML = 'sign';
    button.disabled = true;

    var gameName = document.getElementById('newGameName').value;
    var gameAscii = web3.fromAscii(gameName);
    var gameDescription = document.getElementById('newGameDescription').value;
    var getData = contractInstance.addNewGame.getData(gameAscii, gameDescription);

    web3request(getData,gameCost,gameName,addGameDone,addGameTxDone);
}

function addGameDone(gameName) {
    var button = document.getElementById('newGame_button');
    button.innerHTML = '&#8634 waiting';
}

function addGameTxDone(gameName, result) {
    if (result === false) {
        alert('Game not created');
        var button = document.getElementById('newGame_button');
        button.innerHTML = 'Create';
        button.disabled = false;
        return;
    }

    contractInstance.createGameHash(gameName, web3.eth.accounts[0], function (err, transactionHash) {
        document.getElementById('gameHash').value = transactionHash;
        console.log('Game Hash: ', transactionHash);
        setGameURL();
    })
}

function getGame() {

    demogame = false;
    var gameHash = document.getElementById('gameHash').value;

    contractInstance.getGameByHash(gameHash, function (err, transactionHash) {
        displayGame(transactionHash,'');
    });
}

function displayGame(gameData, demo) {

    document.getElementById("intro").hidden = true;
    document.getElementById("warning").hidden = true;
    document.getElementById("header").className += " small";
    document.getElementById("existingGameSection").hidden = true;
    document.getElementById("newGameSection").hidden = true;
    document.getElementById("activeGameSection").hidden = false;
    document.getElementById("subheader").hidden = true;
    var gameTitel;
    var html;

    if (!demo) {
        gameTitle = web3.toAscii(gameData[0]);
    } else {
        gameTitle = gameData[0];
    }
    document.title = "BlockScores: " + gameTitle;
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
}

function demoGame() {

    demogame = true;
    var gameArray = ["BlockScores Demo Board", "Demo without blockchain interaction",  {c : [ "2"]}];
    displayGame(gameArray, true);

//    var playerArray = ["0x506c617965722031", {c : [ "1"]},  {c : [ "1"]}];
    var playerArray = ["High Scorer", {c : [ "12"]},  {c : [ "3"]}];
    displayPlayer(playerArray, true);

//    var playerArray = ["0x506c617965722032", {c : [ "2"]},  {c : [ "2"]}];
    playerArray = ["The Winnner", {c : [ "9"]},  {c : [ "0"]}];
    displayPlayer(playerArray, true);

    playerArray = ["Trying Hard", {c : [ "2"]},  {c : [ "2"]}];
    displayPlayer(playerArray, true);
}


/** Player Functions */

function addPlayer() {

    if (checkLoggedIn() === false || demogame) return;
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = 'sign';
    button.disabled = true;

    var playerName = document.getElementById('playerName').value;
    var playerAscii = web3.fromAscii(playerName);
    var gameHash = document.getElementById('gameHash').value;
    var getData = contractInstance.addPlayerToGame.getData(gameHash, playerAscii);

    web3request(getData,playerCost,false,addPlayerDone,addPlayerTxDone)
}

function addPlayerDone(playerName) {
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = '&#8634 waiting';
}

function addPlayerTxDone(playerName,result) {
    document.getElementById('playerName').value = "Player Name";
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = '<i>&#10003;</i>';
    button.disabled = false;
    getGame();
}

function getGamePlayers(numPlayers) {
    var gameHash = document.getElementById('gameHash').value;
    for (var i = 0; i < numPlayers; i++) {
        contractInstance.getPlayerByGame(gameHash, i, function (err, transactionHash) {
            displayPlayer(transactionHash,'');
        });
    }
}

function displayPlayer(playerData, demo) {
    var score = playerData[1]['c'][0];
    var score_unconfirmed = playerData[2]['c'][0];
    var playerHash = playerData[0];
    var playerName;

    if (!demo) {
        playerName = web3.toAscii(playerHash);
    } else {
        playerName = playerHash;
    }
    var table = document.getElementById("gameTable").getElementsByTagName('tbody')[0];
    if (playerName !== '') {
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        cell1.innerHTML = playerName;
        cell1.className = 'playerName';
        cell2.innerHTML = score;

        if (score_unconfirmed !== 0) {
            cell3.innerHTML = '(+' + score_unconfirmed + ')&nbsp;<button class="button-primary small" type="button" id="' + playerHash + '_confButton"  onClick="confirmScore(\'' + playerHash + '\')\"><i>&#10003;</i></button>';
        } else {
            cell3.innerHTML = '';
        }
        cell4.innerHTML = '<input size="2" class="form-control" id="' + playerHash + '_value" value="0"><button class="button-primary small" type="button" id="' + playerHash + '_addButton" onClick="addScore(\'' + playerHash + '\');"><i>+</i></button>';
    }
}


/** Score Functions */

function addScore(playerName) {

    if (checkLoggedIn() === false || demogame) return;
    lastTx = playerName;
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = 'sign';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    var scoreValue = document.getElementById(playerName + '_value').value;
    var getData = contractInstance.addGameScore.getData(gameHash, playerName, scoreValue);

    web3request(getData,0,playerName,addScoreDone,addScoreTxDone);
}

function addScoreDone(playerName) {
    lastTx = playerName;
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = '&#8634';
}

function addScoreTxDone(playerName,result) {
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = '<i>&#10003;</i>';
    button.disabled = false;
    getGame();
}

function confirmScore(playerName) {

    if (checkLoggedIn() === false || demogame) return;
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = 'sign';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    var getData = contractInstance.confirmGameScore.getData(gameHash, playerName);

    web3request(getData,0,playerName,confirmScoreDone,confirmScoreTxDone)
}

function confirmScoreDone(playerName) {
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = '&#8634';
}

function confirmScoreTxDone(playerName,result) {

    if (result === false) alert('You can not confirm your own scores');
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = '<i>&#10003;</i>';
    button.disabled = false;
}


/** UI Functions */

function setGameURL() {
    var gameHash = document.getElementById('gameHash').value;
    window.history.pushState(null, null, './index.html?'+gameHash);
    alert ('Please bookmark this URL to access your BlockScores again');
    getGame();
}

function toggleSection(section) {
    section = section + 'Section';
    if (document.getElementById(section).hidden == true) {
        document.getElementById("existingGameSection").hidden = true;
        document.getElementById("newGameSection").hidden = true;
        document.getElementById("newPlayerSection").hidden = true;
        document.getElementById("contactSection").hidden = true;
        document.getElementById(section).hidden = false;
    } else {
        document.getElementById(section).hidden = true;
    }
}

function timer(hash, returndata, callbackTxDone) {
    console.log('waiting for TX'+ timerState[hash]);
    web3.eth.getTransactionReceipt(hash,function(error, result){
        if(!error){
            if (result !== null) {
                console.log(result);
                console.log(result['blockNumber']);
                clearTimeout(timerState[hash]);
                timerState[hash] = true;
                callbackTxDone(returndata, result);
            }
        }else{
            console.error(error);
            clearTimeout(timerState[hash]);
            timerState[hash] = true;
        }
    });
    if(timerState[hash] !== true) timerState[hash] = setTimeout(timer, 1000, hash, returndata, callbackTxDone);
}
