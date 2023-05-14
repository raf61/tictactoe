import Game from '../views/Game.vue'
import Login from '../views/Login.vue'
import notFound404 from '../views/404.vue'

const routes = [
    {
        path:'/game',
        component:Game
    },
    {
        path:'/login',
        component:Login
    },
    {
        path:'/404',
        component:notFound404
    }
]

import {createRouter, createWebHistory} from 'vue-router'

const router = createRouter({
    history:createWebHistory(process.env.BASE_URL),
    routes
})

router.beforeEach((to, from ,next)=>{
    if (!to.matched.length){
        return next('/404')
    }
    next()
})

export default router

