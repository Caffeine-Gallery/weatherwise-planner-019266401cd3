export const idlFactory = ({ IDL }) => {
  const Note = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'isCompleted' : IDL.Bool,
  });
  return IDL.Service({
    'addNote' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'getIncompleteNoteCount' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getNotes' : IDL.Func([IDL.Text], [IDL.Vec(Note)], ['query']),
    'updateNoteStatus' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Bool],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
