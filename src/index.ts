import { app } from 'electron';
import Main from './ts/backend/main';
import unhandled from 'electron-unhandled';

/** 
 * Handle creating/removing shortcuts on Windows when installing/uninstalling.
 */
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

unhandled();
const main = new Main();