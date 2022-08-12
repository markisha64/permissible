import { Permissions, Schema } from '../src';
import { JsonPermissions } from '../lib/types';

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

const schema: Schema<typeof jsonSchema> = new Schema(jsonSchema);

const pString = 'OwgA';
const pFromString: Permissions<typeof jsonSchema> = Permissions.fromBase64(pString, schema);

if (pFromString.is(schema.fields.sendMessage)) {
  console.log('This user can send messages');
}

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

console.log('Setting permissions');
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

if (pJson.createThreads) {
  console.log('This user can create threads.');
}

const defaultPermissions: Permissions<typeof jsonSchema> = schema.createDefault();
console.log(defaultPermissions.toJson());
console.log(defaultPermissions.toBase64());

const pFromCtor: Permissions<typeof jsonSchema> = new Permissions(0n, schema);
console.log(pFromCtor.toJson());
