import io from 'socket.io-client'

class Socket{
    setup(options={}){
        this.socket = io(import.meta.env.VITE_APP_SOCKET_URL, options)
    }
}

export default new Socket()