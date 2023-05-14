import io from 'socket.io-client'

class Socket{
    setup(options={}){
        this.socket = io('http://localhost:8000', options)
    }
}

export default new Socket()