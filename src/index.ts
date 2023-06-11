import { toBigIntLE, toBufferLE } from 'bigint-buffer';
import { Field, JsonPermissions, JsonSchema, Fields } from './types';

export class Schema<T extends JsonSchema> {
  public readonly length: number;
  public readonly fields: Fields<T>;
  private readonly default: bigint;

  constructor(jsonSchema: T) {
    this.fields = Object.create(jsonSchema);

    let index = 0n;
    for (const field in jsonSchema) {
      const value: boolean | { default: string, fields: string[] } = jsonSchema[field];
      if (typeof value === 'boolean') {
        this.fields[field] = {
          index,
          length: 1n,
        };

        index++;
      }
      else {
        const enumerated: Field = {
          index,
          length: BigInt(Math.floor(Math.log2(value.fields.length)) + 1),
        };

        if (!value.fields.includes(value.default)) {
          throw new ParameterError('Default value doesn\'t exist in enum.');
        }

        const max = BigInt(Math.floor(Math.log2(value.fields.length)) + 1);
        for (let i = 0; i < value.fields.length; i++) {
          enumerated[value.fields[i]] = BigInt(i);
        }

        this.fields[field] = enumerated;
        index += max;
      }
    }

    this.length = Number(index);

    const permissions: Permissions<T> = new Permissions<T>(0n, this);
    for (const field in jsonSchema) {
      const value: boolean | { default: string, fields: string[] } = jsonSchema[field];
      if (typeof value === 'boolean') {
        permissions.set(this.fields[field], value);
      }
      else {
        permissions.set(this.fields[field], this.fields[field][value.default]);
      }
    }

    this.default = permissions.valueOf();
  }

  createDefault(): Permissions<T> {
    return new Permissions<T>(this.default, this);
  }
}

class ParameterError extends Error {
}

const base64Regex = /^(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{4}|[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}={2})$/g;

export class Permissions<T extends JsonSchema> {
  private permissions: bigint;
  private schema: Schema<T>;

  static fromBase64<U extends JsonSchema>(permissions: string, schema: Schema<U>): Permissions<U> {
    if (Math.ceil(schema.length / 24) * 4 !== permissions.length) {
      throw new ParameterError(`Invalid string input, expected string of length ${ Math.ceil(schema.length / 24) * 4 }, received string of length ${ permissions.length }.`);
    }

    if (!base64Regex.exec(permissions)) {
      throw new ParameterError('Invalid base64 string');
    }

    return new Permissions(toBigIntLE(Buffer.from(permissions, 'base64')), schema);
  }

  static fromJson<U extends JsonSchema>(permissions: JsonPermissions, schema: Schema<U>): Permissions<U> {
    const permissionsObject: Permissions<U> = new Permissions(0n, schema);

    for (const key in permissions) {
      const value: string | boolean = permissions[key];

      if (schema.fields[key].length === 1n && typeof value === 'boolean') {
        permissionsObject.set(schema.fields[key], value);
      }

      if (schema.fields[key].length > 1n && typeof value === 'string' && schema.fields[key][value]) {
        permissionsObject.set(schema.fields[key], schema.fields[key][value]);
      }
    }

    return permissionsObject;
  }

  constructor(permissions: bigint, schema: Schema<T>) {
    this.permissions = permissions;
    this.schema = schema;
  }

  valueOf(): bigint {
    return this.permissions;
  }

  is(field: Field, value?: bigint): boolean {
    if (value === undefined) value = 1n;

    if (field.length === 1n) {
      return !!(this.permissions & (1n << field.index)) === !!value;
    }

    return value === this.permissions % 2n ** (field.index + field.length) >> field.index;
  }

  set(field: Field, value: bigint | boolean): void {
    if (typeof value === 'boolean') {
      value = value ? 1n : 0n;
    }

    value = value % 2n ** field.length;

    const mod: bigint = this.permissions % 2n ** field.index;
    const div: bigint = field.index + field.length;
    const cleared: bigint = this.permissions >> div << div;

    this.permissions = cleared | mod | value << field.index;
  }

  toBase64(): string {
    return toBufferLE(this.permissions, Math.ceil(this.schema.length / 24) * 3).toString('base64');
  }

  toJson(): JsonPermissions {
    const json: JsonPermissions = {};

    for (const key in this.schema.fields) {
      if (this.schema.fields[key].length === 1n) {
        json[key] = this.is(this.schema.fields[key]);
      }
      else {
        const keys: string[] = Object.keys(this.schema.fields[key]);
        const value: bigint = this.permissions % 2n ** (this.schema.fields[key].length + this.schema.fields[key].index) >> this.schema.fields[key].index;

        const foundKey: string | undefined = keys.find((val) => this.schema.fields[key][val] === value && !['index', 'length'].includes(val));

        if (foundKey) json[key] = foundKey;
      }
    }

    return json;
  }
}
