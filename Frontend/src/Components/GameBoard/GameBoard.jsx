import React, { useState, useContext } from "react";
import GameCell from "../GameCell/GameCell";
import Player from "../PlayerEnum";
import { MoveCard, Movement, GamePiece, GameService } from "../../Services/gameService";
import GameServiceContext from "../../Contexts/GameServiceContext";

const GameBoard = ({onMoveSubmit }) => {
    const gameService = useContext(GameServiceContext);

    const [activeTile, setActiveTile] = useState(null)
    const [tilesPieceCanMoveto, setTilesPieceCanMoveto] = useState([])

    // TODO: Change this
    const team = gameService.getActivePlayer()
    const teamColor = team === 1? Player.BLUE : Player.RED
    const board = gameService.getBoard()

    const movePieceIfPossible = async (index) => {   

        // TODO refactor so FE and BE identify owners the same
        const owner = gameService.getActivePlayer() === 1 ? 'blue' : 'red'

        if (activeTile === null){
            setActiveTile(index);
        } else if (board[activeTile].owner !== null 
            && board[activeTile].owner !== board[index].owner
            && board[activeTile].owner === owner){

            // TODO: validate if the piece is owned by the active player
            // TODO: tie move cards to active player pieces and highlighting.

            // rows are 5 squares long.
            let newRow = Math.floor(index / 5)
            let newCol = index % 5

            let currentRow = Math.floor(activeTile / 5)
            let currentCol = activeTile % 5

            // if your piece can't move there, then don't move
            if (!gameService.canMoveThere([currentRow, currentCol], [newRow, newCol], team )){
                console.log('invalid move')
                resetHighlights()
                return
            }

            onMoveSubmit([currentRow, currentCol], [newRow, newCol]);
            console.log('submitted')

            resetHighlights()
            return
        }
        
        if (board[index].owner === teamColor){ //TODO: refactor to not use color
            setTilesPieceCanMoveto(getAvailableMovesForCell(index))
        }else{
            setTilesPieceCanMoveto([])
        }

        setActiveTile(index)
        
    }

    const resetHighlights = () => {
        console.log('reseting highlights')
        setActiveTile(null)
        setTilesPieceCanMoveto([])
    }

    const getAvailableMovesForCell = (index) => {

        if (board[index] === null || board[index].owner !== teamColor || team === null){
            return null
        }

        let currentRow = Math.floor(index / 5)
        let currentCol = index % 5


        const cells = gameService.getAvailableMovesForPiece([currentRow, currentCol], team)

        let formattedCells = []

        cells.forEach(cell => {
            formattedCells.push((cell[0] * 5) + cell[1])
        })

        return formattedCells
    }

    return (
        <div className=' flex justify-center flex-wrap w-[85%] min-h-[80%] md:w-[500px] '>

            {board.map((tile, index) => (
                <GameCell 
                    handleClick={movePieceIfPossible} 
                    index={index} 
                    isKing={tile.isKing} 
                    isPawn={tile.isPawn}
                    owner={tile.owner}
                    isActive={activeTile === index}
                    shouldHighlight={tilesPieceCanMoveto.includes(index)}
                    key={index} />
            ))}

        </div>
    )
} 


export default GameBoard