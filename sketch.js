class NullPolicy {
  constructor(){
    this.failed = true;
  }
  draw(){}
}

class Policy {
  constructor(active, distribution, x, y){
    this.active = active;
    this.distribution = distribution;
    this.x = x;
    this.y = y;
    this.failed = false;
    this.poles = null;
  }

  votes(rivalpolicy){
    // Policy1.votes(Policy2) = true <==> Policy1 loses the vote, Policy2 wins the vote
    if (rivalpolicy.x == this.x){
      if (rivalpolicy.y == this.y) return {outcome:false, vote:0.5};
      else {
        var vote = 0;
        let meany = (this.y+rivalpolicy.y)/2;
        for (var y=0; y<meany; y+=1){
          for (var x=0; x<this.distribution.W; x+=1){
            vote += this.distribution.dis[y][x];
          }
        }
        if (rivalpolicy.y > this.y) return {outcome:vote < 0.5, vote:1-vote};
        else return {outcome:vote > 0.5, vote:vote};
      }
    } else if (rivalpolicy.y == this.y) {
      var vote = 0;
      let meanx = (this.x+rivalpolicy.x)/2;
      for (var y=0; y<this.distribution.H; y+=1){
        for (var x=0; x<meanx; x+=1){
          vote += this.distribution.dis[y][x];
        }
      }
      if (rivalpolicy.x > this.x) return {outcome:vote < 0.5, vote:1-vote};
      else return {outcome:vote > 0.5, vote:vote};
    } else {
      var vote = 0;
      for (var y=0; y<this.distribution.H; y+=1){
        for (var x=0; x<this.distribution.W; x+=1){
          if (dist(x,y,this.x,this.y)<dist(x,y,rivalpolicy.x,rivalpolicy.y)) vote += this.distribution.dis[y][x];
        }
      }
      return {outcome:vote < 0.5, vote:1-vote};
    }
    return {outcome:false, vote:0};
  }

  fail(){
    this.failed = true;
    this.poles = null;
  }

  activate(){
    this.active = true;
    this.poles = null;
  }

  polesresult(r){
    this.poles = r.outcome;
  }
  
  draw(){
    stroke(0,0,0);
    strokeWeight(10);
    point(this.x,this.y);
    if (!this.active){
      if (this.poles == null) stroke(255,255,255);
      else if (this.poles == true) stroke(30,200,30);
      else if (this.poles == false) stroke(230,30,30);
      strokeWeight(5);
      point(this.x,this.y);
    }    
  }
}

class VoterDistribution {
  constructor(W,H,scale){
    this.W = W;
    this.H = H;
    this.scale = scale;
    this.dis = [];
    this.build();
    this.setup = false;
    this.setupgraphics();
  }

  build(){
    this.dis = [];
    let totalWeight = 0;
    for (let pixy = 0; pixy < this.H; pixy++) {
      this.dis.push([]);
      let y = (pixy/this.H-1/2)*6;
      for (let pixx = 0; pixx < this.W; pixx++) {
        let x = (pixx/this.W-1/2)*6;
        let n = noise(10*pixx/this.W, 10*pixy/this.H)*Math.pow(1.5,-x*x-y*y);
        this.dis[pixy].push(n);
        totalWeight += n;
      }
    }
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        this.dis[y][x] = this.dis[y][x]/totalWeight;
      }
    }
  }

  setupgraphics(){
    this.graphics = createGraphics(this.W,this.H);
    this.graphics.stroke(230,230,230);
    this.graphics.strokeWeight(1);
    this.graphics.line(W/8,H/2,7*W/8,H/2);
    this.graphics.line(W/2,H/8,W/2,7*H/8);
    this.graphics.strokeWeight(this.scale);
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        this.graphics.stroke(100,140,170,30000*this.dis[y][x]*255);
        this.graphics.point(x*this.scale,y*this.scale);
      }
    }
    this.setup = true;
  }
  
  draw(){
    if (this.setup) image(this.graphics,0,0,this.W,this.H);
  }
}

