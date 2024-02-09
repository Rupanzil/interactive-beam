// import calculateDeflectionUDL from "./deflection.mjs";


// Global Variables
const lineWeight = 1;
const lineColor = 255;
const deflectedShapeWeight = 2
const gridColorMinor = 55;
const gridColorMajor = 100;
// 10px = 0.1m
const gridSpacingMinor = 10;
const gridSpacingMajor = 100;
const canvasSizeX = 500;
const canvasSizeY = 500;
// number of minor grids
let minorGrids, majorGrids;
minorGrids = canvasSizeX / gridSpacingMinor;
majorGrids = canvasSizeX / gridSpacingMajor;

// Storing the plot points
// let plotPoints = [];

// for beamLengthSlider
let beamLengthSlider;

function setup() {
  const mainElement = document.querySelector('main');
  let mainContainerDiv = createDiv().parent(mainElement);
  mainContainerDiv.addClass('main-container')

  createCanvas(canvasSizeX,canvasSizeY).parent(mainContainerDiv)

  let sliderContainerDiv = createDiv().parent(mainContainerDiv);
  sliderContainerDiv.addClass('sliders')

  beamLengthSlider = createSlider(10,500, 200, 10).parent(sliderContainerDiv);
  beamLengthSlider.addClass('slider')
  createP('Beam Length').parent(sliderContainerDiv);
  beamLengthSlider.input(updateCanvas);

  loadSlider = createSlider(0,100, 10, 1).parent(sliderContainerDiv);
  loadSlider.addClass('slider')
  createP('Adjust UDL').parent(sliderContainerDiv);
  loadSlider.input(updateCanvas);

  elasticModulusSlider = createSlider(50,400, 200, 1).parent(sliderContainerDiv);
  elasticModulusSlider.addClass('slider')
  createP('Adjust Elastic Modulus').parent(sliderContainerDiv);
  elasticModulusSlider.input(updateCanvas);

  MOISlider = createSlider(1000,50000, 10000, 100).parent(sliderContainerDiv);
  MOISlider.addClass('slider')
  createP('Adjust Moment of Inertia').parent(sliderContainerDiv);
  MOISlider.input(updateCanvas);

  deflectionScaleSlider = createSlider(500,10000, 1000, 10).parent(sliderContainerDiv);
  deflectionScaleSlider.addClass('slider')
  createP('Adjust deflection scale').parent(sliderContainerDiv);
  deflectionScaleSlider.input(updateCanvas);
}

function updateCanvas() {
  redraw();   // Redraws the canvas when beam length changes
}

// Create a grid which displays scale
function drawGrid() {

  // drawing minor grids in x-direction
  stroke(gridColorMinor)
  strokeWeight(lineWeight)
  for (let i = 0; i < minorGrids; i++) {
    let yPostion = i * gridSpacingMinor;
    line(0, yPostion, canvasSizeX, yPostion)
  }

  // drawing minor grids in y-direction
  stroke(gridColorMinor)
  strokeWeight(lineWeight)
  for (let i = 0; i < minorGrids; i++) {
    let xPostion = i * gridSpacingMinor;
    line(xPostion, 0, xPostion, canvasSizeY)
  }

  // Drawing major grid in X-direction
  stroke(gridColorMajor)
  strokeWeight(lineWeight)
  for (let i = 0; i < majorGrids; i++) {
    let yPostion = i * gridSpacingMajor;
    line(0, yPostion, canvasSizeX, yPostion)
  }

  // drawing major grids in y-direction
  stroke(gridColorMajor)
  strokeWeight(lineWeight)
  for (let i = 0; i < majorGrids; i++) {
    let xPostion = i * gridSpacingMajor;
    line(xPostion, 0, xPostion, canvasSizeY)
  }
}

function displayLength(beamLength) {
  fill(255)
  strokeWeight(0)
  textSize(18)
  text(`Beam length: ${beamLength/100} m `, 175, 320)
}

// Display the UDL value on screen
function displayUDL(load) {
  fill(255)
  strokeWeight(0)
  textSize(18)
  text(`UDL: ${(load /10).toFixed(1) } kN/m `, 175, 340)
}

