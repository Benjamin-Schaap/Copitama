import assert from 'assert'
import promptSync from 'prompt-sync';

const prompt = promptSync();

class MoveCard {
    constructor(name, movements) {
        this.name = name;
        this.movements = movements;
    }

    equals(otherMoveCard) {
        if (this.name !== otherMoveCard.name) return false;
    }
}

class Movement {
    constructor(horizontal, vertical) {
        this.horizontal = horizontal;
        this.vertical = vertical;
    }

    equals(otherMovement) {
        return this.horizontal === otherMovement.horizontal && this.vertical === otherMovement.vertical;
    }
}

class GamePiece {
    constructor(isMasterMonk, team) {
        this.isMasterMonk = isMasterMonk;
        this.team = team;
    }
}

const tiger = new MoveCard('tiger', [new Movement(0, -1), new Movement(0, 2)]);
const elephant = new MoveCard('elephant', [new Movement(1, 0), new Movement(-1, 0), new Movement(-1, 1), new Movement(1, 1)]);
const hackMove = new MoveCard('hack', [new Movement(0, 4)]);
const crane = new MoveCard('crane', [new Movement(0, -1), new Movement(-1, 1), new Movement(1, 1)]);
const dragon = new MoveCard('dragon', [new Movement(-1, -1), new Movement(1, -1), new Movement(-2, 1), new Movement(2, 1)]);

export class Copitama {

    constructor() {
        // Game board
        this.board = Array(5).fill(null).map(() => Array(5).fill(null));

        // History of moves
        this.history = [];
        this.player1MoveCards = [tiger, crane];
        this.player2MoveCards = [elephant, hackMove];
        this.floaterMove = [dragon];
        this.gameOver = false;

        // setting up the pieces
        for (let index = 0; index < 5; index++) {

            // the middle piece is the master monk in a row
            if (index === 2) {
                this.board[0][index] = new GamePiece(true, 1);
                this.board[4][index] = new GamePiece(true, 2);
                continue;
            }
            this.board[0][index] = new GamePiece(false, 1);
            this.board[4][index] = new GamePiece(false, 2);
        }
    }

    printBoard() {
        this.board.forEach((row) => {
            let rowString = '';

            row.forEach((cell) => {
                if (cell === null) {
                    rowString += '[ ]\t\t';
                } else {
                    rowString += `[${cell.team}${cell.isMasterMonk ? 'H' : 'M'}]\t`;
                }
            });
            console.log(rowString);
        });
        console.log('\n');
    }

    getBoard() {
        return this.board;
    }

    // TODO: There needs to be some logic around what moveCard a user chooses to use
    getAvailableMovesForPiece(pieceLocation, moveCards, team) {
        let validMoves = [];
        let pieceRowCoord = pieceLocation[0];
        let pieceColCoord = pieceLocation[1];

        moveCards.forEach(moveCard => {
            moveCard.movements.forEach(movement => {
                let newRowCoord = pieceRowCoord + movement.vertical;
                let newColCoord = pieceColCoord + movement.horizontal;

                // reflect the vertical value for player 2, since they're on the bottom
                if (team === 2) {
                    newRowCoord = pieceRowCoord + movement.vertical * -1;
                }

                // make sure the movement would still be on the board
                if (0 <= newRowCoord && newRowCoord < this.board.length && 0 <= newColCoord && newColCoord < this.board[0].length) {

                    let cell = this.board[newRowCoord][newColCoord]

                    // if the space is empty, or the cell is inhabited by an enemy player, it's a valid move
                    if (cell == null) {
                        validMoves.push([newRowCoord, newColCoord])
                    } else if (cell.team != team) {
                        validMoves.push([newRowCoord, newColCoord])
                    }

                }

            })
        })

        return validMoves
    }

    getAllPiecesForPlayer(board, team) {
        let pieceCoord = [];

        for (let rowIndex = 0; rowIndex < board.length; rowIndex++) {
            let row = board[rowIndex];

            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                let cell = row[colIndex];

                if (cell !== null && cell.team === team) {
                    pieceCoord.push([rowIndex, colIndex]);
                }
            }
        }

