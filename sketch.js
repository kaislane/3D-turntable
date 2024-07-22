// RECURSOS //
let turntable, needle, sticker, stickerPlay, stickerStop, stickerRate;

// BOTONES //
let buttonPlayPressed = false;
let buttonStopPressed = false;
let switchRatePressed = false;
let buttonRadius = 80; // Radio de los botones

let buttonX = 730; // Posición X de los botones

let buttonY = -50; // Posición Y de los botones
let switchY = -50; // Posición Y del switch de velocidad

let buttonPlayOriginalY = buttonY; // Posición Y original del botón Play
let buttonPlayTargetY = buttonY; // Posición Y objetivo del botón Play, para hacer un lerp
let buttonStopOriginalY = buttonY; // Posición Y original del botón Stop
let buttonStopTargetY = buttonY; // Posición Y objetivo del botón Stop, para hacer un lerp

let buttonPlayZ = 86;
let buttonStopZ = 343;
let switchRateZ = 600;

let switchRotate = 0; // Ángulo de rotación del switch

let rotationAngle = 0; // Ángulo de rotación del vinilo y de la pegatina
let rotationSpeed = 0; // Velocidad de rotación actual
let targetSpeed = 0; // Velocidad objetivo de rotación

// CANCIÓN Y VELOCIDAD DE REPRODUCCIÓN //
let song;
let fft;
let waveformPrevious = [];
let smoothedWaveform = [];

let originalRate = 1.0; // Velocidad original
let increasedRate = 1.25; // Velocidad aumentada
let targetRate = originalRate; // Velocidad objetivo
let currentRate = originalRate; // Velocidad actual

// --- //

function preload() {
  turntable = loadModel('./assets/tocadiscos.obj', true);
  needle = loadModel('./assets/aguja.obj', true);
  sticker = loadImage('./assets/sticker.png');
  stickerPlay = loadImage('./assets/sticker_play.png');
  stickerStop = loadImage('./assets/sticker_stop.png');
  stickerRate = loadImage('./assets/sticker_rate.png');
  song = loadSound('./assets/Kavinsky_Nightcall.mp3');
}

// SETUP //

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);

  angleMode(DEGREES);

  fft = new p5.FFT(0.5, 128);

  // Inicializo los arrays con ceros;
  for (let i = 0; i < fft.waveform().length; i++) {
    waveformPrevious[i] = 0;
    smoothedWaveform[i] = 0;
  }

  // Creo la cámara;
  let cam = createCamera();

  // Posiciono la cámara para la vista isométrica;
  cam.setPosition(500, -500, 500);
  // cam.setPosition(0, -500, 1); // Vista superior;
  // cam.setPosition(0, 1, 500); // Vista lateral;
  cam.lookAt(0, 0, 0);

  // Configuro la perspectiva ortogonal;
  orthoView();
}

// DRAW //

