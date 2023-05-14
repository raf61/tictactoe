const crypto = require('crypto')
const _ = require('lodash')

module.exports = function createGame(){
    const state = {
        players:[],
        matches:{}
    }

    function addPlayer(id, user){
        let index = state.players.indexOf(id)
        let playerObj = {
            id,
            free:true,
            currentMatch:null,
            user
        }
        index == -1 && state.players.push(playerObj)
        return playerObj
        
    }

    function removePlayer(id){
        let index = state.players.findIndex(x=>x.id == id)
        if (index == -1)
            return

        let player = _.cloneDeep(state.players[index])
        let curMatch = _.cloneDeep(state.matches[player.currentMatch])
        removeMatch(player.currentMatch)
        state.players.splice(index, 1)

        let result = {
            player
        }
        if (curMatch){
            result.match = curMatch
        }
        return result
        
    }

    function createMatch(firstPlayerId){

        let matchId = crypto.randomBytes(16).toString('hex')
        state.matches[matchId] = {
            started:false,
            players:[],
            state:[[null, null, null],[null, null, null],[null, null, null]],
            roundPlayer:0
        }
        return joinMatch({playerId:firstPlayerId, matchId})
    }
    

    function removeMatch(matchId){
        let match = state.matches[matchId]
        if (!match)
            return
        match.players.forEach(playerId=>{
            let player = state.players.find(x=>x.id==playerId)
            if (player){
                player.free = true
                player.currentMatch = null
            }
        })
        Reflect.deleteProperty(state.matches, matchId)
    }

    function joinMatch({playerId, matchId}){

        let match = state.matches[matchId]
        let player = state.players.find(x=>x.id == playerId)
        if ((!match || !player || match.players.length >= 2)){
            return
        }
        match.players.push(playerId)
        player.free = false
        player.currentMatch = matchId
        match.id = matchId
        
        return matchId

    }

    function startMatch(matchId){
        let match = state.matches[matchId]
        if (match){
            match.players = _.shuffle(match.players)
            match.started = true
        }
    }

    function matchPlayer(playerId){
        let match = null
        let matchId;
        for (matchId in state.matches){
            let x = state.matches[matchId]
            if (x.players.length < 2 && !x.started){
                match = x
                joinMatch({playerId, matchId})
                break
            }
        }
        if (match){
            return matchId
        }

        return createMatch(playerId)
    }

    function makeMove({playerId, matchId, command}){
        let match = state.matches[matchId]
        if (!match || !match.players.includes(playerId) || match.players[match.roundPlayer] != playerId){
            return
        }
        
        let {row, col} = command
        row = Math.abs(Number(row))
        col = Math.abs(Number(col))
        if (isNaN(row) || isNaN(col) || row > 2 || col > 2){
            return
        }
        let move = match.state[row][col]
        if (move != undefined){
            return
        }
        match.state[row][col] = match.roundPlayer
        match.roundPlayer = Number(!match.roundPlayer)      
    }

    function getSquareSequences(arr){
        let result = []

        function column(m, i){
            let res = []
            m.map(x=>res.push(x[i]))
            return res
        }
        function row(arr, i){
            return arr[i]
        }
        function diagLeft(arr){
            let c = 0
            let res = []
            for (let r of arr){
                res.push(r[c])
                c++
            }
            return res
        }
        function diagRight(arr){
            let c = arr.length - 1
            let res = []
            for (let r of arr){
                res.push(r[c])
                c--
            }
            return res
        }

        for (let c in arr){
            result.push(row(arr, c))
            result.push(column(arr, c))
        }
        result.push(diagLeft(arr))
        result.push(diagRight(arr))
               
        
        
        return result

    }

    function verifyFinishMatch(matchId){
        let match = state.matches[matchId]
        if (!match){
            return
        }
        
        let sequences = getSquareSequences(match.state)
        let thereIsNullSpace = false
        for (let sequence of sequences){
            if (sequence.includes(null)){
                thereIsNullSpace = true
            }
            if (_.isEqual(sequence, [0,0,0])){
                return {finished:true, winner:0}
            }
            else if (_.isEqual(sequence, [1,1,1])){
                return {finished:true, winner:1}
            }
        }
        if (!thereIsNullSpace){
            return {finished:true, winner:null}
        }

        return {finished:false}

    }



    return {
        state,
        addPlayer,
        removePlayer,
        createMatch,
        startMatch,
        removeMatch,
        matchPlayer,
        makeMove,
        verifyFinishMatch
    }
}