export type FileType = 'image' | 'video';

export type FileToTag = {
    type: FileType;
    fullPath: string;
    fullName: string;
    nameWithoutExtension: string;
    extension: string;
}
