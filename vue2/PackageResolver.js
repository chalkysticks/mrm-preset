/**
 * Workspace-first package resolution for ChalkySticks Vue 2 builds.
 *
 * @author Matt Kenefick <matt@chalkysticks.com>
 * @package Vue2
 * @project ChalkySticks MRM Preset
 */

const fileSystem = require('fs');
const path = require('path');

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
	const packageRoot = workspaceAvailable
		? workspaceRoot
		: path.dirname(
				require.resolve(`${packageName}/package.json`, {
					paths: [projectRoot],
				}),
		  );

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
