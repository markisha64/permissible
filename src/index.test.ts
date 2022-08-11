import { Permissions, compile } from './index';
import { jsonPermissions, rulesCompiled } from './types';

const schema = {
	writeAccess: 'boolean',
	readAccess: 'boolean',
	deleteAccess: 'boolean',
	type: [
		'moderator',
		'admin',
		'user',
		'guest',
	],
	premium: 'boolean',
	visible: 'boolean',
};

const compiled: rulesCompiled<typeof schema> = compile(schema);

const json: jsonPermissions = {
	writeAccess: false,
	readAccess: true,
	deleteAccess: false,
	type: 'user',
	premium: true,
	visible: true,
};

const validBase64: string = Permissions.fromJson(json, compiled).toBase64();

test('from/to json', () => {
	const permissions: Permissions<typeof schema> = Permissions.fromJson(json, compiled);

	expect(permissions.toJson()).toStrictEqual(json);
});

test('from/to base64', () => {
	const permissions: Permissions<typeof schema> = Permissions.fromBase64(validBase64, compiled);

	expect(permissions.toBase64()).toBe(validBase64);
});

test('is/set values', () => {
	const permissions: Permissions<typeof schema> = Permissions.fromJson(json, compiled);

	expect(permissions.is(compiled.writeAccess, true)).toBe(false);
	expect(permissions.is(compiled.readAccess, true)).toBe(true);
	expect(permissions.is(compiled.deleteAccess, true)).toBe(false);
	expect(permissions.is(compiled.type, compiled.type.user)).toBe(true);
	expect(permissions.is(compiled.premium, true)).toBe(true);
	expect(permissions.is(compiled.visible, true)).toBe(true);

	permissions.set(compiled.type, compiled.type.admin);
	permissions.set(compiled.visible, false);
	permissions.set(compiled.writeAccess, true);
	permissions.set(compiled.deleteAccess, true);

	expect(permissions.is(compiled.writeAccess, true)).toBe(true);
	expect(permissions.is(compiled.readAccess, true)).toBe(true);
	expect(permissions.is(compiled.deleteAccess, true)).toBe(true);
	expect(permissions.is(compiled.type, compiled.type.admin)).toBe(true);
	expect(permissions.is(compiled.premium, true)).toBe(true);
	expect(permissions.is(compiled.visible, true)).toBe(false);
});

test('string length', () => {
	expect(() => Permissions.fromBase64('a', compiled)).toThrow('Invalid string input, expected string of length 4, received string of length 1.');
	expect(() => Permissions.fromBase64('aadasdad', compiled)).toThrow('Invalid string input, expected string of length 4, received string of length 8.');
});

test('base64', () => {
	expect(() => Permissions.fromBase64('aa?d', compiled)).toThrow('Invalid base64 string');
});
