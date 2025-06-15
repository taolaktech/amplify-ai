require('dotenv').config();
const express = require('express');
const axios = require('axios');
const generateTemplatePrompt = require('./generate-prompt');
const generateTemplateData = require('./generate-template-data');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/generate-ad', async (req, res) => {
  try {
    if (!req?.body) {
        throw new Error('invalid input')
    }
    
    const {
        productName,
        productPrice,
        productDescription,
        productCategory,
        productImage,
        productLink,
        productAudience,
        productOccasion,
        productFeatures,
        brandColor,
        brandLogo,
        brandName,
        channel,
        tone,
    } = req.body;

    const prompt = await generateTemplateData({
        productName,
        productDescription,
        productCategory,
        productAudience,
        productOccasion,
        productFeatures,
        channel,
    }, tone);
    
    if (!prompt) {
        throw new Error('error generating prompt')
    }

    const response = await axios.post(
      'https://sync.api.bannerbear.com/v2/images',
      {
        "template": "97xPQmDnq9vq5G3E82",
        "modifications": [
            {
            "name": "image_1",
            "image_url": productImage
            },
            {
            "name": "image_2",
            "image_url": productImage
            },
            {
            "name": "white_border",
            "color": null,
            "border_color": null,
            "border_width": null
            },
            {
            "name": "CTA_text",
            "text": prompt.cta,
            "color": null,
            "background": null
            },
            {
            "name": "title_text",
            "text": prompt.headline,
            "color": null,
            "background": null
            },
            {
            "name": "subtitle_text",
            "text": prompt.sub_title,
            "color": null,
            "background": null
            },
            {
            "name": "description_text",
            "text": prompt.body,
            "color": null,
            "background": null
            },
            {
            "name": "icon_logo",
            "color": null,
            "border_color": null,
            "border_width": null,
            },
            {
            "name": "brand_name",
            "text": brandName,
            "color": null,
            "background": null
            },
            {
            "name": "price_text",
            "text": productPrice,
            "color": brandColor || '#444',
            "background": null
            }
        ],
        "webhook_url": null,
        "transparent": false,
        "metadata": null
        },
      {
        headers: {
          'Authorization': `Bearer ${process.env.BANNER_BEAR_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const imageUrl = response.data.image_url;
    
    res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    console.log(error);
    console.error('Error generating image:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to generate image' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
