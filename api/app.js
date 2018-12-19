var express = require('express');
var _ = require('lodash');
var require = require('requirejs');
var app = express();
var body_parser = require('body-parser');
const fs = require('fs');

// Use middleware to set the default Content-Type
app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    next();
});
app.use(body_parser.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
    
app.get('/',function(req,res){
    res.sendFile('index.html');
});

var player_uuid = [];
var playerNames = [];
var events = [];
var game ;
// Retrieve game data from the last synced state
// if (fs.existsSync('game-data.json')) {
//     let rawdata = fs.readFileSync('game-data.json');  
//     game = JSON.parse(rawdata);  
}
// = { status: 'start',
//   currentPlay: 0,
//   currentValidCards: [ 27, 31, 7, 23, 51, 2, 34, 50, 13, 41, 5, 44, 24 ],
//   players:
//    [ [ 27, 31, 7, 23, 51, 2, 34, 50, 13, 41, 5, 44, 24 ],
//      [ 15, 35, 14, 30, 6, 22, 10, 1, 17, 25, 4, 20, 12 ],
//      [ 39, 3, 43, 47, 26, 18, 46, 33, 49, 40, 28, 32, 36 ],
//      [ 19, 11, 42, 38, 29, 45, 21, 9, 37, 0, 16, 8, 48 ] ] };
var allReady = false;

// query = { id, name }
app.get('/api/ready', (req, res) => {
    console.log('ready request', req.query);
    if(game.status != 'start' && game.status  != 'playing') {
        return res.status(400).send({
            success: false,
            message: 'Game status is not in start',
        })
    }
    if(!req.query.id) {
        return res.status(400).send({
            success: false,
            message: 'uuid is reqd'
        });
    }
    if(!req.query.name) {
        return res.status(400).send({
            success: false,
            message: 'name is reqd'
        });
    }
    let playerId = _.findIndex(player_uuid, (id) => {return id==req.query.id});
    console.log(playerId);
    if( playerId === -1 ){
        player_uuid.push(req.query.id);
        playerNames.push(req.query.name); //  send this to server
        playerId = player_uuid.length - 1;
        console.log('player Id..', playerId);
    }
    if (playerId === 3){
        // send this to server
        allReady = true;
        console.log('all players ready for final showdown');
    }

    return res.status(200).send({
        success: true,
        cards: game.players[playerId],
    });
});

app.post('/api/playCard', (req, res) => {
    console.log('play Card post - game status', game.status, '..req id', req.body.id, '..player uuid -- ', player_uuid);
    if(game.status != 'playing') {
        return res.status(400).send({
            success: false,
            message: 'Game status is not in playing state',
        });
    }
    if(!req.body.id) {
        return res.status(400).send({
            success: false,
            message: 'uuid is reqd'
        });
    }
    if(!req.body.card) {
        return res.status(400).send({
            success: false,
            message: 'card played is reqd'
        });
    }
    let playerId = _.findIndex(player_uuid, (id) => {return id==req.body.id});
    if( playerId === -1 ){
        return res.status(400).send({
            success: false,
            message: 'No such player exists'
        });
    }
    if (game.currentPlay != playerId) {
        return res.status(400).send({
            success: false,
            message: 'Not your turn yet'
        });
    }
    if( _.findIndex(game.currentValidCards, (card) => {return card.id==req.body.card.id}) >= 0 ) {
        // Queuing this event to send to server
        events.push({
            playerId,
            card: req.body.card,
        });
        return res.status(200).send({
            success: true,
            message: 'Accepted'
        });
    }
    return res.status(400).send({
        success: false,
        message: 'Invalid Card'
    })    
});

app.post('/api/internalPost', (req, res) => {
    game = req.body; 
    let data = JSON.stringify(game);  
    console.log(game.status);
    fs.writeFileSync('game-data.json', data); 
    return res.status(200).send({
        success: true
    });
})

app.get('/api/internalGet', (req, res) => {
    // console.log('internal get');
    res.status(200).send({
        allReady,
        playerNames,
        events,
    });
    events = [];
    return;

})

// For testing by developers
app.get('/api/extPost', (req, res)  => {
    console.log('external post');
    allReady = true;    
    player_uuid = ['a0','a1','a2','a3'];
    console.log('..game current play', game.currentPlay);
    return res.status(200).send({
        success: true
    });

})

const PORT = 6969;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});


// double play of cards