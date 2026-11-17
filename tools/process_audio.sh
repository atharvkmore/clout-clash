#!/usr/bin/env bash
# Compress generated audio for embedding.
#   raw/audio/m_*.mp3 -> assets/audio/music/  (stereo, 104 kbps)
#   raw/audio/v_*.mp3 -> assets/audio/voice/  (mono 64 kbps, silence trimmed, loudness -14 LUFS)
# Requires ffmpeg.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/audio/music assets/audio/voice
for f in raw/audio/m_*.mp3; do
  ffmpeg -y -v error -i "$f" -ac 2 -ar 44100 -b:a 104k "assets/audio/music/$(basename "$f")"
done
for f in raw/audio/v_*.mp3; do
  ffmpeg -y -v error -i "$f" -af "silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.02,areverse,silenceremove=start_periods=1:start_threshold=-42dB:start_silence=0.08,areverse,loudnorm=I=-14:TP=-1.5" \
    -ac 1 -ar 44100 -b:a 64k "assets/audio/voice/$(basename "$f")"
done
echo "audio done"
