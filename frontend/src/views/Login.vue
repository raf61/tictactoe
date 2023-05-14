<template>
    <div v-if="render">
        <div class="input-container">
            <input type="email" name="email" v-model="email">
            <input type="password" name="password" id="password" v-model="password">
            <button @click="login">Entrar</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
import { mapMutations, mapState } from 'vuex'
export default {
    name:'Login',
    data(){
        return {
            render:false,
            email:'',
            password:''
        }
    },     
    computed:{
        ...mapState(['user'])
    },
    methods:{
        ...mapMutations(['SET_USER']),
        async login(){
           try{
               const {data} = await axios.post(`${process.env.VUE_APP_SOCKET_URL}/login`,{
                   email:this.email,
                   password:this.password
               })
               if (!data.success){
                    return this.$message('Email ou senha inválidos')
               }
               
               localStorage.setItem('access_token', data.token)
               this.SET_USER({...data.user, is_authenticated:true,})
               this.$message('Seja bem vindo')
               this.$socket.setup({
                   auth:{
                       token:data.token
                   }
               })
               this.$router.push('/game')
           } 
           catch(E){
               this.$message('Não foi possível fazer login')
           }
        }
    },
    created(){
        if (this.user.is_authenticated){
            return this.$router.push('/game')
        }
        this.render = true
    }

}
</script>

<style scoped>

</style>