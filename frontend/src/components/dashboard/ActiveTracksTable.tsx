import type { Track } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ActiveTracksTableProps {
  tracks: Track[];
}

export default function ActiveTracksTable({ tracks }: ActiveTracksTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Thumbnail</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Artists</TableHead>
            <TableHead>Album</TableHead>
            <TableHead className="text-right">Last Seen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No active tracks found.
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
                      className="w-16 h-12 object-cover rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No img</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{track.title}</TableCell>
                <TableCell>{track.artists?.join(', ')}</TableCell>
                <TableCell>{track.album || '-'}</TableCell>
                <TableCell className="text-right">
                  {new Date(track.lastSeen).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
