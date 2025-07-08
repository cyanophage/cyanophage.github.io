
const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
var url_layout = params.layout;

var swidth = 1000;
var sheight = 180;

var w = 38;
var gap = 8;
var letter = "";
var x = 0;
var y = 0;
var dx;
var fontsize;
var per;
var max = 11.870939;
var red = 0;
var scroll_amount = 0;
var hw_scroll_amount = 0;
var sh_scroll_amount = 0;
var trigram_scroll_amount = 0;
var green = 128;
var mode = params.mode;
if (!mode){  mode = "ergo"}
var lang = "english";
if (params.lan) {
  lang = params.lan;
  if (lang != "english"){
    selectLanguage(lang);
  }
}
var needs_update = true;

function scroll(event){
  event.preventDefault();
  //
  const svgRect = el.getBoundingClientRect();
  const mouseX = event.clientX - svgRect.left;
  const mouseY = event.clientY - svgRect.top;
  if (mouseX > 570 && mouseX < 770 && mouseY > 345){
    hw_scroll_amount += Math.sign(event.deltaY);
    if (hw_scroll_amount < 0){hw_scroll_amount = 0;}
  } else if (mouseX > 200 && mouseX < 430 && mouseY > 345){
    sh_scroll_amount += Math.sign(event.deltaY);
    if (sh_scroll_amount < 0){sh_scroll_amount = 0;}
  } else if (mouseX > 780 && mouseX < 970 && mouseY > 345){
    trigram_scroll_amount += Math.sign(event.deltaY);
    if (trigram_scroll_amount < 0){trigram_scroll_amount = 0;}
  } else {
    scroll_amount += Math.sign(event.deltaY);
    if (scroll_amount < 0){scroll_amount = 0;}
    if (scroll_amount > 50){scroll_amount = 50;}
  }
  generatePlots();
}

var svg = d3.select("#svglayout").append("svg").attr("xmlns","http://www.w3.org/2000/svg").attr("width", swidth).attr("height", sheight);

var stats = d3.select("#svgstats").append("svg").attr("width", swidth).attr("height", 600)

const el = document.querySelector("#svgstats");
el.onwheel = scroll;

const word_list_url = 'word_list.json';
const dictionary_url = 'dictionary.json';
const effort_url = 'bigram_effort.json';
let words = {};
let dictionary = [];
let bigram_effort = {};

function fetchData(){
  fetch(word_list_url)
    .then(response => response.json())
    .then(data => {
      words = data; // Assign data to the global variable
      console.log("fetchData");
      dataloaded = true;
      needs_update = true;
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
      console.log("fetchDictionary");
      dictionaryloaded = true;
      needs_update = true;
    })
    .catch(error => console.error('Error loading dictionary JSON file:', error));
}

async function loadAllData() {
  try {
      const [wordsData, dictionaryData, effortData] = await Promise.all([
          fetch(word_list_url).then(response => response.json()),
          fetch(dictionary_url).then(response => response.json()),
          fetch(effort_url).then(response => response.json())
      ]);

      // Assign the data to your global variables
      words = wordsData;
      dictionary = dictionaryData.dictionary || [];
      bigram_effort = effortData;

      console.log("All data loaded successfully!");

      dataloaded = true;
      dictionaryloaded = true;
      effortloaded = true;
      setMode();
      generateCoords();
      measureDictionary();
      measureWords();
      generateLayout();
      generatePlots();

  } catch (error) {
      console.error('Error loading data:', error);
  }
}

function selectLanguage(lan) {
  document.getElementById("langDropDown").innerHTML = lan.charAt(0).toUpperCase() + lan.substr(1).toLowerCase();
  lang = lan
  var queryParams = new URLSearchParams(window.location.search);
  queryParams.set("lan",lang)
  history.replaceState(null, null, "?"+queryParams.toString());
  if (lan == "english"){
    console.log("============ ENGLISH ============")
    updateRcData(lan);
    dictionaryloaded = true;
    dataloaded = true;
    needs_update = true;
    loadAllData();
    return;
  }

  var word_list = 'words-'+lan+'.json'; // words-german.json
  console.log("============ "+lan.toUpperCase()+" ============")
  fetch(word_list)
    .then(response => response.json())
    .then(data => {
      words = data; // Assign data to the global variable
      needs_update = true;
      console.log("fetchData");
      dataloaded = true;
      updateRcData(lan);
      setMode();
      getDictionaryFromWords();
      dictionaryloaded = true;
      measureDictionary();
      measureWords();
      generateLayout();
      generatePlots();
    })
    .catch(error => console.error('Error loading JSON file:', error));
}

makeDraggable(svg.node());

