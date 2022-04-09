import { app, autoUpdater } from 'electron';
import Main from './ts/backend/main';
import unhandled from 'electron-unhandled';

/** 
 * Handle creating/removing shortcuts on Windows when installing/uninstalling.
 */
if (require('electron-squirrel-startup')) {
    // eslint-disable-line global-require
    app.quit();
}

const server = "electron-deploy-j1bpx82a5-kaytotes.vercel.app"
const url = `${server}/update/${process.platform}/${app.getVersion()}`;

if (app.isPackaged) {
    autoUpdater.setFeedURL({ url });
}

unhandled();
const main = new Main();