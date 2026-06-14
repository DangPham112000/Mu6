export interface Track {
  videoId: string;
  title: string;
  artists: string[];
  album?: string;
  thumbnailUrl?: string;
  status: 'ACTIVE' | 'REMOVED';
  lastSeen: string;
}

export interface SyncResponse {
  success: boolean;
  message: string;
}
