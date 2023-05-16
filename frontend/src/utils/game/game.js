import {reactive} from 'vue'
import _ from 'lodash'

export default function createGame(){

    let originalState = {
        positions:[[null, null, null],[null, null, null],[null,null,null]],
        playing:null,
        playerIndex:null
    }

    const state = reactive(_.cloneDeep(originalState))
    

    function updateState(newState){
        Object.assign(state.positions, newState)
    }

    function setPlaying(value){
        state.playing = value
    }

    function resetState(){
        Object.assign(state, _.cloneDeep(originalState))
    }

    function setPlayerIndex(value){
        state.playerIndex = value
    }

    
    return {
        updateState,
        state,
        setPlaying,
        resetState,
        setPlayerIndex
    }
}