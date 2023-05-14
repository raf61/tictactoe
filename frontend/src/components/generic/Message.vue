<template>
    <div>

            
            <div class="message-container">
                <transition name="toast">
                    <div class="message" v-show="_message.visible" :style="{'background-color':bgcolor || 'auto', color:color || 'auto'}">
                        <p>{{text}}</p>
                    </div>
                </transition>
            </div>
    </div>
</template>

<script>
export default {
    name:'Message',
    props:['text', 'visible', 'bgcolor', 'color'],
    
}
</script>

<style>
.message-container{
    position:fixed;
    width:100%;
    left:1rem;
    bottom:1rem;
    
}
.message{
    display:inline-block;
    max-width:600px;
    background-color:#181818;
    color:white;
    padding:.8rem 1rem;
    border-radius:3px;
    min-width:20rem;
}
.message p{
    font-size:11pt;
}
.toast-enter-active{
    animation:tfrom;
    animation-duration:.3s;
}
.toast-leave-from{
    transform:translateY(0px)
}
.toast-leave-active{
    transition:.4s;
}
.toast-leave-to{
    transform:translateY(5rem)
}

@keyframes tfrom{
    0%{
        transform:translateY(5rem)
    }
    100%{
        transform:translateY(0px)
    }
}

</style>