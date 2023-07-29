<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let canShuffle: boolean;
    export let started: boolean;
    export let playing: boolean;

    const dispatch = createEventDispatcher<{ shuffle: null, reset: null, toggle: null, download: null }>();
</script>

<div class="ctrls">
    {#if canShuffle}
        <button class="shuffle" on:click={() => dispatch( 'shuffle' )}>
            <svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
        </button>
    {:else}
        <button class="cancel" on:click={() => dispatch( 'reset' )} disabled={playing}>
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
    {/if}

    <button class="play-pause" on:click={() => dispatch( 'toggle' )}>
    {#if playing}
        <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
    {:else}
        <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
    {/if}
    </button>

    <button class="download" on:click={() => dispatch( 'download' )} disabled={!started || playing}>
        <svg viewBox="0 0 24 24"><path d="M5,20h14v-2H5V20z M19,9h-4V3H9v6H5l7,7L19,9z"/></svg>
    </button>
</div>

<style>
    .ctrls {
        flex: 0 0 auto;
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;

        margin: 2rem 0;
    }
    .ctrls button {
        flex: 0 0 auto;

        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;

        width: 6rem;
        height: 4rem;
        margin: 0 1rem;

        background: rgba(0,0,0,0);
        border: 0;
        appearance: none;

        border-radius: .25rem;

        transition: opacity 300ms, background-color 300ms;
    }
    .ctrls button:hover {
        cursor: pointer;
        background: rgba(0,0,0,0.05);
    }
    .ctrls button[disabled] {
        cursor: default;
        background: rgba(0,0,0,0);
        opacity: .2;
    }
    .ctrls svg {
        width: 2rem;
        height: 2rem;
    }
</style>
