import type { Track, SyncResponse } from '../types';

export const getActiveTracks = async (): Promise<Track[]> => {
  const response = await fetch('/api/tracks/active');
  if (!response.ok) {
    throw new Error('Failed to fetch active tracks');
  }
  return response.json();
};

export const getRemovedTracks = async (): Promise<Track[]> => {
  const response = await fetch('/api/tracks/removed');
  if (!response.ok) {
    throw new Error('Failed to fetch removed tracks');
  }
  return response.json();
};

export const triggerSync = async (): Promise<SyncResponse> => {
  const response = await fetch('/api/sync/trigger', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to trigger sync');
  }
  return response.json();
};
