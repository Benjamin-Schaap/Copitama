import Player from "../Components/PlayerEnum";

export class MoveCard {
    constructor(name, movements) {
        this.name = name;
        this.movements = movements;
    }

    equals(otherMoveCard) {
        if (this.name !== otherMoveCard.name) return false;
    }
}

export class Movement {
    constructor(horizontal, vertical) {
        this.horizontal = horizontal;
        this.vertical = vertical;
    }

    equals(otherMovement) {
        return this.horizontal === otherMovement.horizontal && this.vertical === otherMovement.vertical;
    }
}

export class GamePiece {
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

export class GameService {

    #history
    #gameBoard
    #player1MoveCards
    #player2MoveCards
    #isPlayer1Turn
    #gameOver
    #floaterMove


    constructor() {

        this.gameBoard = [[{ isKing: false, isPawn: true, owner: Player.RED },
        { isKing: false, isPawn: true, owner: Player.RED },
        { isKing: true, isPawn: false, owner: Player.RED },
        { isKing: false, isPawn: true, owner: Player.RED },
        { isKing: false, isPawn: true, owner: Player.RED }], // 5 of red's pieces
        [{ isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null }],
        [{ isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: true, isPawn: false, owner: Player.BLUE },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null }],
        [{ isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null }],
        [{ isKing: false, isPawn: true, owner: Player.BLUE },
        { isKing: false, isPawn: true, owner: Player.BLUE },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: true, owner: Player.BLUE },
        { isKing: false, isPawn: true, owner: Player.BLUE }]]

        this.#isPlayer1Turn = true

        // History of moves
        this.history = [];
        this.player1MoveCards = [tiger, crane];
        this.player2MoveCards = [elephant, dragon];
        this.floaterMove = [hackMove];
        this.gameOver = false;

    }

    convertToDesiredStructure = (board) => {

        let newBoard = [];

        board.forEach(row => {
            row.forEach(cell => {
                if (cell.owner === null) {
                    newBoard.push({ isKing: false, isPawn: false, owner: null });
                } else {
                    newBoard.push({
                        isKing: cell.isKing,
                        isPawn: !cell.isKing,
                        owner: cell.owner === 'red' ? "red" : "blue"
                    });
                }
            });
        })

        return newBoard;
    }

    getBoard = () => {
        return this.convertToDesiredStructure(this.gameBoard)
    }

    getIsPlayer1turn = () => {
        return this.isPlayer1Turn
    }

    swapPlayerTurn = () => {
        this.isPlayer1Turn = !this.isPlayer1Turn
    }

    getMoveCardsForPlayer = (team) => {
        if (team === 1) {
            return this.player1MoveCards
        }

        return this.player2MoveCards
    }

    getFloaterMove = () => {
        return this.floaterMove
    }

    getAvailableMovesForPiece = (pieceLocation, moveCards, team) => {
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
                if (0 <= newRowCoord && newRowCoord < 5 && 0 <= newColCoord && newColCoord < 5) {


                    let cell = this.gameBoard[newRowCoord][newColCoord]

                    // if the space is empty, or the cell is inhabited by an enemy player, it's a valid move
                    if (cell == null || cell.team !== team) {
                        validMoves.push([newRowCoord, newColCoord])
                    }

                }

            })
        })

        return validMoves
    }
}