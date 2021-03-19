// let palette = [];
// function addToPalette(swatch) {
//     palette.push(swatch)
//     // if (pallete.includes(swatch)) {
//     //     //nada
//     // } else {
//     //     palette.push(swatch)
//     // }
// }
// function removeFromPalette(swatch) {
//     palette.splice(palette.indexOf(swatch), 1)
// }
//ICEBOX: This whole thing might be even cooler migrated to offscreen canvas api 
window.addEventListener('DOMContentLoaded', (event) => {
    const $swatches = document.getElementById('swatches')
    const $image = document.getElementById('image')
    const $palette = document.getElementById("palette")
    const $paints = document.getElementById("paints")
    const postPort = chrome.runtime.connect({ name: "imagePlease" })
    //internal palette model
    let palette = [];
    function addToPalette(swatch) {
        palette.push(swatch)
        update$Palette()
        // bobRossSpeaks() //I dont' know if this is really a feature, but it was fun
    }
    function removeFromPalette(swatch) {
        palette.splice(palette.indexOf(swatch), 1)
        update$Palette()
    }
    function update$Palette() {
        postPort.postMessage({ palette: palette, sourceHref: sourceHref })
        $paints.innerHTML = ""
        palette.forEach(color => {
            const swatch = document.createElement("button")
            swatch.style.backgroundColor = color
            $paints.appendChild(swatch)
        })
    }
    // http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
    // https://www.base64-image.de/
    var image = new Image();
    var sourceHref = "";
    image.onload = function () {
        var canvas = document.createElement('canvas');
        //canvas.style.position = "absolute"
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        $image.appendChild(canvas)
        const painters = document.createElement("img")
        //$palette = painters
        painters.src = "/images/palette.png"
        painters.width = "200px"
        $palette.appendChild(painters)
        $palette.style.zIndex = 1
        $palette.style.position = "absolute"
        $palette.style.top = `${parseInt(image.height / 4)}px`
        $palette.style.left = `${parseInt(image.width / 4)}px`
        painters.style.height = `${parseInt(image.height / 2)}px`
        painters.style.width = `${parseInt(image.width / 2)}px`
        $paints.style.height = `${parseInt(image.height / 4)}px`
        $paints.style.width = `${parseInt(image.width / 4)}px`
        $paints.style.top = `${parseInt(image.height / 8)}px`
        $paints.style.left = `${parseInt(image.width / 8)}px`
        $image.height = `${image.height}px`
        $palette.appendChild(painters)
        context.drawImage(image, 0, 0);

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        //https://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hexadecimal-in-javascript#:~:text=As%20the%20accepted%20answer%20states,toString(16)%20work%20correctly.
        function rgb2hex(r, g, b) {
            // if (g !== undefined)
            return Number(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).substring(1);
            // else
            //     return Number(0x1000000 + r[0] * 0x10000 + r[1] * 0x100 + r[2]).toString(16).substring(1);
        }

        const dataObject = {}
        // Now you can access pixel data from imageData.data.
        // It's a one-dimensional array of RGBA values.
        // Here's an example of how to get a pixel's color at (x,y)
        for (let y = 0; y < imageData.height; y++) {
            for (let x = 0; x < imageData.width; x++) {
                var index = (y * imageData.width + x) * 4;
                var red = imageData.data[index];
                var green = imageData.data[index + 1];
                var blue = imageData.data[index + 2];
                //var alpha = imageData.data[index + 3];
                var hexcolor = rgb2hex(red, green, blue)
                if (dataObject[hexcolor]) {
                    dataObject[hexcolor] += 1
                } else {
                    dataObject[hexcolor] = 1
                }
                if (x % 101 == 0) {
                    //console.log(hexcolor)
                }
                //console.log([index, red, green, blue, alpha])
            }
        }
        console.log(dataObject)
        console.log(`we analyzed ${imageData.height * imageData.width} pixels`)
        const sortArray = []
        for (key in dataObject) {
            sortArray.push({ count: dataObject[key], key: `#${key}` })
        }
        sortArray.sort((a, b) => a.count < b.count ? 1 : -1)
        console.log(sortArray.length)
        const top500 = sortArray.slice(0, 500)

        postPort.postMessage({
            analysis: {
                href: sourceHref,
                top500,
                source: image.src,
                dimensions: [imageData.width, imageData.height],
                length: sortArray.length,
                when: Date.now()
            }
        })
        console.log('did we send the message?')

        top500.forEach(color => {
            // console.log(color)
            const swatch = document.createElement("button")
            swatch.classList.add("swatch")
            swatch.dataset.swatch = color.key
            swatch.style.backgroundColor = color.key
            $swatches.appendChild(swatch)
        })

        $swatches.addEventListener("click", (event) => {
            if (event.target.classList.contains('swatch')) { // Step 3
                console.log(event.target.dataset.swatch);
                const swatch = event.target.dataset.swatch
                if (event.target.classList.contains("selected")) {
                    //remove from palette
                    removeFromPalette(swatch)
                    event.target.classList.remove("selected")
                } else {
                    //add to palette
                    addToPalette(swatch)
                    event.target.classList.add("selected")
                }
                //paletteToggle(color)
            }
        })
    };
    postPort.postMessage({ gimme: "data" })
    postPort.onMessage.addListener(function (msg) {
        console.log(msg)
        if (msg.data) {
            image.src = msg.data
            sourceHref = msg.href
            console.log("loading image source", msg.href)
        }
    })

    function bobRossSpeaks() {
        const randomQuote = bobross[Math.floor(Math.random() * bobross.length)]
        console.log(randomQuote)
        var utterance = new SpeechSynthesisUtterance();
        utterance.text = randomQuote;

        // optional parameters
        utterance.lang = 'en-GB'; // if bob ross were a british computer
        utterance.volume = 0.2;   // he wouldn't overwhelm with volume
        utterance.rate = 0.7; //  cause he's chill
        window.speechSynthesis.speak(utterance);

        // postPort.postMessage({ rossMe: randomQuote })
    }
})