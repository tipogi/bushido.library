import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

const LOGS_PATH = path.resolve(__dirname, '../..', 'logs/');
export const NODE_FILES_PATH = path.resolve(LOGS_PATH, 'node/files/');
export const NODE_IMPORT_PATH = path.resolve(LOGS_PATH, 'node/import/');
export const DOMAIN_DELETED_PATH = path.resolve(LOGS_PATH, 'domain/deleted/');
export const DOMAIN_UNAVAILABLE_PATH = path.resolve(LOGS_PATH, 'domain/unavailable/');

@Injectable()
export class SystemService {
  async writeInTheFile(absolutePath: string, message: string) {
    const { fileName, moment_path, time } = formatDate();
    const logFile = await checkTheFolderStructure(absolutePath, moment_path, fileName);
    await fs.appendFileSync(logFile, `${time} - ${message}`);
  }
}

// Get the information to create the log
const formatDate = () => {
  const { day, month, year, hour, minutes, seconds } = getDate();
  const fileName = 'day_' + day;
  const moment_path = `${year}/${month}/`;
  const time = hour + ':' + minutes + ':' + seconds;
  return { fileName, moment_path, time };
};

const checkTheFolderStructure = async (filePath: string, moment_path: string, fileName: string) => {
  const logFile = path.resolve(filePath, `${moment_path}${fileName}.log`);
  // Check if the log exist, if not create the file
  if (!fs.existsSync(logFile)) {
    await fs.mkdirSync(path.resolve(filePath, moment_path), { recursive: true });
  }
  return logFile;
};

const getDate = () => {
  const date = new Date();
  const day = parseTime(date.getDate());
  const month = parseTime(date.getMonth() + 1);
  const year = date.getFullYear();
  const hour = parseTime(date.getHours());
  const minutes = parseTime(date.getMinutes());
  const seconds = parseTime(date.getSeconds());
  return { day, month, year, hour, minutes, seconds };
};
const parseTime = (date: number) => {
  let parsedDate = date.toString();
  if (parsedDate.length == 1) {
    parsedDate = '0' + parsedDate;
  }
  return parsedDate;
};
