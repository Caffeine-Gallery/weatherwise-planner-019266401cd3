import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Note {
  'id' : bigint,
  'content' : string,
  'isCompleted' : boolean,
}
export interface _SERVICE {
  'addNote' : ActorMethod<[string, string], bigint>,
  'getIncompleteNoteCount' : ActorMethod<[string], bigint>,
  'getNotes' : ActorMethod<[string], Array<Note>>,
  'updateNoteStatus' : ActorMethod<[string, bigint, boolean], boolean>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
