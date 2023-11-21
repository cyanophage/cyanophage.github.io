
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
let url_layout = params.layout;

var swidth = 1000;
var sheight = 180;

var w = 30;
var gap = 10;
var letter = "";
var x = 0;
var y = 0;
var dx;
var fontsize;
var per;
var max = 11.870939;
var red = 0;
var green = 128;

var svg = d3.select("#svglayout").append("svg").attr("xmlns","http://www.w3.org/2000/svg").attr("width", swidth).attr("height", sheight);

var stats = d3.select("#svgstats").append("svg").attr("width", swidth).attr("height", 600)

const word_list_url = 'word_list.json';
const dictionary_url = 'dictionary.json';
const effort_url = 'bigram_effort.json';
let words = {};
let dictionary = {};
let bigram_effort = {};

// Fetch the JSON file
function fetchData(){
  fetch(word_list_url)
    .then(response => response.json())
    .then(data => {
      words = data; // Assign data to the global variable
      measureWords();
      generateLayout();
      generatePlots();
    })
    .catch(error => console.error('Error loading JSON file:', error));
}
function fetchDictionary(){
  fetch(dictionary_url)
    .then(response => response.json())
    .then(data => {
      if (data["dictionary"]){
        dictionary = data["dictionary"]; // Assign data to the global variable
      } else {
        console.log("something went wrong with loading the dictionary");
      }
      measureDictionary();
      generateLayout();
      generatePlots();
    })
    .catch(error => console.error('Error loading dictionary JSON file:', error));
}
function fetchEffort(){
  fetch(effort_url)
    .then(response => response.json())
    .then(data => {
      bigram_effort = data;
      measureDictionary();
      generatePlots();
      console.log("effort loaded");
    })
    .catch(error => console.error('Error loading effort JSON file:', error));
}

makeDraggable(svg.node());

// col         0  1  2  3  4  5  6  7  8  9 10 11
var finger = [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10]
var hand = [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2]

var rcdata = [
  ["tab", 0, 0, 0],
  ["q", 0, 1, 0.06607202],
  ["w", 0, 2, 2.775025],
  ["e", 0, 3, 11.870939],
  ["r", 0, 4, 4.988437],
  ["t", 0, 5, 9.547406],
  ["y", 0, 6, 1.7949564],
  ["u", 0, 7, 2.7419887],
  ["i", 0, 8, 6.177734],
  ["o", 0, 9, 7.6643543],
  ["p", 0, 10, 1.4425724],
  ["-", 0, 11, 0.2753001],
  ["ctrl", 1, 0, 0],
  ["a", 1, 1, 7.466138],
  ["s", 1, 2, 5.5720735],
  ["d", 1, 3, 4.2616453],
  ["f", 1, 4, 2.0482326],
  ["g", 1, 5, 2.2244246],
  ["h", 1, 6, 6.519106],
  ["j", 1, 7, 0.06607202],
  ["k", 1, 8, 1.0571523],
  ["l", 1, 9, 4.6030173],
  [";", 1, 10, 0.4184561],
  ["'", 1, 11, 0.3523841],
  ["\\", 2, 0, 0],
  ["z", 2, 1, 0.04404801],
  ["x", 2, 2, 0.07708402],
  ["c", 2, 3, 1.8830525],
  ["v", 2, 4, 0.7488162],
  ["b", 2, 5, 1.5526924],
  ["n", 2, 6, 6.1446977],
  ["m", 2, 7, 1.5857284],
  [",", 2, 8, 1.9601365],
  [".", 2, 9, 0.48452812],
  ["/", 2, 10, 0.14315604],
  ["enter", 2, 11, 0],
  ["shift", 3, 4, 0.89197224],
  ["mod", 3, 5, 0],
  ["back", 3, 6, 0],
  ["space", 3, 7, 0],
]

var effort = [
  [
    5, // column 0 tab
    3, // column 1 q
    2, // column 2 w
    1, // column 3 e
    2, // column 4 r
    7, // column 5 t
    7, // column 6 y
    2, // column 7 u
    1, // column 8 i
    2, // column 9 o
    3, // column 10 p
    5, // column 11 [
  ],
  [
    5, // column 0 ctrl
    1, // column 1 a
    0, // column 2 s
    0, // column 3 d
    0, // column 4
    5, // column 5
    5, // column 6
    0, // column 7
    0, // column 8
    0, // column 9
    1, // column 10
    5, // column 11
  ],
  [
    7, // column 0
    3, // column 1
    2, // column 2
    2, // column 3
    1, // column 4
    8, // column 5
    8, // column 6
    1, // column 7
    2, // column 8
    2, // column 9
    3, // column 10
    7, // column 11
  ],
];

// var bigram_effort = {
//   2 : {          // col1
//     1 : {        // row1
//       3 : {      // col2
//         0 : 1.0, // row2
//       }
//     }
//   }
// };

//    0  1  2  3  4  5  6  7  8  9 10 11
// 0     q  w  e  r  t  y  u  i  o  p  -
// 1     a  s  d  f  g  h  j  k  l  ;  '
// 2  \  z  x  c  v  b  n  m  ,  .  /

function openPopup() {
  for (var row = 0; row < 3; row++){
    for (var col = 0; col < 12; col++){
      var name = "textInput-" + row + "-" + col
      document.getElementById(name).value = effort[row][col];
    }
  }
  document.getElementById('popup').style.display = 'flex';
}

function closePopup() {
  for (var row = 0; row < 3; row++){
    for (var col = 0; col < 12; col++){
      var name = "textInput-" + row + "-" + col
      effort[row][col] = document.getElementById(name).value;
    }
  }
  document.getElementById('popup').style.display = 'none';
  measureWords();
  generateLayout();
}

