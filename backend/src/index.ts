import express from 'express';
import mongoose from 'mongoose';
import { setupCronJobs } from './jobs/cron.js';
import apiRouter from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ytm_tracker';

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is alive' });
});

// Register API Routes
app.use('/api', apiRouter);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB');

    // Khởi tạo Cron Jobs
    setupCronJobs();

    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });
