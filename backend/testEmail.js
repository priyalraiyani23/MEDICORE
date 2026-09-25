import { sendEmail } from "./src/util/sendEmail.js";

async function test() {
    console.log("Testing email sending...");
    const result = await sendEmail("23se02cs084@ppsu.ac.in", "Test Email", "<h1>This is a test email</h1>");
    console.log("Result:", result);
}
test();