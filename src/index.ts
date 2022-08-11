import Parser from './parser';

const toCompile: Record<string, string | string[]> = {
	test: 'boolean',
	test2: 'boolean',
	enum: [
		'lmao',
		'asdasd',
		'test',
	],
};

const compiled = Parser.compile(toCompile);

const parsed = new Parser('a1');

console.log(parsed.is(compiled.test, true));

parsed.set(compiled.test, false);

console.log(parsed.is(compiled.test, true));
