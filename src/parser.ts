type data = {
	index: bigint
	length: bigint
	[key: string]: bigint
}

import { toBigIntLE } from 'bigint-buffer';

type rules = Record<string, string | string[]>
type rulesCompiled = Record<string, data>;

function bigIntPow(b: bigint, e: bigint): bigint {
	if (e === 1n) {
		return b;
	}

	const x = bigIntPow(b, e / 2n);
	if (e % 2n === 0n) {
		return x * x;
	}
	else {
		return x * x * b;
	}
}

export default class Parser {
	private permissions: bigint;

	static compile(permissionRules: rules): rulesCompiled {
		const compiled: rulesCompiled = {};

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

	constructor(permissions: string) {
		this.permissions = toBigIntLE(Buffer.from(permissions, 'base64'));
	}

	is(permission: data, value: bigint | boolean): boolean {
		if (permission.length === 1n) {
			return !!(this.permissions & (1n << permission.index)) === !!value;
		}

		console.log(this.permissions.toString(2));
		console.log(value.toString(2));

		return value === this.permissions % bigIntPow(2n, permission.index + permission.length) / bigIntPow(2n, permission.index);
	}
}
