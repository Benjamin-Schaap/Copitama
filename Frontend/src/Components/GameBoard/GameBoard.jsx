import React, { useState, useEffect } from "react";
import axios from 'axios'
import GameCell from "../GameCell/GameCell";
import Player from "../PlayerEnum";
import { MoveCard, Movement, GamePiece, GameService } from "../../Services/gameService";

// TODO: Delete after getting the backend up and running
// const startingBoard = [{isKing: false, isPawn: true, owner: Player.RED},
//     {isKing: false, isPawn: true, owner: Player.RED},
//     {isKing: true, isPawn: false, owner: Player.RED},
//     {isKing: false, isPawn: true, owner: Player.RED},
//     {isKing: false, isPawn: true, owner: Player.RED}, // 5 of red's pieces
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: false, owner: null},
//     {isKing: false, isPawn: true, owner: Player.BLUE},
//     {isKing: false, isPawn: true, owner: Player.BLUE},
//     {isKing: true, isPawn: false, owner: Player.BLUE},
//     {isKing: false, isPawn: true, owner: Player.BLUE},
//     {isKing: false, isPawn: true, owner: Player.BLUE}
// ]
const startingBoard = [{isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null},
    {isKing: false, isPawn: false, owner: null}
]

const gameService = new GameService()

const GameBoard = () => {
    const [gameBoard, setBoard] = useState(gameService.getBoard());
    const [activeTile, setActiveTile] = useState(null)
    const [tilesPieceCanMoveto, setTilesPieceCanMoveto] = useState([])

    // TODO: Change this
    const team = 1
    const teamColor = Player.BLUE

    //formatBackendBoardToFrontEnd
      

    useEffect(() => {
        console.log(`activeTile has changed to: ${activeTile}`);
        console.log('tilesPieceCanMoveTo', tilesPieceCanMoveto)
        console.log(tilesPieceCanMoveto.includes(13))
      }, [activeTile, tilesPieceCanMoveto]);

    useEffect(() => {
    const source = new EventSource('http://localhost:5000/realtime-feed');

    source.onmessage = (event) => {
        console.log('Received new data from SSE')
        console.log(event.data)
        setBoard(gameService.convertBackendToFontend(event.data));
    };

    // end the SSE connection when component dismounts
    return () => {
        source.close();
    };
    }, []);

    const movePieceIfPossible = async (index) => {

        if (activeTile === null){
            setActiveTile(index);
        } else if (gameBoard[activeTile].owner !== null 
            && gameBoard[activeTile].owner !== gameBoard[index].owner){

                console.log('moved piece')

            // rows are 5 squares long.
            let newRow = Math.floor(index / 5)
            let newCol = index % 5

            let currentRow = Math.floor(activeTile / 5)
            let currentCol = activeTile % 5

            try {
                await axios.post('http://localhost:5000/move', { data: {
                    currentPosition: [currentRow, currentCol],
                    destination: [newRow, newCol]
                  }});
            } catch(error){
                console.error(error)
                console.log('Continuing locally')
            }

            setActiveTile(null)
            setTilesPieceCanMoveto([])
            return
        } 
        
        if (gameBoard[index].owner === teamColor){ //TODO: refactor to not use color
            setTilesPieceCanMoveto(getAvailableMovesForCell(index))
        }else{
            setTilesPieceCanMoveto([])
        }

        setActiveTile(index)
        
    }

    const getAvailableMovesForCell = (index) => {

        if (gameBoard[index] === null || gameBoard[index].owner !== teamColor){
            return null
        }

        let currentRow = Math.floor(index / 5)
        let currentCol = index % 5


        const cells = gameService.getAvailableMovesForPiece([currentRow, currentCol], gameService.getMoveCardsForPlayer(team), team)
        console.log([currentRow, currentCol])
        console.log(cells)

        let formattedCells = []

        cells.forEach(cell => {
            formattedCells.push((cell[0] * 5) + cell[1])
        })

        return formattedCells
    }





    return (
        <div className=' flex justify-center flex-wrap w-[85%] min-h-[80%] md:w-[500px] '>

            {gameBoard.map((tile, index) => (
                <GameCell 
                    handleClick={movePieceIfPossible} 
                    index={index} 
                    isKing={tile.isKing} 
                    isPawn={tile.isPawn}
                    owner={tile.owner}
                    isActive={activeTile === index}
                    shouldHighlight={tilesPieceCanMoveto.includes(index)} />
            ))}

        </div>
    )
} 


export default GameBoard