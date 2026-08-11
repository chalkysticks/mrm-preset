# ChalkySticks Vue 2 build preset

This entry point owns the build behavior shared by the maintained Vue 2 projects:

- filesystem caching and development-server defaults;
- library-only dependency externals;
- Node browser fallbacks;
- Sass loader defaults;
- asset-resource rule construction; and
- workspace-first package resolution.

Each project retains a root `vue.config.js` and supplies only its package surfaces, asset catalogs, externals, and genuinely project-specific webpack behavior.

```js
const Vue2Preset = require('@chalkysticks/mrm-preset/vue2');

module.exports = Vue2Preset.createVue2Config({
	externals: ['vue', 'vue-router', 'vuex'],
	moduleRules: [Vue2Preset.createAssetResourceRule(['glb', 'gltf'])],
	projectRoot: __dirname,
});
```

Logical asset transformation remains owned by `@chalkysticks/asset-loader/vue-cli`; this preset only helps projects resolve and compose that integration.
