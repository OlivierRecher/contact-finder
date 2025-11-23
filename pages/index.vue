<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Sidebar pour les clés API -->
    <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10 overflow-y-auto">
      <div class="p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-6">🔑 Configuration</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Clé API OpenAI
            </label>
            <input
              v-model="openaiApiKey"
              type="password"
              placeholder="sk-..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="saveOpenAiKey"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Clé API Serper.dev
            </label>
            <input
              v-model="serperApiKey"
              type="password"
              placeholder="Votre clé Serper"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="saveSerperKey"
            />
          </div>
        </div>
        
        <div class="mt-6 p-3 bg-blue-50 rounded-md">
          <p class="text-xs text-blue-800">
            Nécessaire pour scanner le web et analyser les profils.
          </p>
        </div>
      </div>
    </div>

    <!-- Contenu principal -->
    <div class="ml-64">
      <div class="max-w-7xl mx-auto px-8 py-12">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-3">
            🎯 Recruiter Hunter AI : Trouvez votre futur patron
          </h1>
          <p class="text-gray-600 text-lg">
            Cette application utilise l'IA pour identifier les contacts clés dans une entreprise cible 
            et rédiger vos messages d'approche.
          </p>
        </div>

        <!-- Formulaire de recherche -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <!-- Colonne gauche -->
          <div class="space-y-6">
            <div>
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">1. Définir la cible</h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Poste visé
                  </label>
                  <input
                    v-model="targetRole"
                    type="text"
                    placeholder="Chef de Projet Digital"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Entreprise cible
                  </label>
                  <input
                    v-model="targetCompany"
                    type="text"
                    placeholder="L'Oréal"
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Description du poste (optionnel)
                  </label>
                  <textarea
                    v-model="jobDescription"
                    rows="4"
                    placeholder="Copiez/Collez la description du poste..."
                    class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">2. Votre Profil (pour l'IA)</h2>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Vos points forts / Résumé CV
                </label>
                <textarea
                  v-model="userContext"
                  rows="3"
                  placeholder="5 ans d'expérience, expert en agile, bilingue anglais."
                  class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              @click="handleSearch"
              :disabled="isLoading || !canSearch"
              class="w-full bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <span v-if="isLoading" class="animate-spin">⏳</span>
              <span v-else>🔍</span>
              {{ isLoading ? 'Recherche en cours...' : 'Lancer la recherche' }}
            </button>

            <div v-if="error" class="p-4 rounded-md" :class="error.includes('⏱️') ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'">
              <p class="text-sm font-medium" :class="error.includes('⏱️') ? 'text-yellow-800' : 'text-red-800'">
                {{ error }}
              </p>
              <p v-if="error.includes('⏱️')" class="text-xs text-yellow-700 mt-2">
                💡 Astuce : Les limites de taux sont basées sur votre plan OpenAI. Vous pouvez attendre quelques instants ou mettre à niveau votre plan.
              </p>
            </div>
          </div>

          <!-- Colonne droite - Résultats -->
          <div v-if="contacts.length > 0" class="space-y-6">
            <div>
              <h2 class="text-2xl font-semibold text-gray-800 mb-4">3. Contacts Identifiés</h2>
              
              <div class="space-y-4 max-h-[600px] overflow-y-auto">
                <div
                  v-for="contact in filteredContacts"
                  :key="contact.id"
                  class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                      <h3 class="text-xl font-semibold text-gray-900 mb-1">
                        {{ contact.name }}
                      </h3>
                      <p class="text-gray-600 font-medium mb-2">{{ contact.role }}</p>
                      <p class="text-gray-500 text-sm italic mb-3">{{ contact.reason }}</p>
                      <a
                        :href="contact.link"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Voir le profil LinkedIn →
                      </a>
                    </div>
                    
                    <div class="flex flex-col items-end gap-2 ml-4">
                      <div class="text-right">
                        <div class="text-2xl font-bold text-blue-600">{{ contact.score }}</div>
                        <div class="text-xs text-gray-500">/100</div>
                      </div>
                      <span
                        :class="getBadgeClass(contact.type)"
                        class="px-3 py-1 rounded-full text-xs font-semibold"
                      >
                        {{ contact.type }}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    @click="generateMessage(contact)"
                    :disabled="isGenerating"
                    class="w-full mt-4 bg-gray-100 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
                  >
                    ✉️ Rédiger un message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Génération de message -->
        <div v-if="selectedContact && draftMessage" class="mt-8">
          <div class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 class="text-2xl font-semibold text-gray-800 mb-4">
              4. Brouillon pour {{ selectedContact.name }}
            </h2>
            
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Message suggéré (Copiable)
              </label>
              <textarea
                :value="draftMessage"
                rows="10"
                readonly
                class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 font-mono text-sm"
              />
            </div>
            
            <button
              @click="copyToClipboard"
              class="bg-green-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-green-700 transition-colors"
            >
              📋 Copier dans le presse-papier
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useApiKeys } from '~/composables/useApiKeys'
import { useSerper } from '~/composables/useSerper'
import { useOpenAI, OpenAIError } from '~/composables/useOpenAI'

