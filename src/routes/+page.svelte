<script lang="ts">
    import { open } from '@tauri-apps/plugin-dialog';
    import { readDir, rename } from '@tauri-apps/plugin-fs';
    import FolderSearchIcon from 'lucide-svelte/icons/folder-search';
    import { Button } from '@/lib/components/ui/button';
    import FileViewer from '@/components/FileViewer.svelte';
    import FileTaggerInput, { type TagEvent } from '@/components/FileTaggerInput.svelte';
    import type { FileToTag, FileType } from '@/lib/types';
    import { enabledFileExtensions } from '@/lib/config';

    let workingDirectoryFullPath = $state<string>('');
    let filesToTag = $state<FileToTag[]>([]);
    let currentFileIndex = $state<number>(0);
    let taggingState = $state<'waiting' | 'tagging' | 'done'>('waiting');

    async function selectDirectory(event: Event) {
        event.preventDefault();

        const selected = await open({
            directory: true,
            multiple: false,
        });

        if (selected === null) {
            return;
        }

        workingDirectoryFullPath = selected;

        retrieveFiles();
    }

    async function retrieveFiles() {
        const entries = await readDir(workingDirectoryFullPath);

        for (const entry of entries) {
            if (!entry.isFile) {
                continue;
            }

            const fileType = getFileTypeIfEnabled(entry.name.split('.').pop()!);

            if (fileType === null) {
                continue;
            }

            filesToTag.push({
                type: fileType,
                fullPath: `${workingDirectoryFullPath}/${entry.name}`,
                fullName: entry.name,
                nameWithoutExtension: getFileNameWithoutExtension(entry.name),
                extension: getFileExtension(entry.name) || '',
            });
        }

        startTagging();
    }

    function getFileTypeIfEnabled(extension: string): FileType | null {
        for (const [fileType, extensions] of Object.entries(enabledFileExtensions)) {
            if (extensions.includes(extension)) {
                return fileType as FileType;
            }
        }

        return null;
    }

    function startTagging() {
        taggingState = 'tagging';
        currentFileIndex = 0;
    }

    function handleTag(event: TagEvent) {
        if (event.changed) {
            const currentFile = filesToTag[currentFileIndex];
            const currentFilePath = currentFile.fullPath;
            const currentFileExtension = currentFile.extension;

            renameFile(currentFilePath, `${event.newFileNameWithoutExtension}.${currentFileExtension}`);

            filesToTag[currentFileIndex] = {
                ...currentFile,
                nameWithoutExtension: event.newFileNameWithoutExtension,
                fullName: `${event.newFileNameWithoutExtension}.${currentFile.extension}`,
            };
        }
        currentFileIndex += 1;

        if (currentFileIndex === filesToTag.length) {
            taggingState = 'done';
        }
    }

    async function renameFile(filePath: string, newFileName: string) {
        return await rename(filePath, `${workingDirectoryFullPath}/${newFileName}`);
    }

    function getFileNameWithoutExtension(filePath: string | undefined) {
        if (filePath === undefined) {
            return '';
        }
        const baseName = filePath.substring(filePath.lastIndexOf('/') + 1);
        const fileNameWithoutExt = baseName.substring(0, baseName.lastIndexOf('.'));
        return fileNameWithoutExt;
    }

    function getFileExtension(filePath: string | undefined) {
        if (filePath === undefined) {
            return '';
        }
        return filePath.split('.').pop();
    }
</script>

<div class="mt-16 mx-auto flex flex-col gap-8 w-fit p-4">
    {#if taggingState === 'waiting'}
        <p class="text-xl text-center">Select a directory to start tagging files.</p>

        <div class="flex justify-center">
            <Button onclick={selectDirectory}>
                <FolderSearchIcon class="mr-1 size-4" />
                Select directory
            </Button>
        </div>
    {:else if taggingState === 'tagging'}
        <p class="text-xl text-center">Tagging file {currentFileIndex + 1} of {filesToTag.length}</p>

        <div class="flex flex-col items-center gap-4">
            <div class="h-[50vh] outline outline-offset-2">
                <FileViewer file={filesToTag[currentFileIndex]} />
            </div>

            <FileTaggerInput
                fileNameWithoutExtension={filesToTag[currentFileIndex].nameWithoutExtension}
                onTag={handleTag}
            />
        </div>
    {:else if taggingState === 'done'}
        <p class="text-xl text-center">Tagging complete!</p>

        <div class="flex justify-center">
            <Button onclick={selectDirectory}>
                <FolderSearchIcon class="mr-1 size-4" />
                Select another directory
            </Button>
        </div>
    {/if}
</div>
