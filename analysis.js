//ICEBOX: This whole thing might be even cooler migrated to offscreen canvas api 
window.addEventListener('DOMContentLoaded', (event) => {
    const $swatches = document.getElementById('swatches')
    const $image = document.getElementById('image')
    var postPort = chrome.runtime.connect({ name: "imagePlease" })
    // http://stackoverflow.com/questions/3528299/get-pixel-color-of-base64-png-using-javascript
    // https://www.base64-image.de/
    var image = new Image();
    var sourceHref = "";
    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;

        var context = canvas.getContext('2d');
        $image.appendChild(canvas)
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

        top500.forEach(color => {
            // console.log(color)
            const swatch = document.createElement("button")
            swatch.classList.add("swatch")
            swatch.dataset.swatch = color.key
            swatch.style.backgroundColor = color.key
            $swatches.appendChild(swatch)
        })
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
        $swatches.addEventListener("click", (event) => {
            if (event.target.classList.contains('swatch')) { // Step 3
                console.log(event.target.dataset.swatch);
                const color = event.target.dataset.swatch
                event.target.classList.toggle("selected")
                //paletteToggle(color)
            }
        })
        console.log('did we send the message?')
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
    // image.src = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAEcAbwBvAGcAbABlAC8AUwBrAGkAYQAvAEIANQA0ADgARAA5ADEAMQAzADcAMwA4ADgARgBFADIAMgBFADYANQBEADMAQwBFADcAMwAwADcAMgBGADQAM1hZWiAAAAAAAABxUgAAN98AAAFAWFlaIAAAAAAAAGBsAAC/sQAADR5YWVogAAAAAAAAJRcAAAhwAADEznBhcmEAAAAAAAQAAAAB9gQAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMAAwICAwICAwMDAwQDAwQFCAUFBAQFCgcHBggMCgwMCwoLCw0OEhANDhEOCwsQFhARExQVFRUMDxcYFhQYEhQVFP/bAEMBAwQEBQQFCQUFCRQNCw0UFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFP/AABEIBEMEHwMBIgACEQEDEQH/xAAeAAEAAAcBAQEAAAAAAAAAAAAAAgMEBQYHCAEJCv/EAGsQAAECBQICBgQGBxANCgUCBwECAwAEBQYREiEHMQgTIjJBURQjYXEVFkKBkaEJJDNicsHhGSU2N1JWZIKDo6Wxs7TR1BcmNDhDVXaFlKK10vA1R1Njc4SSlbLEGFd0deLxRsNEk1Rlwif/xAAcAQEAAgIDAQAAAAAAAAAAAAAAAQIDBAUGBwj/xABKEQACAQIEAwMHCgQFAwIGAwAAAQIDEQQSITEFQVETImEGFjJTcZHRFBU1UnKBoaKxsjNCVJIjNoLB8DRi8XPhBxckJkOzg8LS/9oADAMBAAIRAxEAPwDLl+j4eKpKqqGpBB6zly3P3x/HHrjUuErX8HVRsJfT29fdB+bvH8cY+qoS6S+C7WCnrEOEHw5ds78z4e/nEU1U2x1qg5V0BLyVJUr5Cf1R37x/HzjgHEytmQESyVp/O6rZD+Oy5yGOQ++MeS6JcrZSKXVwRMqSdC+7z7I++8zGON1VsYKp2rJCZnOUju5zvz7xiempS7S2sTlab0zKuQ7mQeW/eP8ATFlEqX5tuVQZTVSqwT6Q4ghLnLvdhO3PzPsill2ZZbsmk0eqhHWOoUEuc+9hCdvDx90WdqpMIMtqm6y3pmHAcD7mDq2Tv3j4/PEtFUlW/RNMxVk4W4klI7gJOEp35nbPKMliC8yrLKvQkqpVTUnU6lRbcxr72Ep25DxjxqVl1mRIplWcLjbqVaV9877J25DxixSlSlCqUQZqrgp6xKktp7vPsp3+mPZeqy6TKoXP1YaUOApaHdG+EJ3+kxIK5aGOrkcyNUyphwKVq+6EZ2T96PGIWOoPo6+oqytcmsbHvkZ2H3o8Ys4qjClymahUSAwtKsJ7vPsJ35ecRpqjKmWc1afRiVWg4bPtwgb8vOJKle5MyvUt4+FSsySgfJZGeX3oiQ7NSxQrLtU0uSeTqHeUM/6o/FFAirIygqrU3kyZSQGuXPsDfl5n2xX0iSqFel5lySqE2+0xKJbdKGcgKUrSlsb8iSPriUgUK55lbbo9NqBzLDYp2Ud/oSIluVNCS5+es4Msjm2dz/uxldc4c3TbVMq1Qm1zbcpIyqG5pZl9m1KGQjnsMKGT7YwZdZKEuq+F21DqEpwWv9Uez2xNmCrm6iEmbKanNOEhG6m8aj7fYI9erAUqYCassaig+sb7x9vsihnqqpxU4W6skpUG8qLeAfZ7hEs1QgTiRUZZ4Eo76Ma/YPICIsC7KqagZk/DIXlxBALfePmfYImKqzh6z8+UKy8kkKR3vafYItjlTcWZkicklkqRnKe/+QRE5PvOLdPpEgrLqdsd/wDJEWBdV1depWKtLrzMhWVI733xj1uqO6k/nlJK+2tXbGM/fH2RZ3Jt4rX26e6TMA4AxqPn7ojQ+8tST1VOWTM5yTjV7fwYAvjFTfWpsJn6eftlSsLTjJ/VmK2RqUyhUoUzVNKkvLIKxyP6o/iEY4wt9TjWiXpzn2yop32UfM/exUyqphapf7QkFnrVq73ePmfvYqyyMgkp+YQqTAVS+wpagV/J++O8TZOdmUGSPVUpWELxqOyOW6vPMWKTS6kyShSpNaiVqGtzvcu0rbl5fPCXYedEsPgWWVpQtQKndjy7StvoiGDJpKYmtEtiQpOkMqIJV3OW59pitQia6tBFIpaCmX8XO6Pb7T4RiclKqLcsDbyFYYUoZf3/AAlbfRFSiU0oSn4tnV1GUkzPL749nn5RBJlIbmAFj4BpqcMgYLvcB8PwjFU5KPhLw+LEjgJQD6/cA47PLvHaMW9BTpXm2HAUtA/3RyHiTtziNcg1hwm2JlIATsJjcDb2d4xCjYGSPSTmt7FpSqu0hP8AdHdG3ZG3e/LtEmYkCVLBsxghTwQdEz/qjbn5/PFidk5ZLjw+LE8kpUjOJjujb2d4/jiFcrLayo23Uk+vHdmOQx4bd78sXSIZeBTEpcSDZjatUwUHRM88A9gbfSfZEDdMS8pjNnZ+2XEkIme9jPZG3h5+yLKJSVSpBNvVVAEwpJCH8kc8JG3Pz+eJSJZjMvih1dAL7iToe5c+yNufmfZE2IL8qnIxKAWigBbjmR6T2l4zty2Ai0pkdTsmPiwlxJ607P7LO/s2AijEuwj0PFv1PcuZUH918+yNuQ8fdFA2w056JijVIkoczpd73PYbch4xJBXpkUH0Um29eplw/d+/7eWwEURkEFDI+Lq1Eyi17Pd7n2+XIeUUqEMKDCRS6kslheQHOZ9nsEU2lhJTrp1SyZRR7K+fPf8ABESkCpXJp6tX5wPZEpnJd9/b5fV7Igckm1IeIoTw0y6Tnrf9c/0RRudQkOfaVU/uUHdf1/gxKdDRTMfatUR6lJ722f1R9kS0C4TEuy2mYHwLMIPVIOet3H30Sn5VtAm8UqaRgtkZd7vLf5/xxRzC2B6SrqKmFBKN1nlvzP4olzT7IU+kCpIOtGCo8uW5/FEAuDsuylbpNLm0gOI5L7ufxmJq2GErWBTJxHrwMdZnT7PeYthdb9afzyT65Pe8OXP2xGH2S4O1Ukn0j5x7PfCwLs22zrbHwbOgiYKcBfL2RE220pxkCnzn3ZSca/qi1MTUv1rGV1QDr1d0Ekez3xMk5xgvS+pdSwXFbIG/uHthYF5lEMj0XNPnslSxsvvewRMlSytEiPg+edylzsheNR22Hs/piyS041qkz19SwdYAT/EPxx7KzbR9Dy7UleqWeznflsPZ5xFgXyWTLqak/tGfSksrJwrdfLl7BEcqqXUhoGRqTh9FVvr5kePuEWiXnmtDWH6ltLK8O8fIfexGmfZQRqnKnj0TfCef/wCIiLEovrS2OqcxKVRSjKZA1bE/qj7BE9ZY6twehVYn0dKt1f6xixLqrTfXJanqooKlk5JTjUfM/exP+F2tMyBUKrq6tHyTuf1R9nsiGrFi8LWykTZcZrQIbQpOTsOXbMVSZmWSHcit6wUqzz05x2j7T5e2LEupNfbIVUqrnKDlaCf2x35eQicmrsoU6fhWptnrUkFbZyNu8ff4CKtA170v5qWc6Pd4tt/CqVhcoermfuY+2md1e0x82Y+iXS1qyJrgJdbQqk7MZdlvUPowP7qaOVHz8Y+dscjhlaD9pViOwuAf6UtC/d/5dyOPY+jXQFSlXDBGQD2Fcx+yH47Fwv8AjP2f7o4HjNXscNntezX+5Z4Qja9mJB4NXESBnrHd/wBoiO0HW6tTskna+qRqoNqUkqCSUjmQNhEMZ9Z8zWmrDuBuRk5d6nKDnpDrjmFo9WM6RnfbeL/wHfS3K1/UBhsNL39zn9EDFUrunGUrXt4mooR7zjaPARINYqmQD9rp5/hQMtap2VNztexq2EbE4N6Rfkxqx9wdxn8JMY6qgTdzXjUJGQShbyph5SQpQSMBR8YEdss7i9LK9zHYRnkrwXuSYSorblpcgkBLr26seI0gxTNcIrmdnHWDJIbDeMvLdSGznyPj9G3jAj5RR+sjDIRlNzcN63akp6VNstuSoICnmF6gknlkHBHvxiMWgZYTjUV4u6ERFtQSFFJCTyONo2tZsvJWhw5eulUk1OVFayGS8M6O3oGPLfJONzyzFoRxwuJLilKbkVpP+DUyrA+hWfrga/bTm2qcbpO29jX0IvLonr2uNxUtKJVOziyrqWBhION+Z2G3iYyT+wtcXVk/afWAZ6nr+3/Fj64GWVaELKbSZgUIrZ6jT1NqaqdMyzjc6lQR1OMqJPIDHPORjHOMwY4LXE60lS/RJdahs2492vdsCPrgTKrTgk5S3MDSkrICQST4CJ8pITE/ONSku0pyZcVoQ2OZPlGV0m3a3Z990yWEuw7UiOtZbU52FAhQ3I5clfRFe07PPcZJZdSZbl50zTfWNsq1JHYGMH3YgY5Vt8tmrX3MHqVMmqPOuSc4yqXmW8a21cxkAj6iIpYzTilLOznEmosMNqdecUyhCEDJUS0jAAiexwYuJ1tKnBKSy1cmnX+19QI+uBKrwUIym"
})