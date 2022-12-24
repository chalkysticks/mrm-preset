module.exports = {
	collectCoverage: false,
	globals: {
		'ts-jest': {
			isolatedModules: true,
			tsconfig: 'tsconfig.module.json',
		}
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
	preset: 'ts-jest',
	testEnvironment: 'node',
	testPathIgnorePatterns: ['/lib/', '/node_modules/'],
	transform: {
		'^.+\\.(ts|tsx)?$': 'ts-jest',
		"^.+\\.(js|jsx)$": "babel-jest",
	}
};
