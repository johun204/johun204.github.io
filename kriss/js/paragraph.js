function ParagraphLabeling(){
  var menu_id = ["Abstract", "Introduction", "Main", "Methods", "Summary", "Captions"];
  var index = 0;
  var result_html = "<table class=\"table table-bordered\"><tr><td>index</td><td>paragraph_data</td><td>tag</td></tr>";
  for(var i=0; i<menu_id.length; i++)
  {
    var txt = localStorage.getItem("Textarea_" + menu_id[i]);
    if(/\w/.test(txt) == false || txt == undefined) continue;
    try{
      txt = txt.replace(/\r\n/g, '\n');
      var paragraphs = txt.split('\n\n');
    }catch(err){ continue; }
    cnt = 0;
    for (var j = 0; j < paragraphs.length; j++) {
      var lines = paragraphs[j].split('\n');
      var retLines = [];
      for (var k = 0; k < lines.length; k++) {
        if (/\w/.test(lines[k])) {
          retLines.push(lines[k]);
        }
      }
      if (retLines.length > 0) {
        index++;
        cnt++;
        result_html += "<tr><td>" + index + "</td><td>" + retLines.join(' ') + "</td><td>[" + (i==0?cnt:0) + "," + (i==1?cnt:0) + "," + (i==2?cnt:0) + "," + (i==3?cnt:0) + "," + (i==4?cnt:0) + "," + (i==5?cnt:0) + "]</td></tr>";
      }
    }
  }
  document.getElementById("Table_Paragraph").innerHTML = result_html + "</table>";
}
function saveToFile() {
  fileName = "download.xls";
  content = "\ufeff" + document.getElementById("Table_Paragraph").innerHTML.replace("class=\"table table-bordered\"", "border=\"1\""); //utf-8+BOM
  if((navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) || (navigator.userAgent.toLowerCase().indexOf("msie") !== -1)){ //ie
    var blob = new Blob([content], { type: "text/plain", endings: "native" });
    window.navigator.msSaveBlob(blob, fileName);
  }
  else{ //chrome
    var blob = new Blob([content], { type: 'text/plain;charset=UTF-8;' });
    objURL = window.URL.createObjectURL(blob);
            
    if (window.__Xr_objURL_forCreatingFile__) {
      window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
    }
    window.__Xr_objURL_forCreatingFile__ = objURL;
    var a = document.createElement('a');
    a.download = fileName;
    a.href = objURL;
    a.click();
  }
}
window.onload = function(){
  ParagraphLabeling();
}