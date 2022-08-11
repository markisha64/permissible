import { Permissions, compile } from './index';
import { jsonPermissions, rules, rulesCompiled } from './types';

const schema: rules = {
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

const compiled: rulesCompiled = compile(schema);

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
	const permissions: Permissions = Permissions.fromJson(json, compiled);

	expect(permissions.toJson()).toStrictEqual(json);
});

test('from/to base64', () => {
	const permissions: Permissions = Permissions.fromBase64(validBase64, compiled);

	expect(permissions.toBase64()).toBe(validBase64);
});

test('is/set values', () => {
	const permissions: Permissions = Permissions.fromJson(json, compiled);

	expect(permissions.is(compiled.rules.writeAccess, true)).toBe(false);
	expect(permissions.is(compiled.rules.readAccess, true)).toBe(true);
	expect(permissions.is(compiled.rules.deleteAccess, true)).toBe(false);
	expect(permissions.is(compiled.rules.type, compiled.rules.type.user)).toBe(true);
	expect(permissions.is(compiled.rules.premium, true)).toBe(true);
	expect(permissions.is(compiled.rules.visible, true)).toBe(true);

	permissions.set(compiled.rules.type, compiled.rules.type.admin);
	permissions.set(compiled.rules.visible, false);
	permissions.set(compiled.rules.writeAccess, true);
	permissions.set(compiled.rules.deleteAccess, true);

	expect(permissions.is(compiled.rules.writeAccess, true)).toBe(true);
	expect(permissions.is(compiled.rules.readAccess, true)).toBe(true);
	expect(permissions.is(compiled.rules.deleteAccess, true)).toBe(true);
	expect(permissions.is(compiled.rules.type, compiled.rules.type.admin)).toBe(true);
	expect(permissions.is(compiled.rules.premium, true)).toBe(true);
	expect(permissions.is(compiled.rules.visible, true)).toBe(false);
});