function getEffort(row, column){
  if (effort[row]){
    if (effort[row][column]){
      return effort[row][column];
    }
  }
  return 0;
}

var skip_toggle = false;
function skipToggle() {
  skip_toggle = !skip_toggle
  generatePlots();
}
var scissors_toggle = true;
function scissorsToggle() {
  scissors_toggle = !scissors_toggle
  generatePlots();
}

function showTooltip(evt, text) {
  let tooltip = document.getElementById("tooltip");
  tooltip.innerHTML = text;
  tooltip.style.display = "block";
  tooltip.style.left = evt.pageX + 10 + 'px';
  tooltip.style.top = evt.pageY + 10 + 'px';
}

function hideTooltip() {
  var tooltip = document.getElementById("tooltip");
  tooltip.style.display = "none";
}

function importLayout(layout) {
  // 01234567890123456789012345678901
  // wlrdzqgubj-shnt,.aeoi'fmvc/;pxky
  for (let i = 0; i < 11; i++) {
    rcdata[i + 1][0] = layout.charAt(i);
  }
  for (let i = 11; i < 22; i++) {
    rcdata[i + 2][0] = layout.charAt(i);
  }
  for (let i = 22; i < 32; i++) {
    rcdata[i + 3][0] = layout.charAt(i);
  }
  if (layout.length >= 33) {
    rcdata[36][0] = layout.charAt(32);
  }
}

function exportLayout(){
  var str = "";
  for (let i = 0; i < 11; i++) {
    str += rcdata[i + 1][0];
  }
  for (let i = 11; i < 22; i++) {
    str += rcdata[i + 2][0];
  }
  for (let i = 22; i < 32; i++) {
    str += rcdata[i + 3][0]
  }
  if (rcdata[36][0].length == 1) {
    str += rcdata[36][0];
  }
  return str
}

function colToX(col) {
  dx = 55;
  if (col > 5) {
    dx = dx + 40;
  }
  return dx + col * (w + gap)
}

function rowToY(row) {
  return 10 + row * (w + gap)
}

function getCol(letter) {
  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i][0] === letter) {
      return rcdata[i][2];
    }
  }
  return -1;
}

function getRow(letter) {
  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i][0] === letter) {
      return rcdata[i][1];
    }
  }
  return -1;
}

