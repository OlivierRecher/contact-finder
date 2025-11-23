# 🎯 Recruiter Hunter AI - Contact Finder

Modern web application to identify key contacts in a target company and draft your outreach messages, built with Nuxt 3, Vue 3, and Tailwind CSS.

## 🚀 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📋 Prerequisites

You will need two API keys:

1. **OpenAI API Key**: To analyze profiles and generate messages
   - Get your key at [platform.openai.com](https://platform.openai.com/api-keys)

2. **Serper.dev API Key**: To search for LinkedIn profiles via Google X-Ray
   - Get your key at [serper.dev](https://serper.dev)

## 🎨 Features

- 🔍 Search for LinkedIn profiles in a target company
- 🤖 AI analysis of profiles with relevance scoring
- ✉️ Automatic generation of personalized messages
- 💾 Local storage of API keys (localStorage)
- 🎨 Modern and responsive interface with Tailwind CSS

## 📝 Usage

1. Enter your API keys in the left sidebar
2. Fill out the form:
   - Target position
   - Target company
   - Job description (optional)
   - Your profile/CV summary
3. Click "Launch Search"
4. Review identified contacts with their relevance score
5. Click "Draft Message" to generate a personalized message
6. Copy the message to your clipboard

## 🛠️ Technologies

- **Nuxt 3**: Full-stack Vue.js framework
- **Vue 3**: Progressive JavaScript framework
- **TypeScript**: Static typing
- **Tailwind CSS**: Utility-first CSS framework
- **OpenAI API**: AI content analysis and generation
- **Serper.dev API**: Advanced web search

## 📦 Production Build

```bash
npm run build
```

## 🔒 Security

API keys are stored locally in the browser (localStorage) and are never sent to any third-party server other than the API services used.

