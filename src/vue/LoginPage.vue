<template>
  <div class="uk-container uk-container-center uk-margin-top">
    <div class="uk-grid uk-child-width-1-3@m uk-child-width-1-1@s uk-flex-center">
      <div>
        <div class="uk-card uk-card-default uk-card-body">
          <h3 class="uk-card-title uk-text-center">Connexion</h3>

          <!-- Formulaire de connexion -->
          <form @submit.prevent="login" v-if="!isRegistering">
            <div class="uk-margin">
              <input
                v-model="email"
                class="uk-input"
                type="email"
                placeholder="Email"
                required>
            </div>
            <div class="uk-margin">
              <input
                v-model="password"
                class="uk-input"
                type="password"
                placeholder="Mot de passe"
                required>
            </div>
            <div class="uk-margin">
              <button class="uk-button uk-button-primary uk-width-1-1" type="submit" :disabled="isLoading">
                <span v-if="isLoading" uk-spinner="ratio: 0.5"></span>
                {{ isLoading ? 'Connexion...' : 'Se connecter' }}
              </button>
            </div>
            <div class="uk-text-center">
              <p>
                <a href="#" @click="isRegistering = true">Créer un compte</a> |
                <a href="#" @click="showResetPassword = true">Mot de passe oublié ?</a>
              </p>
            </div>
          </form>

          <!-- Formulaire d'inscription -->
          <form @submit.prevent="register" v-if="isRegistering">
            <div class="uk-margin">
              <input v-model="registerForm.email" class="uk-input" type="email" placeholder="Email" required>
            </div>
            <div class="uk-margin">
              <input v-model="registerForm.pseudo" class="uk-input" type="text" placeholder="Pseudo" required>
            </div>
            <div class="uk-margin">
              <input v-model="registerForm.phone" class="uk-input" type="tel" placeholder="Téléphone" required>
            </div>
            <div class="uk-margin">
              <input v-model="registerForm.city" class="uk-input" type="text" placeholder="Ville" required>
            </div>
            <div class="uk-margin">
              <input v-model="registerForm.cityCode" class="uk-input" type="text" placeholder="Code postal" required>
            </div>
            <div class="uk-margin">
              <input v-model="registerForm.password" class="uk-input" type="password" placeholder="Mot de passe" required>
            </div>
            <div class="uk-margin">
              <input v-model="registerForm.passwordConfirm" class="uk-input" type="password" placeholder="Confirmer le mot de passe" required>
            </div>
            <div class="uk-margin">
              <button class="uk-button uk-button-primary uk-width-1-1" type="submit" :disabled="isLoading">
                <span v-if="isLoading" uk-spinner="ratio: 0.5"></span>
                {{ isLoading ? 'Inscription...' : "S'inscrire" }}
              </button>
            </div>
            <div class="uk-text-center">
              <p><a href="#" @click="isRegistering = false">Déjà un compte ? Se connecter</a></p>
            </div>
          </form>

          <!-- Modal Reset Password -->
          <div v-if="showResetPassword" class="uk-modal uk-open" style="display: block;">
            <div class="uk-modal-dialog">
              <button class="uk-modal-close-default" type="button" @click="showResetPassword = false" uk-close></button>
              <div class="uk-modal-header">
                <h2 class="uk-modal-title">Réinitialiser le mot de passe</h2>
              </div>
              <div class="uk-modal-body">
                <form @submit.prevent="resetPassword">
                  <div class="uk-margin">
                    <input v-model="resetEmail" class="uk-input" type="email" placeholder="Votre email" required>
                  </div>
                  <div class="uk-margin">
                    <button class="uk-button uk-button-primary uk-width-1-1" type="submit" :disabled="isLoading">
                      Réinitialiser
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// État réactif
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const isRegistering = ref(false)
const showResetPassword = ref(false)
const resetEmail = ref('')
const message = ref('')
const messageType = ref('error')

// Formulaire d'inscription
const registerForm = ref({
  email: '',
  pseudo: '',
  phone: '',
  city: '',
  cityCode: '',
  password: '',
  passwordConfirm: ''
})

// API URL
const API_BASE = 'http://localhost:3000'

// Vérifier si l'utilisateur est déjà connecté
onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    checkTokenValidity(token)
  }
})

// Fonction pour vérifier la validité du token
async function checkTokenValidity(token) {
  try {
    const response = await fetch(`${API_BASE}/check`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      // Token valide, rediriger vers les articles
      router.push('/articles')
    } else {
      // Token invalide, le supprimer
      localStorage.removeItem('authToken')
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error)
    localStorage.removeItem('authToken')
  }
}

// Fonction de connexion
async function login() {
  if (!email.value || !password.value) {
    showMessage('Veuillez remplir tous les champs', 'error')
    return
  }

  isLoading.value = true
  message.value = ''

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const result = await response.json()

    if (result.code === '200') {
      // Sauvegarder le token
      localStorage.setItem('authToken', result.data)
      showMessage('Connexion réussie !', 'success')

      // Rediriger vers la page des articles
      setTimeout(() => {
        router.push('/articles')
      }, 1000)
    } else {
      showMessage(result.message || 'Erreur de connexion', 'error')
    }
  } catch (error) {
    console.error('Erreur:', error)
    showMessage('Erreur de connexion au serveur', 'error')
  } finally {
    isLoading.value = false
  }
}

// Fonction d'inscription
async function register() {
  if (registerForm.value.password !== registerForm.value.passwordConfirm) {
    showMessage('Les mots de passe ne correspondent pas', 'error')
    return
  }

  isLoading.value = true
  message.value = ''

  try {
    const response = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerForm.value)
    })

    const result = await response.json()

    if (result.code === '200') {
      showMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.', 'success')
      isRegistering.value = false
      // Réinitialiser le formulaire
      registerForm.value = {
        email: '',
        pseudo: '',
        phone: '',
        city: '',
        cityCode: '',
        password: '',
        passwordConfirm: ''
      }
    } else {
      showMessage(result.message || 'Erreur lors de l\'inscription', 'error')
    }
  } catch (error) {
    console.error('Erreur:', error)
    showMessage('Erreur de connexion au serveur', 'error')
  } finally {
    isLoading.value = false
  }
}

// Fonction de réinitialisation du mot de passe
async function resetPassword() {
  if (!resetEmail.value) {
    showMessage('Veuillez entrer votre email', 'error')
    return
  }

  isLoading.value = true

  try {
    const response = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: resetEmail.value
      })
    })

    const result = await response.json()

    if (result.code === '200') {
      showMessage(`Nouveau mot de passe: ${result.data}`, 'success')
      showResetPassword.value = false
      resetEmail.value = ''
    } else {
      showMessage(result.message || 'Erreur lors de la réinitialisation', 'error')
    }
  } catch (error) {
    console.error('Erreur:', error)
    showMessage('Erreur de connexion au serveur', 'error')
  } finally {
    isLoading.value = false
  }
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
.uk-modal.uk-open {
  background: rgba(0, 0, 0, 0.6);
}
</style>