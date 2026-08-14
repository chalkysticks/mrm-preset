/**
 * Workspace-first package resolution for ChalkySticks Vue 2 builds.
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
 * Resolve a package from a sibling workspace when its required build marker is
 * available, otherwise resolve the installed dependency.
 *
 * @param string packageName
 * @param string projectRoot
 * @param string workspacePath
 * @param string workspaceMarker
 * @return Object
 */
function resolvePackageSurface(packageName, projectRoot, workspacePath, workspaceMarker) {
	const workspaceRoot = path.resolve(projectRoot, workspacePath);
	const workspaceAvailable = fileSystem.existsSync(path.join(workspaceRoot, workspaceMarker));
	const packageRoot = workspaceAvailable ? workspaceRoot : resolveInstalledPackageRoot(packageName, projectRoot);

	return {
		packageRoot: packageRoot,
		workspaceAvailable: workspaceAvailable,
		workspaceRoot: workspaceRoot,
	};
}

/**
 * Resolve one executable module from a sibling workspace or the installed
 * package dependency.
 *
 * @param string moduleIdentifier
 * @param string projectRoot
 * @param string workspaceEntry
 * @param string workspacePath
 * @return string
 */
function resolveWorkspaceModule(moduleIdentifier, projectRoot, workspaceEntry, workspacePath) {
	const workspaceModulePath = path.resolve(projectRoot, workspacePath, workspaceEntry);

	if (fileSystem.existsSync(workspaceModulePath)) {
		return workspaceModulePath;
	}

	return require.resolve(moduleIdentifier, {
		paths: [projectRoot],
	});
}

module.exports = {
	resolvePackageSurface: resolvePackageSurface,
	resolveWorkspaceModule: resolveWorkspaceModule,
};
