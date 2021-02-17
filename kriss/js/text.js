var texts;
String.prototype.replaceAll = function(org, dest) {
  return this.split(org).join(dest);
}
function newline2space(text) {
  try{
    text = text.replace(/\r\n/gi, '\n');
    text = text.replace(/\n\n/gi, '.');
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
      texts[i] += "." + texts[n];
      texts[n] = undefined;
      document.getElementById("text" + (i)).value += "." + document.getElementById("text" + n).value;
      document.getElementById("text" + n).value = "";
      document.getElementById("li" + n).style.display = "none";
      break;
    }
  }
}
function TextSplit(){
  if(location.hostname != "johun204.github.io" && location.hostname != "localhost"){alert("호스트 네임 오류!");return;}

  var menu_id = ["Abstract", "Main", "Methods", "Summary"];
  var result_html = "<div class=\"list-group\">";

  texts = [];
  for(var i=0; i<menu_id.length; i++)
  {
    result_html += "<li class=\"list-group-item list-group-item-primary\">" + menu_id[i] + (i == 1 ? " text" : "") + "</li>";
    var txt = restore(localStorage.getItem("Textarea_" + menu_id[i]));
    if(/\w/.test(txt) == false || txt == undefined) continue;
    var lines = newline2space(txt).split("?").join(".").split(".");
    var new_lines = [lines[0]];
    for (var j = 1; j < lines.length; j++) {
      if(/\w/.test(lines[j]) == false){
        new_lines[new_lines.length-1] += lines[j];
      }else if(isNumeric(lines[j].trim())){
        new_lines[new_lines.length-1] += "." + lines[j];
      }else{
        var tmp1 = new_lines[new_lines.length-1].trim().split(" ");
        var tmp2 = lines[j].trim().split(" ");
        tmp1 = removeSpecial(tmp1[tmp1.length-1]);

        if(tmp2[0] == "," || tmp1 == "i.e" || tmp1 == "e.g"){
          new_lines[new_lines.length-1] += "." + lines[j];
        }
        else{
          tmp2 = removeSpecial(tmp2[0]);
          if(isNumeric(new_lines[new_lines.length-1][new_lines[new_lines.length-1].length-1]) && isNumeric(lines[j][0])){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else if((tmp1 == "Fig" || tmp1 == "fig" || tmp1 == "Figs") && isNumeric(tmp2[0])){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else if((tmp1 == "Ref" || tmp1 == "Refs") && isNumeric(tmp2[0])){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else if((tmp1 == "Eq") && isNumeric(tmp2[0])){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else if(tmp1 == "e" && tmp2 == "g"){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else if(tmp1 == "i" && tmp2 == "e"){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else if(tmp1 == "etc" && tmp2 == "and"){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else if(tmp1 == "etc" && tmp2 == "with"){
            new_lines[new_lines.length-1] += "." + lines[j];
          }else{
            new_lines.push(lines[j]);
          }
        }
      }
    }
    for (var j = 0; j < new_lines.length; j++) {
      result_html += "<li class=\"list-group-item\" id=\"li" + texts.length + "\"><div class=\"input-group\"><input type=\"text\" class=\"form-control\" id=\"text" + texts.length + "\"><span class=\"input-group-btn\"><button class=\"btn btn-primary" + (texts.length==0?" disabled":"") + "\" type=\"button\" onclick=\"mergeText(" + texts.length + ");\"><i class=\"bi-arrow-90deg-up\"></i> 합치기</button></span></div></li>";
      texts.push(new_lines[j]);
    }
  }
  result_html += "</div>";
  document.getElementById("List_Text").innerHTML = result_html;
  for (var i = 0; i < texts.length; i++) {
    var obj = document.getElementById("text" + i).value = texts[i];
  }
}
function ClearLabeling(){
  document.getElementById("Table_Text").innerHTML = "<table class=\"table table-bordered\"><tr><td>index</td><td>category</td><td>numerical</td></tr></table>";
}
function TextLabeling(){
  alert("최종 변환 결과는 반드시 직접 확인하셔야합니다.");
  var footnote = document.getElementById("footnoteSwitch").checked;
  var exception = [];
  var rules = document.getElementById("FirstLabelingRule").value.split(",");
  for(var i=0;i<rules.length;i++){
    try{
      if(rules[i].split(":").length < 2){
        if(rules[i].trim() != "") alert("\"" + rules[i].trim() + "\" 규칙 오류!");
        continue;
      }
      var w = rules[i].split(":")[0].trim();
      var t = rules[i].split(":")[1].trim();
      if(rules[i].split(":").length > 2 || w == "" || w == undefined || t == "" || t == undefined){
        alert("\"" + rules[i].trim() + "\" 규칙 오류!");
      }else{
        exception.push({"word":w,"tag":t});
      }
    }catch(e){
      alert(rules[i] + " 규칙 오류!");
    }
  }
  var result_html = "<table class=\"table table-bordered\"><tr><td>index</td><td>category</td><td>numerical</td>";
  for(var i=1; i<=52; i++)
    result_html += "<td>word" + i + "</td>";
  result_html += "</tr>";

  var index = 1;
  for(var i=0; i<texts.length; i++)
  {
    texts[i] = document.getElementById("text" + i).value;
    if(texts[i] == undefined || /\w/.test(texts[i]) == false) continue;
    result_html += "<tr><td>" + index + "</td><td>[]</td><td>[]</td>";

    var txt = texts[i].trim();
    txt = txt.replaceAll(",", ", ").replaceAll("%", " %").replaceAll("℃", " ℃").replaceAll("°", " °");
    while(txt.indexOf("  ") > -1)txt = txt.replaceAll("  ", " ");
    var spaces = txt.split(" ");
    var tags = [];
    var category = [0, 0, 0, 0, 0, 0];
    var numerical = [];
    var md = [];
    var m_cnt = 1, d_cnt = 1;

	if(footnote){
	  var j=0;
	  while(j<spaces.length){
		try{
          if(spaces[j][0] == "[" && spaces[j][spaces[j].length - 1] == "]"){
			var tmp = spaces[j].substring(1, spaces[j].length - 1);
			if(isNumeric(tmp)) spaces.splice(j, 1);
			else if(isNumeric2(tmp)) spaces.splice(j, 1);
			else j++;
		  }else{
			j++;
		  }
		}catch(e){}
	  }
	}
    for(var j=0; j<spaces.length;j++){
      result_html += "<td>" + spaces[j] + "</td>";
      var tag = WordLabeling(spaces[j], j, exception);
      if(tag["tag"] == "m"){
        for(var k=0; k<j; k++){
          if(tags[k]["tag"][0] == "m" && tags[k]["similar"] == tag["similar"]){
            tag["tag"] = tags[k]["tag"];
            break;
          }
        }
        if(tag["tag"] == "m"){
          tag["tag"] += m_cnt;
          m_cnt++;
        }md.push({"index":j,"tag":tag["tag"]});
      }if(tag["tag"] == "d"){
        for(var k=0; k<j; k++){
          if(tags[k]["tag"][0] == "d" && tags[k]["similar"] == tag["similar"]){
            tag["tag"] = tags[k]["tag"];
            break;
          }
        }
        if(tag["tag"] == "d"){
          tag["tag"] += d_cnt;
          d_cnt++;
        }md.push({"index":j,"tag":tag["tag"]});
      }
      if(tag["tag"] == "n" && j>0 && (tags[j-1]["similar"] == "Fig" || tags[j-1]["similar"] == "Figs" || tags[j-1]["similar"] == "Figure" || tags[j-1]["similar"] == "Ref")){
        tag["tag"] = "o";
      }
      if(tag["tag"] == "m_")tag["tag"] = "m";
      if(tag["tag"] == "d_")tag["tag"] = "d";
      tags.push(tag);

      if(tag["tag"] == "mc"){
        category[3]++;
      }else if(tag["tag"][0] == "m"){
        category[0]++;
      }else if(tag["tag"][0] == "d"){
        category[1]++;
      }else if(tag["tag"][0] == "p"){
        category[2]++;
      }else if(tag["tag"] == "e"){
        category[4]++;
      }else if(tag["tag"] == "s"){
        category[5]++;
      }

      if(tags[j]["tag"] == "u" && j > 0 && tags[j - 1]["tag"] == "n"){
        numerical.push(j);
      }

    }for(var j=0; j<52-spaces.length; j++){
      result_html += "<td></td>";
    }result_html += "</tr>";

    result_html += "<tr><td>tag-" + index + "</td><td>[" + category[0] + "," + category[1] + "," + category[2] + "," + category[3] + "," + category[4] + "," + category[5] + "]</td><td>[";
    if(numerical.length > 0){
      for(var j=0; j<numerical.length; j++){
        if(j>0)result_html += ",";
        result_html += "[" + spaces[numerical[j]-1].replaceAll(",","").replaceAll("(","").replaceAll(")","") + "," + spaces[numerical[j]].replaceAll(",","").replaceAll("(","").replaceAll(")","") + "]";
      }
    }else{
      result_html += "0,0";
    }
    result_html += "]</td>";
    for(var j=0; j<spaces.length; j++){
      var tag = tags[j];
      result_html += "<td style=\"color:" + (tag["level"] == 1 ? "#000000" : (tag["level"] == 2 ? "#0000DD" : "#DD0000")) + ";\"";
      result_html += "title=\"" + tag["similar"].replaceAll("\"","'") + "\">";
      if(md.length > 0 && tag["tag"] != "o" && tag["tag"] != "u" && (tag["tag"].length != 2 || /[0-9]/.test(tag["tag"][1]) == false )){
        var min = 0;
        for(var k=1; k<md.length; k++){
          if(Math.abs(md[min]["index"] - j) > Math.abs(md[k]["index"] - j)) min = k;
          else break;
        }
        result_html += md[min]["tag"];
      }result_html += tag["tag"];
      result_html += "</td>";
    }for(var j=0; j<52-spaces.length; j++){
      result_html += "<td></td>";
    }result_html += "</tr>";
    index++;
  }
  document.getElementById("Table_Text").innerHTML = result_html + "</table>";
}
function saveToFile() {
  alert("다운로드 후 반드시 엑셀로 열어 .xlsx 형식으로 변환하여 업로드하셔야 합니다.");
  fileName = "text_labeling.xls";
  content = "\ufeff" + document.getElementById("Table_Text").innerHTML.replace("class=\"table table-bordered\"", "border=\"1\" style=\"font-family:'맑은 고딕', 'Malgun Gothic';font-size:11pt;\""); //utf-8+BOM
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