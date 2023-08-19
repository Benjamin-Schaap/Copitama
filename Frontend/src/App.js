import PageHeader from './Components/PageHeader/PageHeader'
import GameBoard from './Components/GameBoard/GameBoard';
import MovementCard from './Components/MovementCard/MovementCard';
import GameServiceContext from './Contexts/GameServiceContext';
import axios from 'axios'
import { MoveCard, Movement, GameService } from './Services/gameService';
import { useState, useEffect } from 'react';

const tiger = new MoveCard('tiger', [new Movement(0, 1), new Movement(0, -2)]);
const elephant = new MoveCard('elephant', [new Movement(-1, 0), new Movement(1, 0), new Movement(1, -1), new Movement(-1, -1)]);
const hackMove = new MoveCard('hack', [new Movement(0, 2,), new Movement(2, 0), new Movement(2, 2)]);
const crane = new MoveCard('crane', [new Movement(0, -1), new Movement(-1, 1), new Movement(1, 1)]);
const dragon = new MoveCard('dragon', [new Movement(1, 1), new Movement(-1, 1), new Movement(2, -1), new Movement(-2, -1)]);

const gameService = new GameService()

// TODO: reverse move cards of red player so that it's clearer what moves are available to each
// player.

// TODO: When a movecard is highlighted, and then a piece is selected, only highlight cells obtainable via that move card.


function App() {

  const [player1MoveCards, setPlayer1MoveCards] = useState(gameService.getMoveCardsForPlayer(1))
  const [player2MoveCards, setPlayer2MoveCards] = useState(gameService.getMoveCardsForPlayer(2))
  const [floaterMove, setFloaterMove] = useState(gameService.getFloaterMove())
  const [activePlayer, setActivePlayer] = useState(gameService.getActivePlayer())
  const [selectedMove, setSelectedMove] = useState("")

  useEffect(() => {
    const source = new EventSource('http://localhost:5000/realtime-feed');

    source.onmessage = (event) => {
      gameService.consumeSSE(event.data);
      setActivePlayer(gameService.getActivePlayer());
      setPlayer1MoveCards(gameService.getMoveCardsForPlayer(1))
      setPlayer2MoveCards(gameService.getMoveCardsForPlayer(2))
      setFloaterMove(gameService.getFloaterMove())
    };

    // end the SSE connection when component dismounts
    return () => {
      source.close();
    };
  }, []);

  // because gameboard consumes the SSE stream and not app, this doesn't fix ALL loading issues. 
  // TODO: consider a refactor of the SSE stream to app.js.
  if (player1MoveCards === undefined || player2MoveCards === undefined || floaterMove === undefined) {
    return (<div className='h-screen bg-slate-500 justify-center flex flex-col items-center'>Loading</div>)
  }

  if (gameService.isGameOver()) {
    return (<div className='h-screen bg-slate-500 justify-center flex flex-col items-center text-white'>Game Over</div>)
  }

  const submitMove = async (currentPosition, destination) => {
    // Perform axios request or any other backend interaction here
    try {
      await axios.post('http://localhost:5000/move', { data: { currentPosition, destination, selectedMove, activePlayer } });
      console.log('posted to endpoint', { data: { currentPosition, destination, selectedMove, activePlayer } })
    } catch (error) {
      console.error(error)
      console.log('Continuing locally')
    }
  }

  const handleSelection = (title) => {
    // get movecards for active player
    const selectedMoveCards = (activePlayer === 1) ? player1MoveCards : player2MoveCards;

    const matchingMoveCard = selectedMoveCards.find(moveCard => moveCard.name === title);
    console.log('selectedMoveCard', matchingMoveCard !== undefined ? matchingMoveCard : "")

    // deselect logic
    if (matchingMoveCard.name === selectedMove.name) {
      setSelectedMove("")
    } else {
      setSelectedMove(matchingMoveCard !== undefined ? matchingMoveCard : "")
    }
  };


  return (
    <GameServiceContext.Provider value={gameService}>
      <div className='h-screen bg-slate-500 justify-center flex flex-col items-center'>
        <PageHeader />
        <p className=' text-white text-4xl'>Current Player: {activePlayer === 1 ? "Blue" : "Red"}</p>
        <div className='grid grid-flow-col grid-cols-3 m-auto'>
          <div className='m-auto'>
            {activePlayer === 2 &&
              <MovementCard title={floaterMove.name} cellsToHighlight={floaterMove.movements} isOpponentCard={true} />
            }
          </div>
          <div className='m-auto'>
            <div className='justify-center flex flex-col items-center'>
              <div className=' center md:flex md:w-full m-auto justify-center'>
                {
                  player2MoveCards.map((card, index) => {
                    return card && <MovementCard key={index}
                      title={card.name}
                      cellsToHighlight={card.movements}
                      isOpponentCard={true}
                      handleSelection={handleSelection}
                      isSelected={selectedMove.name === card.name} />

                  })
                }
              </div>
              <GameBoard onMoveSubmit={submitMove} />
              <div className=' center md:flex md:w-full m-auto justify-center'>
                {
                  player1MoveCards.map((card, index) => {
                    return card && <MovementCard key={index}
                      title={card.name}
                      cellsToHighlight={card.movements}
                      handleSelection={handleSelection}
                      isSelected={selectedMove.name === card.name} />

                  })
                }
              </div>

            </div>
          </div>
          <div className='m-auto'>
            {activePlayer === 1 &&
              <MovementCard title={floaterMove.name} cellsToHighlight={floaterMove.movements} />
            }
          </div>

        </div>
      </div>
    </GameServiceContext.Provider>


  );
}

export default App;