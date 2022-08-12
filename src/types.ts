export type Data = {
	index: bigint
	length: bigint
	[key: string]: bigint
}
export type JsonPermissions = Record<string, boolean | string>;
export type JsonSchema = Record<string, string | string[]>
export type Fields<T> = {
	[key in keyof T]: Data
};
