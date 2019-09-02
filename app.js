var uploadImage = document.getElementById('uploadImage');
var uploadedImage = document.getElementById('uploadedImage');
var btnGrayscale = document.getElementById('btnGrayScale');
var btnOtsu = document.getElementById('btnOtsu');
var myCanvas = document.getElementById('myCanvas');
var otsuCanvas = document.getElementById('otsuCanvas');
var canvasContext;
var imgData;
var pixels = [];
var histArr = [];

uploadImage.addEventListener('change', () =>{
    if(uploadImage.files[0]){
        uploadedImage.src = URL.createObjectURL(uploadImage.files[0]);
    }
    else{
        uploadedImage.src = "";
    }
});

btnGrayscale.addEventListener('click', () => {
    let cumilativeCount = 0;
    let grayscaleValue = 0;
    myCanvas.width = uploadedImage.width;
    myCanvas.height = uploadedImage.height;
    canvasContext = myCanvas.getContext("2d");
    canvasContext.drawImage(uploadedImage,0,0, myCanvas.width, myCanvas.height);
    imgData = canvasContext.getImageData(0, 0, myCanvas.width, myCanvas.height);
    console.log(imgData);
    for(let i=0;i<imgData.data.length;i+=4){
        grayscaleValue = Math.trunc((imgData.data[i] + imgData.data[i+1] + imgData.data[i+2])/3);
        imgData.data[i] = grayscaleValue;
        imgData.data[i+1] = grayscaleValue;
        imgData.data[i+2] = grayscaleValue;
        imgData.data[i+3] = 255;
        pixels.push(new PixelOfImage(cumilativeCount++,grayscaleValue));
    }
    canvasContext.putImageData(imgData,0,0);
})

btnOtsu.addEventListener('click', () => {
    getHistogram();
    let otsuThreshold = getBestThresholdAccordingToOtsu();
    console.log(otsuThreshold);
    debugger;
    for(let i=0;i<pixels.length;i++){
        if(pixels[i].intensity<otsuThreshold){
            imgData.data[4*i] = 0;
            imgData.data[4*i+1] = 0;
            imgData.data[4*i+2] = 0;
        }
        else{
            imgData.data[4*i] = 255;
            imgData.data[4*i+1] = 255;
            imgData.data[4*i+2] = 255;
        }
        imgData.data[4*i+3] = 255;
    }
    otsuCanvas.width = uploadedImage.width;
    otsuCanvas.height = uploadedImage.height;
    canvasContext = otsuCanvas.getContext("2d");
    canvasContext.putImageData(imgData,0,0);
});

class PixelOfImage{
    constructor(position,intensity){
        this.position = position;
        this.intensity = intensity;
    }
}

function getHistogram() {
    for(let i=0;i<256;i++){
        histArr[i] = 0;
    }
    pixels.forEach((val) => {
        histArr[val.intensity] = histArr[val.intensity]+1;
    });
    console.log(histArr);
}

function getBestThresholdAccordingToOtsu(){
    debugger;
    let bestThreshold = -1;
    let bestInBetweenVariance = 0;
    let curInBetweenVariance;
    let arr1 = [];
    let arr2 = [];
    let mean1;
    let mean2;
    let weight1;
    let weight2;
    histArr.forEach((hist,ind) => {
        if(ind!=histArr.length-1) {
            arr1 = histArr.slice(0,ind+1);
            arr2 = histArr.slice(ind+1,histArr.length);
            weight1 = getWeight(arr1);
            weight2 = getWeight(arr2);
            mean1 = getMean(arr1,0);
            mean2 = getMean(arr2,arr1.length);
            curInBetweenVariance = weight1 * weight2 * (mean1 - mean2) * (mean1 - mean2);
            if(curInBetweenVariance > bestInBetweenVariance){
                bestInBetweenVariance = curInBetweenVariance;
                bestThreshold = ind;
            }
        }
    });
    return bestThreshold;
}

function getWeight(arr){
    var sum = 0;
    for (var i = 0; i < arr.length; i++) {
        sum += arr[i]
    }
    return sum/pixels.length;
}

function getMean(arr,backGroundStart){
    var mean = 0;
    var sum = 0;
    arr.forEach((ele,idx) => {
        mean = mean + (ele * (backGroundStart + idx));
        sum += ele;
    });
    return mean/sum;
}