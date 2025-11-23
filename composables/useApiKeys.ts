export const useApiKeys = () => {
  const getOpenAiKey = (): string => {
    if (process.client) {
      return localStorage.getItem('openai_api_key') || ''
    }
    return ''
  }

  const getSerperKey = (): string => {
    if (process.client) {
      return localStorage.getItem('serper_api_key') || ''
    }
    return ''
  }

  const setOpenAiKey = (key: string): void => {
    if (process.client) {
      localStorage.setItem('openai_api_key', key)
    }
  }

  const setSerperKey = (key: string): void => {
    if (process.client) {
      localStorage.setItem('serper_api_key', key)
    }
  }

  return {
    getOpenAiKey,
    getSerperKey,
    setOpenAiKey,
    setSerperKey
  }
}

