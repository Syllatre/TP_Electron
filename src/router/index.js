import { createRouter, createWebHashHistory } from 'vue-router';
import PageOne from "../vue/PageOne.vue";
import PageTwo from "../vue/PageTwo.vue";

const routes = [
    { path: '/page-1', name: 'PageOne', component: PageOne },
{ path: '/page-2', name: 'PageTwo', component: PageTwo }
];

const router = createRouter({
    history: createWebHashHistory(), // important pour Electron (pas d'historique HTML5)
    routes
});

export default router;