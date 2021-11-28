module.exports = {
	roots: ["./src/"],
	preset: "jest-preset-angular",
	reporters: ["default", "jest-junit"],
	collectCoverage: true,
	coverageDirectory: "./coverage",
	testMatch: ["**/+(*.)+(spec).+(ts)"],
	coverageReporters: ["text", "cobertura"],
	resolver: "jest-preset-angular/build/resolvers/ng-jest-resolver.js",
	moduleDirectories: ["node_modules", "."],
	transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$)"],
	transform: {
		"^.+\\.(ts|js|mjs|html|svg)$": "jest-preset-angular",
	},
	moduleFileExtensions: ["ts", "html", "js", "json", "mjs"],
	collectCoverage: true,
	coverageReporters: ["text", "cobertura"],
	coverageDirectory: "./coverage",
};
