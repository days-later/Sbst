import { build, files, version } from '$service-worker';

type SWEvent = Event & {
    waitUntil: ( promise: Promise<unknown> ) => void;
    request: Request,
    respondWith: ( response: Promise<Response> ) => void,
}

//const worker = (self as unknown) as ServiceWorkerGlobalScope;
const worker = (self as unknown) as any;

const FILES = `static${version}`;
const NETWORK = `network${version}`;

const excludeAssets: string[] = [];
const excludeAssetDirs: string[] = [];

const to_cache = build.concat( files.filter( f => {
    if (excludeAssets.includes( f )) return false;
    for (const dir of excludeAssetDirs) if (f.startsWith( dir )) return false;
    return true;
}));
const staticAssets = new Set( to_cache );

worker.addEventListener( 'install', (event: SWEvent) => {
    event.waitUntil(
        caches
            .open(FILES)
            .then((cache) => cache.addAll( to_cache ))
            .then(() => {
                worker.skipWaiting();
            })
    );
});

worker.addEventListener('activate', (event: SWEvent) => {
    event.waitUntil(
        caches.keys().then(async (keys) => {
            for (const key of keys) {
                if (key !== FILES) await caches.delete(key);
            }
            worker.clients.claim();
        })
    );
});

async function cacheResponse( request: Request ): Promise<Response> {
    const cached = await caches.match( request );
    return cached || await fetch( request );
}

async function cachedNetworkResponse( request: Request ): Promise<Response> {
    try {
        const response = await fetch( request );
        const cache = await caches.open( NETWORK );
        cache.put( request, response.clone() );
        return response;
    }
    catch ( e ) {
        const cache = await caches.open( NETWORK );
        const response = await cache.match( request );
        if (response) return response;
        throw e;
    }
}

worker.addEventListener('fetch', (event: SWEvent) => {
    if (event.request.method !== 'GET' || event.request.headers.has('range')) return;

    const url = new URL( event.request.url );

    // eg a dataurl
    if (!url.protocol.startsWith('http')) return;

    // only from own host
    if (url.host !== self.location.host) return;

    // skip for dev server
    if (url.port !== self.location.port) return;

    if (staticAssets.has( url.pathname )) {
        event.respondWith( cacheResponse( event.request ) );
    }
    else {
        event.respondWith( cachedNetworkResponse( event.request ) );
    }
});
