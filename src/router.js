import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'PageOne',
    component: () => import('./vue/PageOne.vue')
  },
  {
    path: '/page-2',
    name: 'PageTwo',
    component: () => import('./vue/PageTwo.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;