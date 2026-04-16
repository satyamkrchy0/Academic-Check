const API_BASE = 'http://localhost:5000/api/v1';
const SOCKET_BASE = 'http://localhost:5000';

let authToken = localStorage.getItem('academic_check_token') || '';
let socket;

const resultText = document.getElementById('result-text');
const historyList = document.getElementById('history-list');
const statusMessage = document.getElementById('status-message');

const authElements = {
  name: document.getElementById('name'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  error: document.getElementById('auth-error'),
  registerButton: document.getElementById('register-btn'),
  loginButton: document.getElementById('login-btn')
};

const profileElements = {
  phone: document.getElementById('phone'),
  university: document.getElementById('university'),
  degree: document.getElementById('degree'),
  graduationYear: document.getElementById('graduationYear'),
  githubUrl: document.getElementById('githubUrl'),
  linkedinUrl: document.getElementById('linkedinUrl'),
  about: document.getElementById('about'),
  error: document.getElementById('profile-error'),
  saveButton: document.getElementById('save-profile-btn')
};

const predictElements = {
  academicScore: document.getElementById('academicScore'),
  skillsRating: document.getElementById('skillsRating'),
  projectsCount: document.getElementById('projectsCount'),
  internshipExperience: document.getElementById('internshipExperience'),
  communicationSkills: document.getElementById('communicationSkills'),
  error: document.getElementById('predict-error'),
  predictButton: document.getElementById('predict-btn')
};

function setResult(text) {
  resultText.textContent = text;
}

function setStatus(text) {
  statusMessage.textContent = text;
}

function setError(target, message = '') {
  target.textContent = message;
}

function setButtonLoading(button, isLoading, loadingText) {
  if (!button.dataset.defaultText) {
    button.dataset.defaultText = button.textContent;
  }

  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : button.dataset.defaultText;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildAuthPayload(mode) {
  const payload = {
    name: authElements.name.value.trim(),
    email: authElements.email.value.trim().toLowerCase(),
    password: authElements.password.value
  };

  if (mode === 'register' && payload.name.length < 2) {
    throw new Error('Name must be at least 2 characters');
  }
  if (!isValidEmail(payload.email)) {
    throw new Error('Enter a valid email address');
  }
  if (payload.password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  return payload;
}

function buildPredictionPayload() {
  const payload = {
    academicScore: Number(predictElements.academicScore.value),
    skillsRating: Number(predictElements.skillsRating.value),
    projectsCount: Number(predictElements.projectsCount.value),
    internshipExperience: Number(predictElements.internshipExperience.value),
    communicationSkills: Number(predictElements.communicationSkills.value)
  };

  const validators = [
    [payload.academicScore >= 0 && payload.academicScore <= 100, 'Academic score must be between 0 and 100'],
    [payload.skillsRating >= 0 && payload.skillsRating <= 10, 'Skills rating must be between 0 and 10'],
    [Number.isInteger(payload.projectsCount) && payload.projectsCount >= 0 && payload.projectsCount <= 20, 'Projects count must be an integer between 0 and 20'],
    [
      Number.isInteger(payload.internshipExperience) && payload.internshipExperience >= 0 && payload.internshipExperience <= 5,
      'Internship experience must be an integer between 0 and 5'
    ],
    [payload.communicationSkills >= 0 && payload.communicationSkills <= 10, 'Communication skills must be between 0 and 10']
  ];

  const invalid = validators.find(([condition]) => !condition);
  if (invalid) {
    throw new Error(invalid[1]);
  }

  return payload;
}

function buildProfilePayload() {
  const graduationYearRaw = profileElements.graduationYear.value.trim();
  const githubUrl = profileElements.githubUrl.value.trim();
  const linkedinUrl = profileElements.linkedinUrl.value.trim();

  if (graduationYearRaw) {
    const graduationYear = Number(graduationYearRaw);
    if (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2100) {
      throw new Error('Graduation year must be between 2000 and 2100');
    }
  }

  if (githubUrl) {
    try {
      new URL(githubUrl);
    } catch (error) {
      throw new Error('GitHub URL must be valid');
    }
  }

  if (linkedinUrl) {
    try {
      new URL(linkedinUrl);
    } catch (error) {
      throw new Error('LinkedIn URL must be valid');
    }
  }

  return {
    phone: profileElements.phone.value.trim(),
    university: profileElements.university.value.trim(),
    degree: profileElements.degree.value.trim(),
    graduationYear: graduationYearRaw ? Number(graduationYearRaw) : null,
    githubUrl,
    linkedinUrl,
    about: profileElements.about.value.trim()
  };
}

function setProfileValues(profile = {}) {
  profileElements.phone.value = profile.phone || '';
  profileElements.university.value = profile.university || '';
  profileElements.degree.value = profile.degree || '';
  profileElements.graduationYear.value = profile.graduationYear || '';
  profileElements.githubUrl.value = profile.githubUrl || '';
  profileElements.linkedinUrl.value = profile.linkedinUrl || '';
  profileElements.about.value = profile.about || '';
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
    setStatus(`Authenticated: ${msg.message}`);
  });

  socket.on('prediction:created', (prediction) => {
    setResult(`Live update: ${prediction.employmentProbability}% employability`);
  });
}

async function loadHistory() {
  if (!authToken) {
    historyList.innerHTML = '';
    return;
  }

  const response = await callApi('/predict/history', 'GET');
  historyList.innerHTML = '';

  response.data.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.output.employmentProbability}% employability | readiness ${item.output.careerReadinessScore}`;
    historyList.appendChild(li);
  });
}

async function loadProfile() {
  if (!authToken) {
    setProfileValues();
    return;
  }

  const response = await callApi('/users/me', 'GET');
  setProfileValues(response.data.profile);
}

document.getElementById('register-btn').addEventListener('click', async () => {
  setError(authElements.error);
  setButtonLoading(authElements.registerButton, true, 'Registering...');

  try {
    const payload = buildAuthPayload('register');
    const response = await callApi('/auth/register', 'POST', payload);
    authToken = response.token;
    localStorage.setItem('academic_check_token', authToken);
    connectSocket();
    await Promise.all([loadHistory(), loadProfile()]);
    setStatus(`Logged in as ${response.user.email}`);
    setResult('Registration successful');
  } catch (error) {
    setError(authElements.error, error.message);
  } finally {
    setButtonLoading(authElements.registerButton, false, 'Registering...');
  }
});

document.getElementById('login-btn').addEventListener('click', async () => {
  setError(authElements.error);
  setButtonLoading(authElements.loginButton, true, 'Logging in...');

  try {
    const payload = buildAuthPayload('login');
    const response = await callApi('/auth/login', 'POST', {
      email: payload.email,
      password: payload.password
    });
    authToken = response.token;
    localStorage.setItem('academic_check_token', authToken);
    connectSocket();
    await Promise.all([loadHistory(), loadProfile()]);
    setStatus(`Logged in as ${response.user.email}`);
    setResult('Login successful');
  } catch (error) {
    setError(authElements.error, error.message);
  } finally {
    setButtonLoading(authElements.loginButton, false, 'Logging in...');
  }
});

document.getElementById('profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  setError(profileElements.error);
  setButtonLoading(profileElements.saveButton, true, 'Saving...');

  try {
    if (!authToken) {
      throw new Error('Login first to save profile');
    }

    const payload = buildProfilePayload();
    await callApi('/users/me', 'PUT', payload);
    setResult('Profile saved successfully');
  } catch (error) {
    setError(profileElements.error, error.message);
  } finally {
    setButtonLoading(profileElements.saveButton, false, 'Saving...');
  }
});

document.getElementById('prediction-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  setError(predictElements.error);
  setButtonLoading(predictElements.predictButton, true, 'Predicting...');

  try {
    if (!authToken) {
      throw new Error('Login first to run prediction');
    }

    const payload = buildPredictionPayload();
    const response = await callApi('/predict', 'POST', payload);
    const result = response.data;
    setResult(
      `Employment Probability: ${result.employmentProbability}% | Career Readiness: ${result.careerReadinessScore} | ${result.explanation}`
    );
    await loadHistory();
  } catch (error) {
    setError(predictElements.error, error.message);
  } finally {
    setButtonLoading(predictElements.predictButton, false, 'Predicting...');
  }
});

if (authToken) {
  connectSocket();
  loadHistory();
  loadProfile();
  setStatus('Authenticated session restored');
}
