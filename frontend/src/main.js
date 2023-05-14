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
    Socket.setup({
        auth:{
            token:localStorage.getItem('access_token')
        }
    });

    let default_message = {
        text:'',
        visible:false,
        bgcolor:"#181818",
        color:'white',
        timeout:setTimeout(()=>{}, 0)
    }

    app.config.globalProperties.$message = (text='', bgcolor, color, duration=4000)=>{
        clearTimeout(app.config.globalProperties._message.timeout)
        Object.assign(app.config.globalProperties._message, _.cloneDeep(default_message))
        Object.assign(app.config.globalProperties._message, {
            visible:true,
            text,
            bgcolor:bgcolor || default_message.bgcolor,
            color:color || default_message.color
        })
        
        app.config.globalProperties._message.timeout = setTimeout(() => {
            app.config.globalProperties._message.visible = false
        }, duration);
    }
    app.config.globalProperties._message = reactive(_.cloneDeep(default_message))

    app.mount('#app')
})()