// col         0  1  2  3  4  5  6  7  8  9 10 11
var fingerAssignment = [
               [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
               [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
               [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10]
             ]
// var hand = [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2]

// char, row, col, freq, y, x, width, keyname
var rcdata = [
  ["q", 0, 1, 0.06607202, 0, 0, 1, 0],
  ["w", 0, 2, 2.775025, 0, 0, 1, 1],
  ["e", 0, 3, 11.870939, 0, 0, 1, 2],
  ["r", 0, 4, 4.988437, 0, 0, 1, 3],
  ["t", 0, 5, 9.547406, 0, 0, 1, 4],
  ["y", 0, 6, 1.7949564, 0, 0, 1, 5],
  ["u", 0, 7, 2.7419887, 0, 0, 1, 6],
  ["i", 0, 8, 6.177734, 0, 0, 1, 7],
  ["o", 0, 9, 7.6643543, 0, 0, 1, 8],
  ["p", 0, 10, 1.4425724, 0, 0, 1, 9],
  ["-", 0, 11, 0.2753001, 0, 0, 1, 10],
  ["a", 1, 1, 7.466138, 0, 0, 1, 11],
  ["s", 1, 2, 5.5720735, 0, 0, 1, 12],
  ["d", 1, 3, 4.2616453, 0, 0, 1, 13],
  ["f", 1, 4, 2.0482326, 0, 0, 1, 14],
  ["g", 1, 5, 2.2244246, 0, 0, 1, 15],
  ["h", 1, 6, 6.519106, 0, 0, 1, 16],
  ["j", 1, 7, 0.06607202, 0, 0, 1, 17],
  ["k", 1, 8, 1.0571523, 0, 0, 1, 18],
  ["l", 1, 9, 4.6030173, 0, 0, 1, 19],
  [";", 1, 10, 0.4184561, 0, 0, 1, 20],
  ["'", 1, 11, 0.3523841, 0, 0, 1, 21],
  ["z", 2, 1, 0.04404801, 0, 0, 1, 22],
  ["x", 2, 2, 0.07708402, 0, 0, 1, 23],
  ["c", 2, 3, 1.8830525, 0, 0, 1, 24],
  ["v", 2, 4, 0.7488162, 0, 0, 1, 25],
  ["b", 2, 5, 1.5526924, 0, 0, 1, 26],
  ["n", 2, 6, 6.1446977, 0, 0, 1, 27],
  ["m", 2, 7, 1.5857284, 0, 0, 1, 28],
  [",", 2, 8, 1.9601365, 0, 0, 1, 29],
  [".", 2, 9, 0.48452812, 0, 0, 1, 30],
  ["/", 2, 10, 0.14315604, 0, 0, 1, 31],
  ["\\", 2, 0, 0, 0, 0, 1, 32],
  ["^", 3, 4, 0, 0, 0, 1, 33],
  ["tab", 0, 0, 0, 0, 0, 1, 34],
  ["ctrl", 1, 0, 0, 0, 0, 1, 35],
  ["enter", 2, 11, 0, 0, 0, 1, 36],
  ["mod", 3, 5, 0, 0, 0, 1, 37],
  ["back", 3, 6, 0, 0, 0, 1, 38],
  ["space", 3, 7, 0, 0, 0, 1, 39],
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

function openImportPopup() {
  document.getElementById('importPopup').style.display = 'flex';
}

function openCorpusPopup() {
  document.getElementById('corpusPopup').style.display = 'flex';
}

function containsOneCopyOfAllLetters(str) {
  str = str.toUpperCase();
  if (strCount(str,",")!=1) {return false;}
  if (strCount(str,".")!=1) {return false;}
  if (strCount(str,";")>1) {return false;}
  if (strCount(str,"/")>1) {return false;}
  if (strCount(str,"'")>1) {return false;}
  if (strCount(str,"\\")>1) {return false;}
  if (strCount(str,"-")>1) {return false;}
  // Convert the string to uppercase

  // Remove non-alphabetic characters
  str = str.replace(/[^A-Z]/g, '');

  // Check if the string has exactly one copy of each letter
  const uniqueLetters = new Set(str);
  return uniqueLetters.size === 26; //wlrdzqgubj-shnt,.aeoi'fmvc/;pxky
}

function deepCopy(arr) {
  return arr.map(item => Array.isArray(item) ? deepCopy(item) : item);
}

function strCount(str,char) {
  for(var count=-1,index=-2; index != -1; count++,index=str.indexOf(char,index+1) );
  return count
}

function closeImportPopup() {
  var importString = document.getElementById('importText').value;
  importString = importString.replace(/\s+/g, '');
  // if we import a string that is 30 characters long and doesn't contain - or ' then we add them in
  // but then what if we add a 30 character string that does contain - or '. well then we should add something else in
  if (importString.length == 0) {
    document.getElementById('importPopup').style.display = 'none';
    return
  }
  if (importString.length == 30){ // probably cmini
    if (strCount(importString,"-")==0 && strCount(importString,"'")==0){
      importString = importString.slice(0, 10) + "-" + importString.slice(10,20) + "'" + importString.slice(20) + "\\^";
    } else if (strCount(importString,"-")==0 && strCount(importString,";")==0 ) {
      importString = importString.slice(0, 10) + "-" + importString.slice(10,20) + ";" + importString.slice(20) + "\\^";
    } else if (strCount(importString,"'")==0 && strCount(importString,";")==0 ) {
      importString = importString.slice(0, 10) + ";" + importString.slice(10,20) + "'" + importString.slice(20) + "\\^";
    } else if (strCount(importString,"'")==0 && strCount(importString,"/")==0 ) {
      importString = importString.slice(0, 10) + "/" + importString.slice(10,20) + "'" + importString.slice(20) + "\\^";
    } else if (strCount(importString,";")==0 && strCount(importString,"/")==0 ) {
      importString = importString.slice(0, 10) + "/" + importString.slice(10,20) + ";" + importString.slice(20) + "\\^";
    } else if (strCount(importString,";")==0 && strCount(importString,"'")==0 ) {
      importString = importString.slice(0, 10) + ";" + importString.slice(10,20) + "'" + importString.slice(20) + "\\^";
    } else if (strCount(importString,"/")==0 && strCount(importString,"-")==0 ) {
      importString = importString.slice(0, 10) + "/" + importString.slice(10,20) + "-" + importString.slice(20) + "\\^";
    } else {
      importString = importString.slice(0, 10) + "+" + importString.slice(10,20) + "*" + importString.slice(20) + "\\^";
    }
  }
  if (containsOneCopyOfAllLetters(importString)){ // fwhmzqouybjsnrtk-aeicxvpld/;,'.g\^
    if ((mode == "iso" || mode == "ansi") && importString.length >= 33) {
      document.getElementById('importMessage').innerText = "You can't have layouts with thumb letters on ISO/ANSI"
    } else if (importString.length >= 33 && importString.length <= 36) {
      if (importString.length == 33) {
        importString = importString + "^⎈␣"
      } else if (importString.length == 34) {
        importString = importString + "⎈␣"
      } else if (importString.length == 35) {
        importString = importString + "␣"
      }
      needs_update = true;
      importLayout(importString);
      var queryParams = new URLSearchParams(window.location.search);
      queryParams.set("layout", exportLayout());
      queryParams.set("mode",mode)
      queryParams.set("lan",lang)
      history.replaceState(null, null, "?"+queryParams.toString());
      generateCoords();
      measureDictionary();
      measureWords();
      generateLayout();
      generatePlots();
      document.getElementById('importPopup').style.display = 'none';
    } else {
      document.getElementById('importMessage').innerText = "Input string needs to be 30,32 or 33 characters"
      // console.log(document.getElementById('importMessage'));
      console.log("input string is length "+ importString.length + "  " + importString);
    }
  } else {
    document.getElementById('importMessage').innerText = "Imported layout should have only 1 of A-Z and . and , "
  }
  needs_update = true;
}

function closeCorpusPopup() {
  var massive_string = document.getElementById('corpusText').value;
  massive_string = massive_string.toLowerCase().replace(/\s+/g, ' ');
  words = {};
  if (massive_string.length == 0) {
    document.getElementById('corpusPopup').style.display = 'none';
    return;
  }
  if (massive_string.length < 1000) {
    document.getElementById('corpusMessage').innerText = "You call that a corpus?";
    return;
  }
  list = massive_string.split(" ")
  var regex = /\d/;
  list.forEach(element => {
    // i don't know what to do with these at the moment. just replacing them for now
    element = element.replace("ä","a")
    element = element.replace("å","a")
    element = element.replace("á","a")
    element = element.replace("à","a")
    element = element.replace("â","a")
    element = element.replace("ö","o")
    element = element.replace("ó","o")
    element = element.replace("í","i")
    element = element.replace("ü","u")
    element = element.replace("é","e")
    element = element.replace("è","e")
    element = element.replace("ç","c")
    element = element.replace("æ","ae")
    element = element.replace("ß","ss")
    element = element.replace("ğ","g")
    if (regex.test(element)){

    } else {
      if (words[element]) {
        words[element] += 1
      } else {
        words[element] = 1
      }
    }
  });
  dictionary = [];
  count = 0;
  for(var word in words) {
    dictionary.push(word)
    count += 1
  }
  // console.log(count);

  document.getElementById('corpusPopup').style.display = 'none';
  needs_update = true;
  measureWords();
  measureDictionary();
  generatePlots();
}

function closePopup() {
  for (var row = 0; row < 3; row++){
    for (var col = 0; col < 12; col++){
      var name = "textInput-" + row + "-" + col
      effort[row][col] = document.getElementById(name).value;
    }
  }
  document.getElementById('popup').style.display = 'none';
  needs_update = true;
  measureWords();
  generateLayout();
}

function copyEffortGridToClipboard() {
  values = []
  for (var row = 0; row < 3; row++){
    for (var col = 0; col < 12; col++){
      var name = "textInput-" + row + "-" + col
      values.push(document.getElementById(name).value);
    }
  }
  var str = values.join(",");

  if (!navigator.clipboard) {
    console.error("Clipboard API not supported");
    return;
  }

  navigator.clipboard.writeText(str)
  .then(
    // console.log("copied!")
  )
  .catch(err => {
    console.error("Failed to copy to clipboard contents:", err);
  });

}

function pasteEffortGridFromClipboard() {
  if (!navigator.clipboard) {
    console.error("Clipboard API not supported");
    return;
  }
  // Retrieve clipboard content
  navigator.clipboard.readText()
  .then(text => {
    // console.log("Clipboard content:", text);
    var numbersArray = text.split(",").map(Number);
    if (numbersArray.length != 36) {
      return
    }

    for (var row = 0; row < 3; row++){
      for (var col = 0; col < 12; col++){
        var name = "textInput-" + row + "-" + col
        document.getElementById(name).value = numbersArray[row * 12 + col]
      }
    }
  })
  .catch(err => {
    console.error("Failed to read clipboard contents:", err);
  });
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
var scissors_toggle = 0;
function scissorsToggle(v) {
  scissors_toggle += v
  if (scissors_toggle > 2){
    scissors_toggle = 0
  }
  if (scissors_toggle < 0){
    scissors_toggle = 2
  }
  generatePlots();
}
var lsb_toggle = 0;
function lsbToggle() {
  lsb_toggle += 1
  if (lsb_toggle > 1){
    lsb_toggle = 0
  }
  generatePlots();
}

var sfb_toggle = 0;
function sfbToggle(v) {
  sfb_toggle += v
  if (sfb_toggle > 2){
    sfb_toggle = 0
  }
  if (sfb_toggle < 0){
    sfb_toggle = 2
  }
  generatePlots();
}
var trigram_toggle = 0;
function trigramToggle(v) {
  trigram_toggle += v
  if (trigram_toggle > 4){
    trigram_toggle = 0
  }
  if (trigram_toggle < 0){
    trigram_toggle = 4
  }
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

function setMode() {
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  console.log("setMode to "+mode);
  if (mode == "ergo") {
    setErgo()
  } else if (mode == "ansi") {
    setAnsi()
  } else if (mode == "iso") {
    setIso()
  }
  generateCoords()
}

function setErgo() {
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  console.log("setErgo");
  rcdata[32][1] = 2
  rcdata[32][2] = 0
  rcdata[32][6] = 1
  rcdata[33][1] = 3
  rcdata[33][2] = 4
  rcdata[33][6] = 1
  rcdata[34] = ["tab", 0, 0, 0, 0, 0, 1]
  rcdata[35] = ["ctrl", 1, 0, 0, 0, 0, 1]
  rcdata[36] = ["enter", 2, 11, 0, 0, 0, 1]
  rcdata[37] = ["mod", 3, 5, 0, 0, 0, 1]
  rcdata[38] = ["back", 3, 6, 0, 0, 0, 1]
  rcdata[39] = ["space", 3, 7, 0, 0, 0, 1]
  mode = "ergo"
  fingerAssignment = [
                 [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
                 [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
                 [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10]
               ]

  var queryParams = new URLSearchParams(window.location.search);
  queryParams.set("layout", exportLayout());
  queryParams.set("mode",mode)
  queryParams.set("lan",lang)
  history.replaceState(null, null, "?"+queryParams.toString());
  generateCoords()
}


function activateErgo() {
  needs_update = true;
  setErgo();
  generateCoords();
  measureDictionary();
  measureWords();
  generateLayout();
  generatePlots();
}

function setErgo() {
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  console.log("activateErgo");
  rcdata[32][1] = 2
  rcdata[32][2] = 0
  rcdata[32][6] = 1
  rcdata[33][1] = 3
  rcdata[33][2] = 4
  rcdata[33][6] = 1
  rcdata[34] = ["tab", 0, 0, 0, 0, 0, 1, 34]
  rcdata[35] = ["ctrl", 1, 0, 0, 0, 0, 1, 35]
  rcdata[36] = ["enter", 2, 11, 0, 0, 0, 1, 36]
  rcdata[37] = ["mod", 3, 5, 0, 0, 0, 1, 37]
  rcdata[38] = ["back", 3, 6, 0, 0, 0, 1, 38]
  rcdata[39] = ["space", 3, 7, 0, 0, 0, 1, 39]
  mode = "ergo"
  fingerAssignment = [
                 [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
                 [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
                 [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10]
               ]

  var queryParams = new URLSearchParams(window.location.search);
  queryParams.set("layout", exportLayout());
  queryParams.set("mode",mode)
  queryParams.set("lan",lang)
  history.replaceState(null, null, "?"+queryParams.toString());
}

function activateIso(anglemod) {
  needs_update = true;
  setIso(anglemod);
  generateCoords();
  measureDictionary();
  measureWords();
  generateLayout();
  generatePlots();
}

function setIso(anglemod) {
  // console.log(rcdata)
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  hasshift = false
  for(let i = 0; i < 34; i++){
    if (rcdata[i][0] == "shift" || rcdata[i][0] == "^") {
      hasshift = true
    }
  }
  if (hasshift == true) {
    rcdata[32][1] = 2
    rcdata[32][2] = 0
    rcdata[32][6] = 1
    rcdata[33][1] = 2
    rcdata[33][2] = -1
    rcdata[33][6] = 1.25
    rcdata[34] = ["tab", 0, 0, 0, 0, 0, 1.5, 34]
    rcdata[35] = ["back", 0, 12, 0, 0, 0, 2.25, 35]
    rcdata[36] = ["ctrl", 1, 0, 0, 0, 0, 1.75, 36]
    rcdata[37] = ["enter", 1, 12, 0, 0, 0, 2, 37]
    rcdata[38] = ["rshift", 2, 12, 0, 0, 0, 2.5, 38]
    rcdata[39] = ["space", 3, 3, 0, 0, 0, 6.5, 39]
    if (anglemod){
      fingerAssignment = [ // angle mod
        [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
        [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
        [1, 2, 3, 4, 4, 4, 7, 7, 8, 9, 10, 10, 10]
      ]
    } else {
      fingerAssignment = [
        [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
        [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
        [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10]
      ]
    }
    mode = "iso"
    var queryParams = new URLSearchParams(window.location.search);
    queryParams.set("layout", exportLayout());
    queryParams.set("mode",mode)
    queryParams.set("lan",lang)
    history.replaceState(null, null, "?"+queryParams.toString());
  } else {
    console.log("You can't have layouts with thumb letters on ISO/ANSI")
  }
}

function activateAnsi() {
  needs_update = true;
  setAnsi();
  generateCoords();
  measureDictionary();
  measureWords();
  generateLayout();
  generatePlots();
}

function setAnsi() {
  // console.log(rcdata)
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  hasshift = false
  for(let i = 0; i < 34; i++){
    if (rcdata[i][0] == "shift" || rcdata[i][0] == "^") {
      hasshift = true
    }
  }
  if (hasshift == true) {
    // rcdata[32] = [rcdata[32][0], 0, 12, 0.2753001, 0, 0, 1, rcdata[32][7]]
    // rcdata[33] = [rcdata[33][0], 2, -1, 0, 0, 0, 2.25, rcdata[33][7]]

    // backslash key
    rcdata[32][1] = 0
    rcdata[32][2] = 12
    rcdata[32][6] = 1

    // left shift key
    rcdata[33][1] = 2
    rcdata[33][2] = -1
    rcdata[33][6] = 2.25

    rcdata[34] = ["tab", 0, 0, 0, 0, 0, 1.5, 34]
    rcdata[35] = ["back", 0, 13, 0, 0, 0, 1.25, 35]
    rcdata[36] = ["ctrl", 1, 0, 0, 0, 0, 1.75, 36]
    rcdata[37] = ["enter", 1, 12, 0, 0, 0, 2, 37]
    rcdata[38] = ["rshift", 2, 11, 0, 0, 0, 2.5, 38]
    rcdata[39] = ["space", 3, 3, 0, 0, 0, 6.5, 39]
    fingerAssignment = [
      [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
      [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10],
      [1, 1, 2, 3, 4, 4, 7, 7, 8, 9, 10, 10, 10]
    ]
    mode = "ansi"
    var queryParams = new URLSearchParams(window.location.search);
    queryParams.set("layout", exportLayout());
    queryParams.set("mode",mode)
    queryParams.set("lan",lang)
    history.replaceState(null, null, "?"+queryParams.toString());
  } else {
    console.log("You can't have layouts with thumb letters on ISO/ANSI")
  }
}

function importLayout(layout) {
  var decodedString = decodeURIComponent(layout);
  console.log("importing: "+decodedString)
  layout = decodedString
  for (let i = 0; i < 36; i++) { // qwertyuiop-asdfghjkl;'zxcvbnm,./\^⎈␣  - 36
    let key = layout.charAt(i);
    if (key == "⎈") {
      key = "ctrl";
    } else if (key == "␣") {
      key = "space";
    }
    for (let j = 0; j < 36; j++) {
      if (key == rcdata[j][0]) {
        // console.log("swap " + key + " at " + i + " with position " + j)
        // swap
        indices = [0, 3, 7]
        for (let id = 0; id < indices.length; id++){
          var k = indices[id];
          tmp = rcdata[i][k];
          rcdata[i][k] = rcdata[j][k];
          rcdata[j][k] = tmp;
        }
      }
    }
  }
  for (let i = 0; i < 36; i++) {
    if (rcdata[i][0] == "^") {
      if (rcdata[i][1] == 3 && rcdata[i][2] == 4) {
        // cool
      } else {
        rcdata[i][0] = "="
      }
    }
  }

  var queryParams = new URLSearchParams(window.location.search);
  queryParams.set("layout", exportLayout());
  queryParams.set("mode",mode)
  queryParams.set("lan",lang)
  history.replaceState(null, null, "?"+queryParams.toString());
}

function exportLayout() {
  var str = "";
  for (let i = 0; i <= 39; i++) {
    let key = rcdata[i][0];
    if (key.length == 1) {
      str += key;
    } else if (key == "shift") {
      str += "^";
    } else if (key == "ctrl") {
      str += "⎈";
    } else if (key == "space") {
      str += "␣";
    }
  }
  return str;
}

function getX(name, row, col) {
  dx = 55;
  if (mode == "iso") {
    if (row == 0){
      if (name === "tab") {
        off = 0
      } else {
        off = w*0.5;
      }
    } else if (row == 1) {
      if (name === "ctrl") {
        off = 0;
      } else {
        off = w*0.75;
      }
    } else if (row >= 2) {
      if (col == -1) {
        return dx
      } else {
        if (name === "space") {
          off = 0;
        } else if (name == "rshift") {
          off = w*0.25;
        } else {
          off = w*1.25;
        }
      }
    }
    return dx + off + col * w
  } else if (mode == "ansi") {
    if (row == 0){
      if (name === "tab") {
        off = 0
      } else {
        off = w*0.5;
      }
    } else if (row == 1){
      if (name === "ctrl") {
        off = 0;
      } else {
        off = w*0.75;
      }
    } else if (row >= 2){
      if (col == -1) {
        return dx
      } else {
        if (name === "space") {
          off = 0;
        } else {
          off = w*1.25;
        }
      }
    }
    return dx + off + col * w
  } else if (mode == "ergo") {
    if (col > 5) {
      dx = dx + 40;
    }
    return dx + col * w
  }
}
function getY(name, row, col) {
  return 10 + row * w
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
function getChar(row,col) {
  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i][1] == row && rcdata[i][2] == col) {
      return rcdata[i][0];
    }
  }
  return "!";
}

function getFinger(row, col) {
  if (row > 2) {
    if (col <= 4) {
      return 5
    } else {
      return 6
    }
  } else {
    return fingerAssignment[row][col];
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))/w;
}

function generateCoords() {
  console.log("generateCoords")
  for (let i = 0; i < rcdata.length; i++) {
    rcdata[i][4] = getY(rcdata[i][0], rcdata[i][1],rcdata[i][2]); // Y
    rcdata[i][5] = getX(rcdata[i][0], rcdata[i][1],rcdata[i][2]); // X
  }
}

function generateLayout() {
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  console.log("generateLayout")
  svg.selectAll("*").remove();
  if (mode == "iso" || mode == "ansi") {
    outlinewidth = 572;
  } else  {
    outlinewidth = 510;
  }
  svg.append("rect").attr("x", 45).attr("y", 0).attr("width", outlinewidth).attr("height", 170)
  .attr("stroke", "#777777").attr("fill", "#1b1c1f").attr("fill-opactiy", "0.0").attr("rx", 8).attr("ry", 8)
  for (let i = 0; i < rcdata.length; i++) {
    dtx = 0;
    letter = rcdata[i][0];
    if (letter == "^"){
      letter = "shift"
    }
    x = rcdata[i][5];
    y = rcdata[i][4];
    per = rcdata[i][3];
    keywidth = rcdata[i][6];
    red = Math.floor(127 * per / max) + 128
    if (red < 16) {  red = 16; }
    if (red > 255) { red = 255;}
    hex_red = red.toString(16);
    hex_bg = green.toString(16);

    fontsize = 16;
    if (letter.length > 1) { fontsize = 10; }
    if (letter.length > 4 && mode == "ergo") { fontsize = 9; }

    let rectClasses = "draggable";
    let textClasses = "draggable legend";
    if (letter == "mod" || letter == "back" || letter == "tab" || letter == "enter") {
      rectClasses = "";
      textClasses = "legend";
    }

    svg.append("rect").attr("x", x).attr("y", y)
      .attr("width", keywidth*w-gap).attr("height", w-gap).attr("rx", 4).attr("ry", 4)
      .attr("fill", "#" + hex_red + hex_bg + hex_bg).attr("stroke", "black")
      .attr("stroke-width", "1").attr("class", rectClasses);
    if (letter.length > 1 && mode != "ergo") {
      svg.append("text").attr("x", x + 5).attr("y", y + 19)
        .attr("font-size", fontsize).attr("font-family", "Roboto Mono")
        .attr("text-anchor", "left").attr("class", textClasses).text(letter);
    } else {
      svg.append("text").attr("x", x + 15).attr("y", y + 19)
        .attr("font-size", fontsize).attr("font-family", "Roboto Mono")
        .attr("text-anchor", "middle").attr("class", textClasses).text(letter);
    }
  }
  //
  if (m_total_word_effort == 0){
    // console.log("m_total_word_effort == 0")
    measureDictionary();
    measureWords();
  }
  svg.append("text").attr("x", 640).attr("y", 135).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Total Word Effort "+(m_total_word_effort/100.0).toFixed(1))
  // effort text
  svg.append("text").attr("x", 640).attr("y", 165).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Effort "+(577*m_effort/m_input_length).toFixed(2))
  // edit button
  svg.append("rect").attr("x", 760).attr("y", 147).attr("width", 40).attr("height", 25).attr("rx",0).attr("ry",0)
  .attr("fill","#777777").attr("stroke","black").attr("stroke-width","1").attr("onclick", "openPopup()")
  .attr("onmouseover", "showTooltip(evt,'Edit effort values for each key')").attr("onmouseout", "hideTooltip()")

  svg.append("text").attr("x", 760+20).attr("y", 164).attr("font-size", 16).attr("font-family", "Sans,Arial")
  .attr("fill", "#111111").attr("text-anchor", "middle").attr("pointer-events","none").text("Edit")


  // ergo button
  svg.append("rect").attr("x", 640).attr("y", 10).attr("width", 46).attr("height", 25).attr("rx",0).attr("ry",0)
  .attr("fill","#777777").attr("stroke","black").attr("stroke-width","1").attr("onclick", "activateErgo()")
  .attr("onmouseover", "showTooltip(evt,'Switch layout to Ergo')").attr("onmouseout", "hideTooltip()")
  svg.append("text").attr("x", 640+23).attr("y", 10+18).attr("font-size", 16).attr("font-family", "Sans,Arial")
  .attr("fill", "#111111").attr("text-anchor", "middle").attr("pointer-events","none").text("Ergo")
  // iso button
  svg.append("rect").attr("x", 640).attr("y", 10+35).attr("width", 46).attr("height", 25).attr("rx",0).attr("ry",0)
  .attr("fill","#777777").attr("stroke","black").attr("stroke-width","1").attr("onclick", "activateIso(false)")
  .attr("onmouseover", "showTooltip(evt,'Switch layout to ISO')").attr("onmouseout", "hideTooltip()")
  svg.append("text").attr("x", 640+23).attr("y", 10+18+35).attr("font-size", 16).attr("font-family", "Sans,Arial")
  .attr("fill", "#111111").attr("text-anchor", "middle").attr("pointer-events","none").text("ISO")

  // anglemod button
  svg.append("rect").attr("x", 695).attr("y", 10+35).attr("width", 80).attr("height", 25).attr("rx",0).attr("ry",0)
  .attr("fill","#777777").attr("stroke","black").attr("stroke-width","1").attr("onclick", "activateIso(true)")
  .attr("onmouseover", "showTooltip(evt,'Switch layout to ISO with angle mod')").attr("onmouseout", "hideTooltip()")
  svg.append("text").attr("x", 695+40).attr("y", 10+18+35).attr("font-size", 16).attr("font-family", "Sans,Arial")
  .attr("fill", "#111111").attr("text-anchor", "middle").attr("pointer-events","none").text("anglemod")

  // ansi button
  svg.append("rect").attr("x", 640).attr("y", 10+35+35).attr("width", 46).attr("height", 25).attr("rx",0).attr("ry",0)
  .attr("fill","#777777").attr("stroke","black").attr("stroke-width","1").attr("onclick", "activateAnsi()")
  .attr("onmouseover", "showTooltip(evt,'Switch layout to ANSI')").attr("onmouseout", "hideTooltip()")
  svg.append("text").attr("x", 640+23).attr("y", 10+18+35+35).attr("font-size", 16).attr("font-family", "Sans,Arial")
  .attr("fill", "#111111").attr("text-anchor", "middle").attr("pointer-events","none").text("ANSI")

}

var m_column_usage = {};
var m_finger_usage = {};
var m_finger_distance = {};
var m_finger_pairs = {};
var m_same_finger = {};  // per bigram
var m_same_finger2 = {}; // per finger
var m_same_finger3 = {}; // per bigram 2u
var m_skip_bigram = {};
var m_skip_bigram2 = {};
var m_redirects = {};
var m_scissors = {};
var m_all_scissors = {};
var m_pinky_scissors = {};
var m_lat_stretch = {};
var m_lat_stretch2 = {};
var m_letter_freq = {};
var m_row_usage = {};
var m_trigram_count = {};
var m_trigram_count_alt = {};
var m_trigram_count_red = {};
var m_trigram_count_roll_in = {};
var m_trigram_count_roll_out = {};
var m_input_length = 0;
var m_effort = 0;
var m_total_word_effort = 0;
// var m_simple_effort = {};
var finger_pos = [[0, 0], [1, 1], [1, 2], [1, 3], [1, 4], [3, 4], [3, 7], [1, 7], [1, 8], [1, 9], [1, 10]];

var word_effort = Object.create(null)
var samehandstrings = {};
var samehandcount = {};

function measureDictionary() {
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  console.log("measureDictionary");
  // console.log("measuring effort of each word in the dictionary");
  var total=0, word, char1, char2, col1, row1, col2, row2, hand1, hand2, samehand,count = 0;
  word_effort = Object.create(null)
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
    if (isNaN(total)){
      console.log(word + " gives NaN for effort")
    }
    word_effort[word] = total/10;
  }
}

function getDictionaryFromWords() {
  console.log("getDictionaryFromWords");
  dictionary = [];
  for (var word in words) {
    if (words[word] > 100) {
      dictionary.push(word);
    }
  }
}

function getIndexOfKey(name){
  var x = -1;
  for (var i = 0; i < 34; i++) {
    if (rcdata[i][7] == name) {
      x = i;
    }
  }
  return x;
}

function updateRcData(lan) {
  // what are the 33 letters ?
  var letters = []
  for (var word in words) {
    if (letters.length>=32){
      break;
    }
    var wordLetters = word.split(""); // Split the word into individual letters
    for (var i = 0; i < wordLetters.length; i++) {
      if (letters.indexOf(wordLetters[i]) === -1) {
        letters.push(wordLetters[i]); // Add letter to the list if not already present
      }
    }
  }
  // my new idea for fixing this issue still didn't work
  // the problem is that the keys that I want to change when switching languages aren't in a consistent position in the grid, or at a consistent position in the array,
  // or have a consistent letter on them. Even the index I added to try to make them consistent didn't work because of the way the import process works
  if (lan == 'german'){
    // letters = ['q', 'w', 'e', 'r', 't', 'z', 'u', 'i', 'o', 'p', 'ü', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', 'y','x', 'c', 'v', 'b', 'n', 'm', ',', '.', '\'', 'ß']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = 'ü' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'ö' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = 'ä' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = 'ß' }
  } else if (lan == 'english') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/','\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = '-' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = ';' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '/' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'dutch') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/','\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = '-' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = ';' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '/' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'french') {
    // letters = ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'é', 'q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'è', '\'', 'w', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'ç', 'à']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = 'é' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'è' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = 'ç' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = 'à' }
  } else if (lan == 'italian') {
    // letters = ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'é', 'q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'è', '\'', 'w', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', 'ç', 'à']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = 'è' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'à' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = 'ù' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = 'ò' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = 'ì' }
  } else if (lan == 'swedish') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', 'z', 'x',  'c', 'v', 'b','n', 'm', '.', ',', '\'', '\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = 'å' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'ö' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = 'ä' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '\'' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'spanish') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ', '\'', 'z','x', 'c', 'v',  'b', 'n', 'm',',', '.',  '/', '\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = '-' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'ñ' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '/' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'portuguese') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', '\'', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/','\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = '-' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'ç' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '/' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'norweigan') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ø', 'æ', 'z', 'x','c','v', 'b', 'm', 'n', '.', ',',  '\'', '\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = 'å' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'ø' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = 'æ' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '\'' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'finnish') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'å', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ö', 'ä', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '\'', '\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = 'å' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'ö' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = 'ä' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '\'' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'estonian') {
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = 'ä' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = 'õ' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = 'ü' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = 'ö' }
  } else if (lan == 'hungarian') {
    // letters = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '-', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/','\\']
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = '-' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = ';' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '/' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  } else if (lan == 'polish') {
    if (getIndexOfKey(10) >= 0) { rcdata[getIndexOfKey(10)][0] = '-' }
    if (getIndexOfKey(20) >= 0) { rcdata[getIndexOfKey(20)][0] = ';' }
    if (getIndexOfKey(21) >= 0) { rcdata[getIndexOfKey(21)][0] = '\'' }
    if (getIndexOfKey(31) >= 0) { rcdata[getIndexOfKey(31)][0] = '/' }
    if (getIndexOfKey(32) >= 0) { rcdata[getIndexOfKey(32)][0] = '\\' }
  }
}

function measureWords() {
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  console.log("measureWords");
  if (!needs_update){return;}
  m_column_usage = {};
  m_finger_usage = {};
  m_finger_distance = {};
  m_skip_bigram = {};
  m_skip_bigram2 = {};
  m_redirects = {};
  m_scissors = {};
  m_all_scissors = {};
  m_pinky_scissors = {};
  m_same_finger = {};
  m_same_finger2 = {};
  m_same_finger3 = {};
  m_lat_stretch = {};
  m_lat_stretch2 = {};
  m_letter_freq = {};
  m_row_usage = {};
  m_trigram_count = {};
  m_trigram_count_alt = {};
  m_trigram_count_red = {};
  m_trigram_count_roll_in = {};
  m_trigram_count_roll_out = {};
  m_finger_pairs = {};
  samehandstrings = {};
  samehandcount = {};
  m_input_length = 0;
  m_effort = 0;
  m_total_word_effort = 0;
  var char = "";
  var prevchar = "";
  var prevfinger = -1;
  var ppchar = "";
  var ppfinger = -1;
  var bigram, trigram, cat, cat2, skip;
  var prevcol = -1;
  var prevrow = -1;
  var pprow = -1;
  var col,row,hand,prevhand;
  var m_effort_per_letter = {};
  var m_effort_per_word = {};
  var word_count = 0
  for (var word in words) {
    if (word_count > 40000){break;}
    word_count += 1
    finger_pos = [[0, 0], [1, 1], [1, 2], [1, 3], [1, 4], [3, 4], [3, 7], [1, 7], [1, 8], [1, 9], [1, 10]];
    var count = words[word];
    m_input_length += count * (word.length + 1);

    if (word_effort[word]){
      // console.log(word +" "+word_effort[word]);
      m_total_word_effort += word_effort[word] * count;
    }

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
      row = getRow(char);
      col = getCol(char);
      if (col <= 5){
        hand = "L"
      } else {
        hand = "R"
      }
      if (col < 0) { continue; } // this is the part that just skips numbers and other characters
      if (!m_column_usage[col]) {
        m_column_usage[col] = 0;
      }
      if (row < 3){ m_column_usage[col] += count;}
      // finger usage //
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

      var finger = getFinger(row, col);
      if (!m_finger_usage[finger]) {
        m_finger_usage[finger] = 0;
      }
      m_finger_usage[finger] += count;
      // finger travel distance
      if (row < 0) { break; }
      // d = dist(col, row, finger_pos[finger][1], finger_pos[finger][0]);
      x1 = getX(char,row,col)
      y1 = getY(char,row,col)
      x2 = getX(getChar(finger_pos[finger][0],finger_pos[finger][1]),finger_pos[finger][0],finger_pos[finger][1])
      y2 = getY(getChar(finger_pos[finger][0],finger_pos[finger][1]),finger_pos[finger][0],finger_pos[finger][1])
      d = dist(x1, y1, x2, y2);
      if (!m_finger_distance[finger]) {
        m_finger_distance[finger] = 0;
      }
      m_finger_distance[finger] += d * count;

      finger_pos[finger] = [row, col]; // move finger to new position

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

          if (!m_same_finger2[finger]) {
            m_same_finger2[finger] = 0;
          }
          m_same_finger2[finger] += count;

          if (Math.abs(row-prevrow) >= 2) {
            if (!m_same_finger3[bigram]) {
              m_same_finger3[bigram] = 0;
            }
            m_same_finger3[bigram] += count;
          }
        }
        // lsbs
        if ((prevcol == 3 && col == 5) || (prevcol == 8 && col == 6) || (prevcol == 5 && col == 3) || (prevcol == 6 && col == 8)) {
          if (!m_lat_stretch[bigram]) {
            m_lat_stretch[bigram] = 0;
          }
          m_lat_stretch[bigram] += count;
        }
        if ((prevcol == 2 && col == 5) || (prevcol == 9 && col == 6) || (prevcol == 5 && col == 2) || (prevcol == 6 && col == 9)) {
          if (!m_lat_stretch2[bigram]) {
            m_lat_stretch2[bigram] = 0;
          }
          m_lat_stretch2[bigram] += count;
        }
        // scissors
        if (Math.abs(col-prevcol) == 1 && Math.abs(row-prevrow) >= 2 && ((finger <= 4 && prevfinger <= 4 &&finger!=prevfinger)||(finger >=7 && prevfinger>=7&&finger!=prevfinger))) {
          if (!m_scissors[bigram]) {
            m_scissors[bigram] = 0;
          }
          m_scissors[bigram] += count;
        }
        // all 2u scissors
        if (Math.abs(row-prevrow) >= 2 && ((finger <= 4 && prevfinger <= 4)||(finger >=7 && prevfinger>=7))) {
          if (!m_all_scissors[bigram]) {
            m_all_scissors[bigram] = 0;
          }
          m_all_scissors[bigram] += count;
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
          if (!samehandcount[samehand.length]){
            samehandcount[samehand.length] = 0;
          }
          samehandcount[samehand.length] += count
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
        // cat2 = "other";
        if (ppfinger <= 5 && prevfinger <= 5 && finger <= 5) { // left hand
          if (ppfinger < prevfinger && prevfinger < finger) {
            cat = "roll in"
          } else if (ppfinger > prevfinger && prevfinger > finger) {
            cat = "roll out"
          } else if ((ppfinger < prevfinger && finger < prevfinger && finger != ppfinger) || (ppfinger > prevfinger && finger > prevfinger && finger != ppfinger)) {
            cat = "redirect"
            // if (!m_redirects[trigram]) {
            //   m_redirects[trigram] = 0;
            // }
            // m_redirects[trigram] += count;
            if (ppfinger == 4 || prevfinger == 4 || finger == 4) {
            } else {
              cat = "weak redirect"
            }
          }
        }
        if (ppfinger >= 6 && prevfinger >= 6 && finger >= 6) { // right hand
          if (ppfinger > prevfinger && prevfinger > finger) {
            cat = "roll in"
          } else if (ppfinger < prevfinger && prevfinger < finger) {
            cat = "roll out"
          } else if ((ppfinger > prevfinger && finger > prevfinger && finger != ppfinger) || (ppfinger < prevfinger && finger < prevfinger && finger != ppfinger)) {
            cat = "redirect"
            // if (!m_redirects[trigram]) {
            //   m_redirects[trigram] = 0;
            // }
            // m_redirects[trigram] += count;
            if (ppfinger == 7 || prevfinger == 7 || finger == 7) {
            } else {
              cat = "weak redirect"
            }
          }
        } //
        if ((ppfinger <= 5 && prevfinger >= 6 && finger <= 5) || (ppfinger >= 6 && prevfinger <= 5 && finger >= 6)) {
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
        if (cat == "alt"){
          if (!m_trigram_count_alt[trigram]) {
            m_trigram_count_alt[trigram] = 0;
          }
          // if (count > 20){
            m_trigram_count_alt[trigram] += count;
          // }
          // if (count > 10){ console.log(trigram + " "+ count);}
        }
        if (cat == "redirect" || cat == "weak redirect"){
          if (!m_trigram_count_red[trigram]) {
            m_trigram_count_red[trigram] = 0;
          }
          // if (count > 20){
            m_trigram_count_red[trigram] += count;
          // }
        }
        if (cat == "roll in" || cat == "bigram roll in"){
          if (!m_trigram_count_roll_in[trigram]) {
            m_trigram_count_roll_in[trigram] = 0;
          }
          // if (count > 20){
            m_trigram_count_roll_in[trigram] += count;
          // }
        }
        if (cat == "roll out" || cat == "bigram roll out"){
          if (!m_trigram_count_roll_out[trigram]) {
            m_trigram_count_roll_out[trigram] = 0;
          }
          // if (count > 20){
            m_trigram_count_roll_out[trigram] += count;
          // }
        }
      }
      pprow = prevrow
      prevcol = col;
      prevrow = row;
      prevhand = hand;
      ppchar = prevchar;
      ppfinger = prevfinger;
      prevchar = char;
      prevfinger = finger;
    }
    if (samehand.length >= 4) {
      if (!samehandstrings[samehand]) {
        samehandstrings[samehand] = 0;
      }
      samehandstrings[samehand] += count;
    }
    if (!samehandcount[samehand.length]){
      samehandcount[samehand.length] = 0;
    }
    samehandcount[samehand.length] += count
  }
  var scale = 1006393/m_input_length;
  m_total_word_effort *= scale;
  // console.log("word count "+word_count)
  var sum = 0;
  for (var letter in m_letter_freq) {
    sum += m_letter_freq[letter]
  }
  for (var letter in m_letter_freq) {
    for (let i = 0; i < rcdata.length; i++) {
      if (rcdata[i][0] == letter) {
        rcdata[i][3] = 100 * m_letter_freq[letter] / sum
      }
    }
  }
  needs_update = false;
}

function generatePlots() {
  if (dataloaded == false || dictionaryloaded == false || effortloaded == false) {return;}
  console.log("generatePlots")
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
  var max = m_input_length / 5.110882176;
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
  stats.append("text").attr("x", x + 117).attr("y", 124).attr("fill", "#dfe2eb").attr("font-size", 11).attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(parseFloat(100 * sum/max).toFixed(1));
  // (100*sum/max).toFixed(1)
  ///////////////////////////////////   S A M E   F I N G E R   B I G R A M S    ///////////////////////////////
  var x = 0;
  var y = 180;
  sum = 0;
  // toggle button
  stats.append("path").attr("d", `M ${x + 15} ${y - 24} L ${x + 35} ${y - 24} L ${x + 25} ${y - 34} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing same finger bigrams for each bigram, and for each finger')")
  .attr("onmouseout","hideTooltip()").attr("onclick","sfbToggle(-1)")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });

  stats.append("path").attr("d", `M ${x + 15} ${y - 20} L ${x + 35} ${y - 20} L ${x + 25} ${y - 10} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing same finger bigrams for each bigram, and for each finger')")
  .attr("onmouseout","hideTooltip()").attr("onclick","sfbToggle(1)")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });
  if(sfb_toggle == 0) {
    var keyValueArray = Object.entries(m_same_finger);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    m_same_finger = Object.fromEntries(keyValueArray);

    for (var bigram in m_same_finger) {
      sum += m_same_finger[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Same Finger Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
    // stats.append("text").attr("x",x+40).attr("y",y+200).attr("font-size",16).attr("font-family","Sans,Arial").attr("fill","#dfe2eb").attr("text-anchor","left").text("Input Length "+m_input_length);

    var i = 0;
    var t = scroll_amount;
    for (var bigram in m_same_finger) {
      if (t > 0){
        t -= 1;
        continue;
      }
      var width = 18000 * m_same_finger[bigram] / m_input_length;
      if (width > 200) { width = 200; }
      stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", width).attr("height", 10).attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
      stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(bigram);
      stats.append("text").attr("x", x + 200).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * m_same_finger[bigram] / m_input_length)).toFixed(2) + "%");
      //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
      i += 1;
      if (i > 10) { break; }
    }
  } else if(sfb_toggle == 1){
    for (var finger in m_same_finger2) {
      sum += m_same_finger2[finger] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial")
       .attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Same Finger Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
    for (var finger in m_same_finger2) {
      var height = 30000 * m_same_finger2[finger] / m_input_length;
      if (height > 150) { height = 150;}
      var tip = parseFloat(100 * m_same_finger2[finger] / m_input_length).toFixed(2);
      var red = Math.floor(6000 * m_same_finger2[finger] / m_input_length) + 128
      var green = 128;
      if (red < 16) { red = 16; }
      if (red > 255) { red = 255; }
      var hex_red = red.toString(16);
      var hex_bg = green.toString(16);
      stats.append("rect").attr("x", x + finger * 20).attr("y", y+155 - height).attr("width", 15).attr("height", height)
        .attr("fill", "#" + hex_red + hex_bg + hex_bg).attr("stroke", "#453033").attr("stroke-width", 1)
        .attr("onmouseover", "showTooltip(evt,'" + tip + "%')").attr("onmouseout", "hideTooltip()")

      stats.append("text").attr("x", x + finger * 20 + 7).attr("y", y+166).attr("fill", "#dfe2eb").attr("font-size", 10)
        .attr("font-family", "Sans,Arial").attr("text-anchor", "middle").text(finger)
    }

  } else {
    var keyValueArray = Object.entries(m_same_finger3);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    m_same_finger3 = Object.fromEntries(keyValueArray);

    for (var bigram in m_same_finger3) {
      sum += m_same_finger3[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("2u Same Finger Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
    // stats.append("text").attr("x",x+40).attr("y",y+200).attr("font-size",16).attr("font-family","Sans,Arial").attr("fill","#dfe2eb").attr("text-anchor","left").text("Input Length "+m_input_length);

    var i = 0;
    var t = scroll_amount;
    for (var bigram in m_same_finger3) {
      if (t > 0){
        t -= 1;
        continue;
      }
      var width = 18000 * m_same_finger3[bigram] / m_input_length;
      if (width > 200) { width = 200; }
      stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", width).attr("height", 10).attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
      stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(bigram);
      stats.append("text").attr("x", x + 200).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * m_same_finger3[bigram] / m_input_length)).toFixed(2) + "%");
      //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
      i += 1;
      if (i > 10) { break; }
    }

  }
  ///////////////////////////////////   S K I P   F I N G E R   B I G R A M S    ///////////////////////////////
  var x = 250;
  var y = 180;
  sum = 0;
  var tmp;
  if (skip_toggle) {
    var keyValueArray = Object.entries(m_skip_bigram);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Skip Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
  } else {
    var keyValueArray = Object.entries(m_skip_bigram2);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Skip Bigrams (2u) " + parseFloat(100 * sum).toFixed(2) + "%")
  }

  stats.append("path").attr("d", `M ${x + 15} ${y - 24} L ${x + 35} ${y - 24} L ${x + 25} ${y - 34} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing all skip bigrams and only those with a 2u step between 1 and 3')").attr("onmouseout","hideTooltip()").attr("onclick","skipToggle()")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });

  stats.append("path").attr("d", `M ${x + 15} ${y - 20} L ${x + 35} ${y - 20} L ${x + 25} ${y - 10} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing all skip bigrams and only those with a 2u step between 1 and 3')").attr("onmouseout","hideTooltip()").attr("onclick","skipToggle()")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });
  var i = 0;
  var t = scroll_amount;
  for (var bigram in tmp) {
    if (t > 0){
      t -= 1;
      continue;
    }
    var height = 36000 * tmp[bigram] / m_input_length;
    if (height > 200) { height = 200; }
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", height).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 17).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(bigram);
    stats.append("text").attr("x", x + 200).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * tmp[bigram] / m_input_length)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }
  ////////////////////////////   L A T E R A L   S T R E T C H   B I G R A M S   ///////////////////////////////
  var x = 500;
  var y = 180;
  sum = 0;
  if (lsb_toggle == 0){
    var keyValueArray = Object.entries(m_lat_stretch);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Lat Stretch Bigrams " + parseFloat(100 * sum).toFixed(2) + "%")
  } else {
    var keyValueArray = Object.entries(m_lat_stretch2);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Ring LSBs " + parseFloat(100 * sum).toFixed(2) + "%")
  }

  stats.append("path").attr("d", `M ${x + 15} ${y - 24} L ${x + 35} ${y - 24} L ${x + 25} ${y - 34} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing lateral stretches from the middle finger to ring finger')").attr("onmouseout","hideTooltip()").attr("onclick","lsbToggle()")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });

  stats.append("path").attr("d", `M ${x + 15} ${y - 20} L ${x + 35} ${y - 20} L ${x + 25} ${y - 10} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing lateral stretches from the middle finger to ring finger')").attr("onmouseout","hideTooltip()").attr("onclick","lsbToggle()")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });
  var i = 0;
  var t = scroll_amount;
  for (var bigram in tmp) {
    if (t > 0){
      t -= 1;
      continue;
    }
    var height = 10000 * tmp[bigram] / m_input_length;
    if (height > 200) { height = 200; }
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", height).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(bigram);
    stats.append("text").attr("x", x + 200).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * tmp[bigram] / m_input_length)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }
  ////////////////////////////  S C I S S O R S  ///////////////////////////////
  var x = 760;
  var y = 180;
  sum = 0;

  if (scissors_toggle == 1) {
    var keyValueArray = Object.entries(m_pinky_scissors);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Pinky/Ring Scissors " + parseFloat(100 * sum).toFixed(2) + "%")
  } else if (scissors_toggle == 0){
    var keyValueArray = Object.entries(m_scissors);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Scissors " + parseFloat(100 * sum).toFixed(2) + "%")
  } else {
    var keyValueArray = Object.entries(m_all_scissors);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var bigram in tmp) {
      sum += tmp[bigram] / m_input_length;
    }
    stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("All 2u row jumps " + parseFloat(100 * sum).toFixed(2) + "%")
  }
  stats.append("path").attr("d", `M ${x + 15} ${y - 24} L ${x + 35} ${y - 24} L ${x + 25} ${y - 34} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing scissors on ring and pinky, and all 2u scissors')").attr("onmouseout","hideTooltip()").attr("onclick","scissorsToggle(-1)")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });

  stats.append("path").attr("d", `M ${x + 15} ${y - 20} L ${x + 35} ${y - 20} L ${x + 25} ${y - 10} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Toggle between showing scissors on ring and pinky, and all 2u scissors')").attr("onmouseout","hideTooltip()").attr("onclick","scissorsToggle(1)")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });
  var i = 0;
  var t = scroll_amount;
  for (var bigram in tmp) {
    if (t > 0){
      t -= 1;
      continue;
    }
    var height = 36000 * tmp[bigram] / m_input_length;
    if (height > 180) { height = 180; }
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", height).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(bigram);
    stats.append("text").attr("x", x + 190).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * tmp[bigram] / m_input_length)).toFixed(2) + "%");
    //<rect x="#{x+column*20}" y="#{y+100-height}" width="15" height="#{height}" fill="##{ab}7787" stroke="#453033" stroke-width="1" onmousemove="showTooltip(evt,'#{(100*value/sum.to_f).round(2)}%')" onmouseout="hideTooltip()" />\n"
    i += 1;
    if (i > 10) { break; }
  }
  ///////////////////////////////////  T R I G R A M   S T A T S   ///////////////////////////////
  var x = 760;
  var y = 390;
  dx = 105;
  sum = 0;
  scale = 1;
  var trigram_title = "Trigram Stats"

  if (trigram_toggle == 0) {
    var keyValueArray = Object.entries(m_trigram_count);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var cat in tmp) {
      sum += tmp[cat]
    }
    trigram_title = "Trigram Stats"
    scale = 1;
    dx = 105;
  } else if (trigram_toggle == 1) {
    var keyValueArray = Object.entries(m_trigram_count_alt);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var cat in tmp) {
      sum += tmp[cat]
    }
    trigram_title = "Trigram Stats (alts)"
    scale = 3;
    dx = 47;
  } else if (trigram_toggle == 2) {
    var keyValueArray = Object.entries(m_trigram_count_red);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var cat in tmp) {
      sum += tmp[cat]
    }
    trigram_title = "Trigram Stats (redirects)"
    scale = 3;
    dx = 47;
  } else if (trigram_toggle == 3) {
    var keyValueArray = Object.entries(m_trigram_count_roll_in);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var cat in tmp) {
      sum += tmp[cat]
    }
    trigram_title = "Trigram Stats (roll in)"
    scale = 3;
    dx = 47;
  } else if (trigram_toggle == 4) {
    var keyValueArray = Object.entries(m_trigram_count_roll_out);
    keyValueArray.sort((a, b) => b[1] - a[1]);
    tmp = Object.fromEntries(keyValueArray);
    for (var cat in tmp) {
      sum += tmp[cat]
    }
    trigram_title = "Trigram Stats (roll out)"
    scale = 3;
    dx = 47;
  }
  const trigram_desc = {
    "alt":"the hands used to type the trigram are either LRL or RLR",
    "alt sfs":"trigram is typed LRL or RLR but finger1 and finger3 are the same and type a different character",
    "bigram roll in":"two adjacent characters in the trigram are typed with the same hand and the first is outside the second",
    "bigram roll out":"two adjacent characters in the trigram are typed with the same hand and the first is inside the second",
    "weak redirect":"a redirect but none of the fingers used are the index finger",
    "redirect":"the three characters of the trigram are typed with the same hand and the direction changes",
    "roll out":"the three characters of the trigram are typed with the same hand and go from the inside to the outside",
    "roll in":"the three characters of the trigram are typed with the same hand and go from the outside to the inside",
    "other":"all other trigrams that don\\'t fit into any of the other categories",
    // "bigram same row":"two adjacent characters in the trigram are typed on the same row",
    // "trigram same row":"the three characters in the trigram are typed on the same row",
    // "double jump":"trigram is typed top, bottom, top or bottom, top, bottom",
  };
  // for(var tri in m_redirects){
  //   if (m_redirects[tri] > 40){
  //     console.log(tri + "  " + m_redirects[tri]);
  //     // trigram_desc["redirect"] = trigram_desc["redirect"].concat(" "+tri);
  //   }
  // }
  stats.append("path").attr("d", `M ${x + 15} ${y - 20} L ${x + 35} ${y - 20} L ${x + 25} ${y - 10} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Change pages to see different trigram stats')").attr("onmouseout","hideTooltip()").attr("onclick","trigramToggle(-1)")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });

  stats.append("path").attr("d", `M ${x + 15} ${y - 24} L ${x + 35} ${y - 24} L ${x + 25} ${y - 34} Z`)
  .attr("fill", "#777777").attr("stroke", "#989898").attr("stroke-width", 1).attr("onmouseover","showTooltip(evt,'Change pages to see different trigram stats')").attr("onmouseout","hideTooltip()").attr("onclick","trigramToggle(1)")
  .on("mouseover", function() {      d3.select(this).attr("fill", "#bbbbbb");  })  .on("mouseout", function() {      d3.select(this).attr("fill", "#777777");  });

  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text(trigram_title)

  var i = 0
  var t = trigram_scroll_amount;
  for (var cat in tmp) {
    if (t > 0){
      t -= 1;
      continue;
    }
    var width = scale * 200 * tmp[cat] / sum;
    if (width > 200) { width = 200; }
    stats.append("rect").attr("x", x + dx).attr("y", y + i * 15).attr("width", width).attr("height", 10)
      .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
      .attr("onmouseover","showTooltip(evt,'"+trigram_desc[cat]+"')").attr("onmouseout","hideTooltip()")
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 9).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(cat);
    stats.append("text").attr("x", x + 190).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (100 * tmp[cat] / sum)).toFixed(2) + "%");
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

  scale = 30191.79 / m_input_length
  // console.log("input length: "+m_input_length)
  // console.log("scale       : "+scale)
  stats.append("text").attr("x", x + 20).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Same Hand Strings")
  var i = 0
  t = sh_scroll_amount;
  for (var word in samehandstrings) {
    if (t > 0){
      t -= 1;
      continue;
    }
    var count = samehandstrings[word];
    // console.log(word + " " + count)
    var width = scale * word.length * count;
    if (width > 100) {width = 100;}
    stats.append("rect").attr("x", x + 70).attr("y", y + i * 15).attr("width", width).attr("height", 10).attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(word);
    stats.append("text").attr("x", x + 135).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (word.length*count)).toFixed(0));//
    i += 1;
    if (i > 10) { break; }
  }

  ///////////////////////////////////  S A M E   H A N D   C O U N T S  ///////////////////////////////
  var x = 415;
  var y = 390;
  sum = 0;

  // var keyValueArray = Object.entries(samehandcount);
  // keyValueArray.sort((a, b) => b - a);
  // samehandcount = Object.fromEntries(keyValueArray);
  scale = 140.89502 / m_input_length
  // console.log("input length: "+m_input_length)
  // console.log("scale       : "+scale)
  stats.append("text").attr("x", x + 20).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Same Hand Count")
  var i = 0
  for (var len in samehandcount) {
    var count = samehandcount[len];
    var width = scale * count;
    if (width > 100) {width = 100;}
    stats.append("rect").attr("x", x + 40).attr("y", y + i * 15).attr("width", width).attr("height", 10).attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
    stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(len);
    stats.append("text").attr("x", x + 135).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text((scale*7.14285714285714285714285*count).toFixed(1));
    // stats.append("text").attr("x", x + 135).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(count);
    i += 1;
    if (i > 10) { break; }
  }

  ///////////////////////////////////  H A R D   W O R D S   ///////////////////////////////
  var x = 580;
  var y = 390;
  sum = 0;
  var keyValueArray = Object.entries(word_effort);
  keyValueArray.sort((a, b) => b[1]/b[0].length - a[1]/a[0].length);
  word_effort = Object.fromEntries(keyValueArray);
  stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Hard Words ")
  var i = 0
  t = hw_scroll_amount;
  for (var word in word_effort) {
    if (word.length > 3 && words[word] > 4){
      if (t > 0){
        t -= 1;
        continue;
      }
      var height = 100*word_effort[word]/word.length;
      stats.append("rect").attr("x", x + 80).attr("y", y + i * 15).attr("width", height).attr("height", 10).attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
      stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Roboto Mono").attr("text-anchor", "right").text(word);
      stats.append("text").attr("x", x + 165).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (word_effort[word])).toFixed(2));
      i += 1;
      if (i > 10) { break; }
    }
  }
  ///////////////////////////////////  E A S Y   W O R D S   ///////////////////////////////
  // var x = 610;
  // var y = 390;
  // sum = 0;
  // var keyValueArray = Object.entries(word_effort);
  // keyValueArray.sort((a, b) => a[1] - b[1]);
  // word_effort = Object.fromEntries(keyValueArray);
  // stats.append("text").attr("x", x + 40).attr("y", y - 16).attr("font-size", 16).attr("font-family", "Sans,Arial").attr("fill", "#dfe2eb").attr("text-anchor", "left").text("Easy Words ")
  // var i = 0
  // for (var word in word_effort) {
  //   var height = 10*word_effort[word];
  //   if (word.length > 3){
  //     stats.append("rect").attr("x", x + 80).attr("y", y + i * 15).attr("width", height).attr("height", 10)
  //       .attr("fill", "#7777bb").attr("stroke", "#9898d6").attr("stroke-width", 1)
  //     stats.append("text").attr("x", x + 20).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "right").text(word);
  //     stats.append("text").attr("x", x + 125).attr("y", y + i * 15 + 8).attr("fill", "#dfe2eb").attr("font-size", 10).attr("font-family", "Sans,Arial").attr("text-anchor", "left").text(parseFloat("" + (word_effort[word])).toFixed(2));
  //     i += 1;
  //     if (i > 10) { break; }
  //   }
  // }


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
  var starti, dropi, startx, starty;

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
        startx = x;
        starty = y;
        // scan through rcdata to find out which key are we closest to
        closestdist = 9999;
        starti = -1;
        var keyname = ""
        for (let i = 0; i < rcdata.length; i++) {
          d = dist(x, y, rcdata[i][5], rcdata[i][4]);
          if (d < closestdist) {
            closestdist = d;
            starti = i;
            keyname = rcdata[i][0];
          }
        }
        // console.log("keyname = "+keyname);
        if (keyname == "mod" || keyname == "back" || keyname == "tab" || keyname == "enter"){
          selectedElement = null;
          return;
        }
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
      // scan through rcdata to find out which key are we closest to
      closestdist = 9999;
      var keyname = ""
      for (let i = 0; i < rcdata.length; i++) {
        d = dist(x, y, rcdata[i][5], rcdata[i][4]);
        keyname = rcdata[i][0];
        if (d < closestdist) {
          if (keyname == "mod" || keyname == "back" || keyname == "tab" || keyname == "enter") {
          } else {
            closestdist = d;
            dropi = i;
          }
        }
      }
      if (dropi == starti) {
        selectedElement.setAttributeNS(null, "x", startx);
        selectedElement.setAttributeNS(null, "y", starty);
        sibling.setAttributeNS(null, "x", parseInt(startx)+15);
        sibling.setAttributeNS(null, "y", parseInt(starty)+19);
        selectedElement = false;
        sibling = false;
        return;
      }
      if (rcdata[starti][0] == "space") {
        if (rcdata[dropi][1] < 3) {
          selectedElement.setAttributeNS(null, "x", startx);
          selectedElement.setAttributeNS(null, "y", starty);
          sibling.setAttributeNS(null, "x", parseInt(startx)+15);
          sibling.setAttributeNS(null, "y", parseInt(starty)+19);
          selectedElement = false;
          sibling = false;
          return;
        }
      }
      if (rcdata[dropi][0] == "space") {
        if (rcdata[starti][1] < 3) {
          selectedElement.setAttributeNS(null, "x", startx);
          selectedElement.setAttributeNS(null, "y", starty);
          sibling.setAttributeNS(null, "x", parseInt(startx)+15);
          sibling.setAttributeNS(null, "y", parseInt(starty)+19);
          selectedElement = false;
          sibling = false;
          return;
        }
      }
      if (closestdist > 0.8){
        selectedElement.setAttributeNS(null, "x", startx);
        selectedElement.setAttributeNS(null, "y", starty);
        sibling.setAttributeNS(null, "x", parseInt(startx)+15);
        sibling.setAttributeNS(null, "y", parseInt(starty)+19);
        selectedElement = false;
        sibling = false;
        return;
      }
      selectedElement = false;
      sibling = false;

      // indices = [1,2,4,5,6]
      indices = [0, 3, 7]
      for (let i = 0; i < indices.length; i++){
        var k = indices[i];
        tmp = rcdata[starti][k];
        rcdata[starti][k] = rcdata[dropi][k];
        rcdata[dropi][k] = tmp;
      }
      // console.log(rcdata)

      var queryParams = new URLSearchParams(window.location.search);
      queryParams.set("layout", exportLayout());
      queryParams.set("mode",mode)
      queryParams.set("lan",lang)
      history.replaceState(null, null, "?"+queryParams.toString());

      d3.select(svg).selectAll("*").remove();
      needs_update = true;
      measureDictionary();
      measureWords();
      generateLayout();
      generatePlots();
    }
  }
}

if (url_layout) {
  importLayout(url_layout)
}
loadAllData()
