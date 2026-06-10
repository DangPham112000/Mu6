import { SystemConfig } from '../models/SystemConfig.js';
import { Track } from '../models/Track.js';
import { fetchPlaylistItems } from './ytmBridge.js';

export async function syncLibrary() {
  console.log('[SyncEngine] Starting scheduled sync job...');
  try {
    // 1. Lấy thông tin cấu hình từ DB
    const config = await SystemConfig.findOne();
    if (!config) {
      console.log('[SyncEngine] No SystemConfig found. Skipping sync.');
      return;
    }

    if (!config.isCookieValid || !config.cookie) {
      console.log('[SyncEngine] Cookie is missing or invalid. Skipping sync.');
      return;
    }

    if (!config.syncedPlaylists || config.syncedPlaylists.length === 0) {
      console.log('[SyncEngine] No playlists selected for sync. Skipping sync.');
      return;
    }

    // 2. Bắt đầu lặp qua từng playlist để sync
    for (const playlistId of config.syncedPlaylists) {
      console.log(`[SyncEngine] Syncing playlist: ${playlistId}`);

      const syncStartTime = new Date();
      let fetchedTracks;

      try {
         fetchedTracks = await fetchPlaylistItems(config.cookie, playlistId);
      } catch (error: any) {
         console.error(`[SyncEngine] Error fetching playlist ${playlistId}:`, error.message);
         // Nếu lỗi liên quan đến xác thực (ví dụ Unauthorized), đánh dấu cookie là không hợp lệ
         if (error.message && error.message.toLowerCase().includes('unauthorized')) {
             console.log('[SyncEngine] Marking cookie as invalid.');
             config.isCookieValid = false;
             await config.save();
             break; // Dừng toàn bộ sync job vì cookie đã chết
         }
         continue; // Chuyển sang playlist tiếp theo nếu lỗi không phải do cookie
      }

      console.log(`[SyncEngine] Fetched ${fetchedTracks?.length || 0} tracks from playlist ${playlistId}`);

      if (!fetchedTracks) continue;

      // 3. Upsert từng track
      for (const ytmTrack of fetchedTracks) {
        // Chỉ lấy URL thumbnail đầu tiên
        const thumbnailUrl = ytmTrack.thumbnails && ytmTrack.thumbnails.length > 0
                               ? ytmTrack.thumbnails[0]?.url
                               : undefined;
        // Chuyển artists thành mảng chuỗi
        const artistNames = ytmTrack.artists.map(a => a.name);

        const trackData = {
          title: ytmTrack.title,
          artists: artistNames,
          album: ytmTrack.album?.name,
          thumbnailUrl
        };

        // Tìm kiếm xem track đã có trong DB chưa
        const existingTrack = await Track.findOne({ videoId: ytmTrack.videoId });

        if (existingTrack) {
          // Cập nhật metadata
          existingTrack.title = trackData.title;
          existingTrack.artists = trackData.artists;
          if (trackData.album !== undefined) {
             existingTrack.album = trackData.album;
          }
          if (trackData.thumbnailUrl !== undefined) {
             existingTrack.thumbnailUrl = trackData.thumbnailUrl;
          }

          // Tìm xem bài hát này đã được lưu vào playlist hiện tại chưa
          const playlistIndex = existingTrack.playlists.findIndex(p => p.playlistId === playlistId);

          if (playlistIndex !== -1) {
            // Đã có trong playlist -> Cập nhật trạng thái và thời gian
            existingTrack.playlists[playlistIndex]!.status = 'ACTIVE';
            existingTrack.playlists[playlistIndex]!.lastSeen = syncStartTime;
          } else {
            // Chưa có trong playlist này -> Thêm vào mảng
            existingTrack.playlists.push({
              playlistId,
              status: 'ACTIVE',
              lastSeen: syncStartTime
            });
          }
          await existingTrack.save();
        } else {
          // Chưa có trong DB -> Tạo mới hoàn toàn
          await Track.create({
            videoId: ytmTrack.videoId,
            title: trackData.title,
            artists: trackData.artists,
            ...(trackData.album !== undefined ? { album: trackData.album } : {}),
            ...(trackData.thumbnailUrl !== undefined ? { thumbnailUrl: trackData.thumbnailUrl } : {}),
            playlists: [{
              playlistId,
              status: 'ACTIVE',
              lastSeen: syncStartTime
            }]
          });
        }
      }

      // 4. Diffing: Phát hiện các bài hát đã bị xóa khỏi playlist hiện tại
      // Các track thuộc playlist này, đang có status ACTIVE nhưng lastSeen nhỏ hơn thời điểm bắt đầu sync
      const result = await Track.updateMany(
        {
          "playlists": {
            $elemMatch: {
              playlistId: playlistId,
              status: 'ACTIVE',
              lastSeen: { $lt: syncStartTime }
            }
          }
        },
        {
          // Sử dụng toán tử vị trí ($) để cập nhật chính xác element thỏa mãn $elemMatch
          $set: { "playlists.$.status": 'REMOVED' }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`[SyncEngine] Found ${result.modifiedCount} REMOVED tracks in playlist ${playlistId}.`);
      } else {
        console.log(`[SyncEngine] No tracks removed from playlist ${playlistId} in this sync.`);
      }
    }

    console.log('[SyncEngine] Sync job completed successfully.');
  } catch (error: any) {
    console.error('[SyncEngine] Critical error during sync job:', error);
  }
}
