const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runChat() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  const result = await chat.sendMessage("write a haiku about ai");
  console.log(result.response.text());
}

runChat();