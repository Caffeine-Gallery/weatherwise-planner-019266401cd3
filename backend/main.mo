import Bool "mo:base/Bool";
import Hash "mo:base/Hash";

import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Time "mo:base/Time";

actor {
  type Note = {
    id: Nat;
    content: Text;
    isCompleted: Bool;
  };

  type Day = {
    date: Text;
    notes: [Note];
  };

  stable var noteIdCounter : Nat = 0;
  let days = HashMap.HashMap<Text, Day>(0, Text.equal, Text.hash);

  public func addNote(date: Text, content: Text) : async Nat {
    noteIdCounter += 1;
    let newNote : Note = {
      id = noteIdCounter;
      content = content;
      isCompleted = false;
    };

    switch (days.get(date)) {
      case (null) {
        let newDay : Day = {
          date = date;
          notes = [newNote];
        };
        days.put(date, newDay);
      };
      case (?existingDay) {
        let updatedNotes = Array.append<Note>(existingDay.notes, [newNote]);
        let updatedDay : Day = {
          date = existingDay.date;
          notes = updatedNotes;
        };
        days.put(date, updatedDay);
      };
    };

    noteIdCounter
  };

  public query func getNotes(date: Text) : async [Note] {
    switch (days.get(date)) {
      case (null) { [] };
      case (?day) { day.notes };
    };
  };

  public func updateNoteStatus(date: Text, noteId: Nat, isCompleted: Bool) : async Bool {
    switch (days.get(date)) {
      case (null) { false };
      case (?existingDay) {
        let updatedNotes = Array.map<Note, Note>(existingDay.notes, func (note: Note) : Note {
          if (note.id == noteId) {
            {
              id = note.id;
              content = note.content;
              isCompleted = isCompleted;
            }
          } else {
            note
          }
        });
        let updatedDay : Day = {
          date = existingDay.date;
          notes = updatedNotes;
        };
        days.put(date, updatedDay);
        true
      };
    };
  };

  public query func getIncompleteNoteCount(date: Text) : async Nat {
    switch (days.get(date)) {
      case (null) { 0 };
      case (?day) {
        Array.foldLeft<Note, Nat>(day.notes, 0, func (acc, note) {
          if (not note.isCompleted) { acc + 1 } else { acc }
        })
      };
    };
  };
}
