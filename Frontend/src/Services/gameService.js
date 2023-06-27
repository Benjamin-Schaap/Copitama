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
    #activePlayer
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
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null }],
        [{ isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null },
        { isKing: false, isPawn: false, owner: null }],
        [{ isKing: false, isPawn: true, owner: Player.BLUE },
        { isKing: false, isPawn: true, owner: Player.BLUE },
        { isKing: true, isPawn: false, owner: Player.BLUE },
        { isKing: false, isPawn: true, owner: Player.BLUE },
        { isKing: false, isPawn: true, owner: Player.BLUE }]]

        // History of moves
        this.history = [];
        this.player1MoveCards = [tiger, crane];
        this.player2MoveCards = [elephant, dragon];
        this.floaterMove = [hackMove];
        this.gameOver = false;
        this.activePlayer = 1;

    }

    convertBackendToFontend = (board) => {

        let newBoard = [];

        try{
            // Parse board if it's a JSON string
            if (typeof board === 'string') {
                board = JSON.parse(board).board;
            }

            // Flatten the array of arrays and transform the elements
            board.forEach(row => {
                row.forEach(cell => {
                    if (cell === null) {
                        newBoard.push({ isKing: false, isPawn: false, owner: null });
                    } else {
                        newBoard.push({
                            isKing: cell.isMasterMonk,
                            isPawn: !cell.isMasterMonk,
                            owner: cell.team === 1 ? "blue" : "red"
                        });
                    }
                });
            });
        }catch (e){
            console.log(e)
        }

        

        return newBoard;

    }

    // make it so that the FE consumes data exclusively from the SSE connection
    consumeSSE = (data) =>{
        try {
            const parsedData = JSON.parse(data);
            
            this.gameOver = parsedData.gameOver;
            this.gameBoard = this.convertBackendToFontend(data);
            this.activePlayer = parsedData.activePlayer;
            this.history = parsedData.history;
            this.floaterMove = parsedData.floaterMove.map(card => new MoveCard(card.name, card.movements.map(move => new Movement(move.horizontal, move.vertical))));
            this.player1MoveCards = parsedData.player1MoveCards.map(card => new MoveCard(card.name, card.movements.map(move => new Movement(move.horizontal, move.vertical))));
            this.player2MoveCards = parsedData.player2MoveCards.map(card => new MoveCard(card.name, card.movements.map(move => new Movement(move.horizontal, move.vertical))));
        } catch(e) {
            console.log(e);
        }
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
        return this.gameBoard
    }

    getActivePlayer = () => {
        return this.activePlayer
    }

    swapPlayerTurn = () => {
        this.activePlayer = this.activePlayer === 1 ? 2 : 1
    }

    getMoveCardsForPlayer = (team) => {
        if (team === 1) {
            return this.player1MoveCards
        }

        return this.player2MoveCards
    }

    getFloaterMove = () => {
        return this.floaterMove[0]
    }

    getAvailableMovesForPiece = (pieceLocation, team) => {
        let validMoves = [];
        let pieceRowCoord = pieceLocation[0];
        let pieceColCoord = pieceLocation[1];
        let moveCards = team === 1 ? this.player1MoveCards : this.player2MoveCards


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
                if (0 <= newRowCoord && newRowCoord < 5 && 0 <= newColCoord && newColCoord < 5) {


                    // TODO: These three lines are tech debt that needs to be fixed
                    const accessIndex = newRowCoord * 5 + newColCoord
                    let cell = this.gameBoard[accessIndex]  
                    const owner = team === 1 ? 'blue' : 'red'


                    // if the space is empty, or the cell is inhabited by an enemy player, it's a valid move
                    if (cell == null || cell.owner !== owner) {
                        validMoves.push([newRowCoord, newColCoord])
                    }

                }

            })
        })

        return validMoves
    }

    canMoveThere = (pieceLocation, destination, team) => {

        const validMoves = this.getAvailableMovesForPiece(pieceLocation, team)

        if (validMoves.some(move => move[0] === destination[0] && move[1] === destination[1])) {
            return true
        }

        return false

    }

    isGameOver = () => {
        return this.gameOver
    }

    movePiece = (pieceLocation, destination, moveCard, team) => {
        // Ensure the game isn't over
        if (this.gameOver) {
            console.error('Game is over');
            return;
        }
    
        const moveCards = team === 1 ? this.player1MoveCards : this.player2MoveCards;
    
        // check to make sure there is actually a piece at the current location
        const currentPiece = this.gameBoard[pieceLocation[0]][pieceLocation[1]];
    
        if (currentPiece === null || currentPiece.owner !== team) {
            console.error(currentPiece === null ? "Bro there's nobody there" : "That's not your piece");
            return;
        }
    
        if (!moveCards.includes(moveCard) || !this.canMoveThere(pieceLocation, destination, team)) {
            console.error("You can't move there with that piece and moveCard");
            return;
        }
    
        // save the current piece, and make its spot as empty
        const currentPieceCopy = { ...this.gameBoard[pieceLocation[0]][pieceLocation[1]] };
        this.gameBoard[pieceLocation[0]][pieceLocation[1]] = { isKing: false, isPawn: false, owner: null };
    
        // move the piece to new location, saving what was there prior
        const eliminatedCell = { ...this.gameBoard[destination[0]][destination[1]] };
        this.gameBoard[destination[0]][destination[1]] = currentPieceCopy;
    
        console.log(`Player ${team} moves from ${pieceLocation} to ${destination} using ${moveCard.name}`);
    
        // Check to see if piece removed was the head monk
        if (eliminatedCell !== null && eliminatedCell.isKing) {
            console.log('Master Monk Eliminated!');
            this.gameOver = true;
        }
    
        // Move the movecards around
        const currentPlayerMoveCards = team === 1 ? this.player1MoveCards : this.player2MoveCards;
        const cardIndex = currentPlayerMoveCards.indexOf(moveCard);
        currentPlayerMoveCards.splice(cardIndex, 1);
        const newCard = this.floaterMove.pop();
        this.floaterMove.push(moveCard);
        currentPlayerMoveCards.push(newCard);
    
        console.log('\nCards have been moved');
    
        // Switch active player
        this.activePlayer = this.activePlayer === 1 ? 2 : 1;
        console.log('\nActive Player has been switched');
    
        // For debugging only
        const p1Moves = this.player1MoveCards.map(card => card.name);
        console.log('P1', p1Moves);
    
        const p2Moves = this.player2MoveCards.map(card => card.name);
        console.log('P2', p2Moves);
    
        console.log('floater:', this.floaterMove[0].name);
    };
    
}