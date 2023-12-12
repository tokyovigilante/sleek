import { shell } from 'electron';
import { ipcMain, app, IpcMainEvent, clipboard } from 'electron';
import processDataRequest from './ProcessDataRequest/ProcessDataRequest';
import { changeCompleteState } from './ProcessDataRequest/ChangeCompleteState';
import { writeTodoObjectToFile, removeLineFromFile } from './File/Write';
import archiveTodos from './File/Archive';
import { configStorage, filterStorage, notifiedTodoObjectsStorage } from '../config';
import { mainWindow } from '../main';
import { addFile, setFile, removeFile } from './File/File';
import { openFile, createFile } from './File/Dialog';

async function handleDataRequest(event: IpcMainEvent, searchString: string): Promise<void> {
  try {
    const [todoObjects, attributes, headers, filters] = await processDataRequest(searchString);
    event.reply('requestData', todoObjects, attributes, headers, filters);
  } catch(error) {
    console.error(error);
    event.reply('handleError', error);
  }
}

async function handleWriteTodoToFile(event: IpcMainEvent, id: number, string: string | null, state: boolean | undefined): Promise<void> {
  try {
    let updatedString: string | null = string;
    if (state !== undefined && id >= 0) updatedString = await changeCompleteState(string, state)
    const response = await writeTodoObjectToFile(id, updatedString);
    event.reply('writeTodoToFile', response);
  } catch(error) {
    console.error(error);
    event.reply('handleError', error);
  }  
}

function handleStoreGetConfig(event: IpcMainEvent, value: string): void {
  try {
    event.returnValue = configStorage.get(value);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleStoreSetConfig(event: IpcMainEvent, key: string, value: any) {
  try {
    if(!key) return false;
    configStorage.set(key, value);
    console.log(`Set ${key} to ${value}`);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleStoreSetFilters(event: IpcMainEvent, value: any): void {
  try {
    filterStorage.set('filters', value);
    console.log(`Filters saved`);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleStoreSetNotifiedTodoObjects(event: IpcMainEvent, value: any): void {
  try {
    notifiedTodoObjectsStorage.set('notifiedTodoObjects', value);
    console.log(`notifiedTodoObjects saved`);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleSetFile(event: IpcMainEvent, index: number): void {
  try {
    setFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleRemoveFile(event: IpcMainEvent, index: number): void {
  try {
    removeFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleAddFile(event: IpcMainEvent, index: number): void {
  try {
    addFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

async function handleDroppedFile(event: IpcMainEvent, index: number): void {
  try {
    if(process.mas) throw new Error('This release does not support the drag and drop function, please use the file dialog')
    await addFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('droppedFile', error);
  }
}

function handleRevealInFileManager(event: IpcMainEvent, pathToReveal: string): void {
  try {
    shell.showItemInFolder(pathToReveal);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleOpenFile(event: IpcMainEvent, setDoneFile: boolean): void {
  try {
    openFile(setDoneFile);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleCreateFile(event: IpcMainEvent, setDoneFile: boolean): void {
  try {
    createFile(setDoneFile);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleRemoveLineFromFile(event: IpcMainEvent, index: number): void {
  try {
    removeLineFromFile(index);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

async function handleArchiveTodos(event: IpcMainEvent): void {
  try {
    const archivingResult = await archiveTodos();
    event.reply('ArchivingResult', archivingResult);
  } catch (error: any) {
    console.error(error);
    event.reply('handleError', error);
  }
}

function handleSaveToClipboard(event: IpcMainEvent, string: string): void {
  try {

    clipboard.writeText(string);
    
    if (clipboard.readText() === string) {
      event.reply('saveToClipboard', 'Copied to clipboard: ' + string);
    } else {
      throw('Failed to copy to clipboard');
    }
  } catch (error: any) {
    console.error(error);
    event.reply('saveToClipboard', error);
  }
}

function removeEventListeners(): void {
  ipcMain.off('storeGetConfig', handleStoreGetConfig);
  ipcMain.off('storeSetConfig', handleStoreSetConfig);
  ipcMain.off('storeSetFilters', handleStoreSetFilters);
  ipcMain.off('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects);
  ipcMain.off('setFile', handleSetFile);
  ipcMain.off('removeFile', handleRemoveFile);
  ipcMain.off('openFile', handleOpenFile);
  ipcMain.off('createFile', handleCreateFile);
  ipcMain.off('requestData', handleDataRequest);
  ipcMain.off('writeTodoToFile', handleWriteTodoToFile);
  ipcMain.off('archiveTodos', handleArchiveTodos);
  ipcMain.off('addFile', handleAddFile);
  ipcMain.off('droppedFile', handleDroppedFile);
  ipcMain.off('saveToClipboard', handleSaveToClipboard);
  ipcMain.off('revealInFileManager', handleRevealInFileManager);
  ipcMain.off('removeLineFromFile', handleRemoveLineFromFile);
}

app.on('before-quit', removeEventListeners);

ipcMain.on('storeGetConfig', handleStoreGetConfig);
ipcMain.on('storeSetConfig', handleStoreSetConfig);
ipcMain.on('storeSetFilters', handleStoreSetFilters);
ipcMain.on('storeSetNotifiedTodoObjects', handleStoreSetNotifiedTodoObjects);
ipcMain.on('setFile', handleSetFile);
ipcMain.on('removeFile', handleRemoveFile);
ipcMain.on('openFile', handleOpenFile);
ipcMain.on('createFile', handleCreateFile);
ipcMain.on('requestData', handleDataRequest);
ipcMain.on('writeTodoToFile', handleWriteTodoToFile);
ipcMain.on('archiveTodos', handleArchiveTodos);
ipcMain.on('addFile', handleAddFile);
ipcMain.on('droppedFile', handleDroppedFile);
ipcMain.on('saveToClipboard', handleSaveToClipboard);
ipcMain.on('revealInFileManager', handleRevealInFileManager);
ipcMain.on('removeLineFromFile', handleRemoveLineFromFile);