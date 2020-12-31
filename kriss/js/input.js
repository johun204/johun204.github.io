function LoadText(n){
  if(n == undefined) n = 0;
  localStorage.setItem("current_menu", n);
  var menu_id = ["Abstract", "Introduction", "Main", "Methods", "Summary", "Captions"];
  var menu_desc = ["논문의 중심 내용에 대한 전체적인 요약", "논문과 관련된 배경과 논문의 동기 및 결과를 간략하게 소개", "논문의 자세한 내용과 결과들을 기술", "논문의 실험 방법", "논문의 주요 내용에 대한 결과 및 요약", "논문 image에 대한 개략적인 설명"]
  document.getElementById("Menu_Title").innerHTML = menu_id[n] + (n == 2 ? " text" : "");
  document.getElementById("Menu_Desc").innerHTML = menu_desc[n];

  for(var i=0; i<menu_id.length; i++)
  {
    var obj = document.getElementById("Textarea_" + menu_id[i]);
    var btn_obj = document.getElementById("Btn_" + menu_id[i]);
    if(i==n){
      obj.style.display = "block";
      var txt = localStorage.getItem("Textarea_" + menu_id[n]);
      if(txt != undefined) obj.value = txt;
      btn_obj.innerHTML = menu_id[i] + (i == 2 ? " text" : "") + " <span class=\"glyphicon glyphicon-ok\" aria-hidden=\"true\">";
    }else{
      obj.style.display = "none";
      btn_obj.innerHTML = menu_id[i] + (i == 2 ? " text" : "");
    }
  }
}
function AutoSave(obj){
  localStorage.setItem(obj.id, obj.value);
  var d = new Date();
  var nowTime = d.getHours() + "시 " + d.getMinutes() + "분 " + d.getSeconds() + "초";
  document.getElementById("ToastBox").innerHTML = "<div class=\"alert alert-success alert-dismissible\" role=\"alert\">" + nowTime + " 자동저장됨 <span class=\"glyphicon glyphicon-floppy-saved\" aria-hidden=\"true\"> <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button></div>";
}
function AllClear(){
  if(confirm("모든 문단의 내용을 전부 지우시겠습니까?\n지운 후에는 되돌릴 수 없습니다.")){
	var menu_id = ["Abstract", "Introduction", "Main", "Methods", "Summary", "Captions"];
	for(var i=0; i<menu_id.length; i++)
    {
      var obj = document.getElementById("Textarea_" + menu_id[i]);
	  obj.value = "";
	  localStorage.removeItem("Textarea_" + menu_id[i]);
    }
  }
}
function saveToFile() {
  fileName = "download.txt";
  content = "\ufeff"; //UTF-8+BOM
  var menu_id = ["Abstract", "Introduction", "Main", "Methods", "Summary", "Captions"];
  for(var i=0; i<menu_id.length; i++)
  {
    if(i > 0) content += "\n\n==============================================================\n\n";
    var txt = localStorage.getItem("Textarea_" + menu_id[i])
	if(txt != undefined) content += txt;
  }
  if( (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) || (navigator.userAgent.toLowerCase().indexOf("msie") !== -1) ){ //ie
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
  LoadText(localStorage.getItem("current_menu"));
}