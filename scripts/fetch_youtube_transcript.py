import sys
import json
from youtube_transcript_api import YouTubeTranscriptApi

def format_timestamp(seconds):
    mins = int(seconds // 60)
    secs = int(seconds % 60)
    return f"{mins:02d}:{secs:02d}"

def get_transcript(video_id):
    try:
        api = YouTubeTranscriptApi()
        
        # Try fetching default transcripts first
        segments_raw = None
        lang_used = 'en'
        
        try:
            segments_raw = api.fetch(video_id, languages=['en', 'en-US'])
            lang_used = 'en'
        except Exception:
            try:
                # Try listing available transcripts (auto-generated or manual)
                transcript_list = api.list(video_id)
                found = None
                for t in transcript_list:
                    found = t
                    break
                if found:
                    segments_raw = found.fetch()
                    lang_used = found.language_code
            except Exception as inner_e:
                return {
                    'success': False,
                    'videoId': video_id,
                    'error': f"No captions available: {str(inner_e)}",
                    'segments': []
                }

        if not segments_raw:
            return {
                'success': False,
                'videoId': video_id,
                'error': 'Transcript empty or unavailable',
                'segments': []
            }

        formatted_segments = []
        for item in segments_raw:
            # Handle both dictionary and FetchedTranscriptSnippet object formats
            if isinstance(item, dict):
                text = item.get('text', '').strip()
                start = item.get('start', 0.0)
                duration = item.get('duration', 0.0)
            else:
                text = getattr(item, 'text', '').strip()
                start = getattr(item, 'start', 0.0)
                duration = getattr(item, 'duration', 0.0)
            
            end_time = start + duration
            if text:
                formatted_segments.append({
                    'text': text,
                    'startTime': round(start, 2),
                    'duration': round(duration, 2),
                    'endTime': round(end_time, 2),
                    'formattedTimestamp': format_timestamp(start)
                })

        return {
            'success': True,
            'videoId': video_id,
            'language': lang_used,
            'segments': formatted_segments
        }

    except Exception as e:
        return {
            'success': False,
            'videoId': video_id,
            'error': str(e),
            'segments': []
        }

if __name__ == '__main__':
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
        
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'Missing video_id argument'}))
        sys.exit(1)

    vid_id = sys.argv[1]
    result = get_transcript(vid_id)
    print(json.dumps(result, ensure_ascii=False))
