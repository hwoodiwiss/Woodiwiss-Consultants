module.exports = {
	roots: ["./src/"],
	preset: "jest-preset-angular",
	reporters: ["default", "jest-junit"],
	collectCoverage: true,
	coverageDirectory: "./coverage",
	testMatch: ["**/+(*.)+(spec).+(ts)"],
	coverageReporters: ["text", "cobertura"],
	transform: {
		"^.+\\.js$": "babel-jest",
		"^.+\\.(ts|tsx)$": "ts-jest",
	},
	moduleFileExtensions: ["js", "ts"],
	collectCoverage: true,
	coverageReporters: ["text", "cobertura"],
	coverageDirectory: "./coverage",
	transformIgnorePatterns: ["node_modules/(?!(ol)/)"],
	setupFilesAfterEnv: ["./setupJest.ts"],
};
