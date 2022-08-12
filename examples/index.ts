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

const defaultPermissions: string = schema.createDefault().toBase64();
console.log(defaultPermissions);

const pString = 'OwgA';
const pFromString: Permissions<typeof jsonSchema> = Permissions.fromBase64(pString, schema);

if (pFromString.is(schema.fields.sendMessage, false)) {
  console.log('This user can\'t send messages');
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

if (pFromString.is(schema.fields.type, schema.fields.type.admin)) {
  console.log('This user is admin');
}

if (pFromString.is(schema.fields.kickUsers, true)) {
  console.log('This user can kick users');
}

if (pFromString.is(schema.fields.banUsers, true)) {
  console.log('This user can ban users');
}

pFromJson.set(schema.fields.kickUsers, true);
pFromJson.set(schema.fields.banUsers, true);
pFromJson.set(schema.fields.type, schema.fields.type.admin);

if (pFromString.is(schema.fields.type, schema.fields.type.admin)) {
  console.log('This user is admin');
}

if (pFromString.is(schema.fields.kickUsers, true)) {
  console.log('This user can kick users');
}

if (pFromString.is(schema.fields.banUsers, true)) {
  console.log('This user can ban users');
}

const pJson: JsonPermissions = pFromJson.toJson();
console.log(pJson);

if (pJson.createThreads) {
  console.log('This user can create threads.');
}

const pFromCtor: Permissions<typeof jsonSchema> = new Permissions(0n, schema);
console.log(pFromCtor.toJson());
