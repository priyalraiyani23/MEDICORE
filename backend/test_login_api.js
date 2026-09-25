import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  const email = 'priyalraiyani23@gmail.com';
  const password = '123456'; // let's try 123456 to see if it succeeds

  try {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    console.log("Status Code:", res.status);
    const contentType = res.headers.get("content-type");
    console.log("Content-Type:", contentType);
    const text = await res.text();
    console.log("Response Body:", text);
  } catch (error) {
    console.error("Fetch error:", error);
  }
};
test();
