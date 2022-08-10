type data = {
	index: bigint
	value: bigint
	max: bigint
}

import { toBigIntLE } from 'bigint-buffer';

type rules = Record<string, string | string[]>
type rulesCompiled = Record<string, data | Record<string, data>>;

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
					value: 1n,
					index,
					max: 1n,
				};

				index++;
			}
			else {
				const toEnum: string[] = toCompile;
				const enumerated: Record<string, data> = {};

				const max = BigInt(Math.floor(Math.log2(toEnum.length)) + 1);
				for (let i = 0; i < toEnum.length; i++) {
					enumerated[toEnum[i]] = {
						value: BigInt(i),
						index,
						max,
					};
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

	has(permission: data): boolean {
		if (permission.max === 1n) {
			return !!(this.permissions & (permission.value << permission.index));
		}

		return permission.value === this.permissions % bigIntPow(2n, permission.index + permission.max) / bigIntPow(2n, permission.index);
	}
}
