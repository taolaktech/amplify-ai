const axios = require('axios');

module.exports = async function generateTemplateData({
  productName,
  productDescription,
  productCategory,
  productAudience,
  productOccasion,
  productFeatures,
  channel,
}, tone) {

  // Ad channel specifics
  let channelDetails = "";
  if (channel === "instagram") {
    channelDetails = "Format vertically (1080x1920) for Instagram Reels, Stories, and Shopping.";
  } else if (channel === "googleads") {
    channelDetails = "Format as Google Ads: short headline, concise description, focus on keywords.";
  } else if (channel === "facebook") {
    channelDetails = "Format for Facebook Feed & Ads. Use engaging, shareable content.";
  }
  // Tone specifics
  let quirks = "";
  if (tone === "quirky" || tone === "engaging" || tone === "casual") {
    quirks = `Cheeky, playful copy encouraged, like “Zoom into Zaddies Only Season 🔥” or “Now Just $89.99? Your Cart’s Already Crying.”`;
  } else if (tone === "professional") {
    quirks = "Keep copy clear, compelling, and persuasive.";
  }

const promptRequest = `
  Create a high-converting ad prompt for the following Shopify product.

  Product Title: ${productName}
  Description: ${productDescription}
  Features: ${productFeatures.join(', ')}
  Audience: ${productAudience}
  Occasion: ${productOccasion}
  Category: ${productCategory}
  Tone: ${quirks}
  
  Format:
  - Strong headline (fun, emotional if needed)
  - Persuasive short body copy (max of 100 characters)
  - Strong sub-title that can go under headline
  - Clear call-to-action (CTA) short text
  - return as an object d Prompt: {"headline","body","sub_title","cta"}
`;

try {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: promptRequest
        }
      ],
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const prompt = response.data.choices[0].message.content.trim();
    console.log("Ad Prompt:\n", prompt);
    
    return JSON.parse(`${prompt}`);
  } catch (error) {
    console.error("Error generating ad prompt:", error.response?.data || error.message);
    return null;
  }
}
