

// Populate with testing data

// New function to add or update missions without any validation
private func addOrUpdateMission2(newMission : Types.SerializedMission) : () {
  // Deserialize the SerializedMission to a mutable Mission (if needed)
  let newDeserializedMission = Serialization.deserializeMission(newMission);

  // Directly add the mission to the missions vector without any validation
  Vector.add<Types.Mission>(missions, newDeserializedMission);

  return;
};

// Helper function to generate random missions (example missions)
func generateMission(id: Nat) : Types.SerializedMission {
  return {
    id = id;
    title = "Mission Title #" # Nat.toText(id);
    description = "This is the description for mission #" # Nat.toText(id);
    startDate = Time.now();
    endDate = Time.now() + 1_000_000;
    mintime = 3_600;
    maxtime = 21_600;
    mode = 0;
    obj1 = null;
    obj2 = "Objective #" # Nat.toText(id);
    recursive = false;
    secretCodes = null;
    image = "/missionassets/sample_image_" # Nat.toText(id) # ".png";
    requiredPreviousMissionId = if (id > 0) ?(id - 1) else null;
    functionName1 = null;
    functionName2 = "verifyFunction#" # Nat.toText(id);
    iconUrl = "/missionassets/sample_icon_" # Nat.toText(id) # ".png";
    inputPlaceholder = null;
  };
};

