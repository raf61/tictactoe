const createGame = require('./game.js')
const jwt = require('./utils/jwt')
let game = createGame()
const db = require('./database/db.json')

function attributeAuthRequiredEvents({sockets, socket, user}){
    socket.on('disconnect', ()=>{
        console.log(`[-] Socket with id ${socket.id} disconnected`)
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
    let player = game.addPlayer(playerId, user)
    
    

    socket.on('match', ()=>{

        if(!player.free){
            return
        }

        let matchId = game.matchPlayer(playerId)
        socket.join(matchId)
        let match = game.state.matches[matchId]
        console.log('mathinng', game.state.matches)

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
        game.makeMove({playerId, matchId:player.currentMatch, command})
        let match = game.state.matches[player.currentMatch]
        let finishedObj = game.verifyFinishMatch(player.currentMatch)

        sockets.to(player.currentMatch).emit('match-state', match.state)
        

        if (finishedObj.finished){

            sockets.to(player.currentMatch).emit('end-match', {
                winner:match.players[finishedObj.winner] || null
            })
            game.removeMatch(player.currentMatch)
        }
        
    })
}

function removeAllEvents(socket){
    let names = [
        'match',
        'make-move',
    ]

}

module.exports = sockets => {

    sockets.on('connection', async socket=>{
        console.log(`[+] Socket with id ${socket.id} connected`)
        let token = socket.handshake?.auth?.token 
        
        let result = await jwt.verify(token)
        let query = db.users.find(x=>x.id==result?.sub)

        if (result && query){

            let listAlreadyPlayingWithAccount = game.state.players.filter(x=>x.user?.id==query.id)
            
            if (listAlreadyPlayingWithAccount.length){
                for (let alreadyPlayingWithAccount of listAlreadyPlayingWithAccount){
                    let alreadyPlayingSocket = sockets.sockets.sockets.get(alreadyPlayingWithAccount.id)
                    if( alreadyPlayingSocket ){
                        alreadyPlayingSocket.emit('new-device-connected', {})
                    }
            }
            }
            attributeAuthRequiredEvents({sockets, socket, user:query})
        }




    })


}
