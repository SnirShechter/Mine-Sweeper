'use strict';
// global vars
var gBoard;
var gGameState;
var gTimer;

// ---------- GAME START FUNCTIONS ------------
// minesweeper onload function
function initMineSweeper() {
}
function startGame(size, mines) {
    // resets gGameState
    clearInterval(gTimer);
    document.querySelector('.board-container').innerHTML = '';
    gGameState = {
        gameOn: true,
        hasWon: false,
        secsPassed: 0,
        cellsClickCount: 0,
        cellsFlagCount: 0,
        size: size,
        mines: mines
    };
    // sets the clock
    document.querySelector('.timer').innerText = 0;
    gTimer = setInterval(function () {
        gGameState.secsPassed++;
        document.querySelector('.timer').innerText = gGameState.secsPassed;
    }, 1000);
    // creates model and renders it
    gBoard = createBoard();
    printBoard();
}
// creates a new board with mines
function createBoard() {
    var board = [];
    // creating an empty board
    for (var i = 0; i < gGameState.size; i++) {
        var row = [];
        for (var j = 0; j < gGameState.size; j++) {
            row.push({ isMine: false, negMinesCount: 0, isClicked: false, isFlagged: false });
        }
        board.push(row);
    }
    // inserting mines and negsCount
    for (var k = 0; k < gGameState.mines; k++) {
        // getting a random cell
        var i = Math.floor(Math.random() * gGameState.size);
        var j = Math.floor(Math.random() * gGameState.size);
        var cell = board[i][j];
        // checking if it is already a mine
        if (cell.isMine === true) {
            k--;
            continue;
            // if not, make him a mine and raise its negs negsMineCount 
        } else {
            cell.isMine = true;
            board = setNegsMineCount(board, i, j);
        }
    }
    return board;
}
// raises the neighbors' minesCount when the mines are set
function setNegsMineCount(board, i, j) {
    var neighborsCount = 0;
    // checking all slots in square where the slot is the middle
    for (var p = -1; p < 2; p++) {
        for (var k = -1; k < 2; k++) {
            // if we are outside the board(board[-1][0] for example) or on the cell we are checking, skip this iteration
            if (p + i < 0 || k + j < 0 || p + i > board.length - 1 || k + j > board.length - 1 || (p === 0 && k === 0)) continue;
            else board[i + p][j + k].negMinesCount++;
        }
    }
    return board;
}
// printing the board for the game start
function printBoard() {
    var elTable = document.createElement('table');
    for (var i = 0; i < gBoard[0].length; i++) {
        var elRow = document.createElement('tr');
        for (var j = 0; j < gBoard.length; j++) {
            var elText = document.createTextNode(' ');
            var elCell = document.createElement('td');
            elCell.setAttribute('onclick', 'cellClicked(' + i + ',' + j + ')');
            elCell.setAttribute('oncontextmenu', 'cellFlagged(' + i + ',' + j + ')');
            elCell.appendChild(elText);
            elRow.appendChild(elCell);
        }
        elTable.appendChild(elRow);
    }
    document.querySelector('.board-container').appendChild(elTable);
}
// ---------- MID-GAME FUNCTIONS ------------
// when a cell is clicked
function cellClicked(i, j, event) {
    var cell = gBoard[i][j];
    // if alrady clicked,do nothing
    if (cell.isClicked) return;
    // if mine, end game
    else if (cell.isMine) {
        if (gGameState.gameOn) endGame();
        renderCell(i, j);
        return;
    } else {
        gGameState.cellsClickCount++;
        if (cell.isFlagged) gGameState.cellsFlagCount--;
        cell.isClicked = true;
        renderCell(i, j);
    }
    checkWin();
}
// renders the cell
function renderCell(i, j) {
    if (gBoard[i][j].negMinesCount === 0) {
        renderNegCells(i, j);
    }
    var elTable = document.querySelector('table');
    var elRow = elTable.childNodes[i];
    var elCell = elRow.childNodes[j];
    if (gBoard[i][j].isMine) {
        elCell.innerText = 'X';
        elCell.style.backgroundColor = 'red';
    } else {
        if (gBoard[i][j].negMinesCount === 0) {
            elCell.innerText = '';
            elCell.setAttribute('class', 'empty-td');
            elCell.style.backgroundColor = 'grey';
        }
        else {
            elCell.innerText = gBoard[i][j].negMinesCount;
            elCell.style.backgroundColor = 'gainsboro';
        }
    }
}
// renders neighbor cells(in case the clicked cell minesCount was 0)
function renderNegCells(i, j) {
    for (var p = -1; p < 2; p++) {
        for (var k = -1; k < 2; k++) {
            if (p + i < 0 || k + j < 0 ||       // if idx is below 0 OR
                p + i > gBoard.length - 1 ||     // if idx is more than length OR
                k + j > gBoard.length - 1 ||     // if idx is more than length OR
                (p === 0 && k === 0) ||         // if it's the cell we are checking OR
                gBoard[i + p][j + k].isClicked)  // if the cell we are checking is clicked
                continue;                       // then skip iteration
            else {   //  else, click it.
                cellClicked(i + p, j + k);
            };
        }
    }
}
// when a cell is flagged
function cellFlagged(i, j) {
    // if game is off or cell is clicked,do nothing
    if (!gGameState.gameOn || gBoard[i][j].isClicked) return;
    // if not, mark/unmark and render it
    var elTable = document.querySelector('table');
    var elRow = elTable.childNodes[i];
    var elCell = elRow.childNodes[j];
    if (gBoard[i][j].isFlagged) {
        gBoard[i][j].isFlagged = false;
        gGameState.cellsFlagCount--;
        elCell.innerText = '';
        elCell.style.backgroundColor = 'gainsboro';
    } else {
        gBoard[i][j].isFlagged = true;
        gGameState.cellsFlagCount++;
        elCell.innerText = '?';
        elCell.style.backgroundColor = 'yellow';
        checkWin();
    }
}
function checkWin() {
    if (gGameState.cellsClickCount + gGameState.cellsFlagCount === gGameState.size * gGameState.size) {
        gGameState.hasWon = true;
        endGame();
    }
}
// ends current game
function endGame() {
    gGameState.gameOn = false;
    // resets timer and renders
    clearInterval(gTimer);
    document.querySelector('.timer').innerText = '0';
    // if won,print
    if (gGameState.hasWon) {
        showPopup(true);
    }
    // if lost,print and show board
    else {
        for (var i = 0; i < gBoard[0].length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                cellClicked(i, j);
            }
        }
        showPopup(false);
    }
}
function showPopup(victory) {
    var elPopup = document.querySelector('.popup');
    var elTime = elPopup.querySelector('h4 > span');
    var elResult = elPopup.querySelector('h1');
    elTime.innerText = (gGameState.secsPassed);
    elResult.innerText = (victory) ? 'Victorious!!' : 'You lost.';
    elPopup.style.opacity = 1;
    elPopup.style.visibility = 'visible';
}
function hideVictoryPopup() {
    var elPopup = document.querySelector('.popup');
    elPopup.style.opacity = 0;
    elPopup.style.visibility = 'hidden';
}