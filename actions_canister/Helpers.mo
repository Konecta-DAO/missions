import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Char "mo:base/Char";
import Int "mo:base/Int";
import Blob "mo:base/Blob";
import Nat8 "mo:base/Nat8";

module Helpers {

    public func blobToHex(blob : Blob) : Text {
        // Converts the Blob to an array of bytes (Nat8)
        let bytes : [Nat8] = Blob.toArray(blob);
        var hex : Text = "";
        let hexChars : [Char] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];

        for (byteNat8 : Nat8 in bytes.vals()) {
            let byte : Nat = Nat8.toNat(byteNat8);
            let highNibble : Nat = Nat.div(byte, 16);
            let lowNibble : Nat = Nat.rem(byte, 16);
            hex #= Text.fromChar(hexChars[highNibble]);
            hex #= Text.fromChar(hexChars[lowNibble]);
        };

        return hex;
    };

    public func intFromText(s : Text) : ?Int {
        if (Text.size(s) == 0) {
            return null;
        };

        let chars : [Char] = Text.toArray(s);
        var charIndex : Nat = 0;
        var isNegative : Bool = false;

        // Check for sign
        let firstChar = chars[0];
        if (firstChar == '+') {
            if (Array.size(chars) == 1) { return null };
            charIndex := 1;
        } else if (firstChar == '-') {
            if (Array.size(chars) == 1) { return null };
            isNegative := true;
            charIndex := 1;
        };

        // Extract the numeric part as a new Text
        var numTextPart : Text = "";
        if (charIndex == Array.size(chars)) {
            numTextPart := "";
        } else if (charIndex == 0) {
            numTextPart := s;
        } else {
            let numericCharCount = Array.size(chars) - charIndex;
            let subChars : [var Char] = Array.tabulateVar<Char>(
                numericCharCount,
                func(i : Nat) : Char {
                    return chars[charIndex + i];
                },
            );
            numTextPart := Text.fromVarArray(subChars);
        };

        switch (Nat.fromText(numTextPart)) {
            case (null) {
                return null;
            };
            case (?n_val) {
                let intVal = n_val;
                if (isNegative) {
                    return ?Int.neg(intVal);
                } else {
                    return ?intVal;
                };
            };
        };
    };
};
