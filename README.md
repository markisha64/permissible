<div align="center">
    <h1>Permissible</h1>
    <br/>
    <h3>Fast, space-effective typescript permissions library</h3>
</div>

## Introduction

Permissible lets you define a schema for you permissions object.

It uses bitwise math and bigints to store permissions as a bitmask.These operations are very fast.
Currently, supported types: boolean and enum.

Converting the permissions object to base64 is useful because of its size. If you need to send permissions over jwt or smaller storage in database, assuming you don't need to query permissions. 

## Usage

Define you schema. To define a boolean value use `key: boolean` where the value is the default value. 
To define an enum use `{ default: string, fields: string[] }`, where fields is the array of available types and default is a value from the array.

```typescript
const jsonSchema = {
  sendMessage: true,
  readMessageHistory: true,
  deleteMessages: false,
  createThreads: true,
  sendEmoji: true,
  sendFiles: true,
  editChannels: false,
  createChannels: false,
  deleteChannels: false,
  kickUsers: false,
  banUsers: false,
  inviteUsers: true,
  type: {
    default: 'user',
    fields: [
      'user',
      'moderator',
      'admin',
      'owner',
    ],
  },
};
```
<br/>

Create your schema
```typescript
const schema: Schema<typeof jsonSchema> = new Schema(jsonSchema);
```
<br/>

You can create a Permissions object from base64 string
```typescript
const pString = 'OwgA';
const pFromString: Permissions<typeof jsonSchema> = Permissions.fromBase64(pString, schema);
```
<br/>

Check permissions using `.is(field, [value])`
```typescript
if (pFromString.is(schema.fields.sendMessage)) {
  console.log('This user can send messages');
}

if (pFromString.is(schema.fields.type, schema.fields.type.admin)) {
  console.log('This user is admin');
}
```
```text
This user can send messages
```
<br/>

Set permissions using `.set(field, value)`
```typescript
console.log('Checking permissions')
if (pFromString.is(schema.fields.type, schema.fields.type.admin)) {
  console.log('This user is admin');
}

if (pFromString.is(schema.fields.kickUsers)) {
  console.log('This user can kick users');
}

if (pFromString.is(schema.fields.banUsers)) {
  console.log('This user can ban users');
}

console.log('Setting permissions')
pFromString.set(schema.fields.kickUsers, true);
pFromString.set(schema.fields.banUsers, true);
pFromString.set(schema.fields.type, schema.fields.type.admin);

console.log('Checking permissions');
if (pFromString.is(schema.fields.type, schema.fields.type.admin)) {
  console.log('This user is admin');
}

if (pFromString.is(schema.fields.kickUsers)) {
  console.log('This user can kick users');
}

if (pFromString.is(schema.fields.banUsers)) {
  console.log('This user can ban users');
}

if (pFromString.is(schema.fields.type, schema.fields.type.admin)) {
  console.log('This user is admin');
}
```
```text
Checking permissions
Setting permissions
Checking permissions
This user is admin
This user can kick users
This user can ban users
```
<br/>

Create permissions from schema defaults
```typescript
const defaultPermissions: Permissions<typeof jsonSchema> = schema.createDefault();
console.log(defaultPermissions.toJson());
```
```text
{
  sendMessage: true,
  readMessageHistory: true,
  deleteMessages: false,
  createThreads: true,
  sendEmoji: true,
  sendFiles: true,
  editChannels: false,
  createChannels: false,
  deleteChannels: false,
  kickUsers: false,
  banUsers: false,
  inviteUsers: true,
  type: 'user'
}
```
<br/>

Create permissions from json
```typescript
const json: JsonPermissions = {
  sendMessage: true,
  readMessageHistory: true,
  deleteMessages: false,
  createThreads: true,
  sendEmoji: true,
  sendFiles: true,
  editChannels: false,
  createChannels: false,
  deleteChannels: false,
  kickUsers: false,
  banUsers: false,
  inviteUsers: true,
  type: 'user',
};

const pFromJson: Permissions<typeof jsonSchema> = Permissions.fromJson(json, schema);

const pJson: JsonPermissions = pFromJson.toJson();
console.log(pJson);
```
```text
{
  sendMessage: true,
  readMessageHistory: true,
  deleteMessages: false,
  createThreads: true,
  sendEmoji: true,
  sendFiles: true,
  editChannels: false,
  createChannels: false,
  deleteChannels: false,
  kickUsers: false,
  banUsers: false,
  inviteUsers: true,
  type: 'user'
}
```
<br/>

You can make empty permissions using the Permissions constructor
```typescript
const pFromCtor: Permissions<typeof jsonSchema> = new Permissions(0n, schema);
console.log(pFromCtor.toJson());
```
```text
{
  sendMessage: false,
  readMessageHistory: false,
  deleteMessages: false,
  createThreads: false,
  sendEmoji: false,
  sendFiles: false,
  editChannels: false,
  createChannels: false,
  deleteChannels: false,
  kickUsers: false,
  banUsers: false,
  inviteUsers: false,
  type: 'user'
}
```
<br/>

You can format as base64 or json
```typescript
const defaultPermissions: Permissions<typeof jsonSchema> = schema.createDefault();
console.log(defaultPermissions.toJson());
console.log(defaultPermissions.toBase64());
```
```text
{
  sendMessage: true,
  readMessageHistory: true,
  deleteMessages: false,
  createThreads: true,
  sendEmoji: true,
  sendFiles: true,
  editChannels: false,
  createChannels: false,
  deleteChannels: false,
  kickUsers: false,
  banUsers: false,
  inviteUsers: true,
  type: 'user'
}
OwgA
```



