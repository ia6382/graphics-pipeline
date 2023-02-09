// Keyboard handling helper variable for reading the status of keys
var currentlyPressedKeys = {};

arrayVektorjev = [];
triangleVertexes = [];

var sx;
var sy;
var sz;

var tx;
var ty;
var tz;

var rx;
var ry;
var rz;

function start() {	
	zahtevajBranje()

	sx = 1;
	sy = 1;
	sz = 1;

	tx  = 0;
	ty = 0;
	tz = 0;

	rx = 0;
	ry = 0;
	rz = 0;
	
	// Bind keyboard handling functions to document handlers
    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
	
	setTimeout(function() { //zaenkrat tako da najprej prebere v arrayVektorjev
		setInterval(function() {
			handleKeys();
			
			var mvMatrix = mat4.create();
			var pMatrix = mat4.create();

			var vektorji = arrayVektorjev;
			
			//kamera
			mvMatrix = mat4.multiply(mvMatrix, mvMatrix, translate(0, 0, -8));

			//model
			mvMatrix = mat4.multiply(mvMatrix, mvMatrix, translate(tx, ty, tz));
			mvMatrix = mat4.multiply(mvMatrix, mvMatrix, rotateX(rx));
			mvMatrix = mat4.multiply(mvMatrix, mvMatrix, rotateY(ry));
			mvMatrix = mat4.multiply(mvMatrix, mvMatrix, rotateZ(rz));
			mvMatrix = mat4.multiply(mvMatrix, mvMatrix, scale(sx, sy, sz));
			
			//projekcija
			pMatrix = mat4.multiply(pMatrix, pMatrix, perspective(4));
			
			//mnozenje
			vektorji = transformacija(vektorji, mvMatrix);
			vektorji = transformacija(vektorji, pMatrix);
			//normalizacija
			vektorji = normaliziraj(vektorji);
			vektorji = prilagodi(vektorji);
			
			//narisi
			narisi(vektorji, triangleVertexes);
		}, 15);
	}, 100);	
}

function normaliziraj(vektorji){
	buff = new Array(vektorji.length)
	for(i = 0; i < vektorji.length; i ++){
		buff[i] = vec4.create();
	}

	for(j = 0; j < vektorji.length; j ++){	
		vec4.normalize(buff[j], vektorji[j]);	
		
	}
	return buff;
}

function prilagodi(vektorji){ // prilagodi normalizirane koordinate na risalno povrsino
	buff = new Array(vektorji.length)
	for(i = 0; i < vektorji.length; i ++){
		buff[i] = vec4.create();
	}

	for(j = 0; j < vektorji.length; j ++){	
		vec4.scale(buff[j], vektorji[j], 1000);	
		
	}
	return buff;
}

function narisi(vektorji, trikotniki){
	var canvas = document.getElementById("2dcanvas");
	canvas.style.background = '#0051fe';
	var c = canvas.getContext("2d");
	c.viewportWidth = canvas.width;
    c.viewportHeight = canvas.height;
	
	//izhodisce
	var x0 = c.viewportWidth/2;
	var y0 = c.viewportHeight/2;
	
	//prvo pobrisi vse da je prazno	
	c.clearRect(0, 0, canvas.width, canvas.height);
	
	//narisi koordinate x in y(z mi gledamo)
	c.strokeStyle='#011d58';
	c.beginPath();
	c.moveTo(c.viewportWidth/2, 20);
	c.lineTo(c.viewportWidth/2, c.viewportHeight - 20);
	c.stroke();
	c.moveTo(20, c.viewportHeight/2);
	c.lineTo(c.viewportWidth - 20, c.viewportHeight/2);
	c.stroke();
	
	c.strokeStyle='#ff00d8';
	
	for(i = 0; i < trikotniki.length; i += 3){
		c.beginPath();
		c.moveTo(x0 + vektorji[trikotniki[i]-1][0], y0 + vektorji[trikotniki[i]-1][1]);
		c.lineTo(x0 + vektorji[trikotniki[i+1]-1][0], y0 + vektorji[trikotniki[i+1]-1][1]);
		c.lineTo(x0 + vektorji[trikotniki[i+2]-1][0], y0 + vektorji[trikotniki[i+2]-1][1]);
		c.lineTo(x0 + vektorji[trikotniki[i]-1][0], y0 + vektorji[trikotniki[i]-1][1]);
		c.stroke();
	}
	
}

function transformacija(vektorji, matrika){
	buff = new Array(vektorji.length)
	for(i = 0; i < vektorji.length; i ++){
		buff[i] = vec4.create();
	}
	
	var nehomogen = 0;
	for(i = 0; i < vektorji.length; i ++){
			vec4.transformMat4(buff[i], vektorji[i], matrika);
			//preverimo homogeni del
			if(buff[i][3] != 1){
				nehomogen = 1;
				for(j = 0; j < 4; j ++){
					buff[i][j] = buff[i][j]/buff[i][3];
				}
			}
	}
	return buff;
}