var W = 400;
var H = 400;
var d;
var p1;
var p2;

let btn1;
let txt1;
let txt2;

let nullpolicy = new NullPolicy();

class Button {
  constructor(x,y,w,h,text,callback){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.text = text;
    this.hitbox = function(x,y) {
      return (x>this.x && x<this.x+this.w) && (y>this.y && y<this.y+this.h);
    }
    this.callback = callback;
  }

  draw(){
    fill(250,250,250);
    stroke(200,200,200);
    rect(this.x,this.y,this.w,this.h,2);
    fill(50,50,50);
    noStroke();
    textAlign(CENTER,CENTER);
    textSize(18);
    text(this.text,this.x+this.w/2,this.y+this.h/2);
  }

  hover(){
    if (this.hitbox(mouseX,mouseY)) cursor("pointer");
  }
}

class TextInfo {
  constructor(text,x,y,active){
    this.text = text;
    this.x = x;
    this.y = y;
    this.active = active;
    this.tone = 0;
  }

  draw(){
    if (this.active){
      if (this.tone==1) fill(30,200,30);
      else if (this.tone==-1) fill(230,30,30);
      else fill(0,0,0);
      noStroke();
      textSize(18);
      text(this.text,this.x,this.y);
    }
  }

  update(txt){
    this.text = txt;
  }

  activate(){
    this.active = true;
  }

  updateTone(t){
    this.tone = t;
  }
}

function puttovote(){
  if (p2!=nullpolicy){
    let countvotes = p1.votes(p2);
    let policychange = countvotes.outcome;
    console.log('policy change',policychange);
    if (policychange) {
      p1 = p2;
      p1.activate();
      p2 = nullpolicy;
    } else {
      p2.fail();
    }
    return countvotes;
  }
  return null;
}


function setup() {

  d = new VoterDistribution(W,H,1);
  p1 = new Policy(true,d,100,100);
  p2 = nullpolicy;
  
  btn1 = new Button(W*5/4,9*H/20,W/2,H/10,'Put to Vote',function(){
    let countvotes = puttovote();
    if (countvotes!=null){
      txt2.update('Voted for new policy: ' + (100*round(1000*countvotes.vote)/1000).toString() + '%');
      if (countvotes.outcome==true) txt2.updateTone(1);
      else if (countvotes.outcome==false) txt2.updateTone(-1);
      txt2.activate();
      txt1.update('Current Policy: {'+Math.round(p1.x).toString()+','+Math.round(p1.y).toString()+'}');
    }
  });
  
  txt1 = new TextInfo('Current Policy: {'+Math.round(p1.x).toString()+','+Math.round(p1.y).toString()+'}',3*W/2,H/4,true);
  txt2 = new TextInfo('Click on LHS to suggest new policy',3*W/2,3*H/4,true);
    
  canvas = createCanvas(2*W, H); 

  main();
}

function drawui(){
  background(255,255,255);
  strokeWeight(1);
  stroke(0,0,0,30);
  line(W,H/10,W,9*H/10);
  line(0,H-1,2*W,H-1);
  line(2*W-1,0,2*W-1,H);
  line(0,0,2*W,0);
  line(0,0,0,H);
  btn1.draw();
}

function main(){
  drawui();
  d.draw();
  p1.draw();
  p2.draw();
  txt1.draw();
  txt2.draw();
}

function draw(){
  cursor("default");
  btn1.hover();
  if (mouseX<W) cursor('crosshair');
}

function mouseClicked(){
  if (mouseX<W){
    if (p2.failed || p2.poles!=null){
      p2 = new Policy(false,d,mouseX,mouseY);
      p2.polesresult(p1.votes(p2));
    }
  }
  if (mouseX>W){
    if (btn1.hitbox(mouseX,mouseY)) {
      btn1.callback();
    }
  }
  main();
}