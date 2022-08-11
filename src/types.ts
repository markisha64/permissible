export type data = {
	index: bigint
	length: bigint
	[key: string]: bigint
}
export type jsonPermissions = Record<string, boolean | string>;
export type rules = Record<string, string | string[]>
export type rulesCompiled<T> = {
	[key in keyof T]: data
};
