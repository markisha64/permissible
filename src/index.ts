import { toBigIntLE, toBufferLE } from 'bigint-buffer';
import { data, jsonPermissions, rules, rulesCompiled } from './types';

export function compile<T extends rules>(permissionRules: T): rulesCompiled<T> {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const compiled: rulesCompiled<T> = {};

	let index = 0n;
	for (const rule in permissionRules) {
		const toCompile: string | string[] = permissionRules[rule];
		if (typeof toCompile === 'string') {
			compiled[rule] = {
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

			compiled[rule] = enumerated;
			index += max;
		}
	}

	return compiled;
}

function compiledLength<T extends rules>(compiled: rulesCompiled<T>): number {
	let length = 0;
	for (const key in Object.keys(compiled)) {
		length += Array.isArray(compiled[key]) ? Number(compiled[key].length)	: 1;
	}

	return length;
}

class ParameterError extends Error {}
const base64Regex = /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{4}|[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}={2})$/g;

export class Permissions<T extends rules> {
	private permissions: bigint;
	private compiled: rulesCompiled<T>;

	static fromBase64<U extends rules>(permissions: string, compiled: rulesCompiled<U>): Permissions<U> {
		const length: number = compiledLength(compiled);
		if (Math.ceil(length / 24) * 4 !== permissions.length) {
			throw new ParameterError(`Invalid string input, expected string of length ${Math.ceil(length / 24) * 4}, received string of length ${permissions.length}.`);
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

			if (compiled[key].length === 1n && typeof value === 'boolean') {
				permissionsObject.set(compiled[key], value);
			}

			if (compiled[key].length > 1n && typeof value === 'string' && compiled[key][value]) {
				permissionsObject.set(compiled[key], compiled[key][value]);
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
		const length: number = compiledLength(this.compiled);

		return toBufferLE(this.permissions, Math.ceil(length / 24) * 3).toString('base64');
	}

	toJson(): jsonPermissions {
		const json: jsonPermissions = {};

		for (const key in this.compiled) {
			if (this.compiled[key].length === 1n) {
				json[key] = this.is(this.compiled[key], true);
			}
			else {
				const keys: string[] = Object.keys(this.compiled[key]);
				const value: bigint = this.permissions % 2n ** (this.compiled[key].length + this.compiled[key].index) >> this.compiled[key].index;

				const foundKey: string | undefined = keys.find((val) => this.compiled[key][val] === value && !['index', 'length'].includes(val));

				if (foundKey) json[key] = foundKey;
			}
		}

		return json;
	}
}
