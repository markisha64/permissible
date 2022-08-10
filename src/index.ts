import Parser from './parser';

const toCompile: Record<string, string | string[]> = {
	test: 'boolean',
	test2: 'boolean',
	enum: [
		'lmao',
		'asdasd',
		'3adsad',
	],
};

const compiled = Parser.compile(toCompile);

const parsed = new Parser('aaaaa');

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
console.log(parsed.has(compiled.enum.asdasd));
