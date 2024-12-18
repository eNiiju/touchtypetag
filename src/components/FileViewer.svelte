<script lang="ts">
    import type { FileToTag } from '@/lib/types';
    import { readFile } from '@tauri-apps/plugin-fs';

    type Props = {
        file: FileToTag;
    };
    let props: Props = $props();

    let fileSrc = $derived.by(async () => {
        return await getFile(props.file.fullPath);
    });

    async function getFile(filePath: string): Promise<string> {
        const file = await readFile(filePath);
        return URL.createObjectURL(new Blob([file]));
    }
</script>

<div class="h-full">
    {#await fileSrc}
        <p>Loading file...</p>
    {:then src}
        {#if props.file.type === 'image'}
            <img {src} alt="" class="max-h-full" />
        {:else if props.file.type === 'video'}
            <video {src} class="max-h-full">
                <track kind="captions" />
            </video>
        {:else}
            <p>(Unsupported file type)</p>
        {/if}
    {:catch error}
        <p>Oops! - {error}</p>
    {/await}
</div>
