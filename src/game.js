const crypto = require('crypto')
const _ = require('lodash')

module.exports = function createGame(){ // Factory
    
    const state = {
        players:[],
        matches:{}
    }

    /**
     * Add a player to a match
     * @param {String} id The player id
     * @returns a player object
     */
    function addPlayer(id){
        let index = state.players.indexOf(id)
        let playerObj = {
            id,
            free:true,
            currentMatch:null,
        }
        index == -1 && state.players.push(playerObj)
        return playerObj
        
    }

    /**
     * Removes a player from all matches and deletes it
     * @param {String} id The player id
     * @returns The player object
     */
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

    /**
     * Creates a match
     * @param {String} firstPlayerId The id of the player to first get into the match
     * @returns The match id
     */
    function createMatch(firstPlayerId){
        let matchId = crypto.randomBytes(16).toString('hex')
        state.matches[matchId] = {
            started:false,
            players:[],
            state:[[null, null, null],[null, null, null],[null, null, null]],
            roundPlayer:0,
            id: matchId
        }
        return joinMatch({playerId:firstPlayerId, matchId})
    }
    
    /**
     * Deletes a match
     * @param {String} matchId The match id
     */
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

    /**
     * Put a player into a match
     * @param {String} playerId The player id 
     * @param {String} matchId The match id
     * @returns The match id
     */
    function joinMatch({playerId, matchId}){
        let match = state.matches[matchId]
        let player = state.players.find(x=>x.id == playerId)
        if ((!match || !player || match.players.length >= 2)){
            return
        }
        match.players.push(playerId)
        player.free = false
        player.currentMatch = matchId
        
        return matchId

    }

    /**
     * Starts a match and draw the first to play
     * @param {String} matchId The match id
     */
    function startMatch(matchId){
        let match = state.matches[matchId]
        if (match){
            match.players = _.shuffle(match.players)
            match.started = true
        }
    }

    /**
     * Finds a match to a player
     * @param {String} playerId 
     * @returns The match id
     */
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

    /**
     * 
     * @param {String} playerId The id of the player who made the move
     * @param {String} matchId The id of the match in which the move was made
     * @param {Object} command A object containing the row and the column of the made move; Ex.: {row:0, col:0}
     * @returns {Object} A object containing the information of whether the match is over or not and if it ended in a draw or a win(if so, it will have a 0 if the first player in the playerlist wins and 1 if the second does)
     */
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

        return verifyFinishMatch(matchId)
    }

    /**
     * Returns all the directions the square can have (columns, diagonals and rows)
     * @param {Array} matchState The current match state
     * @returns {Object} An array of arrays: ([[3 rows],[3 columns], [2 diagonals])
     */
    function getSquareSequences(matchState){
        
        let result = []

        function column(m, i){
            let res = []
            m.map(x=>res.push(x[i]))
            return res
        }
        function row(matchState, i){
            return matchState[i]
        }
        function diagLeft(matchState){
            let c = 0
            let res = []
            for (let r of matchState){
                res.push(r[c])
                c++
            }
            return res
        }
        function diagRight(matchState){
            let c = matchState.length - 1
            let res = []
            for (let r of matchState){
                res.push(r[c])
                c--
            }
            return res
        }

        for (let c in matchState){
            result.push(row(matchState, c))
            result.push(column(matchState, c))
        }
        result.push(diagLeft(matchState))
        result.push(diagRight(matchState))
            
        
        
        return result

    }

    /**
     * Checks if a match is over or not
     * @param {String} matchId 
     * @returns {Object} A object containing the information whether the match is over or not and it`s winner (if there`s one)
        Ex.: {finished:true, winner:null} -> The match ended in a draw
        Ex.: {finished:false} -> The match is not over yet
        Ex.: {finished:true, winner:0} -> The first player in the match playerlist won the match.
     */
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
        makeMove
    }
}