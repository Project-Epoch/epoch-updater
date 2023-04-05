import { app, autoUpdater, dialog } from 'electron';
import Main from './ts/backend/main';
import unhandled from 'electron-unhandled';
let path = require('path');
let spawn = require('child_process').spawn;

function run(args:any, done:any) {
    var updateExe = path.resolve(path.dirname(process.execPath), '..', 'Update.exe');
    spawn(updateExe, args, {
      detached: true
    }).on('close', done);
  };

/** 
 * Handle creating/removing shortcuts on Windows when installing/uninstalling.
 */
function HandleStartEvent(): boolean {
    if (process.platform === 'win32') {
        let cmd = process.argv[1];
        let target = path.basename(process.execPath);
    
        if (cmd === '--squirrel-install') {
          run(['--createShortcut=' + target + ''], app.quit);
          return true;
        }
        if (cmd === '--squirrel-uninstall') {
          run(['--removeShortcut=' + target + ''], app.quit);
          return true;
        }
        if (cmd === '--squirrel-obsolete') {
          app.quit();
          return true;
        }
      }
      return false;
}

if (HandleStartEvent()) {
    app.quit();
}

if (app.isPackaged) {
    require('update-electron-app')({
        repo: 'Project-Epoch/epoch-updater-releases',
        updateInterval: '10 minutes'
    });
}

unhandled();
const main = new Main();