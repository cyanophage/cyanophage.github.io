
var swidth = 1200;
var sheight = 700;
var svg = d3.select("#svglayout").append("svg").attr("xmlns","http://www.w3.org/2000/svg").attr("width", swidth).attr("height", sheight);

svg.append("g").attr("id", "info-panel");

var keywidth = 1;
var w = 38;
var gap = 8;
var x = 0;
var y = 0;
var on = 0;
var error = true;
var runs = 0;
var times = 20;
var iter;
var running = false;
var progress = 0;
var error_text = "";

var m_score = 0;

var sfb_data = {label: "SFB:", metric: 0, score: 0, weight: 4, min: 0.3, desc: "Single finger bigrams"}
var effort_data = {label: "Effort:", metric: 0, score: 0, weight: 4, min: 0, desc: "Effort based on defined matrix"}
var psfb_data = {label: "pSFB:", metric: 0, score: 0, weight: 0.7, min: 0, desc: "Additional penalty for SFBs on the pinky"}
var rsfb_data = {label: "rSFB:", metric: 0, score: 0, weight: 0.3, min: 0, desc: "Additional penalty for SFBs on the ring finger"}
var scissors_data = {label: "Scissors:", metric: 0, score: 0, weight: 0.8, min: 0, desc: "Two letters on the same hand, two rows between them, on adjacent fingers"}
var prscissors_data = {label: "PRScissor:", metric: 0, score: 0, weight: 0.8, min: 0.2, desc: "Two letters typed with the ring and pinky with at least one row between them"}
var wscissors_data = {label: "WScissors:", metric: 0, score: 0, weight: 0.5, min: 0.05, desc: "Two letters on the same hand, two rows between them, more than one column between them" }
var latstr_data = {label: "LSB:", metric: 0, score: 0, weight: 0.5, min: 0.12, desc: "Lateral stretch bigrams"}
var sfs_data = {label: "SFS:", metric: 0, score: 0, weight: 0.2, min: 0, desc: "Single finger skipgrams (1u)"}
var vowels_data = {label: "Vowels:", metric: 0, score: 0, weight: 3, min: 0, desc: "Should vowels be on the same side"}
var hbalance_data = {label: "Hand Bal:", metric: 0, score: 0, weight: 0.7, min: 1, desc: "Hand balance, how much different from 50/50 usage" }

var rcdata = [
  {char:"", row:0, col:0, enabled:0, finger:1, x:0, y:1, effort:7},
  {char:"", row:0, col:1, enabled:1, finger:1, x:0, y:1, effort:3},
  {char:"", row:0, col:2, enabled:1, finger:2, x:0, y:1, effort:2},
  {char:"", row:0, col:3, enabled:1, finger:3, x:0, y:1, effort:1},
  {char:"", row:0, col:4, enabled:1, finger:4, x:0, y:1, effort:1},
  {char:"", row:0, col:5, enabled:1, finger:4, x:0, y:1, effort:2},
  {char:"", row:0, col:6, enabled:1, finger:7, x:0, y:1, effort:2},
  {char:"", row:0, col:7, enabled:1, finger:7, x:0, y:1, effort:1},
  {char:"", row:0, col:8, enabled:1, finger:8, x:0, y:1, effort:1},
  {char:"", row:0, col:9, enabled:1, finger:9, x:0, y:1, effort:2},
  {char:"", row:0, col:10, enabled:1, finger:10, x:0, y:1, effort:3},
  {char:"", row:0, col:11, enabled:0, finger:10, x:0, y:1, effort:7},
  {char:"", row:1, col:0, enabled:0, finger:1, x:0, y:1, effort:6},
  {char:"", row:1, col:1, enabled:1, finger:1, x:0, y:1, effort:2},
  {char:"", row:1, col:2, enabled:1, finger:2, x:0, y:1, effort:0},
  {char:"", row:1, col:3, enabled:1, finger:3, x:0, y:1, effort:0},
  {char:"", row:1, col:4, enabled:1, finger:4, x:0, y:1, effort:0},
  {char:"", row:1, col:5, enabled:1, finger:4, x:0, y:1, effort:1},
  {char:"", row:1, col:6, enabled:1, finger:7, x:0, y:1, effort:1},
  {char:"", row:1, col:7, enabled:1, finger:7, x:0, y:1, effort:0},
  {char:"", row:1, col:8, enabled:1, finger:8, x:0, y:1, effort:0},
  {char:"", row:1, col:9, enabled:1, finger:9, x:0, y:1, effort:0},
  {char:"", row:1, col:10, enabled:1, finger:10, x:0, y:1, effort:2},
  {char:"", row:1, col:11, enabled:0, finger:10, x:0, y:1, effort:6},
  {char:"", row:2, col:0, enabled:0, finger:1, x:0, y:1, effort:7},
  {char:"", row:2, col:1, enabled:1, finger:1, x:0, y:1, effort:6},
  {char:"", row:2, col:2, enabled:1, finger:2, x:0, y:1, effort:2.1},
  {char:"", row:2, col:3, enabled:1, finger:3, x:0, y:1, effort:1.1},
  {char:"", row:2, col:4, enabled:1, finger:4, x:0, y:1, effort:1.1},
  {char:"", row:2, col:5, enabled:1, finger:4, x:0, y:1, effort:3.1},
  {char:"", row:2, col:6, enabled:1, finger:7, x:0, y:1, effort:3.1},
  {char:"", row:2, col:7, enabled:1, finger:7, x:0, y:1, effort:1.1},
  {char:"", row:2, col:8, enabled:1, finger:8, x:0, y:1, effort:1.1},
  {char:"", row:2, col:9, enabled:1, finger:9, x:0, y:1, effort:2.1},
  {char:"", row:2, col:10, enabled:1, finger:10, x:0, y:1, effort:6},
  {char:"", row:2, col:11, enabled:0, finger:10, x:0, y:1, effort:7},
  {char:"", row:3, col:5, enabled:0, finger:5, x:0, y:1, effort:0},
  {char:" ", row:3, col:6, enabled:0, finger:6, x:0, y:1, effort:0}
]

rcdata = loadEffortValuesFromCookie("rcdataEffort", rcdata);

var letter_position = [];

