import { configStorage } from '../config';
import createFileWatcher from './FileWatcher';
import path from 'path';

interface File {
  active: boolean;
  path: string;
  filename: string;
}

async function addFile(filePath: string): Promise<void> {
  try {
    const files: File[] = (configStorage.get('files') as File[]) || [];
    let existingFileIndex = -1;

    if (files && files.length > 0) {
      files.forEach((file) => {
        file.active = false;
      });
      existingFileIndex = files.findIndex((file) => file.path.includes(filePath));
    }

    if (existingFileIndex === -1) {
      files.push({
        active: true,
        path: filePath,
        filename: path.basename(filePath),
      });
    } else {
      if (existingFileIndex !== -1) {
        files[existingFileIndex].active = true;
      }
    }

    configStorage.set('files', files);

    await createFileWatcher(files);

    console.info('File.ts: File added, restarting file watchers');
    return;

  } catch (error) {
    console.error('File.ts:', error);
    throw error;
  }
}

async function removeFile(index: number): Promise<void> {
  try {
    let files: File[] = configStorage.get('files') as File[];

    files.splice(index, 1);
    const activeIndex: number = files.findIndex((file) => file.active);

    if (files.length > 0 && activeIndex === -1) {
      files[0].active = true;
    } else if (activeIndex !== -1) {
      files[activeIndex].active = true;
    } else {
      files = [];
    }

    configStorage.set('files', files);

    await createFileWatcher(files);
    return;
  } catch (error) {
    console.error('File.ts:', error);
    throw error;
  }
}

function setFile(event: event, index: number): void {
  try {
    const files: File[] = configStorage.get('files') as File[];

    if (files.length > 0) {
      files.forEach((file) => {
        file.active = false;
      });
    }

    files[index].active = true;

    configStorage.set('files', files);

    return;
  } catch (error) {
    console.error('File.ts:', error);
    throw error;
  }
}

export { setFile, removeFile, addFile };
