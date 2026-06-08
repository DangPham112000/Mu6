import sys
import json
import os
from ytmusicapi import YTMusic

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Missing action argument"}))
        sys.exit(1)

    action = sys.argv[1]
    cookie = os.environ.get("YTM_COOKIE_TEMP", "")

    if not cookie:
        print(json.dumps({"error": "Missing YTM_COOKIE_TEMP environment variable"}))
        sys.exit(1)

    try:
        # Create an instance with the provided cookie
        # Depending on ytmusicapi requirements, sometimes cookie needs to be formatted or saved.
        # YTMusic() can be initialized with a headers dictionary containing the cookie.

        # In newer ytmusicapi, we can pass raw cookie string as a setup file or dictionary, or use setup()
        # The easiest way for a raw string is often passing it to auth parameter if it's a JSON string,
        # or passing raw headers. We will try passing a custom header dict.

        headers = {}
        # Simple format expected by ytmusicapi might just be a string, let's see how YTMusic handles it.
        # Actually ytmusicapi usually takes an auth file. Since we want to pass it directly:
        # YTMusic.setup() can create headers string but since we already have cookie string:
        headers_str = f"Cookie: {cookie}"

        # It's better to pass it as auth dict for ytmusicapi if possible, or dump to a temp file.
        # We can write it to a temp file for ytmusicapi to read since it prefers a file for raw headers
        # or we can pass a dict: auth={"Cookie": cookie} -> actually auth needs to be a specific dict structure or file.

        # Let's pass it as a file-like object or write to a temp file, or use setup.
        # According to ytmusicapi docs, we can pass a raw cookie string using setup(auth=cookie_string)
        # But setup() is interactive or saves to file.

        # Alternative: The auth dict needs to be:
        # { "User-Agent": "...", "Accept": "...", "Accept-Language": "...", "Content-Type": "application/json", "X-Goog-AuthUser": "0", "x-origin": "https://music.youtube.com", "Cookie": "..." }

        auth_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "*/*",
            "Accept-Language": "en-US,en;q=0.5",
            "Content-Type": "application/json",
            "X-Goog-AuthUser": "0",
            "x-origin": "https://music.youtube.com",
            "Cookie": cookie
        }

        # Temporarily save headers to a json file because YTMusic expects a filename or dict
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.json') as f:
            json.dump(auth_headers, f)
            temp_file_name = f.name

        try:
            yt = YTMusic(temp_file_name)
        finally:
            os.remove(temp_file_name)

        if action == "get_playlists":
            playlists = yt.get_library_playlists(limit=None)
            # output JSON
            print(json.dumps({"success": True, "data": playlists}))

        elif action == "get_playlist":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Missing playlist_id argument"}))
                sys.exit(1)

            playlist_id = sys.argv[2]

            if playlist_id == "LM":
                # Special case for Liked Music
                limit = None # Fetches all
                tracks = yt.get_liked_songs(limit=limit)
                # Ensure tracks has a consistent format. get_liked_songs returns a dict with 'tracks'
                if isinstance(tracks, dict) and 'tracks' in tracks:
                    track_list = tracks['tracks']
                else:
                    track_list = tracks
            else:
                playlist_info = yt.get_playlist(playlist_id, limit=None)
                if isinstance(playlist_info, dict) and 'tracks' in playlist_info:
                    track_list = playlist_info['tracks']
                else:
                    track_list = playlist_info

            print(json.dumps({"success": True, "data": track_list}))

        else:
            print(json.dumps({"error": f"Unknown action: {action}"}))
            sys.exit(1)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
