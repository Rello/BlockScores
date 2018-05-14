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


/** init Functions */

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        web3js = new Web3(web3.currentProvider);
        document.getElementById("warning").hidden = true;
        getNetworkId();
    } else {
        console.log('No web3? You should consider trying MetaMask!');
        var button = document.getElementById('newGame_button');
        button.innerHTML = 'offline';
        button.disabled = true;
        var button = document.getElementById('existingGame_button');
        button.innerHTML = 'offline';
        button.disabled = true;
    }
})

function checkLoggedIn() {
    if (typeof web3.eth.accounts[0] != 'undefined') return true;
    else {
        console.log ('not signed in');
        alert("Please sign in to your wallet");
        return false;
    }
};

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
            abiArray = abiArray_rospen;
            contract_address = contract_address_rospen;
            initContract();
            break
        default:
            console.log('This is an unknown network.');
            demoGame();
        }
    });
};

function initContract() {
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
        document.getElementById("introGameCost").innerHTML = web3.fromWei(gameCost,'ether');
    })

    contractInstance.playerCost(function (err, transactionHash) {
        playerCost = transactionHash;
        document.getElementById("introPlayerCost").innerHTML = web3.fromWei(playerCost,'ether') / 2;
    })
    priceForGas = '60000000000';
};

function web3request(getData, value, returndata, callback) {
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
                value: value,
                data: getData
            }, function (err, transactionHash) {
                if (err) return console.log('Oh no!: ' + err.message);
                console.log('Tx: ', transactionHash);
                callback(returndata);
            }
        );

    });
}


/** Game Functions */

function createGame() {
    if (checkLoggedIn() === false) return;

    var button = document.getElementById('newGame_button');
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

    document.getElementById("intro").hidden = true;
    document.getElementById("warning").hidden = true;
    document.getElementById("subheader").hidden = true;
    document.getElementById("existingGameSection").hidden = true;
    document.getElementById("newGameSection").hidden = true;
    document.getElementById("activeGameSection").hidden = false;
    document.getElementById("subheader").hidden = true;

    var gameHash = document.getElementById('gameHash').value;

    contractInstance.getGameByHash(gameHash, function (err, transactionHash) {
        displayGame(transactionHash,'');
    });

};

function displayGame(gameData, demo) {
    if (!demo) {
        var gameTitle = web3.toAscii(gameData[0]);
    } else {
        var gameTitle = gameData[0];
    }
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

function demoGame() {
    document.getElementById("warning").hidden = true;
    document.getElementById("intro").hidden = true;
    document.getElementById("subheader").hidden = true;
    document.getElementById("existingGameSection").hidden = true;
    document.getElementById("newGameSection").hidden = true;
    document.getElementById("activeGameSection").hidden = false;

    var gameArray = ["BlockScores Demo Board", "Demo without blockchain interaction",  {c : [ "2"]}];
    displayGame(gameArray, true);

//    var playerArray = ["0x506c617965722031", {c : [ "1"]},  {c : [ "1"]}];
    var playerArray = ["High Scorer", {c : [ "12"]},  {c : [ "3"]}];
    displayPlayer(playerArray, true);

//    var playerArray = ["0x506c617965722032", {c : [ "2"]},  {c : [ "2"]}];
    var playerArray = ["The Winnner", {c : [ "9"]},  {c : [ "0"]}];
    displayPlayer(playerArray, true);

    var playerArray = ["Trying Hard", {c : [ "2"]},  {c : [ "2"]}];
    displayPlayer(playerArray, true);
};


/** Player Functions */

function addPlayer() {

    if (checkLoggedIn() === false) return;
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = 'in progress';
    button.disabled = true;

    var playerName = document.getElementById('playerName').value;
    var playerAscii = web3.fromAscii(playerName);
    var gameHash = document.getElementById('gameHash').value;
    var getData = contractInstance.addPlayerToGame.getData(gameHash, playerAscii);

    web3request(getData,playerCost,false,addPlayerDone)
};

function addPlayerDone(playerName) {
    document.getElementById('playerName').value = "Player Name";
}

function getGamePlayers(numPlayers) {
    var gameHash = document.getElementById('gameHash').value;
    for (i = 0; i < numPlayers; i++) {
        contractInstance.getPlayerByGame(gameHash, i, function (err, transactionHash) {
            displayPlayer(transactionHash,'');
        });
    }
};

function displayPlayer(playerData, demo) {
    var score = playerData[1]['c'][0];
    var score_unconfirmed = playerData[2]['c'][0];
    var playerHash = playerData[0];
    if (!demo) {
        var playerName = web3.toAscii(playerHash);
    } else {
        var playerName = playerHash;
    }
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
        var player_value = playerName + '_value';

        if (score_unconfirmed != 0) {
            cell3.innerHTML = '(+' + score_unconfirmed + ')&nbsp;<button class="button-primary small" type="button" id="' + playerHash + '_confButton"  onClick="confirmScore(\'' + playerHash + '\')\"><i>&#10003;</i></button>';
        } else {
            cell3.innerHTML = '';
        }
        cell4.innerHTML = '<input size="2" class="form-control" id="' + playerHash + '_value" value="0"><button class="button-primary small" type="button" id="' + playerHash + '_addButton" onClick="addScore(\'' + playerHash + '\');"><i>+</i></button>';
    }
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


/** Score Functions */

function addScore(playerName) {

    if (checkLoggedIn() === false) return;
    lastTx = playerName;
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = '&#8634';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    var scoreValue = document.getElementById(playerName + '_value').value;
    var getData = contractInstance.addGameScore.getData(gameHash, playerName, scoreValue);

    web3request(getData,0,playerName,addScoreDone)

    /*
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
    */

};

function addScoreDone(playerName) {
    lastTx = playerName;
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = 'sent';
    button.disabled = false;
    //if (lastTx === playerName) getGame();
}

function confirmScore(playerName) {

    if (checkLoggedIn() === false) return;
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = '&#8634';
    button.disabled = true;

    var gameHash = document.getElementById('gameHash').value;
    var getData = contractInstance.confirmGameScore.getData(gameHash, playerName);

    web3request(getData,0,playerName,confirmScoreDone)
};

function confirmScoreDone(playerName) {
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = 'sent';
    button.disabled = false;
    //getGame();
}


/** UI Functions */

function setGameURL() {
    gameHash = document.getElementById('gameHash').value;
    window.location.href = './index.html?'+gameHash;
};

function toggleSection(section) {
    section = section + 'Section';
    if (document.getElementById(section).hidden == true) {
        document.getElementById("existingGameSection").hidden = true;
        document.getElementById("newGameSection").hidden = true;
        document.getElementById("newPlayerSection").hidden = true;
        document.getElementById(section).hidden = false;
    } else {
        document.getElementById(section).hidden = true;
    }
};
