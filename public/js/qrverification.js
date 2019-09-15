window.addEventListener('load', function () {
    document.querySelector('input[type="file"]').addEventListener('change', function () {
        console.log("hi");
        if (this.files && this.files[0]) {
            var img = document.getElementById('uploadedImg');  // $('img')[0]
            console.log(img.height);
            var ctx = img.getContext("2d");
            img.src = URL.createObjectURL(this.files[0]); // set src to file url
            img.onload = imageIsLoaded; // optional onload event listener
            const jsQR = jsQR(ctx.getImageData(""), img.width, img.height);
            if (jsQR.data !== "") {
                console.log("", jsQR);
            }
        }
    });
});

function imageIsLoaded(e) { alert(e); }