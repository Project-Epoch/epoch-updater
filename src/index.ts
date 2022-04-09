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

const server = "https://electron-deploy-six.vercel.app"
const url = `${server}/update/${process.platform}/${app.getVersion()}`;

if (app.isPackaged) {
    autoUpdater.setFeedURL({ url });
    autoUpdater.checkForUpdates();
    setInterval(() => {
        autoUpdater.checkForUpdates()
    }, 60000);

    autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
        const dialogOpts = {
          type: 'info',
          buttons: ['Restart'],
          title: 'Application Update',
          message: process.platform === 'win32' ? releaseNotes : releaseName,
          detail: 'A new version has been downloaded. Restart the application to apply the updates.'
        }
      
        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        });
    });
}

unhandled();
const main = new Main();