const word_list_url = 'words-english.json';
async function loadAllData() {
  try {
    const [wordsData] = await Promise.all([
        fetch(word_list_url).then(response => response.json()),
    ]);

    words = wordsData;
    getCharacters();
    generateSVG();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

var letter_freq = {};
var bigram_freq = {};
var trigram_freq = {};
var input_length = 0;
function getCharacters() {
  letter_freq = {};
  bigram_freq = {};
  trigram_freq = {};
  input_length = 0;
  letter_position = [];
  var count = 0;
  var wordt;
  for (var word in words) {
    wordt = " "+word+" "
    count = words[word];
    for (let i = 0; i < wordt.length; i++) {
      char = wordt.charAt(i);
      if (!letter_freq[char]) {
        letter_freq[char] = { count: 0, enabled: 1 }
        if (char == ' ') { letter_freq[char].enabled = 0 }
      }
      letter_freq[char].count += count;
      if (i > 0) {
        bigram = wordt.charAt(i-1) + wordt.charAt(i);
        if (!bigram_freq[bigram]) {
          bigram_freq[bigram] = 0
        }
        bigram_freq[bigram] += count;
      }
      if (i > 1) {
        trigram = wordt.charAt(i-2) + wordt.charAt(i-1) + wordt.charAt(i);
        if (!trigram_freq[trigram]) {
          trigram_freq[trigram] = 0
        }
        trigram_freq[trigram] += count;
      }
    }
    input_length += (word.length + 1) * count;
  }
  var bigram_count = 0
  for(var tmp in bigram_freq) {
    bigram_count += 1
  }
  console.log("there are "+bigram_count+ " bigrams")

  for(var tmp in trigram_freq) {
    if (trigram_freq[tmp] <= 30) {
      Reflect.deleteProperty(trigram_freq, tmp)
    }
  }
  var trigram_count = 0
  for(var tmp in trigram_freq) {
    trigram_count += 1
  }
  console.log("there are "+trigram_count+ " trigrams")

  letter_freq[" "].count = letter_freq[" "].count / 2;
  console.log("input_length: "+input_length);

  sortLetterFreq();
}

function getX(row, col) {
  dx = 370;
  if (col > 5) {
    dx = dx + 40;
  }
  return dx + col * w
}
function getY(row, col) {
  return 10 + row * w
}
function getKey(row, col) {
  for (let i = 0; i < rcdata.length; i++) {
    if(rcdata[i].row == row && rcdata[i].col == col) {
      return i
    }
  }
  return 0
}
var col = ""

var selectedElement, offsetx, offsety, sibling;
var startkey, dropi, startx, starty, d;

const dragHandler = d3.drag()
.on("start", function(event, d) {
  // console.log("start:",event.x,event.y);
  closestdist = 9999;
  startkey = "$"
  for(var i = 0; i < letter_position.length; i++) {
    var d2 = dist(event.x, event.y, letter_position[i].x+15, letter_position[i].y+15); // distance to centre of key
    if (d2 < closestdist) {
      closestdist = d2;
      startkey = letter_position[i].letter
      startx = letter_position[i].x;
      starty = letter_position[i].y;
      offsetx = event.x - startx
      offsety = event.y - starty
    }
  }
  if (closestdist < 12){
    d3.select(this).raise();
  }
})
.on("drag", function(event, d) {
  d3.select(this).attr("transform", `translate(${event.x-offsetx}, ${event.y-offsety})`);
})
.on("end", function(event, ele) {
  dropi = -1;
  closestdist = 9999;
  for (let i = 0; i < rcdata.length; i++) {
    d = dist(event.x-offsetx, event.y-offsety, rcdata[i].x, rcdata[i].y);
    if (d < closestdist) {
      closestdist = d;
      dropi = i;
    }
  }

  d3.select(this).attr("transform", `translate(${startx}, ${starty})`);
  if (closestdist < 12){
    if (dropi >= 0){
      for (let i = 0; i < rcdata.length; i++) {
        if (startkey == "␣") {
          if (rcdata[i].char == " ") {
            rcdata[i].char = ""
          }
        } else {
          if (rcdata[i].char == startkey) {
            rcdata[i].char = ""
          }
        }
      }
      rcdata[dropi].char = startkey
      rcdata[dropi].enabled = 0
      letter_freq[startkey].enabled = 0
      generateLayout();
      generateCharacters();
    } else {
      console.log("can't drop here "+dropi)
    }
  } else {
    // console.log("closest end",closestdist)
  }
});

function generateSVG(){
  generateButtons();
  generateLayout();
  generateCharacters();
  generateGraphs();
  generateGraphs2();
  generateModeButtons();
  countCharsKeys();
  generateStats();
}

function clicked_run() {
  results = []; // cleaned out after each run
  best_results = []; // preserved over multiple runs
  runs = 0;
  iter = 0;
  console.log("times",times)
  uid_set = new Set();
  best_score = 1000000;
  bestest_score = 1000000;
  time_to_shuffle = false;
  editable_keys = [];
  setup = false;
  running = true;
  run();
}

function generateButtons() {
  // border
  // svg.append("rect").attr("x", 1).attr("y", 1).attr("width", swidth-2).attr("height", sheight-2)
  // .attr("stroke", "#777777").attr("fill","#1b1c1f").attr("fill-opacity", "0").attr("rx", 8).attr("ry", 8)

  x = 1100
  y = 550
  // Clear button
  svg.append("rect").attr("x", x).attr("y", y-30).attr("width", 80).attr("height", 26).attr("rx", 1).attr("ry", 1)
    .attr("stroke", "#111111").attr("fill", "#aaaaaa").attr("fill-opacity", "1.0").attr("onclick", "clearLetters()");
  svg.append("text").attr("x", x + 40).attr("y", y-30+19).attr("font-size", 16).attr("text-anchor", "middle")
    .attr("onclick", "clearLetters()").text("CLEAR");

  // Run button
  svg.append("rect").attr("x", x).attr("y", y).attr("width", 80).attr("height", 26)
    .attr("stroke", "#111111").attr("fill", "#aaaaaa").attr("fill-opacity", "1.0").attr("rx", 1).attr("ry", 1)
    .attr("onclick", "clicked_run()");

  svg.append("text").attr("x", x + 40).attr("y", y+19).attr("font-size", 16).attr("text-anchor", "middle")
    .attr("onclick", "clicked_run()")
    .text("RUN");

  // key weight edit button
  svg.append("rect").attr("x", x).attr("y", y-90).attr("width", 80).attr("height", 25)
  .attr("stroke", "#777777").attr("fill", "#aaaaaa").attr("fill-opacity", "1.0").attr("onclick", "openEffortPopup()")
  svg.append("text").attr("x", x+40).attr("y", y-90+18).attr("font-size", 16).attr("text-anchor", "middle")
     .attr("onclick", "openEffortPopup()").text("Edit Effort");

  svg.append("text").attr("x", x-40).attr("y", y-60+19).attr("font-size", 16).attr("text-anchor", "middle").attr("fill", "#aaaaaa")
    .text("Iterations:");
  const timesField = svg.append("foreignObject").attr("x", x).attr("y", y - 60)
   .attr("width", 80).attr("height", 26).append("xhtml:input")
   .attr("type", "number").attr("step", "0.01").style("width", "100%").style("height", "100%").style("border", "1px solid #ccc")
   .style("background", "#555").style("padding", "3px").style("font-size", "16px").style("text-align", "center");

  timesField.property("value", times);
  timesField.on("input", function() {
    const value = d3.select(this).property("value");
    if (value === "") {
      d3.select(this).property("value", "1");
      times = 1;
    } else {
      times = parseInt(value);
    }
    generateGraphs();
    generateGraphs2();
  });

  // keyboard layout bounding box
  svg.append("rect").attr("x", 360).attr("y", 0).attr("width", 508).attr("height", 168)
  .attr("stroke", "#777777").attr("fill", "#1b1c1f").attr("fill-opacity", "0.0").attr("rx", 8).attr("ry", 8)
}

function handleCircleHover(data, element) {
  rcdata = data.config;

  d3.select(element)
    .attr("r", 5)
    .attr("fill", "#ff6600")
  // redraw the layout
  generateLayout();
}

function handleCircleLeave(data, element) {
  // Reset the circle
  d3.select(element)
    .attr("r", 3)
    .attr("fill", "#999999");

  svg.selectAll(".tooltip").remove();
}

function generateGraphs() {
  console.log("generateGraphs")
  var yBase = 390;
  var xLeft = 380;
  // Draw axes once (only if they don't exist)
  if (svg.select(".x-axis").empty()) {
    svg.append("line") // x axis
      .attr("class", "x-axis")
      .attr("x1", xLeft)
      .attr("y1", yBase)
      .attr("x2", 900)
      .attr("y2", yBase)
      .style('stroke-width', 2)
      .style("stroke", "#999999");
  }

  if (svg.select(".y-axis").empty()) {
    svg.append("line") // y axis
      .attr("class", "y-axis")
      .attr("x1", xLeft)
      .attr("y1", yBase-150)
      .attr("x2", xLeft)
      .attr("y2", yBase)
      .style('stroke-width', 2)
      .style("stroke", "#999999");
  }
  svg.selectAll(".x-label").remove();
  // Draw x-axis labels once
  var xstep = (900-xLeft)/times
  var k = 1;
  while ((900-xLeft)/(times/k) < 20 && k < 10){
    k += 1
  }
  for (let i = k; i <= times; i += k) {
    svg.append("text")
      .attr("class", "x-label")
      .attr("x", xLeft + (i-0.5) * xstep)
      .attr("y", yBase+18)
      .attr("font-size", 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#999999")
      .text(i);
  }

  // Calculate scale
  var min_score = 100000;
  var max_score = 0;
  for (let i = 0; i < best_results.length; i++) {
    if (best_results[i].score < min_score) {
      min_score = best_results[i].score;
    }
    if (best_results[i].score > max_score) {
      max_score = best_results[i].score;
    }
  }
  if (max_score==0){
    max_score = 10;
  }
  // Remove and redraw y-axis ticks when scale changes
  svg.selectAll(".y-tick").remove();

  var validIntervals = [100,50,20,10,5,2,1,0.5,0.2,0.1]
  var it=0;
  while (max_score/validIntervals[it] < 5 && it < 9){
    it+=1;
  }
  var tickInterval = validIntervals[it];
  var maxTick = tickInterval * Math.ceil(max_score/tickInterval)
  var tickCount = Math.ceil(max_score/tickInterval)
  var scale = 150 / maxTick;
  // console.log("graph",max_score, tickCount, tickInterval, scale);

  svg.append("text")
    .attr("class", "y-tick")
    .attr("x", xLeft-20)
    .attr("y", yBase-75)
    .attr("transform","rotate(-90, "+(xLeft-40)+","+(yBase-75)+")")
    .attr("font-size", 14)
    .attr("text-anchor", "end")
    .attr("fill", "#999999")
    .text("Score");

  for (let i = 0; i <= tickCount; i++) {
    var tickValue = (i * tickInterval).toString()
    if (max_score < 1000 && tickValue.length > 3){
      tickValue = tickValue.substring(0,3)
    }
    var yPos = yBase - i*tickInterval*scale;

    // Tick mark
    svg.append("line")
      .attr("class", "y-tick")
      .attr("x1", xLeft-5)
      .attr("y1", yPos)
      .attr("x2", xLeft+1)
      .attr("y2", yPos)
      .style('stroke-width', 2)
      .style("stroke", "#999999");

    // Tick label
    svg.append("text")
      .attr("class", "y-tick")
      .attr("x", xLeft-10)
      .attr("y", yPos + 5)
      .attr("font-size", 14)
      .attr("text-anchor", "end")
      .attr("fill", "#999999")
      .text(tickValue);
  }

  // Use D3 data binding with enter/exit pattern
  var circles = svg.selectAll(".data-point")
    .data(best_results, d => d.iter); // Use iter as key for object constancy

  // Remove old circles (if needed)
  circles.exit().remove();

  // Add new circles
  circles.enter()
    .append("circle")
    .attr("class", "data-point")
    .attr("cx", d => xLeft + (d.iter + 0.5) * xstep)
    .attr("cy", d => yBase - d.score * scale)
    .attr("r", 3)
    .attr("fill", "#999999")
    .attr("stroke", "#ffffff")
    .attr("onmouseover", d => "showTooltip(evt,'"+(d.score).toFixed(2)+"')").attr("onmouseout", "hideTooltip()")
    .on("mouseover", function(event, d) {
      handleCircleHover(d, this);
    })
    .on("mouseout", function(event, d) {
      handleCircleLeave(d, this);
    });

  // Update existing circles (in case positions need to change based on scale)
  circles
    .attr("cx", d => xLeft + (d.iter + 0.5) * xstep)
    .attr("cy", d => yBase - d.score * scale);
}

var mode = 'sfb';
var mult = 100;
var yLabel = "SFB";
function generateGraphs2() {
  console.log("generateGraphs2")
  var yBase = 590;
  var xLeft = 380;
  // Draw axes once (only if they don't exist)
  if (svg.select(".x-axis2").empty()) {
    svg.append("line") // x axis
      .attr("class", "x-axis2")
      .attr("x1", xLeft)
      .attr("y1", yBase)
      .attr("x2", 900)
      .attr("y2", yBase)
      .style('stroke-width', 2)
      .style("stroke", "#999999");
  }

  if (svg.select(".y-axis2").empty()) {
    svg.append("line") // y axis
      .attr("class", "y-axis2")
      .attr("x1", xLeft)
      .attr("y1", yBase-150)
      .attr("x2", xLeft)
      .attr("y2", yBase)
      .style('stroke-width', 2)
      .style("stroke", "#999999");
  }
  svg.selectAll(".x-label2").remove();
  // Draw x-axis labels once
  var xstep = (900-xLeft)/times
  var k = 1;
  while ((900-xLeft)/(times/k) < 20 && k < 10){
    k += 1
  }
  for (let i = k; i <= times; i += k) {
    svg.append("text")
      .attr("class", "x-label2")
      .attr("x", xLeft + (i-0.5) * xstep)
      .attr("y", yBase+18)
      .attr("font-size", 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#999999")
      .text(i);
  }

  // Calculate scale
  var min_score = 100000;
  var max_score = 0;
  var percentage = 0;
  for (let i = 0; i < best_results.length; i++) {
    percentage = mult*best_results[i].result[mode]/input_length;
    if (percentage < min_score) {
      min_score = percentage;
    }
    if (percentage > max_score) {
      max_score = percentage;
    }
  }
  if (max_score==0){
    max_score = 1;
  }
  // Remove and redraw y-axis ticks when scale changes
  svg.selectAll(".y-tick2").remove();

  var validIntervals = [100,50,20,10,5,2,1,0.5,0.2,0.1]
  var it=0;
  while (max_score/validIntervals[it] < 5 && it < 9){
    it+=1;
  }
  var tickInterval = validIntervals[it];
  var maxTick = tickInterval * Math.ceil(max_score/tickInterval)
  var tickCount = Math.ceil(max_score/tickInterval)
  var scale = 150 / maxTick;
  // console.log("graph2",max_score, tickCount, tickInterval, scale);

  svg.append("text")
    .attr("class", "y-tick2")
    .attr("x", xLeft-20)
    .attr("y", yBase-75)
    .attr("transform","rotate(-90, "+(xLeft-40)+","+(yBase-75)+")")
    .attr("font-size", 14)
    .attr("text-anchor", "end")
    .attr("fill", "#999999")
    .text(yLabel);

  for (let i = 0; i <= tickCount; i++) {
    var tickValue = (i * tickInterval).toString()
    if (max_score < 1000 && tickValue.length > 3){
      tickValue = tickValue.substring(0,3)
    }
    var yPos = yBase - i*tickInterval*scale;

    // Tick mark
    svg.append("line")
      .attr("class", "y-tick2")
      .attr("x1", xLeft-5)
      .attr("y1", yPos)
      .attr("x2", xLeft+1)
      .attr("y2", yPos)
      .style('stroke-width', 2)
      .style("stroke", "#999999");

    // Tick label
    svg.append("text")
      .attr("class", "y-tick2")
      .attr("x", xLeft-10)
      .attr("y", yPos + 5)
      .attr("font-size", 14)
      .attr("text-anchor", "end")
      .attr("fill", "#999999")
      .text(tickValue);
  }

  // Use D3 data binding with enter/exit pattern
  var circles = svg.selectAll(".data-point2")
    .data(best_results, d => d.iter); // Use iter as key for object constancy

  // Remove old circles (if needed)
  circles.exit().remove();

  // Add new circles
  circles.enter()
    .append("circle")
    .attr("class", "data-point2")
    .attr("cx", d => xLeft + (d.iter + 0.5) * xstep)
    .attr("cy", d => yBase - (mult*d.result[mode]/input_length) * scale)
    .attr("r", 3)
    .attr("fill", "#999999")
    .attr("stroke", "#ffffff")
    .attr("onmouseover", d => "showTooltip(evt,'"+(mult*d.result[mode]/input_length).toFixed(2)+"')").attr("onmouseout", "hideTooltip()")
    .on("mouseover", function(event, d) {
      handleCircleHover(d, this);
    })
    .on("mouseout", function(event, d) {
      handleCircleLeave(d, this);
    });

  // Update existing circles (in case positions need to change based on scale)
  circles
    .attr("cx", d => xLeft + (d.iter + 0.5) * xstep)
    .attr("cy", d => yBase - (mult*d.result[mode]/input_length) * scale)
    .attr("onmouseover", d => "showTooltip(evt,'"+(mult*d.result[mode]/input_length).toFixed(2)+"')").attr("onmouseout", "hideTooltip()");
}

function setMode(thing){
  if (thing == 'SFB'){
    mode = 'sfb';
    mult = 100;
  } else if (thing == 'Effort') {
    mode = 'effort';
    mult = 1;
  } else if (thing == "Scissors") {
    mode = 'scissors';
    mult = 100;
  } else if (thing == "LSB") {
    mode = 'lat_str';
    mult = 100;
  } else if (thing == "SFS") {
    mode = 'sfs';
    mult = 100;
  }
  yLabel = thing
  console.log("setting mode to "+mode);
  generateGraphs2();
}

function generateModeButtons() {
  var yBase = 640;
  var xLeft = 380;
  var buttons = ["SFB","Effort","Scissors","LSB","SFS"]
  if (svg.select(".mode-button").empty()) {

    for(var i = 0; i < buttons.length; i++){
      svg.append("rect") // x axis
        .attr("class", "mode-button")
        .attr("x", xLeft+(i*100))
        .attr("y", yBase)
        .attr("width", 90)
        .attr("height", 30)
        .attr("stroke", "#333333")
        .attr("fill", "#222222")
        .attr("onclick", "setMode('"+buttons[i]+"')")
      svg.append("text")
        .attr("x", xLeft+(i*100)+45)
        .attr("y", yBase+16)
        .attr("fill", "#999")
        .attr("font-size", 16)
        .attr("font-family", "Roboto Mono, monospace")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .style("pointer-events", "none")
        .text(buttons[i])
    }
  }
}

function generateLayout() {
  for (let i = 0; i < rcdata.length; i++) {
    x = getX(rcdata[i].row,rcdata[i].col);
    y = getY(rcdata[i].row,rcdata[i].col);
    rcdata[i].x = x;
    rcdata[i].y = y;
    // console.log(i, rcdata[i].x, rcdata[i].y)
  }
  const keyGroups = svg.selectAll("g.key-group")
    .data(rcdata, d => `${d.row}-${d.col}`)

  keyGroups.exit().remove();

  const keyGroupsEnter = keyGroups.enter()
      .append("g")
      .attr("class", "key-group")
      .on("click", function(event, d) {
        toggleKeyOnOff(d);
      });

  // Append the rectangle to each new group
  keyGroupsEnter.append("rect")
    .attr("width", 30)
    .attr("height", 30)
    .attr("rx", 6)
    .attr("ry", 6)
    .attr("fill", "#aaaaaa")

  // Append the text to each new group
  keyGroupsEnter.append("text")
    .attr("x", 15)
    .attr("y", 15)
    .attr("font-size", 16)
    .attr("font-family", "Roboto Mono, monospace")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("pointer-events", "none"); // Prevents text from capturing mouse events from the group

  const mergedGroups = keyGroupsEnter.merge(keyGroups);

  mergedGroups.attr("transform", d => `translate(${d.x}, ${d.y})`);

  mergedGroups.select("rect")
    .attr("stroke-width", "1")
    .attr("stroke", d => d.enabled === 1 ? "#00dd00" : "#dd0000");

  mergedGroups.select("text")
    .text(d => d.char == " " ? "␣" : d.char);
}

function sortLetterFreq(){
  // sort letters highest to lowest. ETAOINSHRDLU etc
  var keyValueArray = Object.entries(letter_freq);
  keyValueArray.sort((a, b) => b[1].count - a[1].count);
  var tmp = Object.fromEntries(keyValueArray);
  letter_position = []
  var ix = 920;
  x = ix;
  y = 20;
  for (var letter in tmp) {
    letter_position.push({letter: letter, count: letter_freq[letter].count, enabled: letter_freq[letter].enabled, x: x, y: y});
    x += 38;
    if (x >= ix+(7*38)) {
      x = ix;
      y += 38;
    }
  }

}

function generateCharacters() {
  console.log("generateCharacters");

  const letterGroups = svg.selectAll("g.letter-group").data(letter_position, d => d.letter);

  letterGroups.exit().remove();

  const letterGroupsEnter = letterGroups.enter()
    .append("g")
      .attr("class", "letter-group")
      // The drag handler and click listener are applied only once on creation.
      .call(dragHandler)
      .on("click", function(event, d) {
        // This function would be defined elsewhere in your code
        toggleCharOnOff(d.letter);
      });

  // Append the rectangle to the new groups
  letterGroupsEnter.append("rect")
    .attr("width", 30)
    .attr("height", 30)
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("fill", "#aaaaaa")
    .attr("stroke-width", "1");

  // Append the text to the new groups
  letterGroupsEnter.append("text")
    .attr("x", 15) // Center horizontally
    .attr("y", 15) // Center vertically
    .attr("font-size", 16)
    .attr("font-family", "Roboto Mono, monospace")
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .style("pointer-events", "none"); // Ensures clicks are registered by the group <g>

  const mergedGroups = letterGroupsEnter.merge(letterGroups);

  mergedGroups.attr("transform", d => `translate(${d.x}, ${d.y})`);

  mergedGroups.select("rect").attr("stroke", d => letter_freq[d.letter].enabled == 1 ? "#00ff00" : "#ff0000");

  mergedGroups.select("text").text(d => d.letter == " " ? "␣" : d.letter); // Use a special character for space
}

function countCharsKeys() {
  var key_count = 0;
  var char_count = 0;
  for (let i = 0; i < rcdata.length; i++) {
    on = rcdata[i].enabled;
    if (on == 1) {
      key_count += 1;
    }
  }
  for (var m in letter_freq) {
    if (letter_freq[m].enabled == 1) {
      char_count += 1;
    }
  }
  error_text = "";
  error = false;
  var diff = 0
  if (key_count > char_count) {
    diff = key_count - char_count
    error_text = "Too many keys ("+diff+"); Select more characters or deselect some keys";
    error = true;
  } else if(char_count > key_count) {
    diff = char_count - key_count
    error_text = "Too many chars ("+diff+"); Select fewer characters or select some more keys";
    error = true;
  }
}

function generateStats() {
  console.log("generateStats")
  const infoPanel = d3.select("#info-panel");

  infoPanel.html(null);

  infoPanel.append("text").attr("x", 340).attr("y", 200).attr("fill", "#ffaaaa")
  .attr("font-size", 13).attr("text-anchor", "left")
  .attr("font-family", "Roboto Mono")
  .text(error_text);

  // === RUN COUNTER ===
  x = 1050
  y = 568
  // infoPanel.append("text").attr("x", x).attr("y", y).attr("fill", "#aaaaaa")
  // .attr("font-size", 20).attr("text-anchor", "left").text(runs);
  if (iter >= 0) {
    infoPanel.append("text").attr("x", x-55).attr("y", y).attr("fill", "#aaaaaa")
    .attr("font-size", 20).attr("text-anchor", "left").text((100 * (iter+1) / times).toFixed(1) + "%");
  }
  // === SCORES ===
  x = 20
  y = 30
  var weight_x = 136
  var min_x = 196
  var score_x = 255

  // headers
  infoPanel.append("text").attr("x", x+weight_x).attr("y", y).attr("fill", "#aaaaaa")
  .attr("font-size", 14).attr("text-anchor", "left").text("Weights:");
  infoPanel.append("text").attr("x", x+min_x+10).attr("y", y).attr("fill", "#aaaaaa")
  .attr("font-size", 14).attr("text-anchor", "left").text("Min:");
  infoPanel.append("text").attr("x", x+score_x).attr("y", y).attr("fill", "#aaaaaa")
  .attr("font-size", 14).attr("text-anchor", "left").text("Scores:");

  // sfb

  var score_x = 255;
  y += 35
  addStatLine(x,y,sfb_data)
  y += 35
  addStatLine(x,y,effort_data)
  y += 35
  addStatLine(x,y,psfb_data)
  y += 35
  addStatLine(x,y,rsfb_data)
  y += 35
  addStatLine(x,y,scissors_data)
  y += 35
  addStatLine(x,y,prscissors_data)
  y += 35
  addStatLine(x,y,wscissors_data)
  y += 35
  addStatLine(x,y,latstr_data)
  y += 35
  addStatLine(x,y,sfs_data)
  y += 35
  addStatLine(x,y,vowels_data)
  y += 35
  addStatLine(x,y,hbalance_data)
  y += 35

  infoPanel.append("text").attr("x", x).attr("y", y).attr("fill", "#aaaaaa").attr("font-family", "Roboto Mono")
  .attr("font-size", 14).attr("text-anchor", "left").text("Score:");
  infoPanel.append("text").attr("x", x+score_x).attr("y", y).attr("fill", "#aaaaaa").attr("font-family", "Roboto Mono")
  .attr("font-size", 14).attr("text-anchor", "left").text(m_score.toFixed(2));

  infoPanel.raise();
}

function addStatLine(x, y, data) {
  const infoPanel = d3.select("#info-panel");
  var value_x = 86
  var weight_x = 136
  var min_x = 196
  var score_x = 255
  infoPanel.append("text").attr("x", x).attr("y", y).attr("fill", "#aaaaaa").attr("font-family", "Roboto Mono")
  .attr("font-size", 14).attr("text-anchor", "left").text(data.label).attr("onmouseover", "showTooltip(evt,'"+data.desc+"')").attr("onmouseout", "hideTooltip()");
  infoPanel.append("text").attr("x", x+value_x).attr("y", y).attr("fill", "#aaaaaa").attr("font-family", "Roboto Mono")
  .attr("font-size", 14).attr("text-anchor", "left").text(data.metric);
  infoPanel.append("text").attr("x", x+score_x).attr("y", y).attr("fill", "#aaaaaa").attr("font-family", "Roboto Mono")
  .attr("font-size", 14).attr("text-anchor", "left").text(data.score.toFixed(3));

  const weight_field = infoPanel.append("foreignObject").attr("x", x + weight_x).attr("y", y - 20)
   .attr("width", 50).attr("height", 25).append("xhtml:input")
   .attr("type", "number").attr("step", "0.01").style("width", "100%").style("height", "100%").style("border", "1px solid #ccc")
   .style("background", "#555").style("padding", "3px").style("font-size", "16px").style("text-align", "right");

  weight_field.property("value", data.weight);
  weight_field.on("input", function() {
    const value = d3.select(this).property("value");
    if (value === "") {
      d3.select(this).property("value", "0");
      data.weight = 0;
    } else {
      data.weight = parseFloat(value);
    }
  });

  const min_field = infoPanel.append("foreignObject").attr("x", x + min_x).attr("y", y - 20)
   .attr("width", 50).attr("height", 25).append("xhtml:input")
   .attr("type", "number").style("width", "100%").style("height", "100%").style("border", "1px solid #ccc")
   .style("background", "#555").style("padding", "3px").style("font-size", "16px").style("text-align", "right");

  min_field.property("value", data.min);
  min_field.on("input", function() {
    const value = d3.select(this).property("value");
    if (value === "") {
      d3.select(this).property("value", "0");
      data.min = 0;
    } else {
      data.min = parseFloat(value);
    }
  });

}

function getEffort(row, col) {
  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i].row == row && rcdata[i].col == col) {
      return rcdata[i].effort
    }
  }
  return 0
}
function setEffort(row, col,value) {
  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i].row == row && rcdata[i].col == col) {
      rcdata[i].effort = value
    }
  }
}

