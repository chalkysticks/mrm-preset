/**
 * Shared Vue CLI configuration factory for ChalkySticks Vue 2 projects.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Vue2
 * @project ChalkySticks MRM Preset
 */

const Config = require('./Config');
const path = require('path');
const { createLibraryExternals, createNodeFallbacks } = require('./Webpack');

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
 * Create the Vue CLI Sass configuration when a shared prelude is supplied.
 *
 * @param string | undefined sassData
 * @return Object
 */
function createStyleConfiguration(sassData) {
	if (!sassData) {
		return {
			extract: false,
		};
	}

	return {
		extract: false,
		loaderOptions: {
			scss: {
				prependData: sassData,

				// Newer sass-loader releases may use the modern-compiler API here.
				// The current Vue 2 projects remain on sass-loader 8, so the shared
				// preset silences only the known legacy API and import warnings.
				sassOptions: {
					quietDeps: true,
					silenceDeprecations: ['import', 'legacy-js-api'],
				},
			},
		},
	};
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
			type: 'filesystem',
		},
		devServer: createDevelopmentServer(options.developmentServer),
		externals: createLibraryExternals(options.externals || []),
		module: {
			rules: options.moduleRules || [],
		},
		plugins: options.plugins || [],
		resolve: {
			alias: options.aliases || {},
			fallback: createNodeFallbacks(options.projectRoot, options.fallbacks),
			mainFields: options.mainFields || Config.DEFAULT_MAIN_FIELDS,
		},
	};

	if (options.snapshot) {
		configuration.snapshot = options.snapshot;
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
		css: createStyleConfiguration(options.sassData),
		publicPath: options.publicPath || process.env.VUE_APP_PUBLIC_PATH || Config.DEFAULT_PUBLIC_PATH,

		// Projects that need dependency transpilation can explicitly supply true
		// or a package list through the factory options.
		transpileDependencies: options.transpileDependencies || [],
	};

	if (options.outputDirectory) {
		configuration.outputDir = options.outputDirectory;
	}

	return configuration;
}

module.exports = {
	createVue2Config: createVue2Config,
};
