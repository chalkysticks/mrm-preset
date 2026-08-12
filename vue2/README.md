# ChalkySticks Vue 2 build preset

This entry point owns the build behavior shared by the maintained Vue 2 projects:

- filesystem caching and development-server defaults;
- library-only dependency externals;
- Node browser fallbacks;
- Sass loader defaults;
- Vue CLI's environment-aware CSS extraction defaults;
- one project-root Vue runtime for workspace-sourced packages;
- asset-resource rule construction; and
- workspace-first package resolution.

Each project retains a root `vue.config.js` and supplies only its package surfaces, asset catalogs, externals, and genuinely project-specific webpack behavior.

```js
const Vue2Preset = require('@chalkysticks/mrm-preset/vue2');

module.exports = Vue2Preset.createVue2Config({
	cacheName: 'web-profile',
	externals: ['vue', 'vue-router', 'vuex'],
	moduleRules: [Vue2Preset.createAssetResourceRule(['glb', 'gltf'])],
	projectRoot: __dirname,
});
```

Logical asset transformation remains owned by `@chalkysticks/asset-loader/vue-cli`; this preset only helps projects resolve and compose that
integration.

For application builds, the preset leaves `css.extract` unset so Vue CLI injects styles during development and extracts styles in production. Library
builds preserve the existing injected-style contract by setting `css.extract` to `false`. A project that intentionally requires a different delivery
model can provide `extractStyles: true` or `extractStyles: false`.

Projects that produce multiple target variants from the same source tree must provide a distinct `cacheName` for each target. This prevents Webpack's
filesystem cache from reusing modules transformed with another target's asset formats or exclusions.
