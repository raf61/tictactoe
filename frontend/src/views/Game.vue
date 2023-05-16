<template>
    <div class="" v-if="render">
        <div class="game-header">
            <div class="game-header-wraper">
                <button class="search-match" @click="searchForMatch" :disabled="searchingMatch || game.state.playing != null || disconnected">
                    Search for a match
                </button>
            </div>
        </div>

        <div class="searching" v-if="searchingMatch">
            <div class="searching-wraper">
                <h2>Searching...</h2>
                <div class="loader-container">
                    <Loader/>
                </div>
            </div>
        </div>


        <div class="disconnected" v-if="disconnected">
            <div class="disconnected-wraper">

                <div class="disconected-2-wraper">
                    <div class="child">
                    <h2>Reconnecting...</h2>
                    <p>Try reloading the page</p>
                    </div>
                </div>
            </div>
        </div>

        <transition name="board">
        <div class="board-container" v-if="!searchingMatch && game.state.playing != null">
            <div>
                <div class="show-turn">
                    <div class="player-square turn-square" :style="{'background-color':game.state.playing ? 'green' : 'transparent'}"></div>
                    <div class="opponent-square turn-square" :style="{'background-color':!game.state.playing ? 'red' : 'transparent'}"></div>
                </div>
            
                <div class="board">
                    <div class="row" v-for="(row,rowIndex) in game.state.positions" :key="rowIndex">
                        <div @click="makeMove([rowIndex, colIndex])" :style="{cursor:game.state.playing ? 'pointer' : 'not-allowed'}" :class="`col col-${rowIndex*row.length+colIndex}`" v-for="(col, colIndex) in row" :key="colIndex">
                            <i class="bi bi-x x-icon move-icon" v-if="col == 0"></i>
                            <i class="bi bi-circle circle-icon move-icon" v-if="col == 1"></i>
                            
                        </div>
                    </div>
                </div><!--board-->
            </div>
        </div>
        </transition>

        <transition-group name="ended-game">

            <div class="ended-game" v-if="wonGame.state && wonGame.wo">
                <div class="ended-game-message" style="box-shadow:1px 1px 8px green;">
                    <p class="msg-title">Win by W.O!</p>
                    <span class="ended-game-icon">
                        <i class="bi bi-hand-thumbs-up"></i>
                    </span>
                    <p class="msg-words">Congratulations!</p>
                </div>
            </div>
            <div class="ended-game" v-else-if="wonGame.state" >
                <div class="ended-game-message" style="box-shadow:1px 1px 8px green;">
                    <p class="msg-title">Victory</p>
                    <span class="ended-game-icon">
                        <i class="bi bi-hand-thumbs-up"></i>
                    </span>
                    <p class="msg-words">Congratulations!</p>

                </div>
            </div>
            <div class="ended-game" v-if="lostGame.state" >
                <div class="ended-game-message" style="box-shadow:1px 1px 8px red;">
                    <p class="msg-title">Defeat</p>
                    <span class="ended-game-icon">
                        <i class="bi bi-hand-thumbs-down"></i>
                    </span>
                    <p class="msg-words">Try harder next time!</p>
                </div>
            </div>


            <div class="ended-game" v-if="drawedGame.state">
                <div class="ended-game-message" style="box-shadow:1px 1px 8px black;">
                    <p class="msg-title">Draw</p>
                    <span class="ended-game-icon">
                        <i class="bi bi-align-middle"></i>
                    </span>
                    <p class="msg-words">Try again... You almost got it!</p>
                </div>
            </div>
        </transition-group>
       
        


    </div>
</template>

<script>
import { getCurrentInstance, onUnmounted, reactive, ref} from 'vue'
import createGame from '../utils/game/game.js'
import Loader from '../components/generic/Loader.vue'

    export default {
        name:'Game',
        components:{Loader,},
        setup(){
            
            const app = getCurrentInstance()
            
            const $socket = app.appContext.config.globalProperties.$socket
            const searchingMatch = ref(false)
            const game = reactive(createGame())
            const wonGame = ref({state:false, wo:null})
            const lostGame = ref({state:false})
            const drawedGame = ref({state:false})
            const disconnected = ref(false)

            searchForMatch()

            $socket.socket.on('disconnect', ()=>{
                resetAll()
                disconnected.value = true

                $socket.socket.on('connect', ()=>{
                    disconnected.value = false
                    searchForMatch()
                })
            })


            $socket.socket.on('start-match', (command)=>{
                const idx = command[$socket.socket.id]
                game.setPlaying(!idx)
                game.setPlayerIndex(idx)
                searchingMatch.value = false
            })

            $socket.socket.on('forced-end-match', ()=>{
                game.setPlaying(null)
                wonGame.value = {state:true, wo:true}
            })

            $socket.socket.on('match-state', state=>{
                
                game.updateState(state)
                game.setPlaying(!game.state.playing)
                
            })

            $socket.socket.on('end-match', ({winner})=>{
                if (winner==null){//draw
                    drawedGame.value.state = true
                }
                else if (winner==$socket.socket.id){//win
                    wonGame.value.state = true
                }
                else{
                    lostGame.value.state = true
                }
                
                game.setPlaying(null)
                
            })

           

            function makeMove([row, col]){
                if (!game.state.playing || game.state.positions[row][col] != null)
                    return

                game.state.positions[row][col] = game.state.playerIndex
                $socket.socket.emit('make-move', {
                    row,
                    col
                })
                
            }

            function resetAll(){
                game.resetState()
                searchingMatch.value = false
                wonGame.value.state = false
                wonGame.value.wo = null
                lostGame.value.state = false
                drawedGame.value.state = false
            }

            function searchForMatch(){
                resetAll()
                searchingMatch.value = true
                $socket.socket.emit('match', {})
            }


            onUnmounted(()=>{
                let eventNames = [
                    'start-match',
                    'forced-end'
                ]
                eventNames.forEach(name=>$socket.socket.off(name))
            })
        
            return {
                game,
                makeMove,
                searchingMatch,
                lostGame,
                wonGame,
                drawedGame,
                searchForMatch,
                disconnected,
                render:true,
            }
        }

    }
