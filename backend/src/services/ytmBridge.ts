import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_SCRIPT_PATH = path.join(__dirname, '../scripts/ytm_fetch.py');
const PYTHON_EXECUTABLE = '/app/venv/bin/python'; // Path inside Docker

export interface Playlist {
  playlistId: string;
  title: string;
  thumbnails?: any[];
  count?: number;
}

export interface Track {
  videoId: string;
  title: string;
  artists: { name: string; id?: string }[];
  album?: { name: string; id?: string };
  thumbnails?: { url: string; width: number; height: number }[];
  isAvailable?: boolean;
}

export interface YtmResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

/**
 * Helper to run the python script with execa
 */
async function runPythonScript<T>(cookie: string, args: string[]): Promise<T> {
  try {
    // We use the system 'python3' if not inside docker, or the venv python if inside docker.
    // For local dev, fallback to 'python3' or 'python'
    const isDocker = process.env.NODE_ENV !== 'development' || process.env.IS_DOCKER === 'true';
    const pythonExe = process.env.PYTHON_EXECUTABLE || (isDocker ? PYTHON_EXECUTABLE : 'python3');

    const { stdout } = await execa(pythonExe, [PYTHON_SCRIPT_PATH, ...args], {
      env: {
        ...process.env,
        YTM_COOKIE_TEMP: cookie,
      },
    });

    const parsed: YtmResponse<T> = JSON.parse(stdout);

    if (parsed.error) {
      throw new Error(`Python script error: ${parsed.error}`);
    }

    if (!parsed.success || !parsed.data) {
      throw new Error('Invalid response from Python script');
    }

    return parsed.data;
  } catch (error: any) {
    console.error('ytmBridge runPythonScript error:', error.message);
    throw error;
  }
}

/**
 * Fetch all playlists for the user
 */
export async function fetchPlaylists(cookie: string): Promise<Playlist[]> {
  return runPythonScript<Playlist[]>(cookie, ['get_playlists']);
}

/**
 * Fetch all tracks for a specific playlist
 * @param cookie YTM cookie
 * @param playlistId The ID of the playlist (e.g. 'LM' for Liked Music)
 */
export async function fetchPlaylistItems(cookie: string, playlistId: string = 'LM'): Promise<Track[]> {
  return runPythonScript<Track[]>(cookie, ['get_playlist', playlistId]);
}
