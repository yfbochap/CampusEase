import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Dashboard from '../views/Dashboard.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path:'/dashboard',
      name:'dashboard',
      component: Dashboard
    },
    {
      path:'/profile',
      name:'profile',
      component: () => import('@/views/profile.vue')
    },
    {
      path:'/edit_profile',
      name:'edit_profile',
      component: ()=>import('@/views/edit_profile.vue') 
    },
    {
      path:'/SignIn',
      name:'SignIn',
      component: ()=>import('@/views/SignIn.vue')
    },
    {
      path:'/SignUp',
      name:'SignUp',
      component: () => import('@/views/SignUp.vue')
    },
    {
      path:'/event/:id/:name',
      name:'event',
      component: () => import('../views/Event.vue'),
      props: true
    },
    {
      path:'/eventCreation',
      name:'eventCreation',
      component: () => import('../views/EventCreation.vue')
    },
    {
      path: '/:pathMatch(.*)*', 
      redirect: '/' 
    },
    {
      path: '/LikedEvents',
      name: 'LikedEvents',
      component: () => import('../views/LikedEvents.vue')
    },
    {
      path: '/your_events',
      name: 'your_events',
      component: () => import('../views/list_user_event.vue')
    },
    {
      path: '/edit_event',
      name: 'edit_event',
      component: () => import('../views/edit_event.vue')
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Always scroll to top when navigating
    return { top: 0 };
  }
})

export default router
