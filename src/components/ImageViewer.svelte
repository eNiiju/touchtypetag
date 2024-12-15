<script lang="ts">
    import { readFile } from '@tauri-apps/plugin-fs';

    type Props = {
        imagePath: string;
    };
    let props: Props = $props();

    let imageSrc = $derived.by(async () => {
        return await getImage(props.imagePath);
    });

    async function getImage(imagePath: string): Promise<string> {
        const image = await readFile(imagePath);
        return URL.createObjectURL(new Blob([image]));
    }
</script>

<div>
    {#await imageSrc}
        <p>Loading image</p>
    {:then src}
        <img {src} alt="" />
    {:catch reason}
        <span>Oops! - {reason}</span>
    {/await}
</div>
