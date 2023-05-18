import React, { useState } from "react";
import cx from 'classnames';


  
  const MovementCard = ({ title, cellsToHighlight = [] }) => {

    //cellsToHighlight = [[0,2], [0, -2], [1,0]]

    // the piece is always in the middle of the board in a movement card.
    const piecePosition = [2,2]

    const getHighlightedCells = ( cellsToHighlight ) => {
      

        // HEX COLORS
        //#eaed93
        // #918672
        // #2FB85E

        let grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => null));

        cellsToHighlight.forEach( movement => {

            const newRow = piecePosition[0] + movement.vertical
            const newCol = piecePosition[1] + movement.horizontal

            grid[newRow][newCol] = '#2FB85E'

        })

        grid[piecePosition[0]][piecePosition[1]] = '#000000'

        return grid
    }

    const board = getHighlightedCells(cellsToHighlight)

    const getCellColor = (cell) => {
        if (cell === '#000000'){
            return 'bg-[#000000]'
        } else if (cell === '#2FB85E'){
            return 'bg-[#2FB85E]'
        } else{
            return ''
        }
    }



    return (
      <div className=" border bg-[#dcd8cf] rounded-[10px] m-4 py-4 px-12 text-center">

            {board.map((row, rowIndex) => (
                <div key={rowIndex} className='flex'>
                {row.map((cell, colIndex) => (
                    <div key={colIndex} className={cx('w-6 h-6 border border-[#7D7A79] m-[2px]', getCellColor(cell))} />
                ))}
            </div>
      ))}

        <p className=" text-lg font-semibold">{title.toUpperCase()}</p>


      </div>
    );
  };

export default MovementCard