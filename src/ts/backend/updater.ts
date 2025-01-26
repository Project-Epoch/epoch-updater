import { app, net } from "electron";
import { WindowManager } from "./window";
import fs from 'fs';
import path from 'path';
import { ClientManager } from "./client";
import { DownloaderHelper } from "node-downloader-helper";
import md5File from 'md5-file';
import { SettingsManager } from "./settings";
import isElevated from "is-elevated";
let log = require("electron-log")

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
    REQUIRES_ELEVATION = 'requires-elevation',
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
 * Helper function to convert Windows-style paths to cross-platform paths
 */
function convertPaths(manifest: Manifest): Manifest {
    manifest.Files = manifest.Files.map((file) => {
        if (file.Path.includes('\\')) {
            file.Path = file.Path.split('\\').join(path.sep);
        }
        return file;
    });
    return manifest;
}

/**
 * Centralised class to handle the Updating Process.
 */
export class Updater {
    private currentState: UpdateState;
    private manifestHost: string = 'updater.project-epoch.net';
    private manifest: Manifest | undefined;
    private updatableFiles: Array<PatchFile> = [];
    private remainingFiles: number = 0;
    private currentDownload: DownloaderHelper;
    private cancelled: boolean = false;

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
        const environment = SettingsManager.storage().get('environment');
        const key = SettingsManager.storage().get('key');

        const request = net.request({
            method: 'GET',
            protocol: app.isPackaged ? 'https:' : 'http:',
            hostname: this.manifestHost,
            path: `/api/manifest?environment=${environment}&internal_key=${key}`,
            redirect: 'error'
        });

        request.on('response', (response) => {
            let result = '';

            response.on('data', (chunk) => {
                result += chunk.toString();
            });

            response.on('end', () => {
                this.processManifestResponse(JSON.parse(result));
            });
        });

        request.on('error', (error) => {
            this.onManifestFailure(error);
        });

        request.setHeader('Content-Type', 'application/json');
        request.end();
    }

    /**
     * Fires when we've got a response from the Manifest 
     * API endpoint.
     * @param response 
     */
    processManifestResponse(response: any) {
        if (response.hasOwnProperty('Version')) {
            this.onManifestReceived(response);
        } else {
            console.log('Unexpected Response');
            console.log(response);
        }
    }

    /**
     * Fired when we have finished loading the Patch Manifest.
     * @param manifest The Patch Manifest we got.
     */
    onManifestReceived(manifest: Manifest) {
        this.manifest = convertPaths(manifest);
        this.checkIntegrity(manifest);
    }

    /**
     * Fired when getting the Manifest Fails.
     */
    onManifestFailure(error: Error) {
        log.error(`Manifest Retrival Failure: ${error.message}`);
    }

    /**
     * Begins the process of checking integrity of game files.
     * @param manifest The Patch Manifest we're using.
     */
    async checkIntegrity(manifest: Manifest) {
        this.setState(UpdateState.VERIFYING_INTEGRITY);
        this.updatableFiles = [];

        /** Check UAC */
        const elevated = await isElevated();
        if (ClientManager.requiresElevation(ClientManager.getClientDirectory()) && ! elevated) {
            this.setState(UpdateState.REQUIRES_ELEVATION);

            return;
        }

        WindowManager.get().webContents.send('client-directory-loaded', ClientManager.getClientDirectory());

        for (let index = 0; index < manifest.Files.length; index++) {
            let element = manifest.Files[index];
            const localPath = path.join(ClientManager.getClientDirectory(), element.Path);

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
            WindowManager.get().webContents.send('version-received', this.manifest.Version);
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
        this.cancelled = false;

        log.info(`Commencing Download of ${this.updatableFiles.length} Files.`);

        for (let index = 0; index < this.updatableFiles.length; index++) {
            const element = this.updatableFiles[index];

            /** If we've cancelled don't process any more. */
            if (this.cancelled) {
                continue;
            }
            /** Figure out filename and directory. */
            let filename = path.basename(element.Path);
            let directory = path.join(ClientManager.getClientDirectory(), path.dirname(element.Path));

            if (! fs.existsSync(directory)) {
                fs.mkdirSync(directory, { recursive: true });
            }
            await this.download(element.URL, directory, filename, index, this.updatableFiles.length);
        }

        this.checkIntegrity(this.manifest);
    }

    /**
     * Attempts to cancel the current downloads.
     */
    async cancel() {
        this.cancelled = true;
        await this.currentDownload.stop();
        this.checkIntegrity(this.manifest);
    }

    /**
     * Attempts to download a file from our CDN.
     * @param url The URL of the file we're downloading.
     * @param directory The directory where we should save it.
     * @param filename The filename to give it.
     * @param index And out of all our downloads which is this.
     * @param total How many total files do we have.
     */
    async download(url: string, directory: string, filename: string, index: number, total: number) {
        this.currentDownload = new DownloaderHelper(url, directory, {
            fileName: filename,
            override: true,
            removeOnStop: true,
            removeOnFail: true,
            timeout: 60000,
            progressThrottle: 1000,
            retry: {
                maxRetries: 3,
                delay: 5000,
            },
        });

        this.currentDownload.on('start', () => {
            log.info(`Beginning Download: ${filename} - Remaining: ${this.remainingFiles}`);

            WindowManager.get().webContents.send('download-started', filename, this.remainingFiles, index + 1, total);
            this.remainingFiles--;
        });

        this.currentDownload.on('progress', (stats) => { 
            WindowManager.get().webContents.send('download-progress', stats.total, stats.name, stats.downloaded, stats.progress, stats.speed);
        });

        this.currentDownload.on('progress.throttled', (stats) => {
            WindowManager.get().webContents.send('download-progress-throttled', stats.total, stats.name, stats.downloaded, stats.progress, stats.speed);
        });

        this.currentDownload.on('error', (stats) => {
            log.error(`Download Failed - Message (${stats.message}) - Status (${stats.status}) - Body: (${stats.body})`);
            console.log(`Message: ${stats.message} - Status: ${stats.status} - Body: ${stats.body}`);
        });

        this.currentDownload.on('end', (stats) => {
            log.info(`Download Complete: ${stats.fileName} - Total Size (${stats.totalSize}) - Disk Size (${stats.onDiskSize}) - Success: ${stats.incomplete ? 'False' : 'True'}`);

            WindowManager.get().webContents.send('download-finished');
        });

        this.currentDownload.on('stop', () => {
            log.info(`Download Stopped`);
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