        return pieceCoord;
    }

    // god I hate javascript
    isMoveInValidMoves(validMovesForCard, newLocation) {

        let wasThereAValidMove = false

        validMovesForCard.forEach(vm => {
            if (vm[0] === newLocation[0] && vm[1] === newLocation[1]) {
                wasThereAValidMove = true
            }
        })

        return wasThereAValidMove
    }

    movePiece(currentLocation, newLocation, moveCard, team) {
        if (this.gameOver) {
            return 'Game is over';
        }

        let moveCards = team === 1 ? this.player1MoveCards : this.player2MoveCards
        const validMovesForCard = this.getAvailableMovesForPiece(currentLocation, [moveCard], team);

        // check to make sure there is actually a piece at the current location
        const currentPiece = this.board[currentLocation[0]][currentLocation[1]];

        if (currentPiece === null) {
            console.log("Bro there's nobody there")
            return "bro there's nobody there";
        }
        if (currentPiece.team !== team) {
            console.log("thats not yours")
            return 'thats not yours';
        }

        if (!moveCards.includes(moveCard) || !this.isMoveInValidMoves(validMovesForCard, newLocation)) {
            console.log("You don't have that moveCard")
            return "You don't have that moveCard";
        }


        if (!this.isMoveInValidMoves(this.getAvailableMovesForPiece(currentLocation, moveCards, team), newLocation)) {
            console.log("You can't move there with that piece and moveCard")
            return "You can't move there with that piece and moveCard";
        }

        // save the current piece, and make its spot as empty
        const currentPieceCopy = Object.assign({}, this.board[currentLocation[0]][currentLocation[1]]);
        this.board[currentLocation[0]][currentLocation[1]] = null;

        // move the piece to new location, saving what was there prior
        const eliminatedCell = Object.assign({}, this.board[newLocation[0]][newLocation[1]]);
        this.board[newLocation[0]][newLocation[1]] = currentPieceCopy;

        console.log(`Player ${team} moves from ${currentLocation} to ${newLocation} using ${moveCard.name}`);

        // Check to see if piece removed was the head monk
        if (eliminatedCell !== null && eliminatedCell.isMasterMonk) {
            console.log('Master Monk Eliminated!');
            this.gameOver = true;
        }

        // Move the movecards around
        if (team === 1) {
            this.player1MoveCards.splice(this.player1MoveCards.indexOf(moveCard), 1);
            const newCard = this.floaterMove.pop();
            this.floaterMove.push(moveCard);
            this.player1MoveCards.push(newCard);
        } else {
            this.player2MoveCards.splice(this.player2MoveCards.indexOf(moveCard), 1);
            const newCard = this.floaterMove.pop();
            this.floaterMove.push(moveCard);
            this.player2MoveCards.push(newCard);
        }

        console.log('\nCards have been moved');

        // ! This is for debugging only, and doesn't need to be kept when transitioned to an api
        let moves = [];

        for (let i = 0; i < this.player1MoveCards.length; i++) {
            moves.push(this.player1MoveCards[i].name);
        }
        console.log('P1', moves);

        moves = [];
        for (let i = 0; i < this.player2MoveCards.length; i++) {
            moves.push(this.player2MoveCards[i].name);
        }
        console.log('P2', moves);

        console.log('floater:', this.floaterMove[0].name)
    }

    overrideMovePiece(currentLocation, newLocation) {
        // check to make sure there is actually a piece at the current location
        const currentPiece = this.board[currentLocation[0]][currentLocation[1]];

        if (currentPiece === null) {
            return false
        }

        this.board[newLocation[0]][newLocation[1]] = currentPiece;
        this.board[currentLocation[0]][currentLocation[1]] = null
        return true
    }

    // TODO: return the moves available per each move card.
    getGameStatus() {
        return {
            board: this.board,
            player1MoveCards: this.player1MoveCards,
            player2MoveCards: this.player2MoveCards,
            floaterMove: this.floaterMove,
            history: this.history,
            gameOver: this.gameOver
        }
    }

    // Public functions
    static overrideMovePiece(currentLocation, newLocation) {
        return this.overrideMovePiece(currentLocation, newLocation)
    }

    static getGameStatus() {
        this.getGameStatus
    }

}

// const game = new Copitama();

// // Tests
// assert(game.movePiece([3, 0], [0, 0], hackMove, 2) === "bro there's nobody there");
// assert(game.movePiece([4, 2], [0, 2], hackMove, 1) === 'thats not yours');
// assert(game.movePiece([4, 2], [0, 2], crane, 2) === "You don't have that moveCard");

// console.log('Tests cleared!\n');

// let team = 1;

// while (!game.gameOver) {

//     console.log(game.player1MoveCards)
//     game.movePiece([0, 2], [2, 2], tiger, 1)

//     game.printBoard();

//     let pieces = game.getAllPiecesForPlayer(game.board, team);
//     let moveCards = [];

//     if (team === 1) {
//         moveCards = game.player1MoveCards;
//     } else {
//         moveCards = game.player2MoveCards;
//     }

//     console.log(`Here are you options as player ${team}`);

//     let allOptions = [];

//     for (let piece of pieces) {
//         let options = game.getAvailableMovesForPiece(piece, moveCards, team);

//         allOptions = allOptions.concat(options);
//     }

//     for (let index = 0; index < allOptions.length; index++) {
//         console.log(`[${index}] ${allOptions[index]}`);
//     }

//     let input = prompt("Enter the number option you'd like to play: ");
//     let playerChoice = parseInt(input, 10);

//     if (team === 1) {
//         team = 2;
//     } else {
//         team = 1;
//     }
// }
