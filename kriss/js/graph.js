function windowToCanvas(canvas, x, y) {
  var bbox = canvas.getBoundingClientRect();
  return { x: x - bbox.left * (canvas.width / bbox.width), y: y - bbox.top * (canvas.height / bbox.height) };
}
function CLIPBOARD_CLASS(canvas_id, autoresize) {
  var _self = this;
  var canvas = document.getElementById(canvas_id);
  var ctx = document.getElementById(canvas_id).getContext("2d");

  //handlers
  document.addEventListener('paste', function (e) { _self.paste_auto(e); }, false);
  canvas.onmousemove = function (e){
    var loc = windowToCanvas(canvas, e.clientX, e.clientY);
    console.log(loc.x + ", " + loc.y);
  };
  canvas.onclick = function (e){
    var loc = windowToCanvas(canvas, e.clientX, e.clientY);
    alert(loc.x + ", " + loc.y);
  };
  //on paste
  this.paste_auto = function (e) {
    if (e.clipboardData) {
      var items = e.clipboardData.items;
      if (!items) return;
      
      //access data directly
      var is_image = false;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          //image
          var blob = items[i].getAsFile();
          var URLObj = window.URL || window.webkitURL;
          var source = URLObj.createObjectURL(blob);
          this.paste_createImage(source);
          is_image = true;
        }
      }
      if(is_image == true){
        e.preventDefault();
      }
    }
  };
  this.paste_createImage = function (source) {
    var pastedImage = new Image();
    pastedImage.onload = function () {
      if(autoresize == true){
        canvas.width = pastedImage.width;
        canvas.height = pastedImage.height;
      }
      else{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      //ctx.drawImage(pastedImage, 0, 0);
    ctx.drawImage(pastedImage, 0, 0, canvas.width, canvas.height);
    };
    pastedImage.src = source;
  };
}

function handleImageView(files){    
  var file = files[0];
  if(!file.type.match(/image.*/)){
    alert("이미지 파일을 선택해주세요!");
  }      
  var reader = new FileReader();
  reader.onload = function(e){
    var img = new Image();
    img.onload = function(){
      var canvas = document.getElementById("graph_canvas");
      var ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    img.src = e.target.result;
  }
  reader.readAsDataURL(file);
}
window.onload = function(){
  var CLIPBOARD = new CLIPBOARD_CLASS("graph_canvas", false);
}