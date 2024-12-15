<script lang="ts">
    import { open } from '@tauri-apps/plugin-dialog';
    import { readDir, rename } from '@tauri-apps/plugin-fs';
    import { Button } from '@/lib/components/ui/button';
    import ImageViewer from '@/components/ImageViewer.svelte';
    import ImageTagger, { type TagEvent } from '@/components/ImageTagger.svelte';

    const ENABLED_FILE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

    let directoryPath = $state<string>('');
    let imageNames = $state<string[]>([]);
    let currentImageIndex = $state<number>(0);
    let taggingState = $state<'waiting' | 'tagging' | 'done'>('waiting');
    let currentImagePath = $derived(`${directoryPath}/${imageNames[currentImageIndex]}`);
    let currentImageNameWithoutExtension = $derived(getFileNameWithoutExtension(imageNames[currentImageIndex]));
    let currentImageExtension = $derived(getFileExtension(imageNames[currentImageIndex]));

    async function selectDirectory(event: Event) {
        event.preventDefault();

        const selected = await open({
            directory: true,
            multiple: false,
        });

        if (selected === null) {
            return;
        }

        directoryPath = selected;

        retrieveImages();
    }

    async function retrieveImages() {
        const entries = await readDir(directoryPath);

        for (const entry of entries) {
            if (entry.isFile && ENABLED_FILE_EXTENSIONS.includes(entry.name.split('.').pop()!)) {
                imageNames.push(entry.name);
            }
        }

        startTagging();
    }

    function startTagging() {
        taggingState = 'tagging';
        currentImageIndex = 0;
    }

    function handleTag(event: TagEvent) {
        if (event.changed) {
            renameImage(currentImagePath, `${event.newImageName}.${currentImageExtension}`);
            imageNames[currentImageIndex] = event.newImageName;
        }
        currentImageIndex += 1;

        if (currentImageIndex === imageNames.length) {
            taggingState = 'done';
        }
    }

    async function renameImage(imagePath: string, newImageName: string) {
        return await rename(imagePath, `${directoryPath}/${newImageName}`);
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

<Button onclick={selectDirectory}>Select directory</Button>

{#if taggingState === 'waiting'}
    <p>Select a directory to start tagging images.</p>
{:else if taggingState === 'tagging'}
    <p>Tagging image {currentImageIndex + 1} of {imageNames.length}</p>

    <div>
        <ImageViewer imagePath={currentImagePath} />
        <ImageTagger imageName={currentImageNameWithoutExtension} onTag={handleTag} />
    </div>
{:else if taggingState === 'done'}
    <p>Tagging complete!</p>
{/if}
