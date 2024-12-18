import type { FileType } from "./types";

export const enabledFileExtensions = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    video: ['mp4', 'webm', 'mkv'],
} as Record<FileType, string[]>;