function getFinger(col, row) {
  if (row > 2) {
    if (col <= 4) {
      return 5
    } else {
      return 6
    }
  } else {
    return finger[col];
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

var xydata = []

function generateCoords() {
  for (let i = 0; i < rcdata.length; i++) {
    xydata[i] = [rcdata[i][0], rowToY(rcdata[i][1]), colToX(rcdata[i][2]), rcdata[i][3]];
  }
}

function generateLayout() {
  svg.selectAll("*").remove();
  svg.append("rect").attr("x", 45).attr("y", 0).attr("width", 530).attr("height", 170)
    .attr("stroke", "#777777").attr("fill", "#1b1c1f").attr("fill-opactiy", "0.0").attr("rx", 8).attr("ry", 8)
  for (let i = 0; i < xydata.length; i++) {
    letter = xydata[i][0];
    x = xydata[i][2];
    y = xydata[i][1];
    per = xydata[i][3];
    red = Math.floor(127 * per / max) + 128
    if (red < 16) {
      red = 16;
    }
    hex_red = red.toString(16);
    hex_bg = green.toString(16);

    fontsize = 16;
    if (letter.length > 1) {
      fontsize = 10;
    }

    svg.append("rect").attr("x", x).attr("y", y)
      .attr("width", w).attr("height", w).attr("rx", 4).attr("ry", 4)
      .attr("fill", "#" + hex_red + hex_bg + hex_bg).attr("stroke", "black")
      .attr("stroke-width", "1").attr("class", "draggable");
    svg.append("text").attr("x", x + 15).attr("y", y + 19)
      .attr("font-size", fontsize).attr("font-family", "Sans,Arial")
      .attr("text-anchor", "middle").attr("class", "draggable legend").text(letter);
  }
  // effort text
  svg.append("text").attr("x", 600).attr("y", 165).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Effort "+(577*m_effort/m_input_length).toFixed(2))
  // edit button
  svg.append("rect").attr("x", 720).attr("y", 147).attr("width", 40).attr("height", 25).attr("rx",0).attr("ry",0)
  .attr("fill","#777777").attr("stroke","black").attr("stroke-width","1").attr("onclick", "openPopup()")
  .attr("onmouseover", "showTooltip(evt,'Edit effort values for each key')").attr("onmouseout", "hideTooltip()")

  svg.append("text").attr("x", 740).attr("y", 164).attr("font-size", 16).attr("font-family", "Sans,Arial")
  .attr("fill", "#111111").attr("text-anchor", "middle").attr("pointer-events","none").text("Edit")

}

var m_column_usage = {};
var m_finger_usage = {};
var m_finger_distance = {};
var m_finger_pairs = {};
var m_same_finger = {};
var m_skip_bigram = {};
var m_skip_bigram2 = {};
var m_scissors = {};
var m_pinky_scissors = {};
var m_lat_stretch = {};
var m_letter_freq = {};
var m_row_usage = {};
var m_trigram_count = {};
var m_input_length = 0;
var m_effort = 0;
var m_simple_effort = {};
var finger_pos = [[0, 0], [1, 1], [1, 2], [1, 3], [1, 4], [3, 4], [3, 7], [1, 7], [1, 8], [1, 9], [1, 10]];

var word_effort = {}
var samehandstrings = {};
function measureDictionary() {
  console.log("measuring effort of each word in the dictionary");
  var total=0, word, char1, char2, col1, row1, col2, row2, hand1, hand2, samehand,count = 0;
  for(var wordi in dictionary) {
    count += 1;
    total = 0.0;
    word = dictionary[wordi];
    char1 = word.charAt(0);
    samehand = `${char1}`;
    for (let i = 1; i < word.length; i++) {
      char1 = word.charAt(i-1);
      char2 = word.charAt(i);
      col1 = getCol(char1);
      row1 = getRow(char1);
      col2 = getCol(char2);
      row2 = getRow(char2);
      if (bigram_effort[col1]) {
        if (bigram_effort[col1][row1]) {
          if (bigram_effort[col1][row1][col2]) {
            if (bigram_effort[col1][row1][col2][row2]) {
              var e = bigram_effort[col1][row1][col2][row2]
              total += e;
            }
          }
        }
      }
    }
    char1 = word.charAt(word.length-1);
    char2 = "_"
    col1 = getCol(char1);
    row1 = getRow(char1);
    col2 = 6;
    row2 = 3;
    if (bigram_effort[col1]) {
      if (bigram_effort[col1][row1]) {
        if (bigram_effort[col1][row1][col2]) {
          if (bigram_effort[col1][row1][col2][row2]) {
            var e = bigram_effort[col1][row1][col2][row2]
            total += e;
          }
        }
      }
    }

    for (let i = 2; i < word.length; i++) {
      char1 = word.charAt(i-2);
      char2 = word.charAt(i);
      col1 = getCol(char1);
      row1 = getRow(char1);
      col2 = getCol(char2);
      row2 = getRow(char2);
      if (bigram_effort[col1]) {
        if (bigram_effort[col1][row1]) {
          if (bigram_effort[col1][row1][col2]) {
            if (bigram_effort[col1][row1][col2][row2]) {
              var e = bigram_effort[col1][row1][col2][row2]
              total += 0.2 * e;
            }
          }
        }
      }
    }
    char1 = word.charAt(word.length-2);
    char2 = "_"
    col1 = getCol(char1);
    row1 = getRow(char1);
    col2 = 6;
    row2 = 3;
    if (bigram_effort[col1]) {
      if (bigram_effort[col1][row1]) {
        if (bigram_effort[col1][row1][col2]) {
          if (bigram_effort[col1][row1][col2][row2]) {
            var e = bigram_effort[col1][row1][col2][row2]
            total += 0.2 * e;
          }
        }
      }
    }

    word_effort[word] = total/word.length;
  }
  // console.log("count "+count);
}

function measureWords() {
  m_column_usage = {};
  m_finger_usage = {};
  m_finger_distance = {};
  m_skip_bigram = {};
  m_skip_bigram2 = {};
  m_scissors = {};
  m_pinky_scissors = {};
  m_same_finger = {};
  m_lat_stretch = {};
  m_letter_freq = {};
  m_row_usage = {};
  m_trigram_count = {};
  m_finger_pairs = {};
  samehandstrings = {};
  m_input_length = 0;
  m_effort = 0;
  var char = "";
  var prevchar = "";
  var prevfinger = -1;
  var ppchar = "";
  var ppfinger = -1;
  var bigram, trigram, cat, skip;
  var prevcol = -1;
  var prevrow = -1;
  var col,row,hand,prevhand;
  var m_effort_per_letter = {};
  var m_effort_per_word = {};
  for (var word in words) {
    finger_pos = [[0, 0], [1, 1], [1, 2], [1, 3], [1, 4], [3, 4], [3, 7], [1, 7], [1, 8], [1, 9], [1, 10]];
    var count = words[word];
    m_input_length += count * (word.length + 1);
    char = word.charAt(0);
    samehand = char
    for (let i = 0; i < word.length; i++) {
      char = word.charAt(i);
      // freq //
      if (!m_letter_freq[char]) {
        m_letter_freq[char] = 0;
      }
      m_letter_freq[char] += count;
      // finger usage //
      col = getCol(char);
      if (col <= 5){
        hand = "L"
      } else {
        hand = "R"
      }
      if (col < 0) { break; } // this is the part that just skips numbers and other characters
      if (!m_column_usage[col]) {
        m_column_usage[col] = 0;
      }
      m_column_usage[col] += count;
      // finger usage //
      row = getRow(char);
      // effort
      if (!m_effort_per_letter[char]){
        m_effort_per_letter[char] = 0
      }
      m_effort_per_letter[char] += count * getEffort(row,col)
      if (!m_effort_per_word[word]){
        m_effort_per_word[word] = 0
      }
      m_effort_per_word[word] += count * getEffort(row,col)

      m_effort += count * getEffort(row, col);


      var finger = getFinger(col, row);
      if (!m_finger_usage[finger]) {
        m_finger_usage[finger] = 0;
      }
      m_finger_usage[finger] += count;
      // finger travel distance
      if (row < 0) { break; }
      d = dist(col, row, finger_pos[finger][1], finger_pos[finger][0]);

      if (!m_finger_distance[finger]) {
        m_finger_distance[finger] = 0;
      }
      m_finger_distance[finger] += d * count;

      if (!m_simple_effort[word]) {
        m_simple_effort[word] = 0
      }
      m_simple_effort[word] += d


      finger_pos[finger] = [row, col];

      // finger row //
      if (!m_row_usage[row]) {
        m_row_usage[row] = 0;
      }
      m_row_usage[row] += count;

      // bigram stuff
      if (i > 0) {
        bigram = prevchar + char;
        if (finger == prevfinger && prevchar != char) {
          if (!m_same_finger[bigram]) {
            m_same_finger[bigram] = 0;
          }
          m_same_finger[bigram] += count;
        }
        if ((prevcol == 3 && col == 5) || (prevcol == 8 && col == 6) || (prevcol == 5 && col == 3) || (prevcol == 6 && col == 8)) {
          if (!m_lat_stretch[bigram]) {
            m_lat_stretch[bigram] = 0;
          }
          m_lat_stretch[bigram] += count;
        }
        // scissors
        if (Math.abs(col-prevcol) == 1 && Math.abs(row-prevrow) >= 2 && ((finger <= 4 && prevfinger <= 4 &&finger!=prevfinger)||(finger >=7 && prevfinger>=7&&finger!=prevfinger))) {
          if (!m_scissors[bigram]) {
            m_scissors[bigram] = 0;
          }
          m_scissors[bigram] += count;
        }
        // pinky/ring scissors
        if (Math.abs(col-prevcol) == 1 && Math.abs(row-prevrow) >= 1 && (finger == 1 ||finger == 10||prevfinger==1||prevfinger==10)) {
          if (!m_pinky_scissors[bigram]) {
            m_pinky_scissors[bigram] = 0;
          }
          m_pinky_scissors[bigram] += count;
        }
        // same hand strings
        if (prevhand == hand) {
          samehand = samehand + char;
        } else {
          if (samehand.length >= 4) {
            if (!samehandstrings[samehand]) {
              samehandstrings[samehand] = 0;
            }
            samehandstrings[samehand] += count;
          }
          samehand = char;
        }
        // finger pairs
        if (!m_finger_pairs[prevfinger]) {
          m_finger_pairs[prevfinger] = {};
        }
        if (!m_finger_pairs[prevfinger][finger]) {
          m_finger_pairs[prevfinger][finger] = 0;
        }
        if (char != prevchar){
          m_finger_pairs[prevfinger][finger] += count;
        }
      }
      // trigram stuff
      if (i > 1) {
        skip = ppchar + "_" + char;
        trigram = ppchar + prevchar + char;
        if (finger == ppfinger && ppchar != char) {
          if (!m_skip_bigram[skip]) {
            m_skip_bigram[skip] = 0;
          }
          m_skip_bigram[skip] += count;

          if (Math.abs(getRow(ppchar)-row) >= 2) {
            if (!m_skip_bigram2[skip]) {
              m_skip_bigram2[skip] = 0
            }
            m_skip_bigram2[skip] += count;
          }
        }
        cat = "other";
        if (ppfinger <= 4 && prevfinger <= 4 && finger <= 4) { // left hand
          if (ppfinger < prevfinger && prevfinger < finger) {
            cat = "roll in"
          } else if (ppfinger > prevfinger && prevfinger > finger) {
            cat = "roll out"
          } else if ((ppfinger < prevfinger && finger < prevfinger) || (ppfinger > prevfinger && finger > prevfinger)) {
            cat = "redirect"
            if (ppfinger == 4 || prevfinger == 4 || finger == 4) {
            } else {
              cat = "bad redirect"
            }
          }
        }
        if (ppfinger >= 7 && prevfinger >= 7 && finger >= 7) { // right hand
          if (ppfinger > prevfinger && prevfinger > finger) {
            cat = "roll in"
          } else if (ppfinger < prevfinger && prevfinger < finger) {
            cat = "roll out"
          } else if ((ppfinger > prevfinger && finger > prevfinger) || (ppfinger < prevfinger && finger < prevfinger)) {
            cat = "redirect"
            if (ppfinger == 7 || prevfinger == 7 || finger == 7) {
            } else {
              cat = "bad redirect"
            }
          }
        }
        if ((ppfinger <= 4 && prevfinger >= 7 && finger <= 4) || (ppfinger >= 7 && prevfinger <= 4 && finger >= 7)) {
          cat = "alt"
          if (ppfinger == finger && ppchar != char) {
            cat = "alt sfs"
          }
        } else if (ppfinger <= 5 && prevfinger <= 5 && finger >= 6 && ppfinger < prevfinger) { // LLR
          cat = "bigram roll in"
        }
        else if (ppfinger >= 6 && prevfinger >= 6 && finger <= 5 && ppfinger > prevfinger) { // RRL
          cat = "bigram roll in"
        }
        else if (ppfinger <= 5 && prevfinger <= 5 && finger >= 6 && ppfinger > prevfinger) { // LLR
          cat = "bigram roll out"
        }
        else if (ppfinger >= 6 && prevfinger >= 6 && finger <= 5 && ppfinger < prevfinger) { // RRL
          cat = "bigram roll out"
        }
        else if (ppfinger <= 5 && prevfinger >= 6 && finger >= 6 && prevfinger > finger) { // LRR
          cat = "bigram roll in"
        }
        else if (ppfinger >= 6 && prevfinger <= 5 && finger <= 5 && prevfinger < finger) { // RLL
          cat = "bigram roll in"
        }
        else if (ppfinger <= 5 && prevfinger >= 6 && finger >= 6 && prevfinger < finger) { // LRR
          cat = "bigram roll out"
        }
        else if (ppfinger >= 6 && prevfinger <= 5 && finger <= 5 && prevfinger > finger) { // RLL
          cat = "bigram roll out";
        }
        if (!m_trigram_count[cat]) {
          m_trigram_count[cat] = 0;
        }
        m_trigram_count[cat] += count;
      }
      prevcol = col;
      prevrow = row;
      prevhand = hand;
      ppchar = prevchar;
      ppfinger = prevfinger;
      prevchar = char;
      prevfinger = finger;
    }
    if (samehand.length >= 4){
      if (!samehandstrings[samehand]) {
        samehandstrings[samehand] = 0;
      }
      samehandstrings[samehand] += count;
    }
  }
  var sum = 0;
  for (var letter in m_letter_freq) {
    sum += m_letter_freq[letter]
  }
  for (var letter in m_letter_freq) {
    for (let i = 0; i < rcdata.length; i++) {
      if (rcdata[i][0] == letter) {
        rcdata[i][3] = 100 * m_letter_freq[letter] / sum
      }
      if (xydata[i][0] == letter) {
        xydata[i][3] = 100 * m_letter_freq[letter] / sum
      }
    }
  }
}

function generatePlots() {
  stats.selectAll("*").remove();
  ///////////////////////////////////////  C O L U M N   U S A G E  ////////////////////////////////////////////
  var x = 500;
  var y = 0;
  stats.append("text").attr("x", x + 40).attr("y", 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Column Usage")
  var sum = 0;
  for (var col in m_column_usage) {
    sum += m_column_usage[col];
  }
  for (var col in m_column_usage) {
    var height = 300 * m_column_usage[col] / sum;
    var tip = parseFloat(100 * m_column_usage[col] / sum).toFixed(2);
    var red = Math.floor(275 * m_column_usage[col] / sum) + 128
    var green = 128;
    if (red < 16) { red = 16; }
    if (red > 255) { red = 255; }
    var hex_red = red.toString(16);
    var hex_bg = green.toString(16);

    stats.append("rect").attr("x", x + col * 20).attr("y", 100 - height).attr("width", 15).attr("height", height)
      .attr("fill", "#" + hex_red + hex_bg + hex_bg).attr("stroke", "#453033").attr("stroke-width", 1)
      .attr("onmouseover", "showTooltip(evt,'" + tip + "%')").attr("onmouseout", "hideTooltip()")
    stats.append("text").attr("x", x + col * 20 + 7).attr("y", 111).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(col)
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
  }

  ///////////////////////////////////////  R O W   U S A G E  ////////////////////////////////////////////
  var x = 770;
  var y = 0;
  stats.append("text").attr("x", x + 40).attr("y", 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Row Usage")
  var sum = 0;
  for (var row in m_row_usage) {
    sum += m_row_usage[row];
  }
  for (var row in m_row_usage) {
    var height = 200 * m_row_usage[row] / sum;
    var tip = parseFloat(100 * m_row_usage[row] / sum).toFixed(2);
    var red = Math.floor(190 * m_row_usage[row] / sum) + 128
    var green = 128;
    if (red < 16) { red = 16; }
    if (red > 255) { red = 255; }
    var hex_red = red.toString(16);
    var hex_bg = green.toString(16);

    stats.append("rect").attr("x", x + 19).attr("y", y + 40 + row * 20).attr("width", height).attr("height", 14)
      .attr("fill", "#" + hex_red + hex_bg + hex_bg).attr("stroke", "#453033").attr("stroke-width", 1)
      .attr("onmouseover", "showTooltip(evt,'" + tip + "%')").attr("onmouseout", "hideTooltip()")
    stats.append("text").attr("x", x + 9).attr("y", y + 51 + row * 20).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(parseInt(row) + 1)
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
  }
  ///////////////////////////////////////   F I N G E R   U S A G E   //////////////////////////////////////
  var x = 0;
  var y = 0;
  stats.append("text").attr("x", x + 40).attr("y", 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Finger Usage")
  var sum = 0;
  var left = 0;
  var right = 0;
  for (var finger in m_finger_usage) {
    sum += m_finger_usage[finger];
    if (finger <= 4) {
      left += m_finger_usage[finger];
    }
    if (finger >= 7) {
      right += m_finger_usage[finger];
    }
  }
  for (var finger in m_finger_usage) {
    var height = 300 * m_finger_usage[finger] / sum;
    var tip = parseFloat(100 * m_finger_usage[finger] / sum).toFixed(2);
    var red = Math.floor(275 * m_finger_usage[finger] / sum) + 128
    var green = 128;
    if (red < 16) { red = 16; }
    if (red > 255) { red = 255; }
    var hex_red = red.toString(16);
    var hex_bg = green.toString(16);
    stats.append("rect").attr("x", x + finger * 20).attr("y", 100 - height).attr("width", 15).attr("height", height)
      .attr("fill", "#" + hex_red + hex_bg + hex_bg).attr("stroke", "#453033").attr("stroke-width", 1)
      .attr("onmouseover", "showTooltip(evt,'" + tip + "%')").attr("onmouseout", "hideTooltip()")
    stats.append("text").attr("x", x + finger * 20 + 7).attr("y", 111).attr("fill", "#dfe2eb").attr("font-size", 10)
      .attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(finger)
  }
  stats.append("text").attr("x", x + 57).attr("y", 124).attr("fill", "#dfe2eb").attr("font-size", 11).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(parseFloat(100 * left / sum).toFixed(2) + "%");
  stats.append("text").attr("x", x + 177).attr("y", 124).attr("fill", "#dfe2eb").attr("font-size", 11).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(parseFloat(100 * right / sum).toFixed(2) + "%");
  ///////////////////////////////////////   F I N G E R   D I S T A N C E   //////////////////////////////////
  var x = 250;
  var y = 0;
  var max = 201609;//from qwerty
  sum = 0
  left = 0;
  right = 0;
  for (var finger in m_finger_distance) {
    sum += m_finger_distance[finger];
    if (finger <= 4) {
      left += m_finger_distance[finger];
    }
    if (finger >= 7) {
      right += m_finger_distance[finger];
    }
  }

  stats.append("text").attr("x", x + 40).attr("y", 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Finger Distance")
  for (var finger in m_finger_distance) {
    if (m_finger_distance[finger] > 0) {
    var height = 75 * m_finger_distance[finger] / max;
    var tip = parseFloat(100 * m_finger_distance[finger] / max).toFixed(2);
    var red = Math.floor(128 * m_finger_distance[finger] / max) + 128
    var green = 128;
    if (red < 16) { red = 16; }
    if (red > 255) { red = 255; }
    var hex_red = red.toString(16);
    var hex_bg = green.toString(16);
    stats.append("rect").attr("x", x + finger * 20).attr("y", 100 - height).attr("width", 15).attr("height", height)
      .attr("fill", "#" + hex_red + hex_bg + hex_bg).attr("stroke", "#453033").attr("stroke-width", 1)
      .attr("onmouseover", "showTooltip(evt,'" + tip + "')").attr("onmouseout", "hideTooltip()")
    stats.append("text").attr("x", x + finger * 20 + 7).attr("y", 111).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(finger)
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    }
  }
  stats.append("text").attr("x", x + 57).attr("y", 124).attr("fill", "#dfe2eb").attr("font-size", 11).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(parseFloat(100 * left / sum).toFixed(2) + "%");
  stats.append("text").attr("x", x + 177).attr("y", 124).attr("fill", "#dfe2eb").attr("font-size", 11).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(parseFloat(100 * right / sum).toFixed(2) + "%");
  ///////////////////////////////////   S A M E   F I N G E R   B I G R A M S    ///////////////////////////////
  var x = 0;
  var y = 180;
  sum = 0;
  var keyValueArray = Object.entries(m_same_finger);
  keyValueArray.sort((a, b) => b[1] - a[1]);
  m_same_finger = Object.fromEntries(keyValueArray);

  for (var bigram in m_same_finger) {
    sum += m_same_finger[bigram] / m_input_length;
  }
  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Same Finger Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
  // stats.append("text").attr("x",x+40).attr("y",y+200).attr("font-size",16).attr("font-family","Sans,Arial").attr("fill","#dfe2eb").attr("text-anchor","left").text("Input Length "+m_input_length);
  var i = 0
  for (var bigram in m_same_finger) {
    var width = 18000 * m_same_finger[bigram] / m_input_length;
    if (width > 200) { width = 200; }
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", width).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(bigram);
    stats.append("text").attr("x", x + 200).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * m_same_finger[bigram] / m_input_length)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }
  ///////////////////////////////////   S K I P   F I N G E R   B I G R A M S    ///////////////////////////////
  var x = 250;
  var y = 180;
  sum = 0;
  var tmp;
  for (var bigram in tmp) {
    sum += tmp[bigram] / m_input_length;
  }
  if (skip_toggle) {
    var keyValueArray = Object.entries(m_skip_bigram);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Skip Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
  } else {
    var keyValueArray = Object.entries(m_skip_bigram2);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("2u Skip Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
  }

  stats.append("rect").attr("x", x + 15).attr("y", y - 32).attr("width", 20).attr("height", 20)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing all skip bigrams and only those with a 2u step between 1 and 3')").attr("onmouseout","hideTooltip()").attr("onclick","skipToggle()")
  var i = 0;
  for (var bigram in tmp) {
    var height = 36000 * tmp[bigram] / m_input_length;
    if (height > 200) { height = 200; }
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", height).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 17).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(bigram);
    stats.append("text").attr("x", x + 200).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * tmp[bigram] / m_input_length)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }
  ////////////////////////////   L A T E R A L   S T R E T C H   B I G R A M S   ///////////////////////////////
  var x = 500;
  var y = 180;
  sum = 0;
  var keyValueArray = Object.entries(m_lat_stretch);
  keyValueArray.sort((a, b) => b[1] - a[1]);
  m_lat_stretch = Object.fromEntries(keyValueArray);
  for (var bigram in m_lat_stretch) {
    sum += m_lat_stretch[bigram] / m_input_length;
  }
  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Lat Stretch Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
  var i = 0
  for (var bigram in m_lat_stretch) {
    var height = 10000 * m_lat_stretch[bigram] / m_input_length;
    if (height > 200) { height = 200; }
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", height).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(bigram);
    stats.append("text").attr("x", x + 200).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * m_lat_stretch[bigram] / m_input_length)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }
  //////////////////////////// P I N K Y - R I N G   S C I S S O R S  ///////////////////////////////
  var x = 760;
  var y = 180;
  sum = 0;

  if (scissors_toggle) {
    var keyValueArray = Object.entries(m_pinky_scissors);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Pinky/Ring Scissors " + parseFloat(100 * sum).toFixed(2) + "%")
  } else {
    var keyValueArray = Object.entries(m_scissors);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Scissors " + parseFloat(100 * sum).toFixed(2) + "%")
  }
  stats.append("rect").attr("x", x + 15).attr("y", y - 32).attr("width", 20).attr("height", 20)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing scissors on ring and pinky, and all 2u scissors')").attr("onmouseout","hideTooltip()").attr("onclick","scissorsToggle()")
  var i = 0;
  for (var bigram in tmp) {
    var height = 36000 * tmp[bigram] / m_input_length;
    if (height > 180) { height = 180; }
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", height).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(bigram);
    stats.append("text").attr("x", x + 190).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * tmp[bigram] / m_input_length)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }
  ///////////////////////////////////  T R I G R A M   S T A T S   ///////////////////////////////
  var x = 760;
  var y = 390;
  sum = 0;
  var keyValueArray = Object.entries(m_trigram_count);
  keyValueArray.sort((a, b) => b[1] - a[1]);
  m_trigram_count = Object.fromEntries(keyValueArray);
  for (var cat in m_trigram_count) {
    sum += m_trigram_count[cat]
  }
  const trigram_desc = {
    "alt":"the hands used to type the trigram are either LRL or RLR",
    "alt sfs":"trigram is typed LRL or RLR but finger1 and finger3 are the same and type a different character",
    "bigram roll in":"two of the characters in the trigram are typed with the same hand and the first is outside the second",
    "bigram roll out":"two of the characters in the trigram are typed with the same hand and the first is inside the second",
    "bad redirect":"a redirect but none of the fingers used are the index finger",
    "redirect":"the three characters of the trigram are typed with the same hand and the direction changes",
    "roll out":"the three characters of the trigram are typed with the same hand and go from the inside to the outside",
    "roll in":"the three characters of the trigram are typed with the same hand and go from the outside to the inside",
    "other":"all other trigrams that don\\'t fit into any of the other categories",
  };
  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Trigram Stats")
  var i = 0
  for (var cat in m_trigram_count) {
    var height = 200 * m_trigram_count[cat] / sum;
    if (height > 200) { height = 200; }
    stats.append("rect").attr("x", x + 88).attr("y", y + i * 15).attr("width", height).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
      .attr("onmouseover","showTooltip(evt,'"+trigram_desc[cat]+"')").attr("onmouseout","hideTooltip()")
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(cat);
    stats.append("text").attr("x", x + 190).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * m_trigram_count[cat] / sum)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }

  ///////////////////////////////////  S A M E   H A N D   S T R I N G S  ///////////////////////////////
  var x = 250;
  var y = 390;
  sum = 0;

  var keyValueArray = Object.entries(samehandstrings);
  keyValueArray.sort((a, b) => b[1]*b[0].length - a[1]*a[0].length);
  samehandstrings = Object.fromEntries(keyValueArray);

  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Same Hand Strings ")
  var i = 0
  for (var word in samehandstrings) {
    var count = samehandstrings[word];
    var width = 0.03 * word.length * count;
    if (width > 100) {width = 100;}
    stats.append("rect").attr("x", x + 80).attr("y", y + i * 15).attr("width", width).attr("height", 10).attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(word);
    stats.append("text").attr("x", x + 145).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(word.length*count);
    i += 1;
    if (i > 10) { break; }
  }
  ///////////////////////////////////  H A R D   W O R D S   ///////////////////////////////
  var x = 420;
  var y = 390;
  sum = 0;
  var keyValueArray = Object.entries(word_effort);
  keyValueArray.sort((a, b) => b[1] - a[1]);
  word_effort = Object.fromEntries(keyValueArray);
  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Hard Words ")
  var i = 0
  for (var word in word_effort) {
    var height = 10*word_effort[word];
    if (word.length > 3){
      stats.append("rect").attr("x", x + 80).attr("y", y + i * 15).attr("width", height).attr("height", 10)
        .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
      stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(word);
      stats.append("text").attr("x", x + 165).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (word_effort[word])).toFixed(2));
      i += 1;
      if (i > 10) { break; }
    }
  }
  ///////////////////////////////////  E A S Y   W O R D S   ///////////////////////////////
  var x = 610;
  var y = 390;
  sum = 0;
  var keyValueArray = Object.entries(word_effort);
  keyValueArray.sort((a, b) => a[1] - b[1]);
  word_effort = Object.fromEntries(keyValueArray);
  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Easy Words ")
  var i = 0
  for (var word in word_effort) {
    var height = 10*word_effort[word];
    if (word.length > 3){
      stats.append("rect").attr("x", x + 80).attr("y", y + i * 15).attr("width", height).attr("height", 10)
        .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
      stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(word);
      stats.append("text").attr("x", x + 125).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (word_effort[word])).toFixed(2));
      i += 1;
      if (i > 10) { break; }
    }
  }


  ///////////////////////////////////  F I N G E R   P A I R S   ///////////////////////////////
  var x = 10;
  var y = 370;
  var box_x = 26;
  var box_y = 20;
  var per = 0;
  var finger1 = i;
  var finger2 = j;
  var sum = 0;
  stats.append("text").attr("x",0).attr("y",0).attr("font-size",10).attr("font-family","Sans,Arial")
       .attr("fill","#dfe2eb").attr("text-anchor","middle")
       .attr("transform",`translate(${x+2},${y+100}) rotate(-90)`)
       .text("First Finger");
  stats.append("text").attr("x",x+130).attr("y",y).attr("font-size",10).attr("font-family","Sans,Arial")
       .attr("fill","#dfe2eb").attr("text-anchor","middle")
       .text("Second Finger");
  for(var i = 0; i <= 8; i++){
    sum = 0;
    for(var j = 1; j <= 8; j++){
      finger1 = i;
      finger2 = j;
      if (i > 4){finger1 += 2;}
      if (j > 4){finger2 += 2;}
      if (m_finger_pairs[finger1]){
        if (m_finger_pairs[finger1][finger2]){
          sum += m_finger_pairs[finger1][finger2];
        }
      }
    }
    for(var j = 0; j <= 8; j++){
      finger1 = i;
      finger2 = j;
      if (i > 4){finger1 += 2;}
      if (j > 4){finger2 += 2;}
      if (i == 0 && j == 0){

      } else if (i == 0 && j > 0) {
        stats.append("text").attr("x",x+box_x*j+14).attr("y",y+box_y*i+14).attr("font-size",10).attr("font-family","Sans,Arial").attr("fill","#dfe2eb").attr("text-anchor","middle").text(finger2);
      } else if (i > 0 && j == 0) {
        stats.append("text").attr("x",x+box_x*j+14).attr("y",y+box_y*i+14).attr("font-size",10).attr("font-family","Sans,Arial").attr("fill","#dfe2eb").attr("text-anchor","middle").text(finger1);
      } else {
        if (m_finger_pairs[finger1]){
          if (m_finger_pairs[finger1][finger2]){
            if (sum > 0){
              per = parseFloat(100 * m_finger_pairs[finger1][finger2] / sum).toFixed(0);
            } else { per = -1;}
            red = Math.floor(128 + 3 * per);
            if (red > 255) {red = 255;}
            hex_red = red.toString(16);

            stats.append("rect").attr("x",x+box_x*j).attr("y",y+box_y*i).attr("width",box_x).attr("height",box_y).attr("fill","#"+hex_red+hex_bg+hex_bg).attr("stroke","black").attr("stroke-width","0.5");
            stats.append("text").attr("x",x+box_x*j+14).attr("y",y+box_y*i+14).attr("font-size",10).attr("font-family","Sans,Arial").attr("fill","black").attr("text-anchor","middle").text(per+"%");
          }
        }
      }
    }
  }
}


