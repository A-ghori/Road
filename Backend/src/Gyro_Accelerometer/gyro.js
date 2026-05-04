
const pino = require('pino');
const logger = pino({
    transport: {
        target: "pino-pretty",
    }
});



let buffer = []
const MAX_SIZE = 5
let gravity = {x: 0, y:0, z:0}
const alpha = 0.95 // Assume value for smoothing factor for stable gravity 


// Remove Gravity
    function removeGravity(ax,ay,az){
    gravity.x = alpha * gravity.x + (1 - alpha) * ax;
    gravity.y = alpha * gravity.y + (1 - alpha) * ay;
    gravity.z = alpha * gravity.z + (1 - alpha) * az;


    return {
        x: ax - gravity.x,
        y: ay - gravity.y,
        z: az - gravity.z
    }
    }

    function getMagnitude(x, y, z){
    return  Math.sqrt(x*x + y*y + z*z);
    }
    
    function getVibration(magnitude){
    return  Math.abs(magnitude - 9.8);
    }

    // Smoothing
   
   function smooth(vibrationValue){
    buffer.push(vibrationValue);
    if(buffer.length > MAX_SIZE) buffer.shift();

    //const avg = buffer.reduce((a,b) => a + b , 0) / buffer.length;
    //return avg;
    //let avgScore = buffer.reduce((a,b) => a+b, 0) / buffer.length
    return Math.max(...buffer);


    //let score = 0;
//
//
    //// Fuzzy Logic
    //if(avgScore < 1.5){
    //    score = 0;
    //}
    //else if(avgScore <= 10){
    //    // LEVEL: LOW (Points allot: 0 to 30)
    //    // Formula: (Force / Max Low Force) * Points Allotted
    //    score = 0 + (avgScore / 10 ) * 30
    //}
    //else if(avgScore <= 20){
    //    // LEVEL: MEDIUM (Points allot: 30 to 70)
    //    // Pehle ke 30 points + is level ke points
    //score = 30 + ((avgScore - 10) / 10 ) * 40
    //}
    //else {
    //    score = 70 + ((avgScore - 20) / 10) * 30
    //}
    //
//
    //// Final Score 
//
    //const finalScore = Math.min(100, Math.max(0, Math.round(score)))
//
    //return {
    //    force : avgScore.toFixed(3),
    //    damageScore : finalScore
    //}
    }
    

   // Fuzzy Logic
   
   // For low damage (0-15)
   //(10 - 15)
// Low: 12 tak khatam ho jaye (Pehle 15 tha)
function low(x) {
    if (x <= 5) return 1; // 5 tak full confidence
    if (x >= 12) return 0;
    return (12 - x) / 7; 
}

// Medium: 5 se hi shuru ho jaye (Pehle 10 tha)
function medium(x) {
    if (x <= 5 || x >= 22) return 0;
    if (x <= 14) return (x - 5) / 9; // 5 to 14 up slope
    return (22 - x) / 8; // 14 to 22 down slope
}

   function high(x){
    if(x <= 18) return 0;
    if(x >= 25) return 1;
    return (x - 18) / 7; // 18 to 25 linear increase
   }

   // Winner Take All Logic
   function getFinalDecision(force){
    const lVal = low(force);
    const mVal = medium(force);
    const hVal = high(force);

    let scores = [
        
            {label: "Low", value: lVal},
            {label: "Medium", value: mVal},
            {label: "High", value: hVal}
        ];
        let winner = scores[0];
        for(let i=1; i<scores.length; i++){
            if(winner.value < scores[i].value){
                winner = scores[i]
            }
        }
        if(force < 1.5) return {label: "NONE", confidence:"0%"}
        
        return {
            label: winner.label,
            confidence: (winner.value * 100).toFixed(0)+ "%"
        }
    }




    // Main Engine

    function analyzeSensor(ax, ay, az){
        const linear = removeGravity(ax, ay, az);
        const magnitude = getMagnitude(linear.x, linear.y, linear.z);
        const vibration = getVibration(magnitude);
        const smoothVibration = smooth(vibration);
        const findalDecision = getFinalDecision(smoothVibration);

       logger.info({
        raw: {ax, ay, az},
        linear,
        magnitude: magnitude.toFixed(3),
        force: smoothVibration.toFixed(3),
        damageLevel: findalDecision.label,
        confidence: findalDecision.confidence
       }, "Sensor Processing Done")
       
       
        return {
            force: smoothVibration.toFixed(3),
            damageLevel: findalDecision.label,
            confidence: findalDecision.confidence
        }
    }
module.exports = { analyzeSensor };
