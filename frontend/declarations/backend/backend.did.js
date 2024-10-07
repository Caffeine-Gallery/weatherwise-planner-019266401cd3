export const idlFactory = ({ IDL }) => {
  const Note = IDL.Record({
    'id' : IDL.Nat,
    'content' : IDL.Text,
    'isCompleted' : IDL.Bool,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Text, 'err' : IDL.Text });
  return IDL.Service({
    'addNote' : IDL.Func([IDL.Text, IDL.Text], [IDL.Nat], []),
    'getIncompleteNoteCount' : IDL.Func([IDL.Text], [IDL.Nat], ['query']),
    'getNotes' : IDL.Func([IDL.Text], [IDL.Vec(Note)], ['query']),
    'getWeather' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getWeatherForecast' : IDL.Func([IDL.Text], [Result], []),
    'setWeather' : IDL.Func([IDL.Text, IDL.Text], [], []),
    'updateNoteStatus' : IDL.Func(
        [IDL.Text, IDL.Nat, IDL.Bool],
        [IDL.Bool],
        [],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
