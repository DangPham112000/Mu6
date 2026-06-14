import type { Track } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface RemovedTracksListProps {
  tracks: Track[];
}

export default function RemovedTracksList({ tracks }: RemovedTracksListProps) {
  const handleFindReplacement = (title: string, artists: string[]) => {
    const searchQuery = encodeURIComponent(`${title} ${artists.join(' ')}`);
    window.open(`https://www.youtube.com/results?search_query=${searchQuery}`, '_blank');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Thumbnail</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Artists</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No removed tracks found. Good news!
              </TableCell>
            </TableRow>
          ) : (
            tracks.map((track) => (
              <TableRow key={track.videoId}>
                <TableCell>
                  {track.thumbnailUrl ? (
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      className="w-16 h-12 object-cover rounded opacity-50 grayscale"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-muted rounded flex items-center justify-center opacity-50">
                      <span className="text-xs text-muted-foreground">No img</span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="destructive">REMOVED</Badge>
                </TableCell>
                <TableCell className="font-medium text-muted-foreground line-through">
                  {track.title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {track.artists?.join(', ')}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFindReplacement(track.title, track.artists)}
                  >
                    <Search className="mr-2 h-4 w-4" />
                    Find Replacement
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
