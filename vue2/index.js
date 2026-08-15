/**
 * Public Vue 2 build-configuration entry point.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Vue2
 * @project ChalkySticks MRM Preset
 */

const { resolvePackageSurface } = require('./PackageResolver');
const { createVue2Config } = require('./VueConfig');
const { configureSassAliases, createAssetResourceRule } = require('./Webpack');

module.exports = {
	configureSassAliases: configureSassAliases,
	createAssetResourceRule: createAssetResourceRule,
	createVue2Config: createVue2Config,
	resolvePackageSurface: resolvePackageSurface,
};
