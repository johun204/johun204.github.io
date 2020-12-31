var texts;
function newline2space(text) {
  try{
    text = text.replace(/\r\n/g, '\n');
    text = text.replace(/\n\n/g, '.');
    var lines = text.split('\n');
  }catch(err){ return ''; }
  var retLines = [];
  for (var i = 0; i < lines.length; i++) {
    if (/\w/.test(lines[i])) {
      retLines.push(lines[i]);
    }
  }return retLines.join(' ');
}
function mergeText(n){
  if(n==0){
    alert('첫 번째 행은 합칠 수 없습니다.');
  }else if(confirm("선택한 행을 바로 위의 행과 합치시겠습니까?\n합친 후에는 되돌릴 수 없습니다.")){
    for(var i=n-1;i>=0;i--){
      if(texts[i] == undefined) continue;
      texts[i] += texts[n];
      texts[n] = undefined;
      document.getElementById("text" + (i)).value += "." + document.getElementById("text" + n).value;
      document.getElementById("li" + n).style.display = "none";
      break;
    }		
  }
}
function TextSplit(){
  document.getElementById("TextLabeling").style.display = "none";
  document.getElementById("TextCheck").style.display = "block";
  var menu_id = ["Abstract", "Main", "Methods", "Summary"];
  var result_html = "<div class=\"list-group\">";

  texts = [];
  for(var i=0; i<menu_id.length; i++)
  {
    result_html += "<li class=\"list-group-item list-group-item-info\">" + menu_id[i] + (i == 1 ? " text" : "") + "</li>";
    var txt = localStorage.getItem("Textarea_" + menu_id[i]);
    if(/\w/.test(txt) == false || txt == undefined) continue;
    var lines = newline2space(txt).split('.');
    var new_lines = [lines[0]];
    for (var j = 1; j < lines.length; j++) {
      if(/\w/.test(lines[j]) == false){
        new_lines[new_lines.length-1] += lines[j];
      }
      else{
        new_lines.push(lines[j]);
      }
    }

    for (var j = 0; j < new_lines.length; j++) {
      result_html += "<li class=\"list-group-item\" id=\"li" + texts.length + "\"><div class=\"input-group\"><input type=\"text\" class=\"form-control\" id=\"text" + texts.length + "\" value=\"" + new_lines[j] + "\"><span class=\"input-group-btn\"><button class=\"btn btn-primary" + (texts.length==0?" disabled":"") + "\" type=\"button\" onclick=\"mergeText(" + texts.length + ");\"><span class=\"glyphicon glyphicon-arrow-up\" aria-hidden=\"true\"></span> 합치기</button></span></div></li>";
	  texts.push(new_lines[j]);
    }
  }
  result_html += "</div>";
  document.getElementById("List_Text").innerHTML = result_html;
}
function TextRepair(){
  document.getElementById("TextCheck").style.display = "block";
  document.getElementById("TextLabeling").style.display = "none";
}
function TextLabeling(){
  document.getElementById("TextCheck").style.display = "none";
  document.getElementById("TextLabeling").style.display = "block";

  var result_html = "<table class=\"table table-bordered\"><tr><td>index</td><td>category</td><td>numerical</td>";
  for(var i=1; i<=52; i++)
    result_html += "<td>word" + i + "</td>";
  result_html += "</tr>";

  var index = 1;
  for(var i=0; i<texts.length; i++)
  {
    if(texts[i] == undefined) continue;
    result_html += "<tr><td>" + index + "</td><td>[]</td><td>[]</td>";	
	spaces = texts[i].trim().split(' ');
	for(var j=0; j<spaces.length;j++){
      result_html += "<td>" + spaces[j] + "</td>";
	}for(var j=0; j<52-spaces.length;j++){
      result_html += "<td></td>";
	}result_html += "</tr>";

	result_html += "<tr><td>tag-" + index + "</td><td>[0,0,0,0,0,0]</td><td>[0,0]</td>";
	for(var j=0; j<52;j++){
      result_html += "<td></td>";
	}result_html += "</tr>";
	index++;
  }
  document.getElementById("Table_Text").innerHTML = result_html + "</table>";
}
function Popup() {
  let win = window.open("about:blank");
  win.document.write("<style>body{padding:0;margin:0;}table {border: 1px solid #DDDDDD; border-collapse: collapse; } th, td { border: 1px solid #DDDDDD; padding: 5px;}</style>");
  win.document.write(document.getElementById("Table_Text").innerHTML);
  win.document.body.contentEditable = true;
}
function saveToFile() {
  fileName = "download.xls";
  content = "\ufeff" + document.getElementById("Table_Text").innerHTML.replace("class=\"table table-bordered\"", "border=\"1\""); //utf-8+BOM
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
  TextSplit();
}
window.onbeforeunload = function() {
  return "변경사항이 저장되지 않을 수 있습니다.";
}