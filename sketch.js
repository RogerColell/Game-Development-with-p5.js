var ship;
var enemies = [];
var drops = [];
var state = 0;
var end = false;
var currentSpeed = 1;
var limitLeft = false;
var limitRight = false;
var score = 0;
var restartButton;
var bulletSound;
var bgMusic;
var fcsb;
var fec;
var fetch;
var enemiesSprites;
var data;

function preload() {     
  var xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET","data.json",false);
  xmlhttp.send();
  var data= xmlhttp.responseText;
  enemiesSprites = JSON.parse(data);
  fcsb = loadImage(enemiesSprites[0].fcsb);
  fec = loadImage(enemiesSprites[1].fec);
  fetch = loadImage(enemiesSprites[2].fetch);
  bulletSound = loadSound('assets/shotSound.wav');
  bgMusic = loadSound('assets/TheForceTheme.mp3');
}

function setup() {    
  createCanvas(1024, 768);
  var j = 6;
  var k = 12;
  ship = new Ship();
  drop = new Drop(width/2, height/2);
  for (var i = 0; i < 6; i++) {
    enemies[i] = new Enemy(i*80+80, 60, currentSpeed, fcsb);
    enemies[j] = new Enemy(i*80+80, 160, currentSpeed, fec);
    enemies[k] = new Enemy(i*80+80, 260, currentSpeed, fetch);
    j++;
    k++;
  }
  restartButton = createButton('REPLAY');
  restartButton.position(width/2.5, height/1.5);
  restartButton.mouseClicked(replay);
  restartButton.style(`background-color: black; 
  color: white; 
  border: 2px solid red; width: 15%; height: 10%;`)
  restartButton.hide();
  bgMusic.play();
}


function draw() {
  if(state == 0){

    background(51);
    fill(255,0,0);
    textSize(50);
    text(`PRESS ENTER TO START`, width/5, height/2);

  } else if (state == 1){

    background(51);
    ship.show();

    fill(255,0,0);
    textSize(30);
    text(`Score: ${score}`, 850, 50);

    shipLimits();

    collisionManagement();
    
    enemyBehaviour();

  } else if(state == 2){
    bgMusic.stop();

    fill(255,0,0);
    textSize(80);
    text(`GAME OVER`, width/4, height/2);

    fill(255,0,0);
    textSize(30);
    text(`Score: ${score}`, 850, 50);

    restartButton.show();

  }
}


// Funció per tornar a jugar.
function replay(){
  restartButton.hide();
  ship.x = width/2;
  enemies = [];
  drops = [];
  score = 0;
  currentSpeed = 1;  
  newlvl();
  state = 1;
  end = false;
  bgMusic.play();
}

//Funció per controlar els limits de la nau.
function shipLimits() {
  if( ship.x < 10){
    ship.x += 2;
  } else if( ship.x > 1014){
    ship.x -= 2;
  } else {
    ship.move();
  }   
}

//Funció per anar creant més enemics quan els elimines.
function newlvl(){
  var j = 6;
  var k = 12;
  for (var i = 0; i < 6; i++) {
    enemies[i] = new Enemy(i*80+80, 60, currentSpeed, fcsb);
    enemies[j] = new Enemy(i*80+80, 160, currentSpeed, fec);
    enemies[k] = new Enemy(i*80+80, 260, currentSpeed, fetch);
    j++;
    k++;
  }
}

//Funció per la interacció de les bales amb els enemics
function collisionManagement(){
  for (var i = 0; i < drops.length; i++) {
    drops[i].show();
    drops[i].move();
    for (var j = 0; j < enemies.length; j++) {
      if (drops[i].hits(enemies[j])) {
        enemies[j].grow();
        score += 1;
        for(var e = 0; e < enemies.length; e++){
          enemies[e].speedUp();
        }
        currentSpeed = enemies[j].getSpeed();
        enemies.splice(j, 1);
        if (enemies.length == 0){
          newlvl();
        }          
        drops[i].evaporate();
      }
    }
  }
}

// Funció per controlar els enemics.
function enemyBehaviour(){
  var edge = false;

    for (var i = 0; i < enemies.length; i++) {      
      if (enemies[i].y > height-80) {
        end = true;
      }
    }
  
    for (var i = 0; i < enemies.length; i++) {
      enemies[i].show();
      enemies[i].move();
      if (enemies[i].x > width || enemies[i].x < 0) {
        edge = true;
      }
    }
  
    if (edge) {
      for (var i = 0; i < enemies.length; i++) {
        enemies[i].shiftDown();
      }
    }
  
    for (var i = drops.length-1; i >= 0; i--) {
      if (drops[i].toDelete) {
        drops.splice(i, 1);
      }
    }

    if (end) {
      state = 2;
    } 
}

// Deixa de moure la nau quan deixes la tecla.
function keyReleased() {
  if (key != ' ') {
    ship.setDir(0);
  }
}

// Funcio per crear la bala i moure la nau.
function keyPressed() {
  if(keyCode === ENTER){
    state = 1;
  }

  if (key === ' ') {
    var drop = new Drop(ship.x, height);
    drops.push(drop);
    bulletSound.play();
  }

  if (keyCode === RIGHT_ARROW) {
    ship.setDir(1);
  } else if (keyCode === LEFT_ARROW) {
    ship.setDir(-1);
  }
}

// Classe de la nau.
function Ship() {
  this.x = width/2;
  this.xdir = 0;

  this.show = function() {
    fill(255,0,0);
    rectMode(CENTER);
    triangle(this.x-15, height, this.x+15, height, this.x, height-40)
    //rect(this.x, height-20, 20, 60);
  }

  this.setDir = function(dir) {
    this.xdir = dir;
  }

  this.move = function() {
    this.x += this.xdir*10;
  } 

}

//Classe per els enemics
function Enemy(x, y, s, img) {
  this.x = x;
  this.y = y;
  this.xdir = s;
  this.r = 30; 
  this.sprite = img; 

  this.grow = function() {
    this.r = this.r + 2;
  }

  this.shiftDown = function() {
    this.xdir *= -1;
    this.y += this.r;
  }

  this.move = function() {
    this.x = this.x + this.xdir;
  }

  this.speedUp = function(){
    this.xdir = this.xdir*1.05;
  }

  this.getSpeed = function(){
    return this.xdir;
  }

  this.show = function() {    
    noStroke();
    fill(0, 0, 0, 150);
    image(this.sprite, this.x, this.y, this.r*2, this.r*2);    
  }

}

//Classe per les bales
function Drop(x, y) {
  this.x = x;
  this.y = y;
  this.r = 8;
  this.toDelete = false;

  this.show = function() {
    noStroke();
    fill(255, 0, 0);
    ellipse(this.x, this.y, this.r*2, this.r*2);
  }

  this.evaporate = function() {
    this.toDelete = true;
  }

  this.hits = function(enemy) {
    var d = dist(this.x, this.y, enemy.x, enemy.y);
    if (d < this.r + enemy.r) {
      return true;
    } else {
      return false;
    }
  }

  this.move = function() {
    this.y = this.y - 10;
  }

}
