const API_BASE = 'http://localhost:5000/api/v1';
const SOCKET_BASE = 'http://localhost:5000';

let authToken = localStorage.getItem('academic_check_token') || '';
let socket;

const resultText = document.getElementById('result-text');
const historyList = document.getElementById('history-list');

function setResult(text) {
  resultText.textContent = text;
}

async function callApi(path, method, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }
  return data;
}

function connectSocket() {
  if (!authToken) return;
  socket?.disconnect();
  socket = io(SOCKET_BASE, {
    auth: { token: authToken }
  });

  socket.on('connection:ok', (msg) => {
    setResult(msg.message);
  });

  socket.on('prediction:created', (prediction) => {
    setResult(`Live update: ${prediction.employmentProbability}% employability`);
  });
}

async function loadHistory() {
  if (!authToken) return;
  const response = await callApi('/predict/history', 'GET');
  historyList.innerHTML = '';

  response.data.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.output.employmentProbability}% employability | readiness ${item.output.careerReadinessScore}`;
    historyList.appendChild(li);
  });
}

document.getElementById('register-btn').addEventListener('click', async () => {
  try {
    const payload = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
    const response = await callApi('/auth/register', 'POST', payload);
    authToken = response.token;
    localStorage.setItem('academic_check_token', authToken);
    connectSocket();
    await loadHistory();
    setResult('Registration successful');
  } catch (error) {
    setResult(error.message);
  }
});

document.getElementById('login-btn').addEventListener('click', async () => {
  try {
    const payload = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
    const response = await callApi('/auth/login', 'POST', payload);
    authToken = response.token;
    localStorage.setItem('academic_check_token', authToken);
    connectSocket();
    await loadHistory();
    setResult('Login successful');
  } catch (error) {
    setResult(error.message);
  }
});

document.getElementById('prediction-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const payload = {
      academicScore: Number(document.getElementById('academicScore').value),
      skillsRating: Number(document.getElementById('skillsRating').value),
      projectsCount: Number(document.getElementById('projectsCount').value),
      internshipExperience: Number(document.getElementById('internshipExperience').value),
      communicationSkills: Number(document.getElementById('communicationSkills').value)
    };

    const response = await callApi('/predict', 'POST', payload);
    const result = response.data;
    setResult(
      `Employment Probability: ${result.employmentProbability}% | Career Readiness: ${result.careerReadinessScore} | ${result.explanation}`
    );
    await loadHistory();
  } catch (error) {
    setResult(error.message);
  }
});

connectSocket();
loadHistory();