function openEffortPopup() {
  for (var row = 0; row < 3; row++) {
    for (var col = 0; col < 12; col++) {
      var name = "textInput-" + row + "-" + col
      document.getElementById(name).value = getEffort(row,col)
    }
  }
  document.getElementById('popup').style.display = 'flex';
}

function loadEffortValuesFromCookie(cookieName, data) {
  const nameEQ = cookieName + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) {
      const effortValuesString = c.substring(nameEQ.length,c.length);
      if (effortValuesString) {
        const effortValues = JSON.parse(effortValuesString);

        // Update the rcdata array with the loaded effort values
        if (Array.isArray(effortValues) && effortValues.length === data.length) {
          return data.map((item, index) => {
            item.effort = effortValues[index];
            return item;
          });
        }
      }
      return data; // Return original data if cookie is empty or malformed
    }
  }
  return data; // Return original data if cookie not found
}

function saveEffortValuesToCookie(cookieName, data, daysToExpire) {
  const effortValues = data.map(item => item.effort);
  const effortValuesString = JSON.stringify(effortValues);

  let expires = "";
  if (daysToExpire) {
    const date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = cookieName + "=" + (effortValuesString || "")  + expires + "; path=/";
}

function closeEffortPopup() {
  for (var row = 0; row < 3; row++) {
    for (var col = 0; col < 12; col++) {
      var name = "textInput-" + row + "-" + col
      setEffort(row, col, document.getElementById(name).value);
    }
  }
  saveEffortValuesToCookie("rcdataEffort", rcdata, 28);
  document.getElementById('popup').style.display = 'none';
}

function openCorpusPopup() {
  document.getElementById('corpusPopup').style.display = 'flex';
}

function closeCorpusPopup() {
  var massive_string = document.getElementById('corpusText').value;
  massive_string = massive_string.toLowerCase().replace(/\s+/g, ' ');
  if (massive_string.length == 0) {
    document.getElementById('corpusPopup').style.display = 'none';
    return;
  }
  words = {};
  list = massive_string.split(" ")
  var regex = /\d/;
  list.forEach(element => {
    if (regex.test(element)){
      // no numbers please
    } else {
      if (words[element]) {
        words[element] += 1
      } else {
        words[element] = 1
      }
    }
  });
  input_length = 0;
  letter_freq = {};
  bigram_freq = {};
  trigram_freq = {};
  getCharacters();
  countCharsKeys();
  generateCharacters();
  generateStats();
  // hide popup
  document.getElementById('corpusPopup').style.display = 'none';
}

function copyEffortGridToClipboard() {
  values = []
  for (var row = 0; row < 3; row++) {
    for (var col = 0; col < 12; col++) {
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

    for (var row = 0; row < 3; row++) {
      for (var col = 0; col < 12; col++) {
        var name = "textInput-" + row + "-" + col
        document.getElementById(name).value = numbersArray[row * 12 + col]
      }
    }
  })
  .catch(err => {
    console.error("Failed to read clipboard contents:", err);
  });
}


function selectLanguage(lan, event) {
  var word_list = 'words-'+lan+'.json';
  console.log("============ "+lan.toUpperCase()+" ============")
  fetch(word_list)
  .then(response => response.json())
  .then(data => {
      if (event.ctrlKey){
        console.log("adding "+lan+" to words")
        for (var word in data) {
          if (words[word]){
            words[word] += data[word]
          } else {
            words[word] = data[word]
          }
        }
        document.getElementById("langDropDown").innerHTML += ("+"+lan.charAt(0).toUpperCase() + lan.substr(1).toLowerCase());
      } else {
        words = data; // Assign data to the global variable
        document.getElementById("langDropDown").innerHTML = lan.charAt(0).toUpperCase() + lan.substr(1).toLowerCase();
      }
      console.log("fetchData");
      getCharacters()
      generateCharacters()
    })
    .catch(error => console.error('Error loading JSON file:', error));
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function toggleKeyOnOff(d) {
  console.log("toggleKeyOnOff "+d);
  if (d.enabled == 1){
    d.enabled = 0
  } else {
    d.enabled = 1;
    for (var m in letter_freq) {
      if (m == d.char) {
        letter_freq[m].enabled = 1;
      }
    }
    d.char = "";
  }

  countCharsKeys();
  generateStats();
  generateLayout();
  generateCharacters();
}

function toggleCharOnOff(char) {
  for (var m in letter_freq) {
    if (m == char) {
      if (letter_freq[m].enabled == 0) {
        letter_freq[m].enabled = 1;
      } else {
        letter_freq[m].enabled = 0;
      }
    }
  }
  generateCharacters();
  countCharsKeys();
  generateStats();
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

function shuffle(array) { // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  let currentIndex = array.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    var tmp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tmp;
  }
  return array
}

function shuffleData(data, reps) {
  if (times<20){reps+=(20-times)}
  var tmp_keys = _.cloneDeep(data)
  var editable_keys = [];
  for (let i = 0; i < tmp_keys.length; i++) {
    if (tmp_keys[i].enabled == 1) {
      editable_keys.push(i);
    }
  }
  for (let i = 0; i < reps; i++) {
    // pick a random key
    var key1 = editable_keys[Math.floor(Math.random()*editable_keys.length)];
    var key2 = editable_keys[Math.floor(Math.random()*editable_keys.length)];
    while(key1 == key2) {
      key2 = editable_keys[Math.floor(Math.random()*editable_keys.length)];
    }
    tmp = tmp_keys[key1].char
    tmp_keys[key1].char = tmp_keys[key2].char
    tmp_keys[key2].char = tmp
  }
  return tmp_keys
}

function create_uid(rcdata) {
  var arr = [];
  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i].enabled == 1) {
      if (rcdata[i].char == " ") {
        arr.push("␣");
      } else {
        arr.push(rcdata[i].char);
      }
    }
  }
  return arr.join("")
}