interface AnalyzedContact {
  id: number
  name: string
  role: string
  score: number
  type: 'Hiring Manager' | 'Recruiter' | 'Peer' | 'Irrelevant'
  reason: string
  link: string
  email?: string
}

const { getOpenAiKey, getSerperKey, setOpenAiKey, setSerperKey } = useApiKeys()
const { searchProfiles } = useSerper()
const { analyzeProfiles, draftMessage: generateDraftMessage } = useOpenAI()

const openaiApiKey = ref('')
const serperApiKey = ref('')
const targetRole = ref('Chef de Projet Digital')
const targetCompany = ref("L'Oréal")
const jobDescription = ref('')
const userContext = ref('5 ans d\'expérience, expert en agile, bilingue anglais.')
const contacts = ref<AnalyzedContact[]>([])
const selectedContact = ref<AnalyzedContact | null>(null)
const draftMessage = ref('')
const isLoading = ref(false)
const isGenerating = ref(false)
const error = ref('')

const canSearch = computed(() => {
  return openaiApiKey.value && serperApiKey.value && targetRole.value && targetCompany.value
})

const filteredContacts = computed(() => {
  return contacts.value
    .filter(c => c.score > 40)
    .sort((a, b) => b.score - a.score)
})

const getBadgeClass = (type: string) => {
  const classes: Record<string, string> = {
    'Hiring Manager': 'bg-purple-100 text-purple-800',
    'Recruiter': 'bg-blue-100 text-blue-800',
    'Peer': 'bg-green-100 text-green-800',
    'Irrelevant': 'bg-gray-100 text-gray-800'
  }
  return classes[type] || classes.Irrelevant
}

const saveOpenAiKey = () => {
  setOpenAiKey(openaiApiKey.value)
}

const saveSerperKey = () => {
  setSerperKey(serperApiKey.value)
}

const handleSearch = async () => {
  if (!canSearch.value) {
    error.value = 'Veuillez entrer vos clés API dans la barre latérale pour commencer.'
    return
  }

  error.value = ''
  isLoading.value = true
  contacts.value = []
  selectedContact.value = null
  draftMessage.value = ''

  try {
    // 1. Recherche des profils
    const rawResults = await searchProfiles(targetCompany.value, targetRole.value, serperApiKey.value)
    
    if (!rawResults || rawResults.length === 0) {
      error.value = 'Aucun résultat trouvé. Essayez de changer le nom de l\'entreprise.'
      isLoading.value = false
      return
    }

    // 2. Analyse IA
    const analyzed = await analyzeProfiles(
      rawResults,
      targetRole.value,
      jobDescription.value,
      openaiApiKey.value
    )

    contacts.value = analyzed
  } catch (err: any) {
    if (err instanceof OpenAIError) {
      if (err.statusCode === 429 && err.retryAfter) {
        error.value = `⏱️ Limite de requêtes atteinte. Veuillez patienter ${err.retryAfter} secondes avant de réessayer.`
      } else {
        error.value = `❌ ${err.message}`
      }
    } else {
      error.value = err.message || 'Une erreur est survenue lors de la recherche.'
    }
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const generateMessage = async (contact: AnalyzedContact) => {
  selectedContact.value = contact
  isGenerating.value = true
  draftMessage.value = ''

  try {
    const message = await generateDraftMessage(
      contact,
      targetRole.value,
      userContext.value,
      openaiApiKey.value
    )
    draftMessage.value = message
  } catch (err: any) {
    if (err instanceof OpenAIError) {
      if (err.statusCode === 429 && err.retryAfter) {
        error.value = `⏱️ Limite de requêtes atteinte. Veuillez patienter ${err.retryAfter} secondes avant de réessayer.`
      } else {
        error.value = `❌ ${err.message}`
      }
    } else {
      error.value = err.message || 'Une erreur est survenue lors de la génération du message.'
    }
    console.error(err)
  } finally {
    isGenerating.value = false
  }
}

const copyToClipboard = async () => {
  if (draftMessage.value) {
    try {
      await navigator.clipboard.writeText(draftMessage.value)
      alert('Message copié dans le presse-papier !')
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }
}

onMounted(() => {
  openaiApiKey.value = getOpenAiKey()
  serperApiKey.value = getSerperKey()
})
</script>

