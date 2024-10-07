import Bool "mo:base/Bool";
import Hash "mo:base/Hash";
import Nat64 "mo:base/Nat64";

import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Result "mo:base/Result";
import Error "mo:base/Error";
import IC "mo:ic";

actor {
  type Note = {
    id: Nat;
    content: Text;
    isCompleted: Bool;
  };

  type Day = {
    date: Text;
    notes: [Note];
    weather: ?Text;
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
          weather = null;
        };
        days.put(date, newDay);
      };
      case (?existingDay) {
        let updatedNotes = Array.append<Note>(existingDay.notes, [newNote]);
        let updatedDay : Day = {
          date = existingDay.date;
          notes = updatedNotes;
          weather = existingDay.weather;
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
          weather = existingDay.weather;
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

  public func setWeather(date: Text, weather: Text) : async () {
    switch (days.get(date)) {
      case (null) {
        let newDay : Day = {
          date = date;
          notes = [];
          weather = ?weather;
        };
        days.put(date, newDay);
      };
      case (?existingDay) {
        let updatedDay : Day = {
          date = existingDay.date;
          notes = existingDay.notes;
          weather = ?weather;
        };
        days.put(date, updatedDay);
      };
    };
  };

  public query func getWeather(date: Text) : async ?Text {
    switch (days.get(date)) {
      case (null) { null };
      case (?day) { day.weather };
    };
  };

  public func getWeatherForecast(location: Text) : async Result.Result<Text, Text> {
    let ic : IC.Service = actor("aaaaa-aa");
    let url = "https://wttr.in/" # location # "?format=%C+%t";

    try {
      let response = await ic.http_request({
        url = url;
        method = #get;
        body = null;
        headers = [];
        transform = null;
        max_response_bytes = ?(2000 : Nat64);
      });

      if (response.status == 200) {
        switch (Text.decodeUtf8(response.body)) {
          case (null) { #err("Failed to decode response body") };
          case (?decodedText) {
            if (Text.contains(decodedText, #text "Unknown location")) {
              #err("Invalid location: " # location)
            } else {
              #ok(decodedText)
            }
          };
        }
      } else {
        #err("Error fetching weather data: HTTP status " # Int.toText(response.status))
      }
    } catch (error) {
      #err("Error fetching weather data: " # Error.message(error))
    }
  };
}
