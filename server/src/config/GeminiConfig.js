const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");
const  { processImageFiles, processImageUrls } = require("../utils/ImageUtils");

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    safetySettings: safetySettings,
});

// const fixedPprompt= "give the result in json format";
   
const chat = async (chatHistory, prompt) => {
  console.log("here");
  console.log(chatHistory[0]);
    const chat = model.startChat({
        history: (chatHistory || []).map(message => ({
            role: message?.role,
            parts: [{ text: message?.message }]
        })),
        generationConfig: {
            maxOutputTokens: 100000,
        },
    });

    try{
        const result = await chat.sendMessage(prompt);
        return result?.response?.text();
    } catch (error) {
        console.error("chat | error", error);
    }
}

const textOnly = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        return result?.response?.text();
    } catch (error) {
        console.error("textOnly | error", error);
        return { Error: "Uh oh! Caught error while fetching AI response" };
    }
}

const textAndImageUrl = async (prompt, image) => {  
    const imageArray = [];
    imageArray.push(image);

    let imageParts = await processImageUrls(imageArray);
  
    try {
      const result = await model.generateContent([prompt, ...imageParts]);
      return result?.response?.text();
    } catch (error) {
      console.error("textAndImage | error", error);
    }
};

const textAndImageFile = async (prompt, image) => {  
  const images = [];
  images.push(image);

  let imageParts = await processImageFiles(images);

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    return result?.response?.text();
  } catch (error) {
    console.error("textAndImage | error", error);
  }
};

module.exports = {
  chat,
  textOnly,
  textAndImageUrl,
  textAndImageFile,
};
