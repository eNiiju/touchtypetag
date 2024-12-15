<script module lang="ts">
    export type TagEvent =
        | {
              changed: false;
          }
        | {
              changed: true;
              newImageName: string;
          };
</script>

<script lang="ts">
    import { Button } from '../lib/components/ui/button';
    import { Input } from '../lib/components/ui/input';

    type Props = {
        imageName: string;
        onTag: (event: TagEvent) => void;
    };

    let props: Props = $props();

    let inputValue = $state<string>('');

    $effect.pre(() => {
        const _ = props.imageName; // Detect changes in imageName prop
        inputValue = '';
    });

    function handleFormSubmit(event: Event) {
        event.preventDefault();

        if (inputValue === '') {
            props.onTag({ changed: false });
            return;
        }
        props.onTag({ changed: true, newImageName: inputValue });
    }
</script>

<form onsubmit={handleFormSubmit}>
    <Input type="text" placeholder={props.imageName} bind:value={inputValue} class="max-w-xs" />
    <Button type="submit">Rename</Button>
</form>
