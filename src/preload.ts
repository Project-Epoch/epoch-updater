import { contextBridge, ipcRenderer } from 'electron';

/** Declare an API with functions. */
export type WindowManagementAPI = {
    rendered: () => void;
    close: () => void;
    minimize: () => void;
}

/** Implement those functions, basically just pass to IPC. */
const windowAPI: WindowManagementAPI = {
    rendered: () => { ipcRenderer.send('window-rendered'); },
    close: () => { ipcRenderer.send('window-close'); },
    minimize: () => { ipcRenderer.send('window-minimize'); }
}

/** Used to open Navigation Links in Browser. */
export type NavigationAPI = {
    open: (link: string) => void;
}

const navigationAPI: NavigationAPI = {
    open: (link: string) => { ipcRenderer.send('link-clicked', link); },
}

/** Updater API */
export type UpdaterAPI = {
    refreshState: () => void;
    onStateChanged: (callback: (state: string) => void) => void;
    
    onOpenDirectoryPicker: () => void;
    onValidDirectoryChosen: (callback: () => void) => void;
    onInvalidDirectoryChosen: (callback: (message: string) => void) => void;

    onDownloadStart: (callback: (filename: string, total: number, index: number) => void) => void;
    onDownloadFinished: (callback: () => void) => void;
    onDownloadProgress: (callback: (total: number, name: string, downloaded: number, progress: number, speed: number) => void) => void;
    
    onVerifyProgress: (callback: (total: number, progress: number, filename: string) => void) => void;

    onPlayButtonClicked: () => void;
    onUpdateButtonClicked: () => void;
    onCancelButtonClicked: () => void;

    onVersionReceived: (callback: (version: string) => void) => void;
}

const updaterAPI: UpdaterAPI = {
    refreshState: () => { ipcRenderer.send('refresh-update-state'); },
    onStateChanged: (callback: Function) => ipcRenderer.on('update-state-changed', (event, state) => { callback(state); }),
    
    onOpenDirectoryPicker: () => { ipcRenderer.send('choose-install-directory'); },
    onValidDirectoryChosen: (callback: Function) => ipcRenderer.on('valid-install-directory-chosen', () => { callback(); }),
    onInvalidDirectoryChosen: (callback: Function) => ipcRenderer.on('invalid-install-directory-chosen', (event, message) => { callback(message); }),

    onDownloadStart: (callback: Function) => ipcRenderer.on('download-started', (event, filename, total, index) => { callback(filename, total, index); }),
    onDownloadFinished: (callback: Function) => ipcRenderer.on('download-finished', (event) => { callback(); }),
    onDownloadProgress: (callback: Function) => ipcRenderer.on('download-progress', (event, total, name, downloaded, progress, speed) => { callback(total, name, downloaded, progress, speed); }),
    
    onVerifyProgress: (callback: Function) => ipcRenderer.on('verify-progress', (event, total, progress, filename) => { callback(total, progress, filename); }),

    onPlayButtonClicked: () => { ipcRenderer.send('play-game'); },
    onUpdateButtonClicked: () => { ipcRenderer.send('update-button-click'); },
    onCancelButtonClicked: () => { ipcRenderer.send('on-cancel-button-clicked'); },

    onVersionReceived: (callback: Function) => ipcRenderer.on('version-received', (event, version) => { callback(version); }),
}

/** Expose to the Electron Window. Make sure to add to src\window.d.ts */
contextBridge.exposeInMainWorld('windowAPI', windowAPI);
contextBridge.exposeInMainWorld('navigationAPI', navigationAPI);
contextBridge.exposeInMainWorld('updaterAPI', updaterAPI);