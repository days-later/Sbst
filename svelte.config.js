import { vitePreprocess } from '@sveltejs/kit/vite';
import static_adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: static_adapter(),
	},
};

export default config;
