import React, { useState, useEffect } from "react";
import axios from 'axios'
import GameCell from "../GameCell/GameCell";
import Player from "../PlayerEnum";

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

const GameBoard = () => {
    const [gameBoard, setBoard] = useState(startingBoard);
    const [activeTile, setActiveTile] = useState(null)

    //formatBackendBoardToFrontEnd

    const convertToDesiredStructure = (board) =>{

        let parsedBoard = null 

        try{
            parsedBoard = JSON.parse(board)
        } catch(e){
            console.log('fucked up')
        }

        let newBoard = [];
        
        parsedBoard.forEach(row => {
            row.forEach(cell => {
                if (cell === null) {
                    newBoard.push({ isKing: false, isPawn: false, owner: null });
                } else {
                    newBoard.push({ 
                    isKing: cell.isMasterMonk, 
                    isPawn: !cell.isMasterMonk, 
                    owner: cell.team === 1 ? "red" : "blue"
                  });
                }
              });
        })

        return newBoard;
      }
      

    useEffect(() => {
        console.log(`activeTile has changed to: ${activeTile}`);
      }, [activeTile]);

    useEffect(() => {
    const source = new EventSource('http://localhost:5000/realtime-feed');

    source.onmessage = (event) => {
        console.log('Received new data from SSE')
        setBoard(convertToDesiredStructure(event.data));
    };

    // end the SSE connection when component dismounts
    return () => {
        source.close();
    };
    }, []);

    const movePieceIfPossible = async (index) => {

        // console.log(index)
        // console.log('active', activeTile, 'index', index)
        // console.log(gameBoard[activeTile].owner !== null)
        // console.log(gameBoard[activeTile].owner !== gameBoard[index].owner)

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
            }

            setActiveTile(null)
            return
        }

        setActiveTile(index)
        
    }


    // const movePiece = async (e) => {
    //     e.preventDefault();
    //     try {
    //       const response = await fetch('/move', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({ currentPosition, destination })
    //       });
    //       const data = await response.json();
    //       setMoveValid(data.moveValid);
    //     } catch (error) {
    //       console.error(error);
    //     }
    //   };






    return (
        <div className=' flex justify-center flex-wrap w-[85%] min-h-[80%] md:w-[500px] '>

            {gameBoard.map((tile, index) => (
                <GameCell 
                    handleClick={movePieceIfPossible} 
                    index={index} 
                    isKing={tile.isKing} 
                    isPawn={tile.isPawn}
                    owner={tile.owner}
                    isActive={activeTile === index} />
            ))}

        </div>
    )
} 


export default GameBoard