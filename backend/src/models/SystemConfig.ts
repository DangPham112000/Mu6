import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemConfig extends Document {
  cookie: string;
  isCookieValid: boolean;
  syncedPlaylists: string[];
}

const SystemConfigSchema: Schema = new Schema({
  cookie: { type: String, default: '' },
  isCookieValid: { type: Boolean, default: false },
  syncedPlaylists: { type: [String], default: [] },
}, { timestamps: true });

export const SystemConfig = mongoose.model<ISystemConfig>('SystemConfig', SystemConfigSchema);
