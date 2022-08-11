import { toBigIntLE, toBufferLE } from 'bigint-buffer';
import { data, jsonPermissions, rules, rulesCompiled } from './types';

export function compile<T extends rules>(permissionRules: T): rulesCompiled<T> {
	const compiled: rulesCompiled<T> = {
		length: 0,
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		rules: {},
	};

	let index = 0n;
	for (const rule in permissionRules) {
		const toCompile: string | string[] = permissionRules[rule];
		if (typeof toCompile === 'string') {
			compiled.rules[rule] = {
				index,
				length: 1n,
			};

			index++;
		}
		else {
			const toEnum: string[] = toCompile;
			const enumerated: data = {
				index,
				length: BigInt(Math.floor(Math.log2(toEnum.length)) + 1),
			};

			const max = BigInt(Math.floor(Math.log2(toEnum.length)) + 1);
			for (let i = 0; i < toEnum.length; i++) {
				enumerated[toEnum[i]] = BigInt(i);
			}

			compiled.rules[rule] = enumerated;
			index += max;
		}
	}

	compiled.length = Number(index) + 1;

	return compiled;
}

class ParameterError extends Error {}
const base64Regex = /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{4}|[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}={2})$/g;

export class Permissions<T extends rules> {
	private permissions: bigint;
	private compiled: rulesCompiled<T>;

	static fromBase64<U extends rules>(permissions: string, compiled: rulesCompiled<U>): Permissions<U> {
		if (Math.ceil(compiled.length / 24) * 4 !== permissions.length) {
			throw new ParameterError(`Invalid string input, expected string of length ${Math.ceil(compiled.length / 24) * 4}, received string of length ${permissions.length}.`);
		}

		if (!base64Regex.exec(permissions)) {
			throw new ParameterError('Invalid base64 string');
		}

		return new Permissions(toBigIntLE(Buffer.from(permissions, 'base64')), compiled);
	}

	static fromJson<U extends rules>(permissions: jsonPermissions, compiled: rulesCompiled<U>): Permissions<U> {
		const permissionsObject: Permissions<U> = new Permissions(0n, compiled);

		for (const key in permissions) {
			const value: string | boolean = permissions[key];

			if (compiled.rules[key].length === 1n && typeof value === 'boolean') {
				permissionsObject.set(compiled.rules[key], value);
			}

			if (compiled.rules[key].length > 1n && typeof value === 'string' && compiled.rules[key][value]) {
				permissionsObject.set(compiled.rules[key], compiled.rules[key][value]);
			}
		}

		return permissionsObject;
	}

	private constructor(permissions: bigint, compiled: rulesCompiled<T>) {
		this.permissions = permissions;
		this.compiled = compiled;
	}

	is(permission: data, value: bigint | boolean): boolean {
		if (typeof value === 'boolean') {
			value = value ? 1n : 0n;
		}

		if (permission.length === 1n) {
			return !!(this.permissions & (1n << permission.index)) === !!value;
		}

		return value === this.permissions % 2n ** (permission.index + permission.length) >> permission.index;
	}

	set(permission: data, value: bigint | boolean): void {
		if (typeof value === 'boolean') {
			value = value ? 1n : 0n;
		}

		value = value % 2n ** permission.length;

		const mod: bigint = this.permissions % 2n ** permission.index;
		const div: bigint = permission.index + permission.length;
		const cleared: bigint = this.permissions >> div << div;

		this.permissions = cleared | mod | value << permission.index;
	}

	toBase64(): string {
		return toBufferLE(this.permissions, Math.ceil(this.compiled.length / 24) * 3).toString('base64');
	}

	toJson(): jsonPermissions {
		const json: jsonPermissions = {};

		for (const key in this.compiled.rules) {
			if (this.compiled.rules[key].length === 1n) {
				json[key] = this.is(this.compiled.rules[key], true);
			}
			else {
				const keys: string[] = Object.keys(this.compiled.rules[key]);
				const value: bigint = this.permissions % 2n ** (this.compiled.rules[key].length + this.compiled.rules[key].index) >> this.compiled.rules[key].index;

				const foundKey: string | undefined = keys.find((val) => this.compiled.rules[key][val] === value && !['index', 'length'].includes(val));

				if (foundKey) json[key] = foundKey;
			}
		}

		return json;
	}
}
