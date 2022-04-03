import { app } from 'electron';
import Main from './ts/main';

/** 
 * Handle creating/removing shortcuts on Windows when installing/uninstalling.
 */
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

const main = new Main();