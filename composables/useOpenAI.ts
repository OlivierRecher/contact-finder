interface Profile {
  title: string
  snippet: string
  link: string
}

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

export class OpenAIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message)
    this.name = 'OpenAIError'
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const fetchWithRetry = async (
  url: string,
  options: any,
  maxRetries = 3,
  baseDelay = 1000
): Promise<any> => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await $fetch(url, options)
      return response
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.status || error?.response?.status
      
      // Erreur 429 - Rate limit
      if (statusCode === 429) {
        // Essayer d'extraire retry-after de différentes façons selon la structure de l'erreur
        let retryAfter: number
        if (error?.response?.headers?.['retry-after']) {
          retryAfter = parseInt(error.response.headers['retry-after'])
        } else if (error?.response?.headers?.['Retry-After']) {
          retryAfter = parseInt(error.response.headers['Retry-After'])
        } else if (error?.headers?.['retry-after']) {
          retryAfter = parseInt(error.headers['retry-after'])
        } else if (error?.headers?.['Retry-After']) {
          retryAfter = parseInt(error.headers['Retry-After'])
        } else {
          // Backoff exponentiel par défaut
          retryAfter = Math.pow(2, attempt) * baseDelay / 1000
        }
        
        if (attempt < maxRetries - 1) {
          const delayMs = retryAfter * 1000
          console.log(`Rate limit atteint. Nouvelle tentative dans ${retryAfter}s...`)
          await sleep(delayMs)
          continue
        } else {
          throw new OpenAIError(
            `Limite de requêtes atteinte. Veuillez patienter ${retryAfter} secondes avant de réessayer.`,
            429,
            retryAfter
          )
        }
      }
      
      // Erreur 401 - Clé API invalide
      if (statusCode === 401) {
        throw new OpenAIError('Clé API OpenAI invalide. Veuillez vérifier votre clé dans la configuration.', 401)
      }
      
      // Erreur 500 - Erreur serveur
      if (statusCode >= 500) {
        if (attempt < maxRetries - 1) {
          const delayMs = Math.pow(2, attempt) * baseDelay
          console.log(`Erreur serveur. Nouvelle tentative dans ${delayMs}ms...`)
          await sleep(delayMs)
          continue
        } else {
          throw new OpenAIError('Erreur serveur OpenAI. Veuillez réessayer plus tard.', statusCode)
        }
      }
      
      // Autres erreurs
      throw new OpenAIError(
        error?.message || error?.data?.message || 'Une erreur est survenue avec l\'API OpenAI.',
        statusCode
      )
    }
  }
  
  throw new OpenAIError('Échec après plusieurs tentatives.')
}

export const useOpenAI = () => {
  const analyzeProfiles = async (
    profiles: Profile[],
    targetRole: string,
    jobDesc: string,
    apiKey: string
  ): Promise<AnalyzedContact[]> => {
    const profilesText = profiles
      .map((p, i) => `ID: ${i}, Titre: ${p.title}, Snippet: ${p.snippet}, Link: ${p.link}`)
      .join('\n')

    const prompt = `
Tu es un expert en recrutement. Voici une liste de résultats de recherche LinkedIn pour une personne cherchant le poste de '${targetRole}'.
Fiche de poste (contexte): ${jobDesc || 'Non fournie'}

Analyse chaque profil et retourne une liste JSON stricte. Pour chaque profil, identifie :
1. Le Nom (extrait du titre).
2. Le Rôle actuel.
3. Le "Potential Score" (0-100) : Probabilité que cette personne puisse m'embaucher ou me faire passer un entretien.
4. Le "Type" : "Hiring Manager" (le chef potentiel), "Recruiter" (RH), "Peer" (Collègue), ou "Irrelevant".
5. Une "Raison" courte (une phrase) expliquant pourquoi ce contact est pertinent.
6. L'adresse email (si disponible dans le snippet, sinon laisse vide "").
7. Le LinkedIn URL.

Voici les profils :
${profilesText}

Réponds UNIQUEMENT avec le tableau JSON (pas de markdown, pas de texte avant/après).
Format: [{"id": 0, "name": "...", "role": "...", "score": 80, "type": "...", "reason": "...", "link": "...", "email": "..."}]
`

    try {
      const response = await fetchWithRetry(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: {
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: 'Tu es un assistant JSON utile.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0
          }
        }
      )

      const content = (response as any).choices[0].message.content
      const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim()
      return JSON.parse(cleanedContent) as AnalyzedContact[]
    } catch (error) {
      console.error('Erreur d\'analyse OpenAI:', error)
      throw error
    }
  }

  const draftMessage = async (
    contactInfo: AnalyzedContact,
    targetRole: string,
    userCvContext: string,
    apiKey: string
  ): Promise<string> => {
    const prompt = `
Rédige un message de connexion LinkedIn (max 300 caractères) et un Email froid (court) pour ce contact.

Moi : Je cherche un poste de ${targetRole}.
Mon contexte : ${userCvContext}

Cible :
Nom : ${contactInfo.name}
Rôle : ${contactInfo.role}
Type : ${contactInfo.type}

Le ton doit être professionnel, direct mais chaleureux. Ne sois pas "spammy".
Si c'est un Hiring Manager, parle de résoudre ses problèmes.
Si c'est un Recruiter, parle de correspondance au profil.
`

    try {
      const response = await fetchWithRetry(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: {
            model: 'gpt-4o',
            messages: [
              { role: 'user', content: prompt }
            ]
          }
        }
      )

      return (response as any).choices[0].message.content
    } catch (error) {
      console.error('Erreur de génération de message:', error)
      throw error
    }
  }

  return {
    analyzeProfiles,
    draftMessage
  }
}

