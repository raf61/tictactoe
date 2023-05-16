const createGame = require('./game.js')
let game = createGame()

function attributeSocketEvents({sockets, socket}){

    socket.on('disconnect', ()=>{
        //console.log(`[-] Socket with id ${socket.id} disconnected`)
        let removed = game.removePlayer(playerId)
        if (!removed){
            return
        }
        const {match, player} = removed
        if (match){
            sockets.to(player.currentMatch).emit('forced-end-match', {})
        }
        
    })

    let playerId = socket.id
    let player = game.addPlayer(playerId)

    socket.on('match', ()=>{

        if(!player.free){
            return
        }

        let matchId = game.matchPlayer(playerId)
        socket.join(matchId)
        let match = game.state.matches[matchId]

        if (match.players.length >= 2){
            game.startMatch(match.id)
            let [player0, player1] = match.players
            sockets.to(matchId).emit('start-match', {
                [player0]:0,
                [player1]:1
            })
        }
        
        
    })

    socket.on('make-move', command=>{
        
        if (player.free){
            return
        }
        let finishedObj = game.makeMove({playerId, matchId:player.currentMatch, command})
        let match = game.state.matches[player.currentMatch]
        

        sockets.to(player.currentMatch).emit('match-state', match.state)
        if (finishedObj.finished){
            sockets.to(player.currentMatch).emit('end-match', {
                winner:match.players[finishedObj.winner] || null
            })
            game.removeMatch(player.currentMatch)
        }
        
    })
}


module.exports = sockets => {

    sockets.on('connection', async socket=>{
        //let token = socket.handshake?.auth?.token 
        
        attributeSocketEvents({sockets, socket})

    })


}
