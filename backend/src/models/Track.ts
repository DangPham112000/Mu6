import mongoose, { Schema, Document } from 'mongoose';

export interface ITrackPlaylistStatus {
  playlistId: string;
  status: 'ACTIVE' | 'REMOVED';
  lastSeen: Date;
}

export interface ITrack extends Document {
  videoId: string;
  title: string;
  artists: string[];
  album?: string;
  thumbnailUrl?: string;
  playlists: ITrackPlaylistStatus[];
}

const TrackPlaylistStatusSchema = new Schema<ITrackPlaylistStatus>({
  playlistId: { type: String, required: true },
  status: { type: String, enum: ['ACTIVE', 'REMOVED'], required: true },
  lastSeen: { type: Date, required: true }
}, { _id: false });

const TrackSchema: Schema = new Schema({
  videoId: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  artists: { type: [String], default: [] },
  album: { type: String },
  thumbnailUrl: { type: String },
  playlists: { type: [TrackPlaylistStatusSchema], default: [] }
}, { timestamps: true });

// Create compound index for fast lookups by status within a playlist
TrackSchema.index({ "playlists.playlistId": 1, "playlists.status": 1 });

export const Track = mongoose.model<ITrack>('Track', TrackSchema);
