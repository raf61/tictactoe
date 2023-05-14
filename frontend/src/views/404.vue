<template>
<div class="container">
    <div>

        <h2>404 not found</h2>
        <router-link to="game">
            <button class="play">
                Click here to Play
            </button>
        </router-link>
    </div>
</div>
</template>

<script>
export default {
    
}
</script>


<style scoped>
    div.container{
        display:flex;
        align-items:center;
        justify-content:center;
        height:90vh;
    }
    div.container > div{
        text-align:center;
    }
    div.container > div .play{
        padding:8px;
        border:none;
        color:white;
        font-weight:bold;
        background: blue;
        border-radius:4px;
        cursor:pointer;
        margin-top:.5rem;
    }

</style>