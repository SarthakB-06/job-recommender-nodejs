import dotenv from 'dotenv';
dotenv.config({ path: './env' }); 

export default {
  port: process.env.PORT || 8000,
  mongodb_uri: process.env.MONGODB_URI,
  jwt_secret: process.env.JWT_SECRET,
  adzuna: {
    appId: process.env.ADZUNA_APP_ID,
    appKey: process.env.ADZUNA_APP_KEY
  },
  rapidApi:{
    key: process.env.RAPID_API_KEY,
    host: process.env.RAPID_API_HOST
  }
};