function makeDraggable(svg) {
  svg.addEventListener('mousedown', startDrag, false);
  svg.addEventListener('mousemove', drag, false);
  svg.addEventListener('mouseup', endDrag, false);
  svg.addEventListener('mouseleave', endDrag);

  svg.addEventListener('touchstart', startDrag);
  svg.addEventListener('touchmove', drag);
  svg.addEventListener('touchend', endDrag);
  svg.addEventListener('touchleave', endDrag);
  svg.addEventListener('touchcancel', endDrag);

  function getMousePosition(evt) {
    var CTM = svg.getScreenCTM();
    if (evt.touches) { evt = evt.touches[0]; }
    return {
      x: (evt.clientX - CTM.e) / CTM.a,
      y: (evt.clientY - CTM.f) / CTM.d
    };
  }

  var selectedElement, offset, offset2, sibling;
  var starti, dropi;

  function startDrag(evt) {
    if (evt.target.classList.contains('draggable')) {
      selectedElement = evt.target;
      if (selectedElement.classList.contains('legend')){
        selectedElement = selectedElement.previousElementSibling;
        sibling = evt.target;
      } else {
        sibling = selectedElement.nextElementSibling; // dude this is super useful!
      }
      if (selectedElement) {
        // move to the end so they appear on top while dragging
        svg.insertBefore(selectedElement, svg.lastChild);
        svg.insertBefore(sibling, svg.lastChild);

        x = selectedElement.getAttributeNS(null, "x");
        y = selectedElement.getAttributeNS(null, "y");
        // scan through xydata to find out which key are we closest to
        closestdist = 9999;
        starti = -1;
        for (let i = 0; i < xydata.length; i++) {
          d = dist(x, y, xydata[i][2], xydata[i][1]);
          if (d < closestdist) {
            // console.log("dist = "+d+"  "+xydata[i][0]);
            closestdist = d;
            starti = i;
          }
        }
        // console.log("picked up "+xydata[starti][0]);
        offset = getMousePosition(evt);
        offset2 = getMousePosition(evt);
        offset.x -= parseFloat(selectedElement.getAttributeNS(null, "x"));
        offset.y -= parseFloat(selectedElement.getAttributeNS(null, "y"));
        offset2.x -= parseFloat(sibling.getAttributeNS(null, "x"));
        offset2.y -= parseFloat(sibling.getAttributeNS(null, "y"));
      }

    }
  }

  function drag(evt) {
    if (selectedElement) {
      if (sibling) {
        evt.preventDefault();
        var coord = getMousePosition(evt);
        selectedElement.setAttributeNS(null, "x", coord.x - offset.x);
        selectedElement.setAttributeNS(null, "y", coord.y - offset.y);
        sibling.setAttributeNS(null, "x", coord.x - offset2.x);
        sibling.setAttributeNS(null, "y", coord.y - offset2.y);
      }
    }
  }


  function endDrag(evt) {
    if (selectedElement) {
      x = selectedElement.getAttributeNS(null, "x");
      y = selectedElement.getAttributeNS(null, "y");
      // console.log("drop at "+x+"  "+y);
      selectedElement = false;
      sibling = false;
      // scan through xydata to find out which key are we closest to
      closestdist = 9999;
      for (let i = 0; i < xydata.length; i++) {
        d = dist(x, y, xydata[i][2], xydata[i][1]);
        if (d < closestdist) {
          // console.log("dist = "+d+"  "+xydata[i][0]);
          closestdist = d;
          dropi = i;
        }
      }

      // swap x and y in xydata
      tmp = xydata[starti][0];
      xydata[starti][0] = xydata[dropi][0];
      xydata[dropi][0] = tmp;
      tmp = xydata[starti][3];
      xydata[starti][3] = xydata[dropi][3];
      xydata[dropi][3] = tmp;
      // swap x and y in rcdata
      tmp = rcdata[starti][0];
      rcdata[starti][0] = rcdata[dropi][0];
      rcdata[dropi][0] = tmp;
      tmp = rcdata[starti][3];
      rcdata[starti][3] = rcdata[dropi][3];
      rcdata[dropi][3] = tmp;

      var queryParams = new URLSearchParams(window.location.search);
      queryParams.set("layout", exportLayout());
      history.replaceState(null, null, "?"+queryParams.toString());

      d3.select(svg).selectAll("*").remove();
      measureWords();
      measureDictionary();
      generateLayout();
      generatePlots();
    }
  }
}

if (url_layout) {
  importLayout(url_layout)
}
generateCoords();
fetchEffort();
fetchData();
fetchDictionary();
