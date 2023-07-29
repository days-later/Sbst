<script context="module" lang="ts">
    export type ProgressEvent = {
        started: boolean,
        playing: boolean,
        done: boolean,

        progress: number,
        active_cracks: number,
        max_cracks: number,

        width: number,
        height: number,

        runtime: number,
    };

</script>
<script lang="ts">
    import { createEventDispatcher, onMount, tick } from "svelte";
    import { downloadCanvas } from "./downloadCanvas";
    import { Sb, type SbLook } from "./Sb/Sb";

    const dispatch = createEventDispatcher<{ init: null, progress: ProgressEvent }>();

    export let seed: string;
    export let supersample = 1;
    export let look: SbLook;

    let el: HTMLElement;
    let width = 0;
    let height = 0;
    let sb: Sb | null = null;

    function emit() {
        if (!sb) return;
        dispatch( 'progress', {
            started: sb.started,
            playing: sb.is_running,
            done: sb.done,
            progress: sb.progress,

            active_cracks: sb.active_cracks,
            max_cracks: sb.max_cracks,

            width,
            height,

            runtime: sb.runtime,
        });
    }

    function setup() {
        const w = Math.max( 4, el.clientWidth * supersample );
        const h = Math.max( 4, el.clientHeight * supersample );

        sb = new Sb({
            seed,
            w,
            h,

            on_frame: emit,
            on_done: emit,

            look,
        });

        for (const c of sb.canvases) el.appendChild( c );
    }

    export async function playpause(): Promise<void> {
        if (!sb) {
            width = el.clientWidth;
            height = el.clientHeight;
            document.documentElement.style.setProperty( '--scale', (1 / supersample) + '' );
            await tick();

            setup();
            emit();
            await tick();
        }

        if (!init) {
            init = true;
            dispatch( 'init' );
        }

        if (!sb) return;

        if (!sb.is_running) {
            sb.run();
            emit();
        }
        else {
            sb.pause();
            emit();
        }
    }
    export function download( name: string ) {
        if (!sb) return;
        downloadCanvas( sb.canvases, `sb-${name}-${seed}` );
    }

    let init = false;
    onMount(() => playpause());
</script>


<div class="substrate" bind:this={el} />


<style>
    .substrate {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }

    .substrate > :global( canvas ) {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        transform-origin: 0 0;
        transform: scale( var(--scale) );
    }

</style>
