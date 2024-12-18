<script module lang="ts">
    export type TagEvent =
        | {
              changed: false;
          }
        | {
              changed: true;
              newFileNameWithoutExtension: string;
          };
</script>

<script lang="ts">
    import { Button } from '../lib/components/ui/button';
    import { Input } from '../lib/components/ui/input';

    type Props = {
        fileNameWithoutExtension: string;
        onTag: (event: TagEvent) => void;
    };

    let props: Props = $props();

    let inputValue = $state<string>('');

    $effect.pre(() => {
        const _ = props.fileNameWithoutExtension; // Detect changes in fileNameWithoutExtension prop
        inputValue = '';
    });

    function handleFormSubmit(event: Event) {
        event.preventDefault();

        if (inputValue === '') {
            props.onTag({ changed: false });
            return;
        }
        props.onTag({ changed: true, newFileNameWithoutExtension: inputValue });
    }
</script>

<form onsubmit={handleFormSubmit}>
    <Input type="text" placeholder={props.fileNameWithoutExtension} bind:value={inputValue} class="max-w-xs" />
    <Button type="submit">Rename</Button>
</form>
