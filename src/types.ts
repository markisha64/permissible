export type data = {
	index: bigint
	length: bigint
	[key: string]: bigint
}
export type jsonPermissions = Record<string, boolean | string>;
export type rules = Record<string, string | string[]>
export type rulesCompiled = {
	length: number,
	rules: Record<string, data>,
};