func numberToAlphabet(num: Nat) : Text {
    let alphabetSize = 26;
    var result = "";
    var currentNum = num;

    // Loop to generate the letters
    label h while (currentNum >= 0) {
      
        // Get the current letter, using 'A' as the base character (ASCII 65)
        let letter = Char.fromNat32(65 + Nat32.fromNat(currentNum % alphabetSize));

        // Prepend the letter to the result (since higher place values should come first)
        result := Text.concat(Text.fromChar(letter), result);

        if (currentNum < alphabetSize) {
            break h;
        };

        // Move to the next "digit"
        currentNum := currentNum / alphabetSize - 1;
    };

    return result;
};

  func generateUser(i : Text) : Principal {
    let registeringPrincipalBlob : Blob = Principal.toBlob(Principal.fromActor(self));
    let registeringPrincipalBytes: [Nat8] = Blob.toArray(registeringPrincipalBlob);
    let length : Blob = Blob.fromArray([Nat8.fromNat(registeringPrincipalBytes.size())]);
    let nonce : Blob = Text.encodeUtf8(i);

    let combinedBytes  : [Nat8] = Blob.toArray(concatenateBlobs(concatenateBlobs(length, registeringPrincipalBlob), nonce));
    let shaBlob : Blob = Sha256.fromArray(#sha224, combinedBytes);
    let shaBytes : [Nat8] = Blob.toArray(shaBlob);
    let typeId : [Nat8] = [3];

    let publicKey : Blob = Blob.fromArray(concatenateArrays(shaBytes, typeId));
    // Generate a self-authenticating principal from the public key
    return Principal.fromBlob(publicKey);
  };

func concatenateArrays(arr1: [Nat8], arr2: [Nat8]) : [Nat8] {
    // Create a new array with the size of both arrays combined
    let totalSize = arr1.size() + arr2.size();
    var resultArray = Array.init<Nat8>(totalSize, 0);

    var index = 0;

    // Copy elements from arr1 into the result array
    for (i in Iter.range(0, arr1.size() - 1)) {
        resultArray[index] := arr1[i];
        index += 1;
    };

    // Copy elements from arr2 into the result array
    for (i in Iter.range(0, arr2.size() - 1)) {
        resultArray[index] := arr2[i];
        index += 1;
    };

    // Return the concatenated array
    return Array.freeze(resultArray);
};

func concatenateBlobs(blob1: Blob, blob2: Blob) : Blob {
    // Convert both blobs to arrays of Nat8
    let array1: [Nat8] = Blob.toArray(blob1);
    let array2: [Nat8] = Blob.toArray(blob2);

    // Concatenate the arrays
    let concatenatedArray: [Nat8] = concatenateArrays(array1, array2);

    // Convert the concatenated array back to a Blob
    return Blob.fromArray(concatenatedArray);
};

// Helper function to generate random progress
func generateSerializedProgress() : Types.SerializedProgress {
  return {
    completionHistory = [{
      timestamp = Time.now();
      pointsEarned = 10000;
      tweetId = null;
    }];
    usedCodes = [];
  };
};

// New function to update user progress without validation
private func updateUserProgress2(userId : Principal, missionId : Nat, serializedProgress : Types.SerializedProgress) : () {

  // Deserialize the progress object directly (assuming you want to keep this step)
  let progress = Serialization.deserializeProgress(serializedProgress);

  // Retrieve the user's missions or create a new TrieMap if it doesn't exist
  let missions = switch (userProgress.get(userId)) {
    case (?map) map;
    case null TrieMap.TrieMap<Nat, Types.Progress>(Nat.equal, Hash.hash);
  };

  // Update the mission progress directly
  missions.put(missionId, progress);

  // Update the user's progress in the main userProgress TrieMap
  userProgress.put(userId, missions);
};

// New function to add a user without any validation
private func addUser2(userId : Principal) : () {
  // Generate random points between 3600 and 21600 for the first mission
  let pointsEarnedOpt = getRandomNumberBetween(3_600, 21_600);

  // Create a completion record for the first mission
  let firstMissionRecord : Types.MissionRecord = {
    var timestamp = Time.now();
    var pointsEarned = Int.abs(pointsEarnedOpt); // Convert to Nat using Int.abs
    var tweetId = null;
  };

  // Create progress for the first mission
  let firstMissionProgress : Types.Progress = {
    var completionHistory = [firstMissionRecord];
    var usedCodes = TrieMap.TrieMap<Text, Bool>(Text.equal, Text.hash);
  };

  // Serialize the progress (optional)
  let tempP = Serialization.serializeProgress(firstMissionProgress);

  // Update user progress for the first mission
  updateUserProgress2(userId, 0, tempP);

  // Add the user to the users vector
  let newUser : Types.User = {
    id = userId;
    var twitterid = null;
    var twitterhandle = null;
    creationTime = Time.now();
    var pfpProgress = "false";
    var totalPoints = Int.abs(0);
  };
  Vector.add<Types.User>(users, newUser);
};

// Updated populateData function using addOrUpdateMission2
public func populateData() : async () {
  // Add 20 missions (same as before)
  // for (missionId in Iter.range(0, 9)) {
  //   let mission = generateMission(missionId);
  //   await addOrUpdateMission2(mission);  // Keeping addOrUpdateMission as is
  // };

  for (i in Iter.range(0, 9999)) {
    let userPrincipal = generateUser(numberToAlphabet(i));
    addUser2(userPrincipal);

    // Update user progress for each mission using updateUserProgress2
    for (missionId in Iter.range(10, 18)) {
      let progress = generateSerializedProgress();
      updateUserProgress2(userPrincipal, missionId, progress);
    };
  };
};

type Stats = {
  usersMissions: [(Principal, Nat)];  // Array of tuples (Principal, Nat)
  numberOfUsersMissions: Nat;
  numberOfUsers: Nat;
  numberOfMissionsAvailable: Nat;
};


// public shared query func instructionCounter() : async Nat64 {
    // Internal function should be: () -> ()
//   let count = IC.countInstructions();

// };

public shared query func getStats() : async Stats {
  // Get the number of users
  let numberOfUsers = Vector.size<Types.User>(users); //4
  
  // Get the total number of missions available
  let numberOfMissionsAvailable = Vector.size<Types.Mission>(missions);//4

  var usersMissions = Vector.new<(Principal, Nat)>();
  var usersMissionsCount : Nat = 0;
   label h for ((userId, userMissions) in userProgress.entries()) {
    
    var numberOfMissionsDone : Nat = 0;
    for (_ in userMissions.entries()) {
      numberOfMissionsDone += 1;
      usersMissionsCount += 1;
    };
    Vector.add<(Principal, Nat)>(usersMissions, (userId, numberOfMissionsDone));
  };

  // Construct the result object
  return {
    usersMissions = Vector.toArray(usersMissions);
    numberOfUsers = numberOfUsers;
    numberOfMissionsAvailable = numberOfMissionsAvailable;
    numberOfUsersMissions = usersMissionsCount;
  }
};


};




