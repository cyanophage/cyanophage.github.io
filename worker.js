// worker.js

var lookup = {};

function makeLookup(config) {
  for (let i = 0; i < config.length; i++) {
    lookup[config[i].char] = {row: config[i].row, col: config[i].col, finger: config[i].finger, effort: config[i].effort}
  }
}

function printConfig(config) {
  console.log("---")
  console.log(config[1].char + " " + config[2].char + " " + config[3].char + " " + config[4].char + " " + config[5].char + "   " + config[6].char + " " + config[7].char + " " + config[8].char + " " + config[9].char + " " + config[10].char)
  console.log(config[13].char + " " + config[14].char + " " + config[15].char + " " + config[16].char + " " + config[17].char + "   " + config[18].char + " " + config[19].char + " " + config[20].char + " " + config[21].char + " " + config[22].char)
  console.log(config[25].char + " " + config[26].char + " " + config[27].char + " " + config[28].char + " " + config[29].char + "   " + config[30].char + " " + config[31].char + " " + config[32].char + " " + config[33].char + " " + config[34].char)
}

function calculateMetrics(letter_freq, bigrams, trigrams, config){
  makeLookup(config);
  var count = 0;
  var a = "";
  var b = "";
  var c = "";
  var row1 = -1;
  var col1 = -1;
  var finger1 = -1;
  var row2 = -1;
  var col2 = -1;
  var finger2 = -1;
  var row3 = -1;
  var col3 = -1;
  var finger3 = -1;
  var sfb = 0;
  var psfb = 0;
  var rsfb = 0;
  var msfb = 0;
  var isfb = 0;
  var scissors = 0;
  var prscissors = 0;
  var lat_str = 0
  var wide_scissors = 0;
  var effort = 0;
  var sfs = 0; // eXd on qwerty where X is not in the same column as e/d - this needs trigrams
  var left_hand = 0;
  var right_hand = 0;
  var hand_balance;
  var vowels;
  var left_vowels = 0;
  var right_vowels = 0;

  for (var letter in letter_freq) {
    if (lookup[letter]){
      count = letter_freq[letter].count
      effort += lookup[letter].effort * count
      col1 = lookup[letter].col;
      row1 = lookup[letter].row;
      if (col1 <= 5){
        if (row1 <= 2){left_hand += count}
        if (letter == "a" || letter == "e" || letter == "i" || letter == "o" || letter == "u"){
          left_vowels += 1;
        }
      }
      if (col1 >= 6){
        if (row1 <= 2){right_hand += count}
        if (letter == "a" || letter == "e" || letter == "i" || letter == "o" || letter == "u"){
          right_vowels += 1;
        }
      }
    } else {
      // console.log("couldn't find "+letter+" "+typeof(letter)+ " in lookup")
    }
  }
  var left_hand_p = 100*(left_hand / (left_hand+right_hand))
  var right_hand_p = 100*(right_hand / (left_hand+right_hand))

  hand_balance = Math.abs(left_hand_p - right_hand_p)
  // console.log(left_hand, right_hand, left_hand_p, right_hand_p, hand_balance)
  if (left_vowels > right_vowels) {
    vowels = right_vowels;
  } else {
    vowels = left_vowels;
  }
  // console.log("left: "+left_hand_p+"  right: "+right_hand_p+"  balance:"+hand_balance)
  for (var item in bigrams) {
    // console.log(item+"   "+data[item]);
    a = item.charAt(0);
    b = item.charAt(1);
    count = bigrams[item]
    if (lookup[a]){
      row1 = lookup[a].row;
      col1 = lookup[a].col;
      finger1 = lookup[a].finger;
    } else {
      // console.log("Can't find lookup info for "+a);
      finger1 = -1;
    }
    if (lookup[b]){
      row2 = lookup[b].row;
      col2 = lookup[b].col;
      finger2 = lookup[b].finger;
    } else {
      // console.log("Can't find lookup info for "+b);
      finger1 = -2;
    }
    if (finger1 == finger2 && a != b) {
      sfb += count
      if (finger1 == 1 || finger1 == 10){
        psfb += count
      }
      if (finger1 == 2 || finger1 == 9){
        rsfb += count
      }
      if (finger1 == 3 || finger1 == 8){
        msfb += count
      }
      if (finger1 == 4 || finger1 == 7){
        isfb += count
      }
    } else {
      if (col1 <= 5 && col2 <= 5){ // LEFT HAND
        if (row1 <= 2 && row2 <= 2){
          if (Math.abs(row1-row2) == 2){
            if (Math.abs(col1-col2)==1){
              scissors += count
            } else if (Math.abs(col1-col2)>1){
              wide_scissors += count
              // console.log(item + " " + count)
            }
          }
          if ((finger1 == 1 && finger2 == 2) || (finger1 == 2 && finger2 == 1)){
            if (Math.abs(row1-row2) >= 1){
              prscissors += count
            }
          }
          if ((col1 == 5 && col2 == 3) || (col1 == 3 && col2 == 5)){
            lat_str += count
          }
          if ((col1 == 5 && col2 == 2) || (col1 == 2 && col2 == 5)){
            lat_str += count/2
            // console.log(item + " " + count)
          }
        }
      } else if (col1 >= 6 && col2 >= 6){ // RIGHT HAND
        if (row1 <= 2 && row2 <= 2){
          if (Math.abs(row1-row2) == 2){
            if (Math.abs(col1-col2)==1){
              scissors += count
            } else if (Math.abs(col1-col2)>1){
              wide_scissors += count
              // console.log(item + " " + count)
            }
          }
          if ((finger1 == 9 && finger2 == 10) || (finger1 == 10 && finger2 == 9)){
            if (Math.abs(row1-row2) >= 1){
              prscissors += count
            }
          }
          if ((col1 == 6 && col2 == 8) || (col1 == 8 && col2 == 6)){
            lat_str += count
          }
          if ((col1 == 6 && col2 == 9) || (col1 == 9 && col2 == 6)){
            lat_str += count/2
          }
        }
      }
    }
  }
  for (var item in trigrams) {
    a = item.charAt(0);
    b = item.charAt(1);
    c = item.charAt(2);
    count = trigrams[item]

    if (lookup[a]){
      row1 = lookup[a].row;
      col1 = lookup[a].col;
      finger1 = lookup[a].finger;
      effort += lookup[a].effort * count
    } else {
      // console.log("Can't find lookup info for "+a);
      finger1 = -1;
    }
    if (lookup[b]){
      row2 = lookup[b].row;
      col2 = lookup[b].col;
      finger2 = lookup[b].finger;
      effort += lookup[b].effort * count
    } else {
      // console.log("Can't find lookup info for "+a);
      finger2 = -2;
    }
    if (lookup[c]) {
      row3 = lookup[c].row;
      col3 = lookup[c].col;
      finger3 = lookup[c].finger;
      effort += lookup[c].effort * count
    } else {
      // console.log("Can't find lookup info for "+a);
      finger3 = -3;
    }

    if (finger1 == finger3 && finger2 != finger1 && Math.abs(row1-row3) >= 1) {
      if (row1 <= 2 && row3 <= 2){
        sfs += count
      }
    }
  }


  return {
          sfb: sfb,
          effort: effort,
          psfb: psfb,
          rsfb: rsfb,
          scissors: scissors,
          prscissors: prscissors,
          wide_scissors: wide_scissors,
          lat_str: lat_str,
          sfs: sfs, // 1u sfs
          hand_balance: hand_balance,
          vowels: vowels
         };
}

// Listen for the 'message' event
self.onmessage = function(e) {
  // Destructure the data and config from the event object
  // const { bigrams, trigrams, config } = e.data;
  const { letter_freq, bigrams, trigrams, config } = e.data;

  if (!letter_freq || !bigrams || !config || !trigrams) {
    self.postMessage('Error: Missing data or config.');
    return;
  }
  metrics = calculateMetrics(letter_freq, bigrams, trigrams, config);

  // Send the final results back to the main script
  self.postMessage({
    result: metrics,
    config: config
  });
};