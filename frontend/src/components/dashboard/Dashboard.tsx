import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { getActiveTracks, getRemovedTracks, triggerSync } from '@/services/api';
import type { Track } from '@/types';
import ActiveTracksTable from './ActiveTracksTable';
import RemovedTracksList from './RemovedTracksList';

export default function Dashboard() {
  const [activeTracks, setActiveTracks] = useState<Track[]>([]);
  const [removedTracks, setRemovedTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [active, removed] = await Promise.all([
        getActiveTracks(),
        getRemovedTracks(),
      ]);
      setActiveTracks(active);
      setRemovedTracks(removed);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await triggerSync();
      await fetchData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-left">YouTube Music Library Tracker</h1>
          <p className="text-muted-foreground text-left mt-2">Manage your active library and find removed tracks.</p>
        </div>
        <Button onClick={handleSync} disabled={isSyncing || isLoading} size="lg">
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sync Now
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="active">Active Library</TabsTrigger>
          <TabsTrigger value="removed">Removed Tracks</TabsTrigger>
        </TabsList>
        <TabsContent value="active">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ActiveTracksTable tracks={activeTracks} />
          )}
        </TabsContent>
        <TabsContent value="removed">
           {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <RemovedTracksList tracks={removedTracks} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
