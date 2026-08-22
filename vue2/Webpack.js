/**
 * Shared Webpack configuration builders for ChalkySticks Vue 2 projects.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Vue2
 * @project ChalkySticks MRM Preset
 */

const Config = require('./Config');
const path = require('path');

/**
 * Escape one file extension before placing it in a regular expression.
 *
 * @param string extension
 * @return string
 */
function escapeRegularExpression(extension) {
	return extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a Webpack asset-resource rule for the supplied file extensions.
 *
 * @param ReadonlyArray<string> extensions
 * @return Object
 */
function createAssetResourceRule(extensions) {
	const escapedExtensions = [];

	for (const extension of extensions) {
		escapedExtensions.push(escapeRegularExpression(extension));
	}

	return {
		generator: {
			filename: Config.ASSET_RESOURCE_FILENAME,
		},
		test: new RegExp(`\\.(${escapedExtensions.join('|')})$`),
		type: 'asset/resource',
	};
}

/**
 * Determine whether the active Vue CLI invocation is building a library.
 *
 * @return boolean
 */
function isLibraryBuild() {
	return process.argv.includes('--target') && process.argv.includes('lib');
}

/**
 * Create the dependency external map used only by Vue CLI library builds.
 *
 * @param ReadonlyArray<string> packageNames
 * @return Record<string, string>
 */
function createLibraryExternals(packageNames) {
	const externals = {};

	if (!isLibraryBuild()) {
		return externals;
	}

	const sortedPackageNames = [...packageNames].sort();

	for (const packageName of sortedPackageNames) {
		externals[packageName] = `commonjs2 ${packageName}`;
	}

	return externals;
}

/**
 * Create browser-safe Node fallback declarations with project overrides.
 *
 * @param string projectRoot
 * @param Record<string, boolean | string> additions
 * @return Record<string, boolean | string>
 */
function createNodeFallbacks(projectRoot, additions) {
	const fallbacks = Object.assign({}, Config.DEFAULT_NODE_FALLBACKS, additions || {});

	if (!Object.prototype.hasOwnProperty.call(fallbacks, 'util')) {
		fallbacks.util = require.resolve('util/', {
			paths: [projectRoot],
		});
	}

	return fallbacks;
}

/**
 * Point Sass package imports at generated resources from a local workspace.
 *
 * @param any config
 * @param string sassPackageRoot
 * @return void
 */
function configureSassAliases(config, sassPackageRoot) {
	config.resolve.alias
		.set('@chalkysticks/sass/asset-resources', path.join(sassPackageRoot, 'build/asset-catalog-resource'))
		.set('@chalkysticks/sass/assets', path.join(sassPackageRoot, 'build/asset'))
		.set('@chalkysticks/sass/scss', path.join(sassPackageRoot, 'src/app'))
		.set('@chalkysticks/sass/styles', path.join(sassPackageRoot, 'build/app.css'))

		// Sass sources under src/app author their artwork URLs as `asset/...`,
		// which only resolves once the package build has copied src/asset into
		// build/. Consumers importing those sources directly instead of the
		// compiled app.css would otherwise resolve the URLs against their own
		// component directory. `src/app/ui/icon.scss` is the only file in the
		// chain issuing bare `asset/` requests, so the alias cannot collide.
		.set('asset', path.join(sassPackageRoot, 'build/asset'));
}

module.exports = {
	configureSassAliases: configureSassAliases,
	createAssetResourceRule: createAssetResourceRule,
	createLibraryExternals: createLibraryExternals,
	createNodeFallbacks: createNodeFallbacks,
	isLibraryBuild: isLibraryBuild,
};
