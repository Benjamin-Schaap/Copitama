import PageHeader from './Components/PageHeader/PageHeader'
import GameBoard from './Components/GameBoard/GameBoard';

function App() {
  return (
    <div className='h-screen bg-slate-500'>
      <div className='justify-center flex flex-col items-center'>

        <PageHeader />
        <GameBoard />

      </div>

    </div>

  );
}

export default App;