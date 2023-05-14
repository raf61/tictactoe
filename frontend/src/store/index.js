import {createStore} from 'vuex'

export default createStore({
    strict:true,
    state:()=>({

    }),
    mutations:{

    },
    modules:{
        user:{
            
            state:()=>({
                email:'',
                is_authenticated:false,
                id:null
            }),

            mutations:{
                SET_USER(state, payload){
                    let allowed_keys = [
                        'email',
                        'is_authenticated',
                        'id'
                    ]
                    for (let key in payload){
                        if (allowed_keys.includes(key)){
                            state[key] = payload[key]
                        }
                    }
                }
            }
        }
    }
})