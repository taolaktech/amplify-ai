require('dotenv').config();
const express = require('express');
const axios = require('axios');
const generateTemplateData = require('./generate-template-data');
const PLATFORM = require('./constants');

const app = express();
const PORT = 3078;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/creatives', async (req, res) => {
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
        accentColor,
        brandLogo,
        brandName,
        channel,
        tone,
        campaignType,
    } = req.body;

    if (channel !== PLATFORM.GOOGLE) {
      const prompt = await generateTemplateData({
        productName,
        productDescription,
        productCategory,
        productAudience,
        brandColor,
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
    }

    //Google Creative
    const request = {
        productName,
        productDescription,
        productCategory,
        productAudience,
        productOccasion,
        productFeatures,
        channel,
    };

    const results = Promise.allSettled(
      Array.from({ length: 4 }, () => generateTemplateData(request, tone, campaignType))
    ).then((results) => {
      const data = [];
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          data.push(result.value);
          console.log(`Creative ${i + 1} generated for ${productName} on channel ${channel}: \n`);
        } else {
          console.error(`Error in generating ${i + 1} creative for ${productName} on channel ${channel}: `, result.reason);
        }
      });

      res.status(200).json({ success: true, data  });
    });
  } catch (error) {
    console.log(error);
    console.error('Error generating image:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Failed to generate image' });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: 'Something went wrong', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
