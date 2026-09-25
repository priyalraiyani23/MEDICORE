import jwt from 'jsonwebtoken';
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

const secret = "medicore@123456"; // from .env JWT_SECRET
const token = jwt.sign({ id: "dummyadminid", role: 'admin' }, secret, { expiresIn: '1h' });

async function testUpload() {
  // First, let's create a pending test directly in the DB to test uploading
  console.log("Token:", token);
  // I will just fetch all pending tests and try to upload to the first one.
  const getPending = await fetch('http://localhost:5000/api/reports/pending', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const pendingData = await getPending.json();
  if (!pendingData.success || pendingData.data.length === 0) {
    console.log("No pending tests found.");
    return;
  }
  const testId = pendingData.data[0]._id;
  console.log("Found pending test:", testId);

  // Now let's try to upload a dummy file
  fs.writeFileSync('dummy.jpg', 'fake image data');
  const fd = new FormData();
  fd.append('fileUrl', fs.createReadStream('dummy.jpg'));
  fd.append('resultSummary', 'This is a test summary from script.');

  const uploadRes = await fetch(`http://localhost:5000/api/reports/test/${testId}/upload`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: fd
  });
  const uploadData = await uploadRes.json();
  console.log("Upload result:", uploadData);
}

testUpload();