function draw() {
  background(31, 30, 28);

  // Desactivo el contorno;
  noStroke();

  // Configuro el "blend" para mantener la transparencia de los stickers;
  let gl = this._renderer.GL;
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  // LUCES //
  directionalLight(200, 200, 200, 0, 300, -100); // Luz difusa;
  pointLight(0, 0, 255, -1500, 100, 0); // Luz azul;

  // ONDA DE SONIDO //
  let waveform = fft.waveform();

  // Suavizo la transición entre los valores actuales y los anteriores;
  for (let i = 0; i < waveform.length; i++) {
    smoothedWaveform[i] = lerp(waveformPrevious[i], waveform[i], 0.1);
    waveformPrevious[i] = smoothedWaveform[i];
  }

  // Dibujo el círculo concéntrico al vinilo que cambia con la onda de sonido;
  push();
  noFill();
  stroke(255);
  strokeWeight(1);

  translate(-120, -115, 0); // Ajusto el centro del círculo;
  rotateY(90);

  for (let t = -1; t <= 1; t += 2) {
    beginShape();
    for (let i = 0; i <= 180; i++) { // Dibujo medio círculo y lo completo con su reflejo;
      let index = floor(map(i, 0, 180, 0, smoothedWaveform.length - 1));
      let r = map(smoothedWaveform[index], -1, 1, 200, 700);
      let x = r * sin(i) * t;
      let z = r * cos(i);
      vertex(x, 0, z); // Lo dibujo en el plano XZ;
    }
    endShape();
  }

  pop();

  // MODELO 3D DEL TOCADISCOS //

  // Cilíndro metálico del centro del plato;
  push();
  fill(255);
  specularMaterial(150);
  translate(-120, -100, 0);
  cylinder(15, 80, 60, 3);
  pop();

  // BOTONES //

  // Botón play;
  push();
  fill(31, 30, 28);
  specularMaterial(40);
  translate(buttonX, buttonPlayTargetY, buttonPlayZ);
  cylinder(buttonRadius, 20, 60, 3);
  pop();

  // Textura del botón play;
  push();
  texture(stickerPlay);
  specularMaterial(100);
  translate(buttonX, buttonPlayTargetY - 11, buttonPlayZ);
  rotateX(90);
  plane(buttonRadius);
  pop();

  // Botón stop;
  push();
  fill(31, 30, 28);
  specularMaterial(40);
  translate(buttonX, buttonStopTargetY, buttonStopZ);
  cylinder(buttonRadius, 20, 60, 3);
  pop();

  // Textura del botón stop;
  push();
  texture(stickerStop);
  specularMaterial(100);
  translate(buttonX, buttonStopTargetY - 11, buttonStopZ);
  rotateX(90);
  plane(buttonRadius);
  pop();

  // Switch de velocidad (33 o 45);
  push();
  fill(31, 30, 28);
  specularMaterial(40);
  translate(buttonX, switchY, switchRateZ);
  cylinder(buttonRadius, 20, 60, 3);
  pop();

  // Textura del switch de velocidad;
  push();
  texture(stickerRate);
  specularMaterial(100);
  translate(buttonX, switchY - 11, switchRateZ);
  rotateX(90);
  rotateZ(switchRotate);
  plane(buttonRadius);
  pop();

  // VINILO //

  // Actualizo el ángulo de rotación dependiendo de la velocidad;
  rotationAngle += rotationSpeed;

  // Vinilo;
  push();
  fill(0, 0, 255);
  specularMaterial(100);
  translate(-120, -100, 0);
  rotateY(rotationAngle);
  cylinder(640, 10, 60, 3);
  pop();

  // Pegatina del vinilo;
  push();
  texture(sticker);
  specularMaterial(100);
  translate(-120, -107, 0);
  rotateX(90);
  rotateZ(rotationAngle);
  plane(460);
  pop();

  // TOCADISCOS //

  // Plato metálico;
  push();
  fill(255);
  specularMaterial(150);
  translate(-120, -70, 0);
  cylinder(660, 40, 60, 3);
  pop();

  // Importo el modelo 3D de la aguja en obj;
  // NOTA: He intentado mover el origen de coordenadas de la aguja para poder controlar su rotación cuando la canción está en play o stop, pero no lo he conseguido...
  push();
  fill(31, 30, 28);
  specularMaterial(40);
  scale(5);
  translate(82, -29, -10);
  rotateZ(180);
  rotateY(200);
  model(needle);
  pop();

  // Importo el modelo 3D del tocadiscos en obj;
  push();
  fill(31, 30, 28);
  specularMaterial(40);
  scale(9);
  rotateY(180);
  rotateZ(180);
  translate(0, -5, 0);
  model(turntable);
  pop();

  // SUAVIZADO DE LOS BOTONES, LA VELOCIDAD DE LA CANCIÓN Y LA ROTACIÓN DEL VINILO //

  // Suavizo el movimiento de los botones al pulsarlos;
  buttonPlayTargetY = lerp(buttonPlayTargetY, buttonPlayPressed ? buttonPlayOriginalY + 10 : buttonPlayOriginalY, 0.3);
  buttonStopTargetY = lerp(buttonStopTargetY, buttonStopPressed ? buttonStopOriginalY + 10 : buttonStopOriginalY, 0.3);

  // Suavizo la transición de la velocidad de reproducción;
  currentRate = lerp(currentRate, targetRate, 0.05); // Lerp entre la velocidad actual y la velocidad objetivo;
  song.rate(currentRate); // Aplico la nueva velocidad;

  // Suavizo la transición de la velocidad de rotación;
  rotationSpeed = lerp(rotationSpeed, targetSpeed, 0.05);
}

// CONTROLES DEL TOCADISCOS //

function mousePressed() {
  let positionPlay = getScreenPosition(buttonX, buttonPlayOriginalY, buttonPlayZ);
  let positionStop = getScreenPosition(buttonX, buttonStopOriginalY, buttonStopZ);
  let positionRate = getScreenPosition(buttonX, switchY, switchRateZ);

  // Botón PLAY //
  if (dist(mouseX, mouseY, positionPlay.x, positionPlay.y) < buttonRadius / 2) {
    buttonPlayPressed = true;
    targetSpeed = switchRatePressed ? 2 : 1;
    if (!song.isPlaying()) {
      song.play();
    }

    // Botón STOP //
  } else if (dist(mouseX, mouseY, positionStop.x, positionStop.y) < buttonRadius / 2) {
    buttonStopPressed = true;
    targetSpeed = 0;
    if (song.isPlaying()) {
      song.stop();
    }

    // Switch VELOCIDAD //
  } else if (dist(mouseX, mouseY, positionRate.x, positionRate.y) < buttonRadius / 2) {
    switchRatePressed = !switchRatePressed; // Alterno el estado del switch;
    targetRate = switchRatePressed ? increasedRate : originalRate; // Cambio la velocidad;
    switchRotate = switchRatePressed ? 45 : 0; // Roto el switch 45 grados;
    if (song.isPlaying()) {
      targetSpeed = switchRatePressed ? 2 : 1;
    }
  }
}

function mouseReleased() {
  buttonPlayPressed = false;
  buttonStopPressed = false;
}

// Utilizo "glMatrix" para pasar de la posición 3D del botón a coordenadas 2D;
function getScreenPosition(x, y, z) {
  let globalPos = createVector(x, y, z);
  let viewMatrix = _renderer.uMVMatrix.mat4;
  let projectionMatrix = _renderer.uPMatrix.mat4;

  let mvpMatrix = mat4.create();
  mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);

  let pos4D = vec4.fromValues(globalPos.x, globalPos.y, globalPos.z, 1);
  vec4.transformMat4(pos4D, pos4D, mvpMatrix);

  let screenPos = createVector(pos4D[0] / pos4D[3], pos4D[1] / pos4D[3], pos4D[2] / pos4D[3]);
  screenPos.x = map(screenPos.x, -1, 1, 0, width);
  screenPos.y = map(screenPos.y, -1, 1, height, 0);

  return screenPos;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  orthoView();
}

// Actualizo la vista ortogonal al cambiar el tamaño de la ventana;
function orthoView() {
  let dis = 1000;
  let aspect = windowWidth / windowHeight; // Calcula la relación de aspecto del canvas
  ortho(-dis * aspect, dis * aspect, -dis, dis, -dis * 2, dis * 2);
}
