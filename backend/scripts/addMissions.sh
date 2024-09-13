dfx canister call backend addOrUpdateMission '( record {
      id = 0 : nat;
      title = "Timekeeper’s Key: Enter the Konecta Realm";
      endDate = 0 : int;
      inputPlaceholder = null;
      mode = 0 : nat;
      obj1 = null;
      obj2 = "Log In";
      recursive = true;
      mintime = 3_600 : int;
      description = "The adventure begins here, brave traveler! To unlock your first precious seconds, you must log in using your NFID. It’s your key to the Konecta Realm. Time waits for no one – claim yours now by hitting that login button and watch the seconds start rolling in!This mission resets every 24 hours, so don’t miss out – let’s keep the Konecta buzz alive!";
      secretCodes = null;
      image = "/missionassets/1725785491851511862_583528316.png";
      requiredPreviousMissionId = opt (1 : nat);
      functionName1 = null;
      functionName2 = "MrWorldWide";
      iconUrl = "/missionassets/1725785497256751411_3004922307.png";
      maxtime = 21_600 : int;
      startDate = 0 : int;
    } )';

dfx canister call backend addOrUpdateMission '( record {
      id = 1 : nat;
      title = "Whispers of the Web: Tune into Konecta";
      endDate = 0 : int;
      inputPlaceholder = null;
      mode = 0 : nat;
      obj1 = null;
      obj2 = "Follow Konecta";
      recursive = false;
      mintime = 3_600 : int;
      description = "Time to connect with the pulse of the Konecta world! Authenticate with Twitter and follow @KonectA_Dao to join the revolution. Once you’ve followed, click the Verify button to secure your seconds. Simple, right?";
      secretCodes = null;
      image = "/missionassets/1725692210979195037_297279684.png";
      requiredPreviousMissionId = opt (0 : nat);
      functionName1 = null;
      functionName2 = "followKonecta";
      iconUrl = "/missionassets/1725692213689593594_3004922307.png";
      maxtime = 21_600 : int;
      startDate = 0 : int;
    } )';    
    
dfx canister call backend addOrUpdateMission '( record {
      id = 2 : nat;
      title = "Visor Quest: Unlock the Look";
      endDate = 0 : int;
      inputPlaceholder = null;
      mode = 1 : nat;
      obj1 = opt "Send DM";
      obj2 = "Verify";
      recursive = false;
      mintime = 3_600 : int;
      description = "Ready to level up? DM @kami_kta and I’ll equip your profile pic it with the legendary Konecta visor. Update your profile, hit Verify, and show off your new look! \n\nHeads up, this mission is in high demand, so it may not always be available – don’t miss your chance to suit up like a pro!";
      secretCodes = null;
      image = "/missionassets/1725692232575380463_1167640701.png";
      requiredPreviousMissionId = opt (1 : nat);
      functionName1 = opt "sendKamiDM";
      functionName2 = "verifyPFP";
      iconUrl = "/missionassets/1725692234958302791_3004922307.png";
      maxtime = 21_600 : int;
      startDate = 0 : int;
    } )';
       
dfx canister call backend addOrUpdateMission '( record {
      id = 3 : nat;
      title = "Identity Unlocked: Let the World Know!";
      endDate = 0 : int;
      inputPlaceholder = null;
      mode = 0 : nat;
      obj1 = null;
      obj2 = "Verify";
      recursive = false;
      mintime = 3_600 : int;
      description = "Time to flex that shiny new profile pic! You’ve already unlocked your Kami-crafted identity – now let’s show it off. All you need to do is send out a tweet about your epic new Twitter PFP using the hashtag /#KonectaPFP. No need to overthink it; just tell the world you’re rocking your new look, courtesy of Kami.\nOnce you’ve tweeted, hit that \"verify\" button and watch the seconds roll in. Ready? Go make some noise!";
      secretCodes = null;
      image = "/missionassets/1725785768581440346_1884939354.png";
      requiredPreviousMissionId = opt (2 : nat);
      functionName1 = null;
      functionName2 = "verifyPFPTW";
      iconUrl = "/missionassets/1725785779007399146_3004922307.png";
      maxtime = 21_600 : int;
      startDate = 0 : int;
    } )';
dfx canister call backend addOrUpdateMission '( record {
      id = 4 : nat;
      title = "Konecta Pulse: Your Daily Tweet Challenge!";
      endDate = 0 : int;
      inputPlaceholder = null;
      mode = 0 : nat;
      obj1 = null;
      obj2 = "Verify";
      recursive = true;
      mintime = 3_600 : int;
      description = "Your daily mission, time adventurer, is simple: tweet using the /#Konecta hashtag. Once you’ve sent your message out into the world, hit the ‘verify’ button and collect your well-earned seconds.\nThis mission resets every 24 hours, so don’t miss out – let’s keep the Konecta buzz alive!";
      secretCodes = null;
      image = "/missionassets/1725785526586991802_1884939354.png";
      requiredPreviousMissionId = opt (1 : nat);
      functionName1 = null;
      functionName2 = "vfTweet";
      iconUrl = "/missionassets/1725785532209635848_3004922307.png";
      maxtime = 21_600 : int;
      startDate = 0 : int;
    } )'; 

dfx canister call backend addOrUpdateMission '( record {
      id = 5 : nat;
      title = "Echo Quest: Past the Message!";
      endDate = 0 : int;
      inputPlaceholder = null;
      mode = 0 : nat;
      obj1 = null;
      obj2 = "Verify";
      recursive = true;
      mintime = 3_600 : int;
      description = "Ready for the next mission, time warrior? Every few days, a key tweet will appear, waiting for you to pass it along to the world. All you need to do is retweet the given post, hit the ‘verify’ button, and claim your reward. It’s that simple.\nKeep an eye out – this mission pops up every couple of days, and the clock is always ticking!";
      secretCodes = null;
      image = "/missionassets/1725805926738335674_3724217585.png";
      requiredPreviousMissionId = opt (1 : nat);
      functionName1 = null;
      functionName2 = "verRT";
      iconUrl = "/missionassets/1725805930950818981_3004922307.png";
      maxtime = 21_600 : int;
      startDate = 0 : int;
    } )';
       
       
