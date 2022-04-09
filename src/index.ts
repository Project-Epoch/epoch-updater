import { app, autoUpdater, dialog } from 'electron';
import Main from './ts/backend/main';
import unhandled from 'electron-unhandled';

/** 
 * Handle creating/removing shortcuts on Windows when installing/uninstalling.
 */
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
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