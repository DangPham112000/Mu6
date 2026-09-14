import { Router } from 'express';
import { SystemConfig } from '../models/SystemConfig.js';
import { Track } from '../models/Track.js';
import { syncLibrary } from '../services/syncEngine.js';

const router = Router();

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

// ==========================================
// System Config / Auth APIs
// ==========================================

// GET /api/config
// Return the current SystemConfig (check if cookie exists/is valid, return synced playlists)
router.get('/config', async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = await SystemConfig.create({ cookie: '', isCookieValid: false, syncedPlaylists: [] });
    }
    res.json({
      hasCookie: !!config.cookie,
      isCookieValid: config.isCookieValid,
      syncedPlaylists: config.syncedPlaylists
    });
  } catch (error) {
    console.error('Error in /api/config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/config/cookie
// Update the user's YTM cookie, set isCookieValid=true
router.post('/config/cookie', async (req, res) => {
  try {
    const { cookie } = req.body;
    if (typeof cookie !== 'string' || !cookie.trim()) {
      return res.status(400).json({ error: 'Valid cookie string is required' });
    }

    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }
    config.cookie = cookie;
    config.isCookieValid = true;
    await config.save();

    res.json({ message: 'Cookie updated successfully' });
  } catch (error) {
    console.error('Error in /api/config/cookie:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/config/playlists
// Update the user's synced playlists array
router.post('/config/playlists', async (req, res) => {
  try {
    const { playlists } = req.body;
    if (!Array.isArray(playlists)) {
      return res.status(400).json({ error: 'Playlists must be an array of strings' });
    }

    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
    }
    config.syncedPlaylists = playlists;
    await config.save();

    res.json({ message: 'Synced playlists updated successfully', syncedPlaylists: config.syncedPlaylists });
  } catch (error) {
    console.error('Error in /api/config/playlists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ==========================================
// Track Retrieval APIs
// ==========================================

// Helper function to build track queries
const buildTrackQuery = (status: 'ACTIVE' | 'REMOVED', req: any) => {
  const { playlistId, search } = req.query;
  const query: any = {};

  if (playlistId) {
    query.playlists = {
      $elemMatch: {
        playlistId: String(playlistId),
        status: status
      }
    };
  } else {
    query['playlists.status'] = status;
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegExp(String(search)), 'i');
    query.$or = [
      { title: { $regex: searchRegex } },
      { artists: { $regex: searchRegex } },
      { album: { $regex: searchRegex } }
    ];
  }

  return query;
};

// GET /api/tracks/active
// Retrieve current tracks (status: 'ACTIVE') supporting pagination, search, etc.
router.get('/tracks/active', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const query = buildTrackQuery('ACTIVE', req);

    const [tracks, total] = await Promise.all([
      Track.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Track.countDocuments(query)
    ]);

    res.json({
      tracks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in /api/tracks/active:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tracks/removed
// Retrieve removed tracks (status: 'REMOVED')
router.get('/tracks/removed', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const query = buildTrackQuery('REMOVED', req);

    const [tracks, total] = await Promise.all([
      Track.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Track.countDocuments(query)
    ]);

    res.json({
      tracks,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in /api/tracks/removed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// ==========================================
// Sync Engine Manual Trigger
// ==========================================

// POST /api/sync/trigger
// Manually trigger the syncLibrary() function immediately
router.post('/sync/trigger', (req, res) => {
  // Run syncLibrary in the background to avoid blocking the HTTP request
  syncLibrary()
    .then(() => console.log('[Manual Sync] Sync completed successfully'))
    .catch((error) => console.error('[Manual Sync] Error during sync:', error));

  res.status(202).json({ message: 'Sync process started in the background' });
});


export default router;
