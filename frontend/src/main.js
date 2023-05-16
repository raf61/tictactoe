import { createApp, reactive } from 'vue'
import App from './App.vue'
import Socket from './services/socketio.service.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import _ from 'lodash'
import 'animate.css'
import router from './router'
import store from './store'

(async ()=>{

    let app = createApp(App)
    app.use(router)
    app.use(store)
    app.config.globalProperties.$socket = Socket
    
    /*Socket.setup({
        auth:{
            token:localStorage.getItem('access_token')
        }
    });*/
    
    Socket.setup({})
    

    app.mount('#app')
})()
