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
  - Product Title: ${productName}
  - Campaign Type: ${campaignType}
  - Description: ${productDescription}
  - Features: ${productFeatures.join(', ')}
  - Audience: ${productAudience}
  - Occasion: ${productOccasion}
  - Category: ${productCategory}
  - Tone/Style: ${quirks} (e.g., playful, bold, cheeky, luxury, nostalgic)
  - Add exact match keywords
  ${channel === 'GOOGLE' ? '- headlines max out at 30 characters \n descriptions max out at 90 characters' : ''}
  - Do not suggest multiple creatives
  - Avoid repitition
  - Add Stronger Urgency/Scarcity

  Output Format:
  - ${channelDetails}
  - Do not use any emojis 
  - All keys should be in lowercase
  - Only use the following structure for the output - must be strictly followed, do not add path, keywords, change the order, use a different key, or any other text.:
  json
  ${ channel === 'GOOGLE' ? 
    {
      "headline": "[Use verbs, nouns, or adjectives to describe the product or service]",
      "description": "[A Wrike ad at the top, heavily focused on authority with words like powerful, enterprise-level security, world’s leading, and trusted.]",
    }
  :
    {
      "headline": "[Bold, thumb-stopping hook. Use emotion, curiosity, numbers, or vivid language]",
      "sub_title": "[Complementary line that supports the headline, builds intrigue or trust]",
      "body": "[Concise body copy under 100 characters, focused on benefit, desire, or urgency]",
      "cta": "[Clear, action-driven CTA with personality—avoid generic phrases like 'Buy now']"
    }
    }
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
    //console.log("Ad Prompt:\n", prompt);
    
    return JSON.parse(`${prompt}`);
  } catch (error) {
    console.error("Error generating ad prompt:", error.response?.data || error.message);
    return null;
  }
}