function rotateX(alpha){
	return mat4.fromValues(1, 0, 0, 0, 0, Math.cos(alpha), Math.sin(alpha), 0,	0, - Math.sin(alpha), Math.cos(alpha), 0, 0, 0, 0, 1);
}

function rotateY(alpha){
	return mat4.fromValues(Math.cos(alpha), 0, -Math.sin(alpha), 0,
							0, 1, 0, 0,
							Math.sin(alpha), 0, Math.cos(alpha), 0,
							0, 0, 0, 1);
	
}

function rotateZ(alpha){
	return mat4.fromValues(Math.cos(alpha), Math.sin(alpha), 0, 0,
							-Math.sin(alpha), Math.cos(alpha), 0, 0,
							0, 0, 1, 0,
							0, 0, 0, 1);
	
}

function translate(dx, dy, dz){
	return mat4.fromValues(1, 0, 0, 0,
							0, 1, 0, 0,
							0, 0, 1, 0, 
							dx, dy, dz, 1);
	
}

function scale(sx, sy, sz){
	return mat4.fromValues(sx, 0, 0, 0,
							0, sy, 0, 0,
							0, 0, sz, 0, 
							0, 0, 0, 1);
	
}

function perspective(d){
	return mat4.fromValues(1, 0, 0, 0,
							0, 1, 0, 0,
							0, 0, 1, -1/d,
							0, 0, 0, 0);
	
}

//branje text datoteke vozlisc in trikotnikov
zahtevajBranje = function() {
  var request = new XMLHttpRequest();
  request.open("GET", "./model.obj");
  request.onreadystatechange = function () {
    if (request.readyState == 4) {
      beri(request.responseText);
    }
  }
  request.send();
}

beri = function(data) {
  var lines = data.split("\n");
  var vertexCount = 0;
  var triangleCount = 0;
  for (var i in lines) {
	var vals = lines[i].replace(/^\s+/, "").split(/\s+/);
	if (vals[0] == "v") {
	  var vektor = vec4.fromValues(parseFloat(vals[1]), parseFloat(vals[2]), parseFloat(vals[3]), 1);
	  arrayVektorjev.push(vektor);
	  
	}
	else if(vals[0] == "f"){
	  triangleVertexes.push(parseFloat(vals[1]));
	  triangleVertexes.push(parseFloat(vals[2]));
	  triangleVertexes.push(parseFloat(vals[3]));
	  triangleCount += 1;	  
	}
  }
}

//
// Keyboard handling helper functions
//
// handleKeyDown    ... called on keyDown event
// handleKeyUp      ... called on keyUp event
//
function handleKeyDown(event) {
  // storing the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = true;
}

function handleKeyUp(event) {
  // reseting the pressed state for individual key
  currentlyPressedKeys[event.keyCode] = false;
}

//
// handleKeys
//
// Called every time before redeawing the screen for keyboard
// input handling. Function continuisly updates helper variables.
//
function handleKeys() {
  //translacija
  if (currentlyPressedKeys[40]) {
    // arrow down
    ty = ty + 0.1;
  } else if (currentlyPressedKeys[38]) {
    // arrow up
     ty = ty - 0.1;
  } else if (currentlyPressedKeys[39]) {
    // arrow right
     tx = tx + 0.1;
  } else if (currentlyPressedKeys[37]) {
    // arrow left
     tx = tx - 0.1;
  } else if (currentlyPressedKeys[33]) {
    // page up
     tz = tz + 0.1;
  } else if (currentlyPressedKeys[34]) {
    // page down
     tz = tz - 0.1;
  }
  
  //skaliranje
  if (currentlyPressedKeys[83]) {
    // s
    sy = sy + 0.1;
  } else if (currentlyPressedKeys[87]) {
    // w
     sy = sy - 0.1;
  } else if (currentlyPressedKeys[68]) {
    // d
     sx = sx + 0.1;
  } else if (currentlyPressedKeys[65]) {
    // a
     sx = sx - 0.1;
  } else if (currentlyPressedKeys[81]) {
    // q
     sz = sz + 0.1;
  } else if (currentlyPressedKeys[69]) {
    // e
     sz = sz - 0.1;
  }
  
  //rotacija
  if (currentlyPressedKeys[100]) {
    // numpad 4
    ry = ry + 0.1;
  } else if (currentlyPressedKeys[102]) {
    // numpad 6
     ry = ry - 0.1;
  } else if (currentlyPressedKeys[104]) {
    // numpad 8
     rx = rx + 0.1;
  } else if (currentlyPressedKeys[98]) {
    // numpad 2
     rx = rx - 0.1;
  } else if (currentlyPressedKeys[103]) {
    // numpad 7
     rz = rz + 0.1;
  } else if (currentlyPressedKeys[105]) {
    // numpad 9
     rz = rz - 0.1;
  }
}