import Vue from 'vue'
import VueRouter from 'vue-router'
import { Message } from 'element-ui'


// const Foo = () => import('./Foo.vue')
const Login = () => import('@/components/login.vue')
const Home = () => import('@/components/home.vue')
const Users = () => import('@/components/users.vue')
const Rights = () => import('@/components/rights.vue')
const Roles = () => import('@/components/roles.vue')
const Goodslist = () => import('@/components/goodslist.vue')
const Goodsadd = () => import('@/components/goodsadd.vue')
const Cateparams = () => import('@/components/cateparams.vue')
const Goodscate = () => import('@/components/goodscate.vue')
const Order = () => import('@/components/order.vue')
const Reports = () => import('@/components/reports.vue')

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      children: [{
        name: 'users',
        path: '/users',
        component: Users
      },
      {
        name: 'rights',
        path: '/rights',
        component: Rights
      }, {
        name: 'roles',
        path: '/roles',
        component: Roles
      },
      {
        name: 'goods',
        path: '/goods',
        component: Goodslist
      },
      {
        name: 'goodsadd',
        path: '/goodsadd',
        component: Goodsadd
      },
      {
        name: 'params',
        path: '/params',
        component: Cateparams
      },
      {
        name: 'categories',
        path: '/categories',
        component: Goodscate
      }, {
        name: 'orders',
        path: '/orders',
        component: Order
      },
      {
        name: 'reports',
        path: '/reports',
        component: Reports
      }]
    }, {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

// 路由的导航守卫
router.beforeEach((to, from, next) => {
  if (to.name === 'login') {
    next()
  } else {
    const token = localStorage.getItem('token')
    if (!token) {
      Message.warning('请先登录!')
      router.push({ name: 'login' })
      return
    }
    next()
  }
})

export default router