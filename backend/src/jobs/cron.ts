import cron from 'node-cron';
import { syncLibrary } from '../services/syncEngine.js';

export function setupCronJobs() {
  console.log('[Cron] Setting up syncLibrary job to run at 02:00 AM daily.');

  // Chạy vào lúc 02:00 sáng mỗi ngày
  cron.schedule('0 2 * * *', async () => {
    console.log('[Cron] Executing scheduled syncLibrary job...');
    await syncLibrary();
  });
}
