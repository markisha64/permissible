import { Permissions, Schema } from './index';
import { JsonPermissions } from './types';

const jsonSchema = {
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

const schema: Schema<typeof jsonSchema> = new Schema(jsonSchema);

const json: JsonPermissions = {
	writeAccess: false,
	readAccess: true,
	deleteAccess: false,
	type: 'user',
	premium: true,
	visible: true,
};

const validBase64: string = Permissions.fromJson(json, schema).toBase64();

test('from/to json', () => {
	const permissions: Permissions<typeof jsonSchema> = Permissions.fromJson(json, schema);

	expect(permissions.toJson()).toStrictEqual(json);
});

test('from/to base64', () => {
	const permissions: Permissions<typeof jsonSchema> = Permissions.fromBase64(validBase64, schema);

	expect(permissions.toBase64()).toBe(validBase64);
});

test('is/set values', () => {
	const permissions: Permissions<typeof jsonSchema> = Permissions.fromJson(json, schema);

	expect(permissions.is(schema.fields.writeAccess, true)).toBe(false);
	expect(permissions.is(schema.fields.readAccess, true)).toBe(true);
	expect(permissions.is(schema.fields.deleteAccess, true)).toBe(false);
	expect(permissions.is(schema.fields.type, schema.fields.type.user)).toBe(true);
	expect(permissions.is(schema.fields.premium, true)).toBe(true);
	expect(permissions.is(schema.fields.visible, true)).toBe(true);

	permissions.set(schema.fields.type, schema.fields.type.admin);
	permissions.set(schema.fields.visible, false);
	permissions.set(schema.fields.writeAccess, true);
	permissions.set(schema.fields.deleteAccess, true);

	expect(permissions.is(schema.fields.writeAccess, true)).toBe(true);
	expect(permissions.is(schema.fields.readAccess, true)).toBe(true);
	expect(permissions.is(schema.fields.deleteAccess, true)).toBe(true);
	expect(permissions.is(schema.fields.type, schema.fields.type.admin)).toBe(true);
	expect(permissions.is(schema.fields.premium, true)).toBe(true);
	expect(permissions.is(schema.fields.visible, true)).toBe(false);
});

test('string length', () => {
	expect(() => Permissions.fromBase64('a', schema)).toThrow('Invalid string input, expected string of length 4, received string of length 1.');
	expect(() => Permissions.fromBase64('aadasdad', schema)).toThrow('Invalid string input, expected string of length 4, received string of length 8.');
});

test('base64', () => {
	expect(() => Permissions.fromBase64('aa?d', schema)).toThrow('Invalid base64 string');
});
