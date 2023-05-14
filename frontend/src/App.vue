<template>
  <div v-if="render">
      <Message :visible="_message.visible" :text="_message.text" :color="_message.color" :bgcolor="_message.bgcolor"/>
    <router-view>
      
    </router-view>
    

  </div>
</template>

<script>
import axios from 'axios'
import { mapMutations, mapState } from 'vuex'
import Message from './components/generic/Message.vue'
export default {
  name: 'App',
  components:{Message},
  data(){
    return{
      render:false
    }
  },
  computed:{
    
  },
  methods:{
    ...mapMutations(['SET_USER'])
  },
  async created(){
    try{
      let access_token = localStorage.getItem('access_token')
      if (!access_token){
        this.SET_USER({
          is_authenticated:false,
        })
        this.render = true
        return
      }
      let {data} = await axios.get(`${process.env.VUE_APP_SOCKET_URL}/status`, {
        headers:{
          Authorization:`Bearer ${access_token}`
        }
      })
      this.SET_USER(data)
    } 
    catch(E){
      this.SET_USER({
          is_authenticated:false,
        })
    }   
    this.render = true
  }

}
</script>
 
<style>

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family: Arial, sans-serif;

}
html, body{
  height:100%;
}
</style>
