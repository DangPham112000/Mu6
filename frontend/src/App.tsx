/**
 * ==========================================
 * TODO (Phase 5): Frontend Features Checklist
 * ==========================================
 *
 * 1. Setup Tailwind CSS & Shadcn/UI
 *
 * 2. Create UI Components for Configuration:
 *    - Popup/Modal: Prompt user for YTM Cookie if `isCookieValid` is false or empty.
 *    - Playlist Selector: Fetch user's playlists (via an API endpoint or backend bridge)
 *      and allow them to select which playlists to sync. Save this to `syncedPlaylists`.
 *
 * 3. Dashboard UI with Shadcn Tabs:
 *    - TODO: Add Playlist Selector drop-down or sidebar to choose specific playlist context.
 *    - Tab 1 ("ACTIVE"): Display currently synced tracks for the selected playlist using Shadcn Data Table. Fetch from `/api/tracks/active?playlistId=...`
 *    - Tab 2 ("REMOVED"): Display missing/removed tracks for the selected playlist with a RED BADGE. Fetch from `/api/tracks/removed?playlistId=...`
 *
 * 4. Action Buttons:
 *    - On each "REMOVED" track: Add "Find Alternative" button that opens:
 *      `https://www.youtube.com/results?search_query=[Title]+[Artist]`
 *    - Global Action: "Sync Now" button that calls `POST /api/sync/trigger`
 *      and shows a loading spinner during the process.
 */

import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>YouTube Music Library Tracker</h1>
      <p>Currently in Phase 3. Please refer to <code>src/App.tsx</code> to see the Phase 5 Frontend TODO list.</p>
    </div>
  )
}

export default App
