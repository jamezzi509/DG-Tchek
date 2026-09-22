#!/bin/zsh
set -eu
cd -- "${0:A:h}"
export PATH="$HOME/.local/node/bin:$PATH"
if ! curl -fsS --max-time 2 'http://127.0.0.1:4179/api/results?state=FL&days=1' >/dev/null; then
  python3 scripts/lotto-engine-bridge.py --port 4179 &
fi
if ! curl -fsS --max-time 2 'http://127.0.0.1:4178/' >/dev/null; then
  if [[ ! -d node_modules ]]; then npm ci; fi
  npm run dev -- --host 127.0.0.1 --port 4178 --strictPort &
fi
for attempt in {1..20}; do
  if curl -fsS --max-time 1 'http://127.0.0.1:4178/' >/dev/null; then break; fi
  sleep 0.3
done
open 'http://127.0.0.1:4178/'
print 'TCHÈK louvri. Kenbe fenèt sa a ouvè pandan w ap sèvi ak koneksyon LottoEngine la.'
wait
