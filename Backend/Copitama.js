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

const tiger = new MoveCard('tiger', [new Movement(0, 1), new Movement(0, -2)]);
const elephant = new MoveCard('elephant', [new Movement(-1, 0), new Movement(1, 0), new Movement(1, -1), new Movement(-1, -1)]);
const hackMove = new MoveCard('hack', [new Movement(0, 2,), new Movement(2, 0), new Movement(2, 2)]);
const crane = new MoveCard('crane', [new Movement(0, -1), new Movement(-1, 1), new Movement(1, 1)]);
const dragon = new MoveCard('dragon', [new Movement(1, 1), new Movement(-1, 1), new Movement(2, -1), new Movement(-2, -1)]);

export class Copitama {

    constructor() {
        // Game board
        this.board = Array(5).fill(null).map(() => Array(5).fill(null));

        // History of moves
        this.history = [];
        this.player1MoveCards = [tiger, crane];
        this.player2MoveCards = [elephant, dragon];
        this.floaterMove = [hackMove];
        this.gameOver = false;
        this.activePlayer = 1

        // setting up the pieces
        for (let index = 0; index < 5; index++) {

            // the middle piece is the master monk in a row
            if (index === 2) {
                this.board[0][index] = new GamePiece(true, 2);
                this.board[4][index] = new GamePiece(true, 1);
                continue;
            }
            this.board[0][index] = new GamePiece(false, 2);
            this.board[4][index] = new GamePiece(false, 1);
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
                    newColCoord = pieceColCoord - movement.horizontal;
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

    isMoveCardInMoveCards(moveCards, moveCard) {
        return moveCards.some(movecard => movecard.name === moveCard.name);
    }

    movePiece(currentLocation, newLocation, moveCard, team) {
        if (this.gameOver) {
            return 'Game is over';
        }

        let moveCards = team === 1 ? this.player1MoveCards : this.player2MoveCards

        let validMovesForCard = []

        // convert FE movecard to BE
        if (moveCard !== null){
            moveCard = new MoveCard(
                moveCard.name, 
                moveCard.movements.map(movement => new Movement(movement.horizontal, movement.vertical))
            );
        }

        // If a move card is provided, use it. Otherwise try to determine
        // if there is a singular card in the players inventory that works.
        if (moveCard !== undefined && moveCard !== null){
            validMovesForCard = this.getAvailableMovesForPiece(currentLocation, [moveCard], team);

            // reset the FE moveCard with the BE one
            moveCard = moveCards.find(mc => mc.name === moveCard.name)
        }else{
            const potentialMoveCard = this.getOnlyValidMoveCard(currentLocation, newLocation, moveCards, team)
            if (potentialMoveCard == null){
                console.log("there isn't a way to determine what move card you are trying to use")
                return "there isn't a way to determine what move card you are trying to use"
            }

            validMovesForCard = this.getAvailableMovesForPiece(currentLocation, [potentialMoveCard], team);
            moveCard = potentialMoveCard
        }
        

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

        if (!this.isMoveCardInMoveCards(moveCards, moveCard)) {
            console.log("You don't have that moveCard")
            return "You don't have that moveCard";
        }


        if (!this.isMoveInValidMoves(this.getAvailableMovesForPiece(currentLocation, [moveCard], team), newLocation)) {
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
        if (eliminatedCell.isMasterMonk) {
            console.log('Master Monk Eliminated!');
            this.gameOver = true;
        }

        // TODO: Modify win condition for if master monk sits on throne

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

        this.activePlayer = this.activePlayer == 1 ? 2 : 1


        console.log('\nActive Player has been switched');

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

        // notify it was successful
        return true
    }

    // used to determine if a move for a certain location matches just one
    // move card. This function does not validate if a piece can actually
    // move there based on game logic.
    //
    //  * if there are 2 movecards that could take piece X
    //    to location Y, the function will return null.
    //  * if there are no movecards that could take piece X
    //    to location Y, the function will return null
    //  * if there is only one movecard that can take piece X
    //    to location Y, the function will return that moveCard.
    getOnlyValidMoveCard(currentLocation, newLocation, moveCards, team){

        let isValidForMoveCardOne = false
        let isValidForMoveCardTwo = false

        console.log('TESTING getOnlyValidMoveCard')
        console.log('team', team)
        console.log('moveCards for team', team === 1 ? this.player1MoveCards : this.player2MoveCards)
        console.log('currentLocation', currentLocation)
        console.log('newLocation', newLocation)
        console.log('moveCards', moveCards)
        console.log('move[0]', this.getAvailableMovesForPiece(currentLocation, [moveCards[0]], team))
        console.log('move[1]', this.getAvailableMovesForPiece(currentLocation, [moveCards[1]], team))

        isValidForMoveCardOne = this.isMoveInValidMoves(this.getAvailableMovesForPiece(currentLocation, [moveCards[0]], team), newLocation)
        isValidForMoveCardTwo = this.isMoveInValidMoves(this.getAvailableMovesForPiece(currentLocation, [moveCards[1]], team), newLocation)

        if (isValidForMoveCardOne && isValidForMoveCardTwo) {
            // If both are valid, return null
            return null;
        } else if (isValidForMoveCardOne) {
            // If only the first is valid, return the first move card
            return moveCards[0];
        } else if (isValidForMoveCardTwo) {
            // If only the second is valid, return the second move card
            return moveCards[1];
        }

        // If neither are valid, return null
        return null;


    }

    overrideMovePiece(currentLocation, newLocation) {
        // check to make sure there is actually a piece at the current location
        const currentPiece = this.board[currentLocation[0]][currentLocation[1]];

        if (currentPiece === null) {
            return false
        }

        this.board[newLocation[0]][newLocation[1]] = currentPiece;
        this.board[currentLocation[0]][currentLocation[1]] = null

        this.activePlayer = this.activePlayer === 1 ? 2 : 1

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
            gameOver: this.gameOver,
            activePlayer: this.activePlayer
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
