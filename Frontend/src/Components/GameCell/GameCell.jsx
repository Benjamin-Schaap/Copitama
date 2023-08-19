import React, { useState } from "react";
import ChessPawn from "../ChessPawn/ChessPawn";
import ChessKing from "../ChessKing/ChessKing";
import Player from "../PlayerEnum";
import cx from 'classnames';


  
  const GameCell = ({ owner, isKing, isPawn, index, handleClick, isActive, shouldHighlight }) => {

    let getColor = () => {

      if (owner === Player.BLUE){
          return "#2196f3"
      } else if (owner === Player.RED){
          return "#f44336"
      }
    }

    let getActiveTheme = () => {

      if (shouldHighlight){
        return "border-1 bg-yellow-300 border-yellow-400"
      } else if ((!isKing && !isPawn) || !isActive){
        return 'border-slate-500 bg-[#dcd8cf]'
      }

      if (owner === Player.BLUE){
        return "border-1 bg-blue-300 border-blue-400"
      } else if (owner === Player.RED){
          return "border-1 bg-red-300 border-red-400"
      }
    }


    return (
      <div onClick={() => handleClick(index)} className={cx("w-1/5 p-5 min-h-[80px] md:p-8 md:w-[100px] md:h-[100px] border box-border flex items-center justify-center rounded-md", getActiveTheme())}>
        { isKing && <ChessKing color={getColor()}/>}

        { isPawn && <ChessPawn color={getColor()}/>}

      </div>
    );
  };

export default GameCell