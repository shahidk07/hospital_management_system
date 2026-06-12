import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

// Export Groq client (reusing the gemini.js filename to preserve module import sanity)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'placeholder_groq_key'
});

export default groq;
