<template>
  <div>
    <!-- Navigation conditionnelle -->
    <nav v-if="showNavigation" class="uk-navbar-container" uk-navbar>
      <div class="uk-navbar-right">
        <ul class="uk-navbar-nav">
          <li><a @click="logout" href="#">Déconnexion</a></li>
        </ul>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const showNavigation = ref(false)

// Vérifier si on doit afficher la navigation
const updateNavigationVisibility = () => {
  const token = localStorage.getItem('authToken')
  showNavigation.value = !!(token && route.path !== '/login')
}

// Fonction de déconnexion
const logout = () => {
  localStorage.removeItem('authToken')
  showNavigation.value = false
  router.push('/login')
}

// Watcher pour surveiller les changements de route
watch(() => route.path, () => {
  updateNavigationVisibility()
})

// Au montage du composant
onMounted(() => {
  updateNavigationVisibility()
})

// Exposer la fonction logout globalement si nécessaire
window.appLogout = logout
</script>