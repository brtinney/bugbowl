// Configuration Object
var FIREWORKS_CONFIG = {
  frameRate: 50,
  secondsBetween: 0.8,
  canvasSelector: "#fireworks",
  particles: 250,
  maxRockets: 10
}

// Controller Object
var FIREWORKS = {
  launchInterval: null,
  drawInterval: null,
  canvas: null,
  rockets: [],
  particles: [],
  width: window.innerWidth,
  height: window.innerHeight,
  animating: false,

  stop: function(){
    this.animating = false;
    clearInterval(this.launchInterval);
  },

  start: function() {
    this.animating = true;
    this.canvas = $(FIREWORKS_CONFIG.canvasSelector);
    this.updateDimensions();
    this.launchInterval = setInterval(launch, 1000 * FIREWORKS_CONFIG.secondsBetween);
    window.requestAnimationFrame(draw);
    context = FIREWORKS.canvas.get(0).getContext('2d'),
    colorCode = 0;
  },

  updateDimensions: function() {
    if (FIREWORKS.animating) {
      FIREWORKS.height = FIREWORKS.canvas.get(0).height = window.innerHeight;
      FIREWORKS.width = FIREWORKS.canvas.get(0).width = window.innerWidth;
    }
  }
}

$(function(){
  $(window).resize(FIREWORKS.updateDimensions);
});


// Based on: http://jsfiddle.net/dtrooper/AceJJ/ with some modified physics


function launch() {
    if (FIREWORKS.rockets.length < FIREWORKS_CONFIG.maxRockets) {
        var rocket = new Rocket(Math.random() * window.innerWidth);
        rocket.explosionColor = Math.floor(Math.random() * 360 / 10) * 10;
        rocket.vel.y = Math.random() * -3 - 4;
        rocket.vel.x = Math.random() * 6 - 3;
        rocket.size = 8;
        rocket.shrink = 0.999;
        rocket.gravity = 0.01;
        FIREWORKS.rockets.push(rocket);
    }
}

function draw() {
    // clear canvas
    context.fillStyle = "rgba(0, 0, 0, 0.05)";
    context.fillRect(0, 0, FIREWORKS.width, FIREWORKS.height);

    var existingRockets = [];

    for (var i = 0; i < FIREWORKS.rockets.length; i++) {
        // update and render
        FIREWORKS.rockets[i].update();
        FIREWORKS.rockets[i].render(context);

        // calculate distance with Pythagoras
        var distance = Math.sqrt(Math.pow(FIREWORKS.width - FIREWORKS.rockets[i].pos.x, 2) + Math.pow(FIREWORKS.height - FIREWORKS.rockets[i].pos.y, 2));

        // random chance of 1% if rockets is above the middle
        var randomChance = FIREWORKS.rockets[i].pos.y < (FIREWORKS.height * 2 / 3) ? (Math.random() * 100 <= 1) : false;

/* Explosion rules
             - 80% of screen
            - going down
            - close to the mouse
            - 1% chance of random explosion
        */
        if (FIREWORKS.rockets[i].pos.y < FIREWORKS.height / 5 || FIREWORKS.rockets[i].vel.y >= 0 || distance < 50 || randomChance) {
            FIREWORKS.rockets[i].explode();
        } else {
            existingRockets.push(FIREWORKS.rockets[i]);
        }
    }

    FIREWORKS.rockets = existingRockets;

    var existingParticles = [];

    for (var i = 0; i < FIREWORKS.particles.length; i++) {
        FIREWORKS.particles[i].update();

        // render and save particles that can be rendered
        if (FIREWORKS.particles[i].exists()) {
            FIREWORKS.particles[i].render(context);
            existingParticles.push(FIREWORKS.particles[i]);
        }
    }

    // update array with existing particles - old particles should be garbage collected
    FIREWORKS.particles = existingParticles;

    while (FIREWORKS.particles.length > FIREWORKS_CONFIG.particles) {
        FIREWORKS.particles.shift();
    }

    if (FIREWORKS.animating)
      window.requestAnimationFrame(draw);
}

function Particle(pos) {
    this.pos = {
        x: pos ? pos.x : 0,
        y: pos ? pos.y : 0
    };
    this.vel = {
        x: 0,
        y: 0
    };
    this.shrink = .97;
    this.size = 2;

    this.resistance = 1;
    this.gravity = 0;

    this.flick = false;

    this.alpha = 1;
    this.fade = 0;
    this.color = 0;
}

Particle.prototype.update = function() {
    // apply resistance
    this.vel.x *= this.resistance;
    this.vel.y *= this.resistance;

    // gravity down
    this.vel.y += this.gravity;

    // update position based on speed
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    // shrink
    this.size *= this.shrink;

    // fade out
    this.alpha -= this.fade;
};

Particle.prototype.render = function(c) {
    if (!this.exists()) {
        return;
    }

    c.save();

    c.globalCompositeOperation = 'lighter';

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(255,255,255," + this.alpha + ")");
    gradient.addColorStop(0.8, "hsla(" + this.color + ", 100%, 50%, " + this.alpha + ")");
    gradient.addColorStop(1, "hsla(" + this.color + ", 100%, 50%, 0.1)");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();

    c.restore();
};

Particle.prototype.exists = function() {
    return this.alpha >= 0.1 && this.size >= 1;
};

function Rocket(x) {
    Particle.apply(this, [{
        x: x,
        y: FIREWORKS.height}]);

    this.explosionColor = 0;
}

Rocket.prototype = new Particle();
Rocket.prototype.constructor = Rocket;

Rocket.prototype.explode = function() {
    var count = Math.random() * 10 + 80;

    for (var i = 0; i < count; i++) {
        var particle = new Particle(this.pos);
        var angle = Math.random() * Math.PI * 2;

        // emulate 3D effect by using cosine and put more particles in the middle
        var speed = Math.cos(Math.random() * Math.PI / 2) * 25;

        particle.vel.x = Math.cos(angle) * speed;
        particle.vel.y = Math.sin(angle) * speed;

        particle.size = 10;

        particle.gravity = 0.05;
        particle.resistance = 0.92;
        particle.shrink = Math.random() * 0.05 + 0.93;

        particle.flick = true;
        particle.color = this.explosionColor;

        FIREWORKS.particles.push(particle);
    }
};

Rocket.prototype.render = function(c) {
    if (!this.exists()) return;
    c.save();

    c.globalCompositeOperation = 'lighter';

    var x = this.pos.x,
        y = this.pos.y,
        r = this.size / 2;

    var gradient = c.createRadialGradient(x, y, 0.1, x, y, r);
    gradient.addColorStop(0.1, "rgba(80, 80, 80 ," + this.alpha + ")");
    gradient.addColorStop(1, "rgba(0, 0, 0, " + this.alpha + ")");

    c.fillStyle = gradient;

    c.beginPath();
    c.arc(this.pos.x, this.pos.y, this.flick ? Math.random() * this.size / 2 + this.size / 2 : this.size, 0, Math.PI * 2, true);
    c.closePath();
    c.fill();

    c.restore();
};
