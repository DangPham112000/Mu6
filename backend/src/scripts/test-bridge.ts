import { fetchPlaylists, fetchPlaylistItems } from '../services/ytmBridge.js';
import dotenv from 'dotenv';

// Load environment variables for local testing
dotenv.config();

const testCookie = process.env.YTM_COOKIE;

async function test() {
  if (!testCookie) {
    console.log('No YTM_COOKIE found in environment, skipping actual API call.');
    console.log('Please set YTM_COOKIE to a valid YouTube Music cookie to test.');
    return;
  }

  try {
    console.log('Testing fetchPlaylists...');
    const playlists = await fetchPlaylists(testCookie);
    console.log(`Successfully fetched ${playlists.length} playlists.`);
    if (playlists.length > 0) {
      console.log('First playlist:', playlists[0]);
    }

    console.log('\nTesting fetchPlaylistItems for "LM" (Liked Music)...');
    const tracks = await fetchPlaylistItems(testCookie, 'LM');
    console.log(`Successfully fetched ${tracks.length} tracks.`);
    if (tracks.length > 0) {
      console.log('First 10 tracks:', tracks.slice(0, 10));
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
