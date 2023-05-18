import PageHeader from './Components/PageHeader/PageHeader'
import GameBoard from './Components/GameBoard/GameBoard';
import MovementCard from './Components/MovementCard/MovementCard';
import { MoveCard, Movement, GameService } from './Services/gameService';
import { useState } from 'react';

const tiger = new MoveCard('tiger', [new Movement(0, 1), new Movement(0, -2)]);
const elephant = new MoveCard('elephant', [new Movement(-1, 0), new Movement(1, 0), new Movement(1, -1), new Movement(-1, -1)]);
const hackMove = new MoveCard('hack', [new Movement(0, 2,), new Movement(2, 0), new Movement(2, 2)]);
const crane = new MoveCard('crane', [new Movement(0, -1), new Movement(-1, 1), new Movement(1, 1)]);
const dragon = new MoveCard('dragon', [new Movement(1, 1), new Movement(-1, 1), new Movement(2, -1), new Movement(-2, -1)]);

const gameService = new GameService()



function App() {

  const [isPlayer1Turn, setIsPlayer1Turn] = useState(gameService.getIsPlayer1turn())
  const [player1MoveCards, setPlayer1MoveCards] = useState(gameService.getMoveCardsForPlayer(1))
  const [player2MoveCards, setPlayer2MoveCards] = useState(gameService.getMoveCardsForPlayer(2))
  const [floaterMove, setFloaterMove] = useState(gameService.getFloaterMove()[0])

  const switchPlayer = () => {

    gameService.swapPlayerTurn()
    setIsPlayer1Turn(gameService.getIsPlayer1turn())
  }

  console.log('moveCards', player1MoveCards)

  return (
    <div className='h-screen bg-slate-500 justify-center flex flex-col items-center'>
      <PageHeader />
      <button className='border border-red-600 bg-blue-600' onClick={() => switchPlayer()}>Switch Player</button>
      <div className='grid grid-flow-col grid-cols-3 m-auto'>
        <div className='m-auto'>
          {isPlayer1Turn &&
            <MovementCard title={hackMove.name} cellsToHighlight={hackMove.movements} />
          }
        </div>
        <div className='m-auto'>
          <div className='justify-center flex flex-col items-center'>
            <div className=' center md:flex md:w-full m-auto justify-center'>
              {
                player2MoveCards.map((card, index) => {
                  return <MovementCard key={index} title={card.name} cellsToHighlight={card.movements} />

                })
              }
            </div>
            <GameBoard gameService={gameService} />
            <div className=' center md:flex md:w-full m-auto justify-center'>
              {
                player1MoveCards.map((card, index) => {
                  return <MovementCard key={index} title={card.name} cellsToHighlight={card.movements} />

                })
              }
            </div>

          </div>
        </div>
        <div className='m-auto'>
          {!isPlayer1Turn &&
            <MovementCard title={floaterMove.name} cellsToHighlight={floaterMove.movements} />
          }
        </div>

      </div></div>


  );
}

export default App;