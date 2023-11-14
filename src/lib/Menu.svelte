<script lang="ts">
    import { Looks } from './Looks';
    import { cfg } from './cfg-store.svelte';

    const { started, playing, ontoggle, ondownload } = $props<{
        started: boolean;
        playing: boolean;
        ontoggle: () => void;
        ondownload: () => void;
    }>();

</script>

<div class="menu">
    <button class="play-pause" onclick={ontoggle}>
        {#if playing}
            <svg viewBox="0 -960 960 960"><path d="M559.5-252v-456h138v456h-138Zm-296 0v-456h139v456h-139Z"/></svg>
        {:else}
            <svg viewBox="0 -960 960 960"><path d="M372-295v-372l292 186-292 186Z"/></svg>
        {/if}
    </button>

    <select class="look" bind:value={cfg.look_index} disabled={playing}>
        {#each Looks as l, i}
            <option value={i}>{l.name}</option>
        {/each}
    </select>

    <select class="res" bind:value={cfg.supersample} disabled={playing}>
        {#each cfg.supersample_options as o}
            <option value={o.value}>{o.label}</option>
        {/each}
    </select>

    <button class="download" disabled={!started || playing} onclick={ondownload}>
        <svg viewBox="0 0 20 16" style="transform: scale(.4)">
            <path d="M0 0 L20 0 L10 12 Z" />
            <rect x=0 y=14 width=100% height=4 />
        </svg>
    </button>
</div>



<style>
    .menu {
        flex: 0 0 auto;

        display: flex;
        flex-flow: row nowrap;
        align-items: stretch;
        gap: 8px;

        --a: max( 48px, 5vmin );
    }

    button,
    select {
        flex: 1 1 auto;

        appearance: none;
        min-width: 0;
        max-width: 60%;
        height: calc( var(--a) * 1.5 );

        margin: 0;
        padding: 0;

        color: var(--ui--btn-fg);
        border-radius: 8px;
        background: var(--ui--btn-bg);

        border: 0;
        font-size: var(--a);
        line-height: 1.5;
        text-align: center;
        font-family: inherit;
        overflow: hidden;
    }

    button:not( :disabled ):hover,
    button:not( :disabled ):focus-visible,
    select:not( :disabled ):hover,
    select:not( :disabled ):focus-visible {
        outline: none;
        cursor: pointer;
        z-index: 1;

        box-shadow: inset 0 0 0 4px var(--ui--btn-fg);
    }

    button:disabled,
    select:disabled {
        opacity: 0.25;
    }

    button {
        display: flex;
        flex-flow: row nowrap;
        justify-content: center;
        align-items: center;
    }
    svg {
        height: 1em;
        width: 1em;
        fill: currentColor;
    }


    @media (max-width: 600px) {
        button, select {
            height: calc( var(--a) * 1 );
            font-size: 40px;
        }

        .play-pause {
            flex: 0 0 20%;
        }
        .look {
            flex: 1 1 auto;
            font-size: 22px;
        }
        .res {
            flex: 0 0 15%;
            font-size: 22px;
        }
        .download {
            flex: 0 0 20%;
        }
    }


</style>