// Displays the total load on screen
function displayTotalLoad( beamLength, loadValue) {
  let actualBeamLength = beamLength/100;
  let actualLoad = loadValue / 10;
  let totalLoad = actualBeamLength * actualLoad;
  text(`Total Load: ${(totalLoad).toFixed(1) } kN `, 175, 360)

}

// Displays the elastic modulus on screen
function displayElasticModulus(E) {
  text(`Elastic Modulus: ${(E).toFixed(1) } GPa `, 175, 380)
}

// Displays the Moment of Inertia on screen
function displayMOI(I) {
  let displayText = `Moment of Inertia: ${(I).toExponential(2) } mm `
  text(displayText, 175, 400)
  let textDisplayWidth = textWidth(displayText)
  textSize(14)
  text(`4`, textDisplayWidth + 170, 390)
}

function displayDeflection(deflection) {
  // stroke(255)
  fill(255)
  strokeWeight()
  textSize(18)
  text(`Beam deflection at mid-point : ${(deflection * 100).toFixed(3)} mm`, 100,100)
}

// Creates a pinned support at the starting position of the beam
function createPinnedSupport(beamStartPos) {
  // Draw the pinned support geometry using triangle
  let triangleYPos = canvasSizeX/2;
  fill(150)
  triangle(beamStartPos, triangleYPos, beamStartPos - 10, triangleYPos + 15, beamStartPos + 10, triangleYPos + 15);
}

// Creates a roller support at the end of the beam
function createRollerSupport(beamEndPos) {
  let diameter = 15;
  let circleXPos = beamEndPos;
  let circleYPos = canvasSizeY/2 + diameter/2 ;
  fill(255,0,255)
  ellipse(circleXPos,circleYPos,diameter)
}

// Creates the load on the beam;
function createLoad(load, beamStartPos, beamLength) {
  fill(132, 31, 39);
  stroke(255)
  let posY = canvasSizeY/2 - 3 - load;
  rect(beamStartPos, posY, beamLength, load)
}

  // Calculations for deflections
  /*
  Mid-point deflection of a simply supported beam having UDL over
  its whole length is equal to (5/384) * (w*l^4) / (EI)
  where, 
  w: load per unit length
  l: length of the beam
  E: Elastic modulus
  I: Moment of Inertia
  */
  function calculateDeflectionUDL( loadValue, beamLength, E, I) {
    const deflection = (5/384) * (loadValue * beamLength ** 4) / ( E * I)
    return deflection;
  }
  
function draw() {
  background(60)
  drawGrid();

  // Create a beam
  let beamLength = beamLengthSlider.value();
  strokeWeight(5)
  stroke(200)
  let beamStartPos = canvasSizeX/2 - beamLength/2
  let beamEndPos = canvasSizeX/2 + beamLength/2;
  line(beamStartPos, canvasSizeY/2, beamEndPos, canvasSizeY/2)

  // Displays the beam length
  displayLength(beamLength)

  // Create pinned support
  createPinnedSupport(beamStartPos);

  // Create a roller support
  createRollerSupport(beamEndPos);

  // Create a loadSlider
  let loadValue = loadSlider.value();

  // Create load shape
  createLoad(loadValue, beamStartPos, beamLength)

  // Display unit load on screen
  displayUDL(loadValue)

  // Display the total load
  displayTotalLoad( beamLength, loadValue)

  //Display elastic Modulus value
  let E = elasticModulusSlider.value();
  displayElasticModulus(E);

  //Display MOI value
  let I = MOISlider.value();
  displayMOI(I);

  // Create deflected shape
  // console.log(loadValue);
  let loadValueInKN = loadValue/10;
  let beamLengthinMeter = beamLength/100
  // console.log(`Beam Length: ${loadValueInKN}`);
  deflection = calculateDeflectionUDL(loadValueInKN, beamLengthinMeter, E * 10 ** 9, I / 10 ** 12)
  // console.log(deflection);
  noFill();
  stroke(255)
  strokeWeight(deflectedShapeWeight);
  let deflectionScale = deflectionScaleSlider.value();
  arc(250, 250, beamLength, deflection*100*deflectionScale, 0, PI);

  // display deflection
  displayDeflection(deflection)

  //Add labels to sliders
  // Improve Styling of sliders
  // add css to the page
  // add footer including links
}
