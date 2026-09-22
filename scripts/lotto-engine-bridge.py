"""Read-only, loopback-only adapter for AJ's installed LottoEngine database."""
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import argparse, json, re, sqlite3

DB = Path.home()/'Library/Application Support/LottoEngine/lotto_results.db'
ORIGINS = {'https://dg-tchek.vercel.app', 'http://127.0.0.1:4178', 'http://localhost:4178'}

def read_results(state, days):
    if state not in {'FL','NY'} or not 1 <= days <= 14: raise ValueError('Invalid state or date range')
    now = datetime.now(ZoneInfo('America/New_York'))
    cutoff = (now.date()-timedelta(days=days-1)).isoformat()
    if not DB.is_file(): raise FileNotFoundError('LottoEngine database unavailable')
    with sqlite3.connect(DB.as_uri()+'?mode=ro', uri=True, timeout=3) as conn:
        conn.execute('PRAGMA query_only=ON')
        conn.row_factory=sqlite3.Row
        rows=conn.execute("SELECT state_code,draw_date,draw_period,pick3,pick4,source_url,collected_at FROM results WHERE state_code=? AND status='approved' AND draw_date>=? AND draw_date<=? AND draw_period IN ('midday','evening') ORDER BY draw_date,CASE draw_period WHEN 'midday' THEN 0 ELSE 1 END LIMIT 60",(state,cutoff,now.date().isoformat())).fetchall()
    draws=[];invalid=0
    for row in rows:
        if not re.fullmatch(r'\d{3}',row['pick3'] or '') or not re.fullmatch(r'\d{4}',row['pick4'] or ''):
            invalid+=1;continue
        draws.append(dict(state=state,date=row['draw_date'],session=row['draw_period'],pick3=row['pick3'],pick4=row['pick4'],sourceUrl=row['source_url'],collectedAt=row['collected_at']))
    return dict(source='LottoEngine Mac',state=state,fetchedAt=now.isoformat(),fromDate=cutoff,draws=draws,invalidRows=invalid)

class Handler(BaseHTTPRequestHandler):
    def allowed(self): return self.headers.get('Origin') in ORIGINS or not self.headers.get('Origin')
    def respond_headers(self,status):
        self.send_response(status)
        origin=self.headers.get('Origin')
        if origin in ORIGINS:self.send_header('Access-Control-Allow-Origin',origin)
        self.send_header('Vary','Origin')
        self.send_header('Access-Control-Allow-Methods','GET, OPTIONS')
        self.send_header('Access-Control-Allow-Private-Network','true')
        self.send_header('Cache-Control','no-store')
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.end_headers()
    def do_OPTIONS(self):self.respond_headers(204 if self.allowed() else 403)
    def do_GET(self):
        if not self.allowed():self.respond_headers(403);return
        url=urlsplit(self.path)
        if url.path!='/api/results':self.respond_headers(404);return
        try:
            params=parse_qs(url.query);data=read_results(params.get('state',['FL'])[0],int(params.get('days',['10'])[0]));status=200
        except (ValueError,TypeError):data={'error':'Invalid request'};status=400
        except (FileNotFoundError,sqlite3.Error):data={'error':'LottoEngine results are unavailable. Open LottoEngine on this Mac.'};status=503
        self.respond_headers(status);self.wfile.write(json.dumps(data).encode())
    def log_message(self,format,*args):pass

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=4179);args=parser.parse_args()
    server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler)
    print(f'LottoEngine read-only connection: http://127.0.0.1:{args.port}',flush=True)
    try:server.serve_forever()
    except KeyboardInterrupt:pass
    finally:server.server_close()
