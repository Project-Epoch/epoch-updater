import { app, net } from "electron";
import { WindowManager } from "./window";
import fs from 'fs';
import { ClientManager } from "./client";
import { DownloaderHelper } from "node-downloader-helper";

/**
 * The various States of the Updater Process.
 */
export enum UpdateState {
    NONE = 'none',
    SETUP = 'setup',
    GET_MANIFEST = 'get-manifest',
    VERIFYING_INTEGRITY = 'verifying-integrity',
    UPDATE_AVAILABLE = 'update-available',
    DOWNLOADING = 'downloading',
    DONE = 'done',
}

interface PatchFiles {
    Path: string;
    Hash: string;
    Size: number;
    URL: string;
}

interface Manifest {
    Version: string;
    Files: Array<PatchFiles>;
}

/**
 * Centralised class to handle the Updating Process.
 */
export class Updater {
    private currentState: UpdateState;
    private manifestHost: string = 'updater.project-epoch.net';
    private version: string = '';
    private updatableFiles: Array<PatchFiles> = [];
    private remainingFiles: number = 0;

    constructor() {
        this.currentState = UpdateState.NONE;

        /** Dev Mode - Use Local. */
        if (! app.isPackaged) {
            this.manifestHost = '127.0.0.1';
        }
    }

    getManifest() {
        const request = net.request({
            method: 'GET',
            protocol: app.isPackaged ? 'https:' : 'http:',
            hostname: this.manifestHost,
            path: '/api/manifest',
            redirect: 'error'
        });

        request.on('response', (response) => {
            response.on('data', (chunk) => {
                this.onManifestReceived(JSON.parse(chunk.toString()));
            });
        });

        request.on('finish', () => {
            console.log('Request is Finished')
        });

        request.on('abort', () => {
            console.log('Request is Aborted')
        });

        request.on('error', (error) => {
            this.onManifestFailure(error);
        });

        request.setHeader('Content-Type', 'application/json');
        request.end();
    }

    onManifestReceived(manifest: Manifest) {
        this.version = manifest.Version;
        this.checkIntegrity(manifest);
    }

    /**
     * Fired when getting the Manifest Fails.
     */
    onManifestFailure(error: Error) {

    }

    checkIntegrity(manifest: Manifest) {
        this.setState(UpdateState.VERIFYING_INTEGRITY);

        manifest.Files.forEach((value) => {
            let localPath = `${ClientManager.getClientDirectory()}\\${value.Path}`;

            /** Doesn't Exist. Just Download. */
            if (! fs.existsSync(localPath)) {
                this.updatableFiles.push(value);
                return;
            }
        });

        /** Need to download every file. Must be new. */
        if (this.updatableFiles.length === manifest.Files.length) {
            this.downloadUpdates();
            return;
        }

        /** Only some files. Must be an update. */
        this.setState(UpdateState.UPDATE_AVAILABLE);
    }

    async downloadUpdates() {
        this.setState(UpdateState.DOWNLOADING);
        this.remainingFiles = this.updatableFiles.length;

        for (let index = 0; index < this.updatableFiles.length; index++) {
            const element = this.updatableFiles[index];

            /** Figure out filename. */
            let parts = element.Path.split('\\');
            let filename = parts[parts.length - 1];

            /** Figure out Directory. */
            let clientDir = ClientManager.getClientDirectory();
            let downloadDir = element.Path.split(filename)[0];
            let directory = `${clientDir}\\${downloadDir}`;

            if (! fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            
            await this.download(element.URL, directory, filename, index);
        }
    }

    async download(url: string, directory: string, filename: string, index: number) {
        const dl = new DownloaderHelper(url, directory);

        dl.on('start', () => {
            WindowManager.get().webContents.send('download-started', filename, this.remainingFiles, index + 1);
            this.remainingFiles--;
        });

        dl.on('progress', (stats) => { 
            WindowManager.get().webContents.send('download-progress', stats.total, stats.name, stats.downloaded, stats.progress, stats.speed);
        });

        dl.on('end', () => {
            WindowManager.get().webContents.send('download-finished');
        });

        await dl.start();
    }

    /**
     * Sets the latest Updater State and fires it to the Frontend.
     * @param state The new state.
     */
    setState(state: UpdateState) {
        this.currentState = state;

        this.refresh();
    }

    /**
     * Forces a Frontend "Refresh" of the Update State by just sending it.
     */
    refresh() {
        WindowManager.get().webContents.send('update-state-changed', this.getState());
    }

    /**
     * Gets our current Update State.
     */
    getState(): UpdateState {
        return this.currentState;
    }
}

/**
 * Constant instance of the Updater Class.
 */
export const UpdateManager = new Updater();