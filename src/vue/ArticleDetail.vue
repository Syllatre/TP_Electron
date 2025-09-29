<template>
  <div class="uk-container uk-margin-top">
    <!-- Bouton retour -->
    <div class="uk-margin-bottom">
      <button @click="goBack" class="uk-button uk-button-default uk-button-small">
        <span uk-icon="chevron-left"></span> Retour à la liste
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="uk-text-center uk-margin">
      <span uk-spinner="ratio: 2"></span>
      <p>Chargement de l'article...</p>
    </div>

    <!-- Article non trouvé -->
    <div v-else-if="!article" class="uk-text-center uk-margin">
      <div class="uk-alert-danger" uk-alert>
        <p>Article non trouvé</p>
      </div>
    </div>

    <!-- Détails de l'article -->
    <div v-else class="uk-card uk-card-default">
      <!-- Image de l'article -->
      <div class="uk-card-media-top">
        <img :src="article.imgPath" :alt="article.title" class="uk-width-1-1" style="max-height: 400px; object-fit: cover;">
      </div>

      <!-- Contenu de l'article -->
      <div class="uk-card-body">
        <!-- Titre -->
        <h1 class="uk-card-title uk-margin-bottom">{{ article.title }}</h1>

        <!-- Métadonnées -->
        <div class="uk-margin-bottom uk-text-meta">
          <span uk-icon="user"></span> Par: <strong>{{ article.author }}</strong>
          <span class="uk-margin-left" uk-icon="calendar"></span> ID: {{ article.id }}
        </div>

        <!-- Séparateur -->
        <hr>

        <!-- Description -->
        <div class="uk-margin-large-bottom">
          <h3>Description</h3>
          <p class="uk-text-lead">{{ article.desc }}</p>
        </div>

        <!-- Actions -->
        <div class="uk-card-footer uk-text-center">
          <button @click="goBack" class="uk-button uk-button-primary uk-margin-right">
            Retour à la liste
          </button>
          <button @click="showEditForm = true" class="uk-button uk-button-secondary uk-margin-right">
            Modifier
          </button>
          <button @click="deleteArticle" class="uk-button uk-button-danger" :disabled="isDeleting">
            <span v-if="isDeleting" uk-spinner="ratio: 0.5"></span>
            {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal pour modifier l'article -->
    <div v-if="showEditForm" class="uk-modal uk-open" style="display: block;">
      <div class="uk-modal-dialog">
        <button class="uk-modal-close-default" type="button" @click="closeEditForm" uk-close></button>
        <div class="uk-modal-header">
          <h2 class="uk-modal-title">Modifier l'article</h2>
        </div>
        <div class="uk-modal-body">
          <form @submit.prevent="updateArticle">
            <div class="uk-margin">
              <label class="uk-form-label">Titre</label>
              <input v-model="editForm.title" class="uk-input" type="text" placeholder="Titre" required>
            </div>
            <div class="uk-margin">
              <label class="uk-form-label">Description</label>
              <textarea v-model="editForm.desc" class="uk-textarea" rows="5" placeholder="Description" required></textarea>
            </div>
            <div class="uk-margin">
              <button class="uk-button uk-button-primary uk-width-1-1" type="submit" :disabled="isUpdating">
                <span v-if="isUpdating" uk-spinner="ratio: 0.5"></span>
                {{ isUpdating ? 'Modification...' : 'Modifier l\'article' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Messages d'erreur/succès -->
    <div v-if="message" class="uk-margin uk-text-center" :class="messageType === 'success' ? 'uk-text-success' : 'uk-text-danger'">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// État réactif
const article = ref(null)
const isLoading = ref(true)
const isDeleting = ref(false)
const isUpdating = ref(false)
const showEditForm = ref(false)
const message = ref('')
const messageType = ref('error')

// Formulaire de modification
const editForm = ref({
  id: '',
  title: '',
  desc: '',
  author: '',
  imgPath: ''
})

// API URL
const API_BASE = 'http://localhost:3000'

// Au montage du composant
onMounted(() => {
  loadArticle()
})

// Charger l'article par son ID
async function loadArticle() {
  const articleId = route.params.id

  if (!articleId) {
    showMessage('ID de l\'article manquant', 'error')
    isLoading.value = false
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE}/articles/${articleId}`)
    const result = await response.json()

    if (result.code === '200') {
      article.value = result.data
      // Pré-remplir le formulaire de modification
      editForm.value = {
        id: result.data.id,
        title: result.data.title,
        desc: result.data.desc,
        author: result.data.author,
        imgPath: result.data.imgPath
      }
    } else {
      showMessage(result.message || 'Article non trouvé', 'error')
    }
  } catch (error) {
    console.error('Erreur:', error)
    showMessage('Erreur de connexion au serveur', 'error')
  } finally {
    isLoading.value = false
  }
}

// Supprimer l'article
async function deleteArticle() {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
    return
  }

  isDeleting.value = true

  try {
    const response = await fetch(`${API_BASE}/articles/${article.value.id}`, {
      method: 'DELETE'
    })

    const result = await response.json()

    if (result.code === '200') {
      showMessage('Article supprimé avec succès', 'success')
      // Rediriger vers la liste après 2 secondes
      setTimeout(() => {
        router.push('/articles')
      }, 2000)
    } else {
      showMessage('Erreur lors de la suppression', 'error')
    }
  } catch (error) {
    console.error('Erreur:', error)
    showMessage('Erreur de connexion au serveur', 'error')
  } finally {
    isDeleting.value = false
  }
}

// Modifier l'article
async function updateArticle() {
  isUpdating.value = true

  try {
    // Conserver l'URL de l'image et l'auteur originaux
    const articleData = {
      ...editForm.value,
      imgPath: article.value.imgPath, // Utiliser l'URL originale
      author: article.value.author     // Utiliser l'auteur original
    }

    const response = await fetch(`${API_BASE}/articles/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleData)
    })

    const result = await response.json()

    if (result.code === '200') {
      // Mettre à jour l'article affiché
      article.value = { ...result.data }
      showMessage('Article modifié avec succès', 'success')
      closeEditForm()
    } else {
      showMessage('Erreur lors de la modification', 'error')
    }
  } catch (error) {
    console.error('Erreur:', error)
    showMessage('Erreur de connexion au serveur', 'error')
  } finally {
    isUpdating.value = false
  }
}

// Fermer le formulaire de modification
function closeEditForm() {
  showEditForm.value = false
}

// Retourner à la liste des articles
function goBack() {
  router.push('/articles')
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
.uk-card-media-top img {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.uk-card-title {
  font-size: 2rem;
  line-height: 1.2;
}

.uk-text-lead {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #666;
}


.uk-modal.uk-open {
  background: rgba(0, 0, 0, 0.6);
}
</style>