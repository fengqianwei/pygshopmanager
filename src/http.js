import axios from 'axios'
// axios.defaults.headers.common['Authorization'] = 'localStorage.getItem("token")'

const httpServer = {}
httpServer.install = function (Vue) {
    // 4. 添加实例方法
    axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
    const AUTH_TOKEN = localStorage.getItem('token')
    axios.defaults.headers.common['Authorization'] = AUTH_TOKEN
    Vue.prototype.$http = axios
}
export default httpServer 
