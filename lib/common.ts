export type TestError = Error | {};

export interface Options {
	dir?: string;
	outDir?: string;
	args?: string[];
	executablePath?: string;
	file?: string;
	height?: number;
	reporter?: string;
	width?: number;
	timeout?: number;
	visible?: boolean;
}

export interface TestDescription {
	duration: number;
	err: TestError;
	fullTitle: string;
	title: string;
}

export interface ResultStats {
	duration: number;
	end: string;
	failures: number;
	passes: number;
	pending: number;
	start: string;
	tests: number;
}

export interface Result {
	failures: TestDescription[];
	passed: TestDescription[];
	pending: TestDescription[];
	stats: ResultStats;
	tests: TestDescription[];
}

export interface Run {
	coverage: object | undefined;
	result: Result;
}