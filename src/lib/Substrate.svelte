<script context="module" lang="ts">
    export type ProgressEvent = {
        started: boolean,
        playing: boolean,
        done: boolean,

        width: number,
        height: number,

        progress: number,
        active_cracks: number,
        max_cracks: number,

        runtime: number,
    };
</script>
<script lang="ts">
    import { onMount, tick } from "svelte";
    import { downloadCanvas } from "./downloadCanvas";
    import { Sb } from "./Sb/Sb";
    import { cfg } from "./cfg-store.svelte";

    const { onprogress } = $props<{ onprogress: (e: ProgressEvent) => void; }>();

    let el: HTMLElement;
    let sb: Sb | null = null;

    function emit() {
        if (!sb) return;
        onprogress({
            started: sb.started,
            playing: sb.is_running,
            done: sb.done,
            progress: sb.progress,

            width: sb.width,
            height: sb.height,

            active_cracks: sb.active_cracks,
            max_cracks: sb.max_cracks,

            runtime: sb.runtime,
        });
    }

    function setup() {
        const w = Math.max( 4, window.screen.width * window.devicePixelRatio * cfg.supersample );
        const h = Math.max( 4, window.screen.height * window.devicePixelRatio * cfg.supersample );

        sb = new Sb({
            seed: cfg.seed,
            w,
            h,

            on_frame: emit,
            on_done: emit,

            look: cfg.look.look,
        });

        for (const c of sb.canvases) el.appendChild( c );
    }

    export async function playpause(): Promise<void> {
        if (!sb) {
            setup();
            emit();
            await tick();
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
        downloadCanvas( sb.canvases, `sb-${name}-${cfg.seed}` );
    }

    onMount(() => playpause());
</script>


<div class="substrate" bind:this={el} />


<style>
    .substrate {
        position: relative;
        width: 100%;
        height: 100%;

        background: var(--canvas-bg);
        overflow: hidden;
    }

    .substrate > :global( canvas ) {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;

        width: 100%;
        height: 100%;
        object-fit: contain;
    }

</style>