var setup = false;
function start() {
  console.log("construct list of chars");
  var list_of_chars = [];
  for (var m in letter_freq) {
    if (letter_freq[m].enabled == 1) {
      list_of_chars.push(m);
    }
  }
  list_of_chars = shuffle(list_of_chars);

  // check the letters fixed on the keyboard are off in the character list
  for (var m in letter_freq) {
    if (letter_freq[m].enabled == 1) {
      for (let i = 0; i < rcdata.length; i++) {
        if (rcdata[i].char == m) {
          error = true
        }
      }
    }
  }
  if (error) { return; }

  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i].enabled == 1) {
      rcdata[i].char = list_of_chars.pop();
    }
  }
  setup = true;
  generateLayout();
}

function clearLetters() {
  for (let i = 0; i < rcdata.length; i++) {
    if (rcdata[i].char != "" && rcdata[i].enabled == 1) {
      rcdata[i].char = ""
    }
  }
  best_results = [];
  generateLayout();
  generateCharacters();
}

var results;
var best_results=[];
var uid_set;
var best_score;
var best_result;
var bestest_score;
var time_to_shuffle;
var editable_keys;

function update_progress() {
  svg.selectAll(".progress").remove();
  if (running) {
    var x = 1060;
    for(var r = 0; r < 360; r += 60){
    svg.append("rect")
      .attr("class", "progress")
      .attr("x", x).attr("y", 562)
      .attr("width", 10).attr("height", 2)
      .attr("stroke", "#111111")
      .attr("fill", "#aaaaaa")
      .attr("transform","rotate("+(progress+r)+","+(x+15)+",563)")
    }
    progress += 21;
    if (progress > 360) {progress -= 360;}
  }
}

