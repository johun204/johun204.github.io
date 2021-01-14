String.prototype.replaceAll = function(org, dest) {
  return this.split(org).join(dest);
}
function copyToClipboard(pid) {
  var val = document.getElementById(pid).innerHTML;
  var t = document.createElement("textarea");
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
  alert("텍스트가 복사되었습니다.\n원하는 곳에 붙여 넣으세요.");
}
function Papago(pid){
  window.open("https://papago.naver.com/?sk=en&tk=ko&hn=0&st=" + encodeURI(document.getElementById(pid).innerHTML)).replaceAll("&","%26");
}
function ParagraphLabeling(){
  if(location.hostname != "johun204.github.io"){alert("호스트 네임 오류!");return;}
  var menu_id = ["Main"];
  var index = 0;
  var result_html = "<table class=\"table table-bordered\"><tr><td><b>paragraph_data</b></td><td><b>Papago</b></td></tr>";
  for(var i=0; i<menu_id.length; i++)
  {
    var txt = restore(localStorage.getItem("Textarea_" + menu_id[i]));
    if(/\w/.test(txt) == false || txt == undefined) continue;
    try{
      txt = txt.replace(/\r\n/gi, '\n');
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
        result_html += "<tr><td id=\"paragraph" + cnt + "\">" + retLines.join(' ') + "</td><td><button type=\"button\" class=\"btn btn-success\" style=\"margin-bottom:3px;\"onclick=\"Papago('paragraph" + cnt + "');\"><span class=\"glyphicon glyphicon-font\" aria-hidden=\"true\"></span> 번역</button><br><button type=\"button\" class=\"btn btn-primary\" onclick=\"copyToClipboard('paragraph" + cnt + "');\"><span class=\"glyphicon glyphicon-duplicate\" aria-hidden=\"true\"></span> 복사</button></td></tr>";
        cnt++;
      }
    }
  }
  document.getElementById("Table_Qna").innerHTML = result_html + "</table>";
}
window.onload = function(){
  ParagraphLabeling();
}