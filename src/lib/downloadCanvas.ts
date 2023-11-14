type Pixel = [ r: number, g: number, b: number, a: number ];

function blend( base: Pixel, layer: Pixel ): Pixel {
    const a = layer[3] / 255;
    return [
        base[0] * (1 - a) + layer[0] * a,
        base[1] * (1 - a) + layer[1] * a,
        base[2] * (1 - a) + layer[2] * a,
        255,
    ];
}

export function downloadCanvas( canvases: HTMLCanvasElement[], filename: string ) {

    const [ data, ... layers ] = canvases.map( c => {
        const ctx = c.getContext( '2d' );
        if (ctx) return ctx.getImageData( 0, 0, c.width, c.height );
        return;
    }).filter( data => !!data ) as ImageData[];

    const size = data.width * data.height * 4;
    const img = data.data;

    for (let pos=0; pos<size; pos += 4) {
        let pixel = img.slice( pos, pos+4 ) as unknown as Pixel;
        for (const l of layers) pixel = blend( pixel, l.data.slice( pos, pos+4 ) as unknown as Pixel );

        img[ pos ] = pixel[ 0 ];
        img[ pos+1 ] = pixel[ 1 ];
        img[ pos+2 ] = pixel[ 2 ];
    }

    const canvas = document.createElement( 'canvas' );
    canvas.width = data.width;
    canvas.height = data.height;

    const ctx = canvas.getContext( '2d' )!;
    ctx.putImageData( data, 0, 0 );

    canvas.toBlob( blob => {
        if (!blob) {
            console.log( 'downloadCanvas: no blob?!' );
            return;
        }

        const url = window.URL.createObjectURL( blob );
        const a = document.createElement( 'a' );

        a.href = url;
        a.download = filename + '.png';
        a.click();
        window.URL.revokeObjectURL( url );

    }, 'image/png' );
}
