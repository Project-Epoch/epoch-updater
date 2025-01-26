import { SettingsManager } from './settings';
import fs from 'fs-extra';
import path from 'path';
import { WindowManager } from './window';
import { dialog } from 'electron';
import cp from "child_process";

/**
 * A class to handle interacting with the Client.
 */
export class Client {
    /**
     * Triggered by the Frontend. Allows us to choose a Directory 
     * where the Client will be installed.
     */
    async chooseDirectory(cb: () => void) {
        const result = await dialog.showOpenDialog(WindowManager.get(), {
            title: 'Choose Client Directory',
            properties: ['openDirectory']
        });

        const dir = result.filePaths[0];

        /** Pressed Cancel. */
        if (dir === undefined) {
            WindowManager.get().webContents.send('invalid-install-directory-chosen', 'Must choose a directory.');
            return;
        }

        if (this.isEmpty(dir)) {
            WindowManager.get().webContents.send('valid-install-directory-chosen', dir);
            this.setClientDirectory(dir);
            cb();
            return;
        }

        if (! this.isWarcraftDirectory(dir)) {
            WindowManager.get().webContents.send('invalid-install-directory-chosen', 'Chosen Directory is not empty and is not a World of Warcraft directory.');
            return;
        }

        if (! this.isCorrectLocale(dir)) {
            WindowManager.get().webContents.send('invalid-install-directory-chosen', 'Invalid World of Warcraft Locale - enUS Required.');
            return;
        }

        /** All other contitions not met, default to valid. */
        WindowManager.get().webContents.send('valid-install-directory-chosen', dir);
        this.setClientDirectory(dir);
        cb();
        return;
    }

    /**
     * Sets and saves the Client Directory we're using.
     * @param path The full path to the Client.
     * @returns this
     */
    setClientDirectory(path: string): Client {
        SettingsManager.storage().set('clientDirectory', path);
        return this;
    }
    
    /**
     * Gets the Directory for where we're keeping our Client.
     * @returns The Directory.
     */
    getClientDirectory(): string {
        return SettingsManager.storage().get('clientDirectory');
    }

    /**
     * Checks to see if we have a Client Directory Set.
     */
    hasClientDirectory(): boolean {
        return this.getClientDirectory() !== '';
    }

    /**
     * Given a Directory it will check to see if it is a Warcraft 
     * Directory based on whether it has a Data subdir and 
     * specific MPQ.
     * @param directoryPath The Directory we're checking.
     */
    isWarcraftDirectory(directoryPath: string): boolean {
        /** Battlenet dll doesn't exist. */
        const battleNetDllPath = path.join(directoryPath, 'Battle.net.dll');
        if (! fs.existsSync(battleNetDllPath)) {
            return false;
        }

        /** Data Directory Doesnt Exists. */
        const dataDirectoryPath = path.join(directoryPath, 'Data');
        if (! fs.existsSync(dataDirectoryPath)) {

            return false;
        }

        /** Check First Patch. */
        const lichkingMpqPath = path.join(dataDirectoryPath, 'lichking.MPQ');
        if (! fs.existsSync(lichkingMpqPath)) {
            return false;
        }

        /** Check Second Patch. */
        const patch3MpqPath = path.join(dataDirectoryPath, 'patch-3.MPQ');
        if (! fs.existsSync(patch3MpqPath)) {
            return false;
        }

        return true;
    }

    /**
     * Check to see if a Client Directory is empty.
     * @param path Path we're checking.
     */
    isEmpty(path: string): boolean {
        return fs.readdirSync(path).length === 0;
    }

    /**
     * Check to see if a Client Directory may require UAC prompt.
     * @param path Path we're checking.
     */
    requiresElevation(path: string): boolean {
        return path.includes('C:\\Program Files (x86)') || path.includes('C:\\Program Files');
    }

    /**
     * Checks to see if the Warcraft Directory provided is 
     * of the locale enUS.
     * @param clientDirectoryPath The directory we're checking.
     */
    isCorrectLocale(clientDirectoryPath: string): boolean {
        /** enUS Locale Doesn't Exist. */
        const enUSLocalePath = path.join(clientDirectoryPath, 'Data', 'enUS');
        if (! fs.existsSync(enUSLocalePath)) {
            return false;
        }

        /** Double check with an MPQ. */
        const enUSLocaleMpqPath = path.join(enUSLocalePath, 'locale-enUS.MPQ');
        if (!fs.existsSync(enUSLocaleMpqPath)) {
            return false;
        }

        return true;
    }

    /**
     * Constructs platform-specific WoW Client startup command
     */
    constructStartupCommand(): string {
        const executablePath = path.join(this.getClientDirectory(), 'Project-Epoch.exe');

        switch (process.platform) {
            case 'linux': {
                /** Use a custom startup command if set */
                const customStartupCommand = process.env.CUSTOM_STARTUP_COMMAND;
                if (customStartupCommand) {
                    return customStartupCommand;
                }
                /** Use the WINEPREFIX environment variable if set; otherwise default to local .wine in getClientDirectory. */
                const winePrefix = process.env.WINEPREFIX || path.join(this.getClientDirectory(), '.wine');
                return `WINEPREFIX="${winePrefix}" wine "${executablePath}"`;
            }

            case 'win32':
                return `"${executablePath}"`;

            default:
                throw new Error(`Unsupported platform: ${process.platform}`);
        }
    }

    /**
     * Attempts to open the WoW Client Exe.
     */
    open() {
        /** Clean Cache. */
        const cachePath = path.join(this.getClientDirectory(), 'Cache');
        fs.removeSync(cachePath);

        /** Constructs platform-specific startup command. */
        const command = this.constructStartupCommand();
        cp.exec(command, (e) => { throw e });
    }
}

export const ClientManager = new Client();