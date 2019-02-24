import axios from 'axios'
import { Message } from 'element-ui'

const HttpServer = {}

HttpServer.install = function (Vue) {
  axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'

  // 请求拦截器
  axios.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    // console.log('请求拦截器被触发了-----')

    // 所有请求发起之后,进行筛选,请求标识是不是login
    // 如果标识是login,不要头部->请求继续发起
    // 当请求标识不是login,先设置头部,再发送请求
    if (config.url !== 'login') {
      const AUTH_TOKEN = localStorage.getItem('token')
      // axios.defaults.headers.common["Authorization"] = AUTH_TOKEN;
      config.headers['Authorization'] = AUTH_TOKEN
      // var per = {};
      // per["Authorization"] = "token";
    }
    // this.$http.get(url) -> 请求拦截处理 ->发请求

    // console.log(config)

    return config
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  })
  // 添加响应拦截器
  axios.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    const {

      meta: { msg, status }
    } = response.data;
    if (status !== 200 && status !== 201) {
      Message.warning(msg)
    }
    return response;
  }, function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  });

  Vue.prototype.$http = axios
}

export default HttpServer
