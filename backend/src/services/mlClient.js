const axios = require('axios');

async function requestPrediction(features) {
  const baseURL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

  const response = await axios.post(`${baseURL}/predict`, features, {
    timeout: 10000
  });

  return response.data;
}

async function requestLLMExplanation(payload) {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  const baseURL = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

  const response = await axios.post(
    `${baseURL}/chat/completions`,
    {
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a concise career mentor.'
        },
        {
          role: 'user',
          content: `Explain this prediction and suggest two concrete improvements: ${JSON.stringify(payload)}`
        }
      ],
      temperature: 0.4
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      timeout: 10000
    }
  );

  return response.data.choices?.[0]?.message?.content || null;
}

module.exports = {
  requestPrediction,
  requestLLMExplanation
};
