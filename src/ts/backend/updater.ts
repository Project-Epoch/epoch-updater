import { app, net } from "electron";
import { WindowManager } from "./window";
import fs from 'fs';
import { ClientManager } from "./client";
import { DownloaderHelper } from "node-downloader-helper";
import md5File from 'md5-file';

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

interface PatchFile {
    Path: string;
    Hash: string;
    Size: number;
    Custom: boolean;
    URL: string;
}

interface Manifest {
    Version: string;
    Files: Array<PatchFile>;
}

/**
 * Centralised class to handle the Updating Process.
 */
export class Updater {
    private currentState: UpdateState;
    private manifestHost: string = 'updater.project-epoch.net';
    private version: string = '';
    private updatableFiles: Array<PatchFile> = [];
    private remainingFiles: number = 0;
    private currentDownload: DownloaderHelper;

    constructor() {
        this.currentState = UpdateState.NONE;

        /** Dev Mode - Use Local. */
        if (! app.isPackaged) {
            this.manifestHost = '127.0.0.1';
        }
    }

    /**
     * Gets the Patch Manifest from our updater API.
     */
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

    /**
     * Fired when we have finished loading the Patch Manifest.
     * @param manifest The Patch Manifest we got.
     */
    onManifestReceived(manifest: Manifest) {
        this.version = manifest.Version;
        this.checkIntegrity(manifest);
    }

    /**
     * Fired when getting the Manifest Fails.
     */
    onManifestFailure(error: Error) {

    }

    /**
     * Begins the process of checking integrity of game files.
     * @param manifest The Patch Manifest we're using.
     */
    async checkIntegrity(manifest: Manifest) {
        this.setState(UpdateState.VERIFYING_INTEGRITY);

        for (let index = 0; index < manifest.Files.length; index++) {
            let element = manifest.Files[index];
            let localPath = `${ClientManager.getClientDirectory()}\\${element.Path}`;

            WindowManager.get().webContents.send('verify-progress', manifest.Files.length, index + 1, element.Path);

            /** Doesn't Exist. Just Download. */
            if (! fs.existsSync(localPath)) {
                this.updatableFiles.push(element);
                continue;
            }

            /** Blizzard File - Just check number of bytes. */
            if (! element.Custom) {
                let size = fs.statSync(localPath).size;
                if (element.Size !== size) {
                    this.updatableFiles.push(element);
                }

                continue;
            }

            /** Custom File. Actually Hash Check. */
            await this.checkHash(element, localPath);
        }

        /** Need to download every file. Must be new. */
        if (this.updatableFiles.length === manifest.Files.length) {
            this.downloadUpdates();
            return;
        }

        if (this.updatableFiles.length > 0) {
            /** Only some files. Must be an update. */
            this.setState(UpdateState.UPDATE_AVAILABLE);
        } else {
            this.setState(UpdateState.DONE);
        }
    }

    /**
     * Generates an MD5 hash for the given file and if not 
     * matching then marks as requiring update.
     * @param file Our Patch Manifest File Entry.
     * @param localPath The path on disk for where it is.
     */
    async checkHash(file: PatchFile, localPath: string) {
        await md5File(localPath).then((hash) => {
            if (hash !== file.Hash) {
                this.updatableFiles.push(file);
            }
        });
    }

    /**
     * Sets our state to Downloading and begins the 
     * process of downloading any updates we had 
     * remaining.
     */
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

    /**
     * Attempts to download a file from our CDN.
     * @param url The URL of the file we're downloading.
     * @param directory The directory where we should save it.
     * @param filename The filename to give it.
     * @param index And out of all our downloads which is this.
     */
    async download(url: string, directory: string, filename: string, index: number) {
        this.currentDownload = new DownloaderHelper(url, directory);

        this.currentDownload.on('start', () => {
            WindowManager.get().webContents.send('download-started', filename, this.remainingFiles, index + 1);
            this.remainingFiles--;
        });

        this.currentDownload.on('progress', (stats) => { 
            WindowManager.get().webContents.send('download-progress', stats.total, stats.name, stats.downloaded, stats.progress, stats.speed);
        });

        this.currentDownload.on('end', () => {
            WindowManager.get().webContents.send('download-finished');
        });

        await this.currentDownload.start();
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