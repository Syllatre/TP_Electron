<template>
  <div class="uk-container uk-margin-top">
    <!-- Header -->
    <div class="uk-text-center uk-margin-bottom">
      <h2>Liste des Articles</h2>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="uk-text-center uk-margin">
      <span uk-spinner="ratio: 2"></span>
      <p>Chargement des articles...</p>
    </div>

    <!-- Articles -->
    <div v-else-if="articles.length > 0" class="uk-grid uk-child-width-1-3@m uk-child-width-1-2@s uk-child-width-1-1@xs" uk-grid>
      <div v-for="article in articles" :key="article.id">
        <div class="uk-card uk-card-default">
          <div class="uk-card-media-top">
            <img :src="article.imgPath" :alt="article.title" style="height: 200px; object-fit: cover;">
          </div>
          <div class="uk-card-body">
            <h3 class="uk-card-title">{{ article.title }}</h3>
            <p>{{ article.desc }}</p>
            <p class="uk-text-meta">Par: {{ article.author }}</p>
          </div>
          <div class="uk-card-footer uk-text-center">
            <button @click="viewArticle(article.id)" class="uk-button uk-button-primary uk-button-small">
              Voir plus
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Aucun article -->
    <div v-else class="uk-text-center uk-margin">
      <p>Aucun article disponible pour le moment.</p>
    </div>

    <!-- Messages -->
    <div v-if="message" class="uk-margin uk-text-center" :class="messageType === 'success' ? 'uk-text-success' : 'uk-text-danger'">
      {{ message }}
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// État réactif
const articles = ref([])
const isLoading = ref(true)
const message = ref('')
const messageType = ref('error')

// API URL
const API_BASE = 'http://localhost:3000'

// Vérifier l'authentification au montage
onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (!token) {
    router.push('/login')
    return
  }

  checkAuthentication()
  loadArticles()
})

// Vérifier l'authentification
async function checkAuthentication() {
  const token = localStorage.getItem('authToken')

  try {
    const response = await fetch(`${API_BASE}/check`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      localStorage.removeItem('authToken')
      router.push('/login')
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    localStorage.removeItem('authToken')
    router.push('/login')
  }
}

// Charger les articles
async function loadArticles() {
  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE}/articles`)
    const result = await response.json()

    if (result.code === '200') {
      articles.value = result.data
    } else {
      showMessage('Erreur lors du chargement des articles', 'error')
    }
  } catch (error) {
    console.error('Erreur:', error)
    showMessage('Erreur de connexion au serveur', 'error')
  } finally {
    isLoading.value = false
  }
}

// Voir un article en détail
function viewArticle(id) {
  router.push(`/article/${id}`)
}




// Fonction utilitaire pour afficher les messages
function showMessage(msg, type) {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 5000)
}
</script>

<style scoped>
.uk-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}
</style>