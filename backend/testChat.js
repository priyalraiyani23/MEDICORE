const login = async () => {
  const loginRes = await fetch('http://localhost:5000/api/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TestUser', email: 'test12@example.com', password: 'password123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  if (!token) {
    const loginRes2 = await fetch('http://localhost:5000/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test12@example.com', password: 'password123' })
    });
    const loginData2 = await loginRes2.json();
    var finalToken = loginData2.token;
  } else {
    var finalToken = token;
  }

  const newChatRes = await fetch('http://localhost:5000/api/chat/new', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + finalToken }
  });
  const chatData = await newChatRes.json();
  const conversationId = chatData.conversation._id;

  const streamRes = await fetch('http://localhost:5000/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + finalToken },
    body: JSON.stringify({ conversationId, message: 'headache' })
  });
  
  const text = await streamRes.text();
  console.log('Output:', text);
};
login();
