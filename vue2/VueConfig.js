/**
 * Shared Vue CLI configuration factory for ChalkySticks Vue 2 projects.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Vue2
 * @project ChalkySticks MRM Preset
 */

const Config = require('./Config');
const fileSystem = require('fs');
const path = require('path');
const { createLibraryExternals, createNodeFallbacks, isLibraryBuild } = require('./Webpack');

/**
 * Create the development-server defaults with project-specific overrides.
 *
 * @param Object overrides
 * @return Object
 */
function createDevelopmentServer(overrides) {
	const developmentServer = {
		client: {
			overlay: false,
		},
		headers: {
			'Access-Control-Allow-Origin': '*',
		},
		hot: process.env.NODE_ENV === 'development',
		https: false,
		liveReload: process.env.NODE_ENV === 'development',
	};

	if (!overrides) {
		return developmentServer;
	}

	for (const key of Object.keys(overrides)) {
		if (key === 'client') {
			developmentServer.client = Object.assign({}, developmentServer.client, overrides.client);

			continue;
		}

		if (key === 'headers') {
			developmentServer.headers = Object.assign({}, developmentServer.headers, overrides.headers);

			continue;
		}

		developmentServer[key] = overrides[key];
	}

	if (Object.prototype.hasOwnProperty.call(overrides, 'server')) {
		delete developmentServer.https;
	}

	return developmentServer;
}

/**
 * Resolve the Sass loader property used to inject shared source data.
 *
 * @param string projectRoot
 * @return string
 */
function resolveSassDataProperty(projectRoot) {
	const packagePath = require.resolve('sass-loader/package.json', {
		paths: [projectRoot],
	});
	const packageInformation = JSON.parse(fileSystem.readFileSync(packagePath, 'utf8'));
	const majorVersion = Number.parseInt(packageInformation.version.split('.')[0], 10);

	return majorVersion >= 9 ? 'additionalData' : 'prependData';
}

/**
 * Resolve CSS extraction without changing Vue CLI's application defaults.
 * Library builds preserve the existing injected-style package contract unless
 * a project explicitly selects another delivery model.
 *
 * @param Object options
 * @return boolean | undefined
 */
function resolveStyleExtraction(options) {
	if (options.extractStyles !== undefined) {
		return options.extractStyles;
	}

	if (isLibraryBuild()) {
		return false;
	}

	return undefined;
}

/**
 * Create the Vue CLI Sass configuration when a shared prelude is supplied.
 *
 * @param Object options
 * @return Object
 */
function createStyleConfiguration(options) {
	const configuration = {};
	const extractStyles = resolveStyleExtraction(options);

	if (extractStyles !== undefined) {
		configuration.extract = extractStyles;
	}

	if (!options.sassData) {
		return configuration;
	}

	const dataProperty = resolveSassDataProperty(options.projectRoot);
	const sassOptions = {
		quietDeps: true,
		silenceDeprecations: ['import', 'legacy-js-api'],
	};
	const scssLoaderOptions = {
		sassOptions: sassOptions,
	};

	if (options.sassImporter) {
		sassOptions.importer = options.sassImporter;
	}

	scssLoaderOptions[dataProperty] = options.sassData;

	configuration.loaderOptions = {
		sass: {
			sassOptions: sassOptions,
		},
		scss: {
			...scssLoaderOptions,
		},
	};

	return configuration;
}

/**
 * Create project aliases with one absolute Vue runtime shared by every
 * workspace-sourced package compiled into the application.
 *
 * @param Object options
 * @return Object
 */
function createAliases(options) {
	const aliases = Object.assign({}, options.aliases || {});

	aliases['vue$'] = require.resolve('vue/dist/vue.runtime.esm.js', {
		paths: [options.projectRoot],
	});

	return aliases;
}

/**
 * Create the webpack-chain callback shared by every Vue 2 project.
 *
 * @param Function | undefined configureProjectChain
 * @return Function
 */
function createWebpackChain(configureProjectChain) {
	/**
	 * Disable the duplicate Vue CLI lint rule and apply project extensions.
	 *
	 * @param any config
	 * @return void
	 */
	function configureWebpackChain(config) {
		config.module.rules.delete('eslint');

		if (configureProjectChain) {
			configureProjectChain(config);
		}
	}

	return configureWebpackChain;
}

/**
 * Create the plain Webpack configuration consumed by Vue CLI.
 *
 * @param Object options
 * @return Object
 */
function createWebpackConfiguration(options) {
	const configuration = {
		cache: {
			buildDependencies: {
				config: [path.join(options.projectRoot, 'vue.config.js')],
			},
			name: options.cacheName,
			type: 'filesystem',
		},
		devServer: createDevelopmentServer(options.developmentServer),
		externals: createLibraryExternals(options.externals || []),
		module: {
			rules: options.moduleRules || [],
		},
		plugins: options.plugins || [],
		resolve: {
			alias: createAliases(options),
			fallback: createNodeFallbacks(options.projectRoot, options.fallbacks),
			mainFields: options.mainFields || Config.DEFAULT_MAIN_FIELDS,
		},
	};

	if (options.snapshot) {
		configuration.snapshot = options.snapshot;
	}

	if (options.optimization) {
		configuration.optimization = options.optimization;
	}

	if (options.output) {
		configuration.output = options.output;
	}

	return configuration;
}

/**
 * Create a complete Vue CLI configuration from shared defaults and explicit
 * project-specific behavior.
 *
 * @param Object options
 * @return Object
 */
function createVue2Config(options) {
	const packageInformation = require(path.join(options.projectRoot, 'package.json'));

	process.env.VUE_APP_VERSION = packageInformation.version;

	const configuration = {
		chainWebpack: createWebpackChain(options.chainWebpack),
		configureWebpack: createWebpackConfiguration(options),
		css: createStyleConfiguration(options),
		publicPath: options.publicPath || process.env.VUE_APP_PUBLIC_PATH || Config.DEFAULT_PUBLIC_PATH,

		// Projects that need dependency transpilation can explicitly supply true
		// or a package list through the factory options.
		transpileDependencies: options.transpileDependencies || [],
	};

	if (options.outputDirectory) {
		configuration.outputDir = options.outputDirectory;
	}

	if (options.productionSourceMap !== undefined) {
		configuration.productionSourceMap = options.productionSourceMap;
	}

	return configuration;
}

module.exports = {
	createVue2Config: createVue2Config,
};
