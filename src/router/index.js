import { createRouter, createWebHashHistory } from 'vue-router';
import LoginPage from "../vue/LoginPage.vue";
import ArticlesPage from "../vue/ArticlesPage.vue";
import ArticleDetail from "../vue/ArticleDetail.vue";

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'Login', component: LoginPage },
    { path: '/articles', name: 'Articles', component: ArticlesPage, meta: { requiresAuth: true } },
    { path: '/article/:id', name: 'ArticleDetail', component: ArticleDetail, meta: { requiresAuth: true } }
];

const router = createRouter({
    history: createWebHashHistory(), // important pour Electron (pas d'historique HTML5)
    routes
});

// Garde de navigation pour vérifier l'authentification
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('authToken');

    // Si la route nécessite une authentification
    if (to.meta.requiresAuth) {
        if (!token) {
            // Pas de token, rediriger vers login
            next('/login');
        } else {
            // Token présent, continuer
            next();
        }
    } else if (to.path === '/login' && token) {
        // Si utilisateur connecté essaie d'accéder au login, rediriger vers articles
        next('/articles');
    } else {
        // Route libre, continuer
        next();
    }
});

export default router;