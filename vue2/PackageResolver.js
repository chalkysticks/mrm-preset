/**
 * Installed-package resolution for ChalkySticks Vue 2 builds.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Vue2
 * @project ChalkySticks MRM Preset
 */

const fileSystem = require('fs');
const moduleSystem = require('module');
const path = require('path');

/**
 * Package manifest filename used to identify installed package roots.
 *
 * @type string
 */
const PACKAGE_MANIFEST_FILENAME = 'package.json';

/**
 * Resolve the root directory of an installed package without requiring its
 * package manifest to be exposed through the package exports map.
 *
 * @param string packageName
 * @param string projectRoot
 * @return string
 */
function resolveInstalledPackageRoot(packageName, projectRoot) {
	const projectRequire = moduleSystem.createRequire(path.join(projectRoot, PACKAGE_MANIFEST_FILENAME));
	const packageSearchPaths = projectRequire.resolve.paths(packageName) || [];

	for (const packageSearchPath of packageSearchPaths) {
		const packageRoot = path.join(packageSearchPath, packageName);
		const packageManifestPath = path.join(packageRoot, PACKAGE_MANIFEST_FILENAME);

		if (fileSystem.existsSync(packageManifestPath)) {
			return fileSystem.realpathSync(packageRoot);
		}
	}

	throw new Error(`Unable to resolve installed package "${packageName}" from "${projectRoot}".`);
}

/**
 * Resolve one installed package surface without relying on repository topology.
 *
 * @param string packageName
 * @param string projectRoot
 * @return Object
 */
function resolvePackageSurface(packageName, projectRoot) {
	return {
		packageRoot: resolveInstalledPackageRoot(packageName, projectRoot),
	};
}

module.exports = {
	resolvePackageSurface: resolvePackageSurface,
};
