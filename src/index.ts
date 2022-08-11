import { compile, Permissions } from './parser';

const toCompile: Record<string, string | string[]> = {
	test: 'boolean',
	test2: 'boolean',
	enum: [
		'lmao',
		'asdasd',
		'test',
	],
};

const compiled = compile(toCompile);

const json = {
	test: true,
	test2: true,
	enum: 'test',
};

const parsed = Permissions.fromJson(json, compiled);

console.log(parsed.toJson());
console.log(parsed.toBase64());


console.log(parsed.is(compiled.rules.test, true));

parsed.set(compiled.rules.test, false);

console.log(parsed.is(compiled.rules.test, true));