</script>


<style scoped>
.board-container{
    height:65vh;
    display:flex;
    justify-content: center;
    align-items:center;
}
.board{
    padding:1rem;
    border:2px solid black;
    border-radius:5px;
}
.row{
    display:flex;

}
.col{
    width:9rem;
    height:9rem;
    display:flex;
    justify-content:center;
    align-items:center;
}
.move-icon{
    font-size:5rem;
}
.x-icon{
    font-size:8rem;
}
.row{
    border:1px solid black;
    border-right: none;
    border-left: none;
}
.row:first-of-type, .row:last-of-type{
    border:none;
}
.col-1{
    border-right:1px solid black;
    border-left:1px solid black;
}
.col-4{
    border-right:1px solid black;
    border-left:1px solid black;
}
.col-6{
}
.col-7{
    border-left:1px solid black;
    border-right:1px solid black;
}
.searching, .disconnected{
    display:flex;
    height:70vh;
    align-items:center;
    justify-content:center;
}
.searching h2, .disconnected h2{
    font-weight:normal;
    margin-bottom:1rem;
}
.searching-wraper{
    text-align:center;
}
.loader-container{
    display:flex;
    justify-content:center;
    align-items:center;
}
.game-header-wraper{
    display:flex;
    justify-content:flex-end;
    padding:1rem;
}
button.search-match{
    cursor:pointer;
    padding:8px;
    color:white;
    border:none;
    background-color:rgb(102, 143, 231);
    border-radius:2px;
    font-weight:bold;
    font-size:11pt;
}
button.search-match:disabled{    
    cursor:pointer;
    opacity:.4;
}

.ended-game{
    display:flex;
    justify-content:center;
}
.ended-game-message{
    text-align:center;
    font-size:12pt;
    padding:5rem 8rem;
    
    border-radius:5px;
}
.msg-title{
    font-size:25pt;
}
.msg-words{
    margin-top:.5rem;
    color:grey;
    font-weight:bold;
}
.ended-game-icon i{
    font-size:6rem;
}

.board-enter-active{
    animation:zoomIn;
    animation-duration:.7s;
}
.board-leave-active{
    animation:fadeOutUp;
    animation-duration:.4s;
}
.ended-game-enter-active{
    animation:fadeInUp;
    animation-duration:1s;
}
.show-turn {
    display:flex;
    justify-content:center;
    margin-bottom:1rem;
}
.show-turn .turn-square{
    width:2rem;
    height:2rem;
    margin:0 0.25rem;
    border-radius:50%;
}
.player-square{
    border:1px solid green;
}
.opponent-square{
    border:1px solid red;
}
.disconnected{
    
}
.disconnected-wraper h2{
    margin-top:.75rem;
    text-align:center;
}
.reconecting-icon{
    text-align:center;
    margin:0 auto;
    height:8rem;
    width:8rem;
    display:flex;
    align-items:center;
    justify-content:center;
    border:5px solid black;
    border-radius:50%;
    margin-bottom:1rem;
}
.reconecting-icon i{
    font-size:6rem;
}




@media screen and (max-width: 500px){
    .col{
        width:5rem !important;
        height:5rem !important;
    }
    .move-icon{
        font-size:3rem;
    }
    .x-icon{
        font-size:5rem;
    }
    .ended-game-message{
        padding:5rem 3rem;
    }
}







@keyframes spin{
    0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.disconected-2-wraper {
    position: relative;
    text-align:center;
    height:20rem;
    width:20rem;
}
.disconected-2-wraper p{
    color:#9e8181;
}
.disconected-2-wraper::before {                
    content: '';
    
    position: absolute;
    
    
    left:0;
    top:0;                
    z-index: -1;
    transition: .5s ease;
    border-radius:50%;
    width: 100%;
    height:100%;
    box-shadow:1px 5px 5px rgb(92, 140, 228);
    animation:infinite linear .6s spin;
    
}
.child{
    position:absolute;
    left:50%;
    top:50%;
    transform:translateX(-50%) translateY(-50%);
}

           
</style>