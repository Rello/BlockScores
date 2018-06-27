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
var boardCost;
var timerState = [];
var demoboard = false;

/** init Functions */

window.addEventListener('load', function () {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3 !== 'undefined') {
        var web3js = new Web3(web3.currentProvider);
        document.getElementById("warning").hidden = true;
        getNetworkId();
    } else {
        console.log('No web3? You should consider trying MetaMask!');

        var button = document.getElementById('newBoard_button');
        button.innerHTML = 'offline';
        button.disabled = true;

        button = document.getElementById('existingBoard_button');
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
            demoBoard();
            break
        case "2":
            console.log('This is the deprecated Morden test network.');
            demoBoard();
            break
        case "3":
            console.log('This is the ropsten test network.');
            abiArray = abiArray;
            contract_address = contract_address;
            initContract();
            break
        default:
            console.log('This is an unknown network.');
            demoBoard();
        }
    });
}

function initContract() {
    // instantiate by address
    MyContract = web3.eth.contract(abiArray);
    contractInstance = MyContract.at(contract_address);
    var boardHash = window.location.href.substring(window.location.href.lastIndexOf("?") + 1).split("&")[0];
    if (boardHash !== location.protocol + '//' + location.host + location.pathname) {
        document.getElementById('boardHash').value = boardHash;
        getBoard();
    } else {
        document.getElementById("activeBoardSection").hidden = true;
    }

    contractInstance.boardCost(function (err, transactionHash) {
        boardCost = transactionHash;
        document.getElementById("introBoardCost").innerHTML = web3.fromWei(boardCost,'ether');
    });

    contractInstance.playerCost(function (err, transactionHash) {
        playerCost = transactionHash;
        document.getElementById("introPlayerCost").innerHTML = web3.fromWei(playerCost,'ether') / 2;
    });
    priceForGas = '41000000000';
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


/** Board Functions */

function addBoard() {

    if (checkLoggedIn() === false) return;

    var button = document.getElementById('newBoard_button');
    button.innerHTML = 'sign';
    button.disabled = true;

    var boardName = document.getElementById('newBoardName').value;
    var boardAscii = web3.fromAscii(boardName);
    var boardDescription = document.getElementById('newBoardDescription').value;
    var getData = contractInstance.addNewBoard.getData(boardAscii, boardDescription);

    web3request(getData,boardCost,boardName,addBoardDone,addBoardTxDone);
}

function addBoardDone(boardName) {
    var button = document.getElementById('newBoard_button');
    button.innerHTML = '&#8634 waiting';
}

function addBoardTxDone(boardName, result) {
    if (result === false) {
        alert('Board not created');
        var button = document.getElementById('newBoard_button');
        button.innerHTML = 'Create';
        button.disabled = false;
        return;
    }

    contractInstance.createBoardHash(boardName, web3.eth.accounts[0], function (err, transactionHash) {
        document.getElementById('boardHash').value = transactionHash;
        console.log('Board Hash: ', transactionHash);
        setBoardURL();
    })
}

function getBoard() {

    demoboard = false;
    var boardHash = document.getElementById('boardHash').value;

    contractInstance.getBoardByHash(boardHash, function (err, transactionHash) {
        displayBoard(transactionHash,'');
    });
}

function displayBoard(boardData, demo) {

    document.getElementById("intro").hidden = true;
    document.getElementById("warning").hidden = true;
    document.getElementById("header").className += " small";
    document.getElementById("existingBoardSection").hidden = true;
    document.getElementById("newBoardSection").hidden = true;
    document.getElementById("activeBoardSection").hidden = false;
    document.getElementById("subheader").hidden = true;
    var boardTitel;
    var html;

    if (!demo) {
        boardTitle = web3.toAscii(boardData[0]);
    } else {
        boardTitle = boardData[0];
    }
    document.title = "BlockScores: " + boardTitle;
    var boardDescrtiption = boardData[1];
    var numPlayers = boardData[2]['c'][0];
    var divPlayers = document.getElementById("boardPlayers");
    divPlayers.innerHTML = "";

    console.log(JSON.stringify(boardData));
    document.getElementById("boardTitle").innerText = boardTitle;
    document.getElementById("boardDescription").innerText = boardDescrtiption;

    html = '<table class="u-full-width" id="boardTable"><thead><tr>';
    html += '<th>PLAYER</th><th class="centered">TOTAL</th><th class="centered light">PEND.</th><th class="centered light">ADD SCORE</th>';
    html += '</tr></thead><tbody></tbody></table>';
    document.getElementById("boardPlayers").innerHTML = html;

    if (!demo) getBoardPlayers(numPlayers);
}

function demoBoard() {

    demoboard = true;
    var boardArray = ["BlockScores Demo Board", "Demo without blockchain interaction",  {c : [ "2"]}];
    displayBoard(boardArray, true);

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

    if (checkLoggedIn() === false || demoboard) return;
    var button = document.getElementById('addPlayer_button');
    button.innerHTML = 'sign';
    button.disabled = true;

    var playerName = document.getElementById('playerName').value;
    var playerAscii = web3.fromAscii(playerName);
    var boardHash = document.getElementById('boardHash').value;
    var getData = contractInstance.addPlayerToBoard.getData(boardHash, playerAscii);

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
    getBoard();
}

function getBoardPlayers(numPlayers) {
    var boardHash = document.getElementById('boardHash').value;
    for (var i = 0; i < numPlayers; i++) {
        contractInstance.getPlayerByBoard(boardHash, i, function (err, transactionHash) {
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
    var table = document.getElementById("boardTable").getElementsByTagName('tbody')[0];
    if (playerName !== '') {
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);

        cell1.innerHTML = playerName;
        cell1.className = 'playerName';
        cell2.innerHTML = score;
        cell2.className = 'centered';

        if (score_unconfirmed !== 0) {
            cell3.innerHTML = '(+' + score_unconfirmed + ')&nbsp;<button class="button-primary small" type="button" id="' + playerHash + '_confButton"  onClick="confirmScore(\'' + playerHash + '\')\"><i>&#10003;</i></button>';
        } else {
            cell3.innerHTML = '';
        }
        cell3.className = 'centered light';
        cell4.innerHTML = '<input size="2" class="form-control" id="' + playerHash + '_value" value="0">&nbsp;<button class="button-primary small" type="button" id="' + playerHash + '_addButton" onClick="addScore(\'' + playerHash + '\');"><i>+</i></button>';
        cell4.className = 'centered light';
    }
}


/** Score Functions */

function addScore(playerName) {

    if (checkLoggedIn() === false || demoboard) return;
    lastTx = playerName;
    var button = document.getElementById(playerName + '_addButton');
    button.innerHTML = 'sign';
    button.disabled = true;

    var boardHash = document.getElementById('boardHash').value;
    var scoreValue = document.getElementById(playerName + '_value').value;
    var getData = contractInstance.addBoardScore.getData(boardHash, playerName, scoreValue);

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
    getBoard();
}

function confirmScore(playerName) {

    if (checkLoggedIn() === false || demoboard) return;
    var button = document.getElementById(playerName + '_confButton');
    button.innerHTML = 'sign';
    button.disabled = true;

    var boardHash = document.getElementById('boardHash').value;
    var getData = contractInstance.confirmBoardScore.getData(boardHash, playerName);

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

function setBoardURL() {
    var boardHash = document.getElementById('boardHash').value;
    window.history.pushState(null, null, './index.html?'+boardHash);
    alert ('Please bookmark this URL to access your BlockScores again');
    getBoard();
}

function toggleSection(section) {
    section = section + 'Section';
    if (document.getElementById(section).hidden == true) {
        document.getElementById("existingBoardSection").hidden = true;
        document.getElementById("newBoardSection").hidden = true;
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
