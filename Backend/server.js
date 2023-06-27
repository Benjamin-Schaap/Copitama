import express from 'express';
import bodyParser from 'body-parser';
import { Copitama } from './Copitama.js';

run().catch(err => console.log(err));

async function run() {
    const app = express();

    let gameManager = {}

    let game = new Copitama()

    // TODO: Fix this not working
    function arraysEqual(a, b) {
        if (a === b) return true;
        if (a == null || b == null) return false;
        if (a.length !== b.length) return false;

        // If you don't care about the order of the elements inside
        // the array, you should sort both arrays here.
        // Please note that calling sort on an array will modify that array.
        // you might want to clone your array first.

        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));


    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "http://localhost:3000");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    // SSE stream creation
    app.get('/sse', async function (req, res) {

        const lobby_id = req.query['lobby_id']

        console.log('Received incoming connection');
        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });
        res.flushHeaders();


        if (!gameManager[lobby_id]) {
            gameManager[lobby_id] = 1
        } else {
            gameManager[lobby_id] += 1
        }

        let localConnections = gameManager[lobby_id]

        res.write(`data: ${gameManager[lobby_id]}\n\n`);

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (localConnections !== gameManager[lobby_id]) {

                localConnections = gameManager[lobby_id]

                console.log('Members in lobby', gameManager[lobby_id]);

                // publish new data                 
                res.write(`data: ${gameManager[lobby_id]}\n\n`);

                console.log('\n\nALL lobbies')

                for (var key in gameManager) {
                    let newKey = key

                    console.log('Lobby_ID:', newKey, 'Members: ', gameManager[newKey])
                }



            }
        }
    });

    // demo SSE stream creation
    app.get('/realtime-feed', async function (req, res) {

        console.log('Received incoming connection');
        res.set({
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/event-stream',
            'Connection': 'keep-alive'
        });
        res.flushHeaders();

        let localGameState = game.getGameStatus()

        res.write(`data: ${localGameState}\n\n`);
        console.log(localGameState.board)

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (arraysEqual(localGameState.board, game.getGameStatus().board)) {

                localGameState = game.getGameStatus()

                console.log('updating clients')
                // console.log(localGameState)

                //console.log('Pushing to data to clients', game.getGameStatus());

                // publish new data                 
                res.write(`data: ${JSON.stringify(game.getGameStatus())}\n\n`);
            }
        }
    });

    // demo move piece endpoint
    app.post('/move', (req, res) => {
        console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\nendpoint was hit')
        const { currentPosition, destination, selectedMove, activePlayer} = req.body.data;
        console.log(req.body.data)

        // Validate input
        if (!Array.isArray(currentPosition) || currentPosition.length !== 2 ||
            !Array.isArray(destination) || destination.length !== 2) {
            console.log('error',
                !Array.isArray(currentPosition),
                currentPosition.length !== 2,
                !Array.isArray(destination),
                destination.length !== 2)
            return res.status(400).json({ error: 'Invalid input' });
        }

        let wasSuccessfulMove = game.movePiece(currentPosition, destination, selectedMove !== "" ? selectedMove : null, activePlayer );

        console.log('successfully moved piece? ', wasSuccessfulMove)

        if (wasSuccessfulMove) {
            return res.status(200).json({ message: 'Move accepted' })

        } else {
            return res.status(400).json({ error: 'Move was not accepted' });
        }
    });




    await app.listen(5007);
    console.log('Listening on port 5007');
}

