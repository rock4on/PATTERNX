#!/usr/bin/env python3
import os
import signal
import subprocess
import time

def restart_flask():
    # Kill existing Flask processes
    try:
        result = subprocess.run(['pgrep', '-f', 'flask run'], capture_output=True, text=True)
        if result.stdout:
            pids = result.stdout.strip().split('\n')
            for pid in pids:
                if pid:
                    os.kill(int(pid), signal.SIGTERM)
                    print(f"Killed Flask process {pid}")
        time.sleep(2)
    except Exception as e:
        print(f"Error killing processes: {e}")
    
    # Start new Flask process
    try:
        env = os.environ.copy()
        env['FLASK_ENV'] = 'development'
        env['FLASK_DEBUG'] = '1'
        
        process = subprocess.Popen([
            'python3', '-m', 'flask', 'run', 
            '--host=0.0.0.0', 
            '--port=5000'
        ], env=env)
        
        print(f"Started new Flask process with PID {process.pid}")
        print("Flask server should be running on http://localhost:5000")
        
    except Exception as e:
        print(f"Error starting Flask: {e}")

if __name__ == "__main__":
    restart_flask()