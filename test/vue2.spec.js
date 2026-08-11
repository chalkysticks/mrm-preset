/**
 * Behavioral coverage for the shared Vue 2 configuration factory.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Test/Vue2
 * @project ChalkySticks MRM Preset
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { createAssetResourceRule, createVue2Config } = require('../vue2');

/**
 * Verify that the shared factory preserves common defaults and project
 * extensions.
 *
 * @return void
 */
function testVue2ConfigurationFactory() {
	const originalArguments = process.argv;
	let projectChainConfigured = false;

	process.argv = ['node', 'vue-cli-service', 'build', '--target', 'lib'];

	try {
		const configuration = createVue2Config({
			aliases: {
				example: '/example',
			},
			chainWebpack: configureProjectChain,
			externals: ['vue'],
			fallbacks: {
				util: false,
			},
			moduleRules: [createAssetResourceRule(['glb', 'gltf'])],
			projectRoot: path.resolve(__dirname, '..'),
			sassData: '@import "mixins";',
		});
		const deletedRules = [];
		const webpackChain = {
			module: {
				rules: {
					delete: deleteRule,
				},
			},
		};

		/**
		 * Record one deleted webpack-chain rule.
		 *
		 * @param string ruleName
		 * @return void
		 */
		function deleteRule(ruleName) {
			deletedRules.push(ruleName);
		}

		/**
		 * Record execution of the project-specific chain extension.
		 *
		 * @return void
		 */
		function configureProjectChain() {
			projectChainConfigured = true;
		}

		configuration.chainWebpack(webpackChain);

		assert.deepEqual(deletedRules, ['eslint']);
		assert.equal(projectChainConfigured, true);
		assert.equal(configuration.configureWebpack.externals.vue, 'commonjs2 vue');
		assert.equal(configuration.configureWebpack.module.rules[0].type, 'asset/resource');
		assert.equal(configuration.configureWebpack.resolve.alias.example, '/example');
		assert.equal(configuration.configureWebpack.resolve.fallback.util, false);
		assert.equal(configuration.css.extract, false);
		assert.equal(configuration.css.loaderOptions.scss.prependData, '@import "mixins";');
	} finally {
		process.argv = originalArguments;
	}
}

test('creates shared Vue 2 configuration', testVue2ConfigurationFactory);
