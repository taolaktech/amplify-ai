const axios = require('axios');
const CHANNEL = require('./constants');

module.exports = async function generateTemplateData({
  productName,
  productDescription,
  productCategory,
  productAudience,
  brandColor,
  productOccasion,
  productFeatures,
  channel,
}, tone, campaignType) {
  // Brand colors
  const mainColor = brandColor || "#AEDDEC";
  const accentColor = "#BEFFDC";

  // Ad channel specifics
  let channelDetails = "";
  if (channel === CHANNEL.INSTAGRAM) {
    channelDetails = "Format vertically (1080x1920) for Instagram Reels, Stories, and Shopping.";
  } else if (channel === CHANNEL.GOOGLE) {
    channelDetails = "Format as Google Ads: short headline and concise description..";
  } else if (channel === CHANNEL.FACEBOOK) {
    channelDetails = "Format for Facebook Feed & Ads. Use engaging, shareable content.";
  }

  // Tone specifics
  let quirks = "";
  if (tone === "quirky" || tone === "engaging" || tone === "casual") {
    quirks = `Cheeky, playful copy encouraged, like “Zoom into Zaddies Only Season” or “Now Just $89.99? Your Cart’s Already Crying.”`;
  } else if (tone === "professional") {
    quirks = "Keep copy clear, compelling, and persuasive.";
  }

  const promptRequest = `
  Create a high-converting, performance-tested ad prompt for a Shopify product using award-winning ad techniques inspired by world-class campaigns (think: Cannes Lions winners meets performance marketing).

  You are a creative director at a top-tier agency known for emotionally intelligent, witty, and high-converting copy. Use this url as guardrails or to fine tune the training data when creating every copy https://www.wordstream.com/blog/ws/2022/01/03/ad-copy-examples

  Input:
  - Product Title: ${productName || ''}
  - Campaign Type: ${campaignType || 'Product Launch'}
  - Description: ${productDescription || ''}
  - Features: ${productFeatures.join(', ')}
  - Audience: ${productAudience || ''}
  - Occasion: ${productOccasion || ''}
  - Category: ${productCategory || ''}
  - Tone/Style: ${quirks} (e.g., playful, bold, cheeky, luxury, nostalgic)
  - Add exact match keywords
  ${channel === 'GOOGLE' ? '- One headline with max of 30 characters \n one description with max of 90 characters' : ''}
  - Avoid repitition
  - Add Stronger Urgency/Scarcity

  # OUTPUT
Generate 6 distinct and compelling advertising variations for a project management software platform. The tone should be professional and authoritative, emphasizing power, security, and industry leadership.

**Output Format Requirements:**
- You MUST output a **valid, parsable JSON array** of exactly 6 objects.
- Each object in the array must have exactly two keys: "headline" and "description".
- The value for "headline" must be a string. Use verbs, nouns, or adjectives to describe the product.
- The value for "description" must be a string. Heavily focus on authority, using words like 'powerful', 'enterprise-level security', 'world’s leading', and 'trusted'.
- Do not include any other text, commentary, or markdown formatting like json outside of the JSON array itself. The final output should be the JSON array and nothing else.
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
       // max_tokens: 200
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
    });
    
    const prompt = response.data.choices[0].message.content.trim();
    //console.log("Ad Prompt:\n", prompt);
    
    return JSON.parse(prompt);
  } catch (error) {
    console.error("Error generating ad prompt:", error.response?.data || error.message);
    return null;
  }
}