function calculateScore(value, weight, min, denom, perc) {
  if (perc==true) {
    value = (100*value)/denom
    var score = (value - min) * weight
  } else {
    value = value/denom
    var score = (value - min) * weight
  }
  if (isNaN(score)) {
    console.log("score is NaN. ",value,weight,min,denom,perc)
    return 0
  }
  if (score < 0) {
    return 0
  }
  return score
}

function run() {
  if (error == true) {console.log("sort errors first");return;}
  runs += 1;
  best_score = 1000000;
  var messages_sent = 0;
  var messages_received = 0;
  var found_new_result = false;
  var best_config
  if (window.Worker) {
    const myWorker = new Worker("worker.js");

    if (setup == false) {
      start();
      for (let i = 0; i < rcdata.length; i++) {
        if (rcdata[i].enabled == 1) {
          editable_keys.push(i);
        }
      }
    }

    if (time_to_shuffle) {
      rcdata = shuffleData(rcdata, times-iter);
      iter += 1;
      time_to_shuffle = false;
      best_score = 1000000;
    } else {
      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          if (results[i].score < best_score) {
            best_score = results[i].score
            best_config = results[i].config
          }
        }
        if (best_config) {
          rcdata = best_config
        }
      }
    }

    for (let i = 0; i < editable_keys.length; i++) {
      for (let j = 0; j < editable_keys.length; j++) {
        if (j > i) {
          var tmp_keys = _.cloneDeep(rcdata)
          // swap keys
          var p = editable_keys[i]
          var q = editable_keys[j]
          tmp = tmp_keys[p].char
          tmp_keys[p].char = tmp_keys[q].char
          tmp_keys[q].char = tmp
          var uid = create_uid(tmp_keys)
          if (uid_set.has(uid)) {
          } else {
            messages_sent += 1;
            myWorker.postMessage({
              letter_freq: letter_freq,
              bigrams: bigram_freq,
              trigrams: trigram_freq,
              config: tmp_keys,
            });
          }
        }
      }
    }
    // column swap
    for (let c = 1; c <= 10; c++) {
      for (let d = 1; d <= 10; d++) {
        if (d > c) {
          var tmp_keys = _.cloneDeep(rcdata)
          for(let r = 0; r <= 2; r++ ) {
            var p = getKey(r, c)
            var q = getKey(r, d)
            if (rcdata[p].enabled == 1 && rcdata[q].enabled == 1) {
              tmp = tmp_keys[p].char
              tmp_keys[p].char = tmp_keys[q].char
              tmp_keys[q].char = tmp
            }
          }

          var uid = create_uid(tmp_keys)
          if (uid_set.has(uid)) {
          } else {
            messages_sent += 1;
            myWorker.postMessage({
              letter_freq: letter_freq,
              bigrams: bigram_freq,
              trigrams: trigram_freq,
              config: tmp_keys,
            });
          }
        }
      }
    }

    // Listen for results coming back from the worker
    myWorker.onmessage = function(e) {
      const { result, config } = e.data;
      uid = create_uid(config)
      var score = 0;

      sfb_data.score = calculateScore(result.sfb, sfb_data.weight, sfb_data.min, input_length, true)
      effort_data.score = calculateScore(result.effort, effort_data.weight, effort_data.min, input_length, false)
      psfb_data.score = calculateScore(result.psfb, psfb_data.weight, psfb_data.min, input_length, true)
      rsfb_data.score = calculateScore(result.rsfb, rsfb_data.weight, rsfb_data.min, input_length, true)
      scissors_data.score = calculateScore(result.scissors, scissors_data.weight, scissors_data.min, input_length, true)
      prscissors_data.score = calculateScore(result.prscissors, prscissors_data.weight, prscissors_data.min, input_length, true)
      wscissors_data.score = calculateScore(result.wide_scissors, wscissors_data.weight, wscissors_data.min, input_length, true)
      latstr_data.score = calculateScore(result.lat_str, latstr_data.weight, latstr_data.min, input_length, true)
      sfs_data.score = calculateScore(result.sfs, sfs_data.weight, sfs_data.min, input_length, true)
      vowels_data.score = (result.vowels - vowels_data.min) * vowels_data.weight
      hbalance_data.score = (result.hand_balance - hbalance_data.min) * hbalance_data.weight
      if (hbalance_data.score < 0) {hbalance_data.score = 0}

      score += sfb_data.score
      score += effort_data.score
      score += psfb_data.score
      score += rsfb_data.score
      score += scissors_data.score
      score += prscissors_data.score
      score += wscissors_data.score
      score += latstr_data.score
      score += sfs_data.score
      score += vowels_data.score
      score += hbalance_data.score

      results.push({score: score, config: config, result: result, iter: iter})
      if (score < best_score) {
        best_score = score;
        found_new_result = true;
      }
      messages_received += 1;
      // console.log("sent = "+messages_sent+"  received = "+messages_received);
      if (messages_received == messages_sent) {
        console.log(iter + " best result: "+best_score);
        update_progress();
        if (found_new_result) {
          run();
        } else {
          time_to_shuffle = true;
          best_score = 1000000;
          for (let i = 0; i < results.length; i++) {
            if (results[i].score < best_score) {
              best_config = results[i].config
              best_score = results[i].score
              best_result = results[i].result
            }
          }
          rcdata = best_config
          var uid = create_uid(rcdata)
          uid_set.add(uid)
          best_results.push({config: best_config, score: best_score, result: best_result, iter: iter})
          results = [];

          sfb_data.metric = ((100*best_result.sfb) / input_length).toFixed(2) + "%"
          effort_data.metric = (best_result.effort / input_length).toFixed(2)
          psfb_data.metric = (100*best_result.psfb / input_length).toFixed(2) + "%"
          rsfb_data.metric = (100*best_result.rsfb / input_length).toFixed(2) + "%"
          scissors_data.metric = (100*best_result.scissors / input_length).toFixed(2) + "%"
          prscissors_data.metric = (100*best_result.prscissors / input_length).toFixed(2) + "%"
          wscissors_data.metric = (100*best_result.wide_scissors / input_length).toFixed(2) + "%"
          latstr_data.metric = (100*best_result.lat_str / input_length).toFixed(2) + "%"
          sfs_data.metric = (100*best_result.sfs / input_length).toFixed(2) + "%"
          vowels_data.metric = (best_result.vowels)
          hbalance_data.metric = (best_result.hand_balance).toFixed(2)

          sfb_data.score = calculateScore(best_result.sfb, sfb_data.weight, sfb_data.min, input_length, true)
          effort_data.score = calculateScore(best_result.effort, effort_data.weight, effort_data.min, input_length, false)
          psfb_data.score = calculateScore(best_result.psfb, psfb_data.weight, psfb_data.min, input_length, true)
          rsfb_data.score = calculateScore(best_result.rsfb, rsfb_data.weight, rsfb_data.min, input_length, true)
          scissors_data.score = calculateScore(best_result.scissors, scissors_data.weight, scissors_data.min, input_length, true)
          prscissors_data.score = calculateScore(best_result.prscissors, prscissors_data.weight, prscissors_data.min, input_length, true)
          wscissors_data.score = calculateScore(best_result.wide_scissors, wscissors_data.weight, wscissors_data.min, input_length, true)
          latstr_data.score = calculateScore(best_result.lat_str, latstr_data.weight, latstr_data.min, input_length, true)
          sfs_data.score = calculateScore(best_result.sfs, sfs_data.weight, sfs_data.min, input_length, true)
          vowels_data.score = (best_result.vowels - vowels_data.min) * vowels_data.weight
          hbalance_data.score = (best_result.hand_balance - hbalance_data.min) * hbalance_data.weight
          if (hbalance_data.score < 0) {hbalance_data.score = 0}

          m_score = sfb_data.score +
                    effort_data.score +
                    psfb_data.score +
                    rsfb_data.score +
                    scissors_data.score +
                    prscissors_data.score +
                    wscissors_data.score +
                    latstr_data.score +
                    sfs_data.score +
                    vowels_data.score +
                    hbalance_data.score

          generateLayout();
          generateStats();
          generateGraphs();
          generateGraphs2();

          if (iter+1 < times) {
            // console.log("=== "+(times-iter)+" ===")
            run();
          } else {
            running = false;
          }
        }
      }
    };

    myWorker.onerror = function(error) {
      console.error('Main: There was an error with the worker.', error);
    };
  } else {
    console.log('Your browser does not support Web Workers.');
  }
}

loadAllData();
