import { Router } from 'express';

const router = Router();

// ==========================================
// TODO (Phase 4): System Config / Auth APIs
// ==========================================

// GET /api/config
// Return the current SystemConfig (check if cookie exists/is valid, return synced playlists)
router.get('/config', (req, res) => {
  res.json({ message: 'TODO: Implement get config endpoint' });
});

// POST /api/config/cookie
// Update the user's YTM cookie, set isCookieValid=true
router.post('/config/cookie', (req, res) => {
  res.json({ message: 'TODO: Implement update cookie endpoint' });
});

// POST /api/config/playlists
// Update the user's synced playlists array
router.post('/config/playlists', (req, res) => {
  res.json({ message: 'TODO: Implement update synced playlists endpoint' });
});


// ==========================================
// TODO (Phase 4): Track Retrieval APIs
// ==========================================

// GET /api/tracks/active
// Retrieve current tracks (status: 'ACTIVE') supporting pagination, search, etc.
router.get('/tracks/active', (req, res) => {
  res.json({ message: 'TODO: Implement get active tracks endpoint' });
});

// GET /api/tracks/removed
// Retrieve removed tracks (status: 'REMOVED')
router.get('/tracks/removed', (req, res) => {
  res.json({ message: 'TODO: Implement get removed tracks endpoint' });
});


// ==========================================
// TODO (Phase 4): Sync Engine Manual Trigger
// ==========================================

// POST /api/sync/trigger
// Manually trigger the syncLibrary() function immediately
router.post('/sync/trigger', (req, res) => {
  res.json({ message: 'TODO: Implement manual sync trigger endpoint' });
});


export default router;
