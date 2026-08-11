/**
 * Shared defaults for ChalkySticks Vue 2 CLI builds.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Vue2/Config
 * @project ChalkySticks MRM Preset
 */

/**
 * Output pattern used by Webpack asset-resource rules.
 *
 * @type string
 */
const ASSET_RESOURCE_FILENAME = 'assets/[name].[hash:8][ext]';

/**
 * Package entry-point preference used by current Vue 2 browser builds.
 *
 * @type ReadonlyArray<string>
 */
const DEFAULT_MAIN_FIELDS = Object.freeze(['module', 'browser', 'main']);

/**
 * Node modules that browser bundles must not attempt to polyfill implicitly.
 *
 * @type Readonly<Record<string, boolean>>
 */
const DEFAULT_NODE_FALLBACKS = Object.freeze({
	// Use crypto-browserify here if a browser project explicitly needs the Node
	// crypto surface instead of disabling it.
	crypto: false,
	fs: false,
	http: false,
	https: false,
	net: false,
	path: false,
	stream: false,
	tls: false,
	url: false,
	zlib: false,
});

/**
 * Default browser base path for Vue CLI builds.
 *
 * @type string
 */
const DEFAULT_PUBLIC_PATH = '/';

module.exports = {
	ASSET_RESOURCE_FILENAME: ASSET_RESOURCE_FILENAME,
	DEFAULT_MAIN_FIELDS: DEFAULT_MAIN_FIELDS,
	DEFAULT_NODE_FALLBACKS: DEFAULT_NODE_FALLBACKS,
	DEFAULT_PUBLIC_PATH: DEFAULT_PUBLIC_PATH,
};
