/**
 * Behavioral coverage for workspace-first package resolution.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Test/Vue2
 * @project ChalkySticks MRM Preset
 */

const assert = require('node:assert/strict');
const fileSystem = require('node:fs');
const operatingSystem = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { resolvePackageSurface } = require('../vue2');

/**
 * Scoped package name used by the restricted exports regression fixture.
 *
 * @type string
 */
const RESTRICTED_PACKAGE_NAME = '@chalkysticks/restricted-exports-fixture';

/**
 * Verify that installed packages remain resolvable when their package exports
 * map does not expose the package manifest.
 *
 * @return void
 */
function testRestrictedPackageExportsResolution() {
	const projectRoot = fileSystem.mkdtempSync(path.join(operatingSystem.tmpdir(), 'chalky-package-resolver-'));
	const packageRoot = path.join(projectRoot, 'node_modules', RESTRICTED_PACKAGE_NAME);

	fileSystem.mkdirSync(packageRoot, {
		recursive: true,
	});
	fileSystem.writeFileSync(path.join(projectRoot, 'package.json'), '{"private":true}\n');
	fileSystem.writeFileSync(
		path.join(packageRoot, 'package.json'),
		JSON.stringify({
			exports: {
				'.': {
					import: './index.js',
				},
			},
			name: RESTRICTED_PACKAGE_NAME,
			type: 'module',
			version: '1.0.0',
		}),
	);

	try {
		const packageSurface = resolvePackageSurface(RESTRICTED_PACKAGE_NAME, projectRoot);

		assert.deepEqual(packageSurface, {
			packageRoot: fileSystem.realpathSync(packageRoot),
		});
	} finally {
		fileSystem.rmSync(projectRoot, {
			force: true,
			recursive: true,
		});
	}
}

test('resolves installed packages with restricted exports', testRestrictedPackageExportsResolution);
