"""Install the existing read-only localhost bridge as a per-user macOS service."""
from pathlib import Path
import os, plistlib, subprocess, sys
root=Path(__file__).resolve().parent.parent
label='com.dg-tchek.lottoengine-bridge'
agent=Path.home()/'Library/LaunchAgents'/f'{label}.plist'
logs=Path.home()/'Library/Logs/DG-Tchek'
agent.parent.mkdir(parents=True,exist_ok=True);logs.mkdir(parents=True,exist_ok=True)
config={'Label':label,'ProgramArguments':[sys.executable,str(root/'scripts/lotto-engine-bridge.py'),'--port','4179'],'WorkingDirectory':str(root),'RunAtLoad':True,'KeepAlive':True,'ThrottleInterval':15,'StandardOutPath':str(logs/'bridge.log'),'StandardErrorPath':str(logs/'bridge-error.log')}
agent.write_bytes(plistlib.dumps(config))
domain=f'gui/{os.getuid()}'
subprocess.run(['launchctl','bootout',f'{domain}/{label}'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
subprocess.run(['launchctl','bootstrap',domain,str(agent)],check=True)
print('LottoEngine bridge installed for this Mac user; loopback only, read-only.')
