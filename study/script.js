var all_idx = [], all_txt = [], all_answer = [];
var load_cnt = 0;
String.prototype.replaceAt = function(index, replacement) {
	if(index >= this.length) {
		return this.valueOf();
	}return this.substring(0, index) + replacement + this.substring(index + 1);
}
function getData(filename){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if (xhr.readyState == XMLHttpRequest.DONE) {
			var newHTML = document.createElement("div");
			newHTML.innerHTML = xhr.responseText;
			if(newHTML.getElementsByClassName("eval_result01").length > 0){
				var newH2 = document.createElement("h2");
				newH2.innerText = test_title;
				for(var i=0; i<newHTML.getElementsByClassName("eval_result01")[0].getElementsByTagName("li").length;i++){
					if(newHTML.getElementsByClassName("eval_result01")[0].getElementsByTagName("li")[i].getElementsByClassName("ev_span")[0].innerText == "평가명"){
						newH2.innerText += " " + newHTML.getElementsByClassName("eval_result01")[0].getElementsByTagName("li")[i].getElementsByClassName("ev_div")[0].innerText;
					}
					if(newHTML.getElementsByClassName("eval_result01")[0].getElementsByTagName("li")[i].getElementsByClassName("ev_span")[0].innerText == "이름"){
						newH2.innerText += "(" + newHTML.getElementsByClassName("eval_result01")[0].getElementsByTagName("li")[i].getElementsByClassName("ev_div")[0].innerText.replaceAt(1,'○') + ")";
					}
				}
				document.body.append(newH2);
			}
			while(newHTML.getElementsByClassName("eval_result02").length > 0){
				document.body.append(newHTML.getElementsByClassName("eval_result02")[0]);
				console.log(document.getElementsByClassName("eval_result02").length);
			}
			load_cnt++;
			if(load_cnt == filenames.length)init2();
		}
	}
	xhr.open('GET', './data/' + filename, true);
	xhr.send(null);
}
function init(){
	console.log('init()');
	for(var i=0;i<filenames.length;i++){
		getData(filenames[i]);
	}
}
function init2(){
	console.log('init2()');
	for(var i=0;i<document.getElementsByTagName("textarea").length;i++){
		document.getElementsByTagName("textarea")[i].value = "";
		document.getElementsByTagName("textarea")[i].removeAttribute("readonly");
	}
	for(var i=0;i<document.getElementsByTagName("table").length;i++){
		document.getElementsByTagName("table")[i].getElementsByTagName("tfoot")[0].style.display="none";
		document.getElementsByTagName("table")[i].getElementsByTagName("tbody")[0].getElementsByClassName("last")[0].innerHTML = "<button onclick='f(" + i + ")' id='btn" + i + "'>정답 보이기</button>";
		
		document.getElementsByTagName("table")[i].getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].getElementsByTagName("th")[1].remove();
		document.getElementsByTagName("table")[i].getElementsByTagName("thead")[0].getElementsByTagName("tr")[0].getElementsByTagName("th")[0].setAttribute("colspan",2);

		for(var j=0; j<document.getElementsByTagName("table")[i].getElementsByTagName("label").length;j++){
			document.getElementsByTagName("table")[i].getElementsByTagName("label")[j].getElementsByTagName("input")[0].removeAttribute("name");
			document.getElementsByTagName("table")[i].getElementsByTagName("label")[j].getElementsByTagName("input")[0].name = 'rr' + i;
		}
	}
	for(var i=0;i<document.getElementsByTagName("input").length;i++){
		document.getElementsByTagName("input")[i].removeAttribute("checked");
		document.getElementsByTagName("input")[i].removeAttribute("disabled");
	}
	if(document.getElementsByTagName("h2").length > 0){
		document.getElementsByTagName("h2")[0].innerHTML = "<a href='index.html'>&#128281;</a> " + document.getElementsByTagName("h2")[0].innerHTML;
	}
	if(document.getElementsByTagName("h2").length > 0){
		document.getElementsByTagName("h2")[0].innerHTML = document.getElementsByTagName("h2")[0].innerHTML + "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type=checkbox onchange='hideDup(this.checked)' checked><span id='lb_chk'>중복 문제 가리기</span></label>" + "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type=checkbox onchange='shuffle(this.checked)' checked><span id='lb_chk2'>문제 보기 섞기</span></label>";
		hideDup(true);
	}

	
	for(var i = 0; i < document.getElementsByClassName("eval_result02").length; i++){
		document.getElementsByClassName("eval_result02")[i].id = 'ev' + i;
		if(document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form").length == 1){
			var arr_idx = [];
			var arr_txt = [];
			var answer = 0;
			for(var j=0;j<document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch").length;j++){
				arr_idx.push(document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByTagName("input")[0].value);
				arr_txt.push(document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByClassName("label_txt")[0].innerText);
				if(document.getElementsByTagName("table")[i].getElementsByTagName("tfoot")[0].getElementsByClassName("txt_blu")[0].innerText == "정답 : " + document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByTagName("input")[0].value) {
					answer = document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByTagName("input")[0].value;
				}
			}
			if(answer != 0){
				all_idx.push(arr_idx);
				all_txt.push(arr_txt);
				all_answer.push(answer);
				document.getElementsByClassName("eval_result02")[i].setAttribute("choice", true);
			}
		}
	}shuffle(true);
}
function f(n){
	if(document.getElementsByTagName("table")[n].getElementsByTagName("tfoot")[0].style.display == "block"){
		document.getElementsByTagName("table")[n].getElementsByTagName("tfoot")[0].style.display = "none";
		document.getElementById("btn" + n).innerText = "정답 보이기";
		boldAnswer(n, false);
	}
	else {
		document.getElementsByTagName("table")[n].getElementsByTagName("tfoot")[0].style.display = "block";
		document.getElementById("btn" + n).innerText = "정답 숨기기";
		boldAnswer(n, true);
	}
}
function hideDup(t){
	//중복문제 가리기
	var cnt=0;
	if(t == true){
		for(var i = 1; i < document.getElementsByClassName("eval_result02").length; i++){
			for(var j=0; j<i; j++){
				if(document.getElementsByClassName("eval_result02")[i].getElementsByClassName("txt_blc")[0].innerText.substr(3).trim() == document.getElementsByClassName("eval_result02")[j].getElementsByClassName("txt_blc")[0].innerText.substr(3).trim()){
					document.getElementsByClassName("eval_result02")[i].style.display = "none";
					cnt++;
					break;
				}
			}
		}
	}else{
		for(var i = 1; i < document.getElementsByClassName("eval_result02").length; i++){
			document.getElementsByClassName("eval_result02")[i].style.display = "block";
		}
	}document.getElementById('lb_chk').innerText = "중복 문제 가리기 (" + (document.getElementsByClassName("eval_result02").length - cnt) + "문제)";
}
function shuffleArr(array) {
  array.sort(() => Math.random() - 0.5);
}
function shuffle(t){
	//문제 보기 섞기
	var cnt=0;
	if(t == true){
		for(var i = 0; i < document.getElementsByClassName("eval_result02").length; i++){
			if(document.getElementsByClassName("eval_result02")[i].getAttribute("choice") == "true"){
				var arr_shuffle = [];
				for(var j=0;j<all_txt[cnt].length;j++){arr_shuffle.push(j);shuffleArr(arr_shuffle);}
				for(var j=0;j<document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch").length;j++){
					document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByClassName("label_txt")[0].innerText = all_txt[cnt][arr_shuffle[j]];
					if(all_idx[cnt][arr_shuffle[j]] == all_answer[cnt]){
						document.getElementsByTagName("table")[i].getElementsByTagName("tfoot")[0].getElementsByClassName("txt_blu")[0].innerText = "정답 : " + document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByTagName("input")[0].value;
					}
				}cnt++;
			}
			if(document.getElementsByTagName("table")[i].getElementsByTagName("tfoot")[0].style.display == "none"){
				boldAnswer(i, false);
			}
			else {
				boldAnswer(i, true);
			}
		}
	}else{
		for(var i = 0; i < document.getElementsByClassName("eval_result02").length; i++){
			if(document.getElementsByClassName("eval_result02")[i].getAttribute("choice") == "true"){
				var arr_shuffle = [];
				for(var j=0;j<all_txt[cnt].length;j++){arr_shuffle.push(j);}
				for(var j=0;j<document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch").length;j++){

					document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByClassName("label_txt")[0].innerText = all_txt[cnt][arr_shuffle[j]];
					if(all_idx[cnt][arr_shuffle[j]] == all_answer[cnt]){
						document.getElementsByTagName("table")[i].getElementsByTagName("tfoot")[0].getElementsByClassName("txt_blu")[0].innerText = "정답 : " + document.getElementsByClassName("eval_result02")[i].getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByTagName("input")[0].value;
					}
				}cnt++;
			}
			if(document.getElementsByTagName("table")[i].getElementsByTagName("tfoot")[0].style.display == "none"){
				boldAnswer(i, false);
			}
			else {
				boldAnswer(i, true);
			}
		}
	}
}
function boldAnswer(n, t){
	if(document.getElementById("ev"+n).getAttribute("choice") == "true"){
		if(t == true){
			for(var j=0;j<document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch").length;j++){
				if("정답 : " + document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].getElementsByTagName("input")[0].value == document.getElementById("ev"+n).getElementsByTagName("tfoot")[0].getElementsByClassName("txt_blu")[0].innerText){
					document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].style.fontWeight = 'bold';
					document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].style.color = '#dc3545';
				}else{
					document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].style.fontWeight = 'normal';
					document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].style.color = '#222222';
				}
			}
		}
		else{
			for(var j=0;j<document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch").length;j++){
				document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].style.fontWeight = 'normal';
				document.getElementById("ev"+n).getElementsByClassName("exam_form")[0].getElementsByClassName("ex_ch")[j].style.color = '#222222';
			}
		}

	}
}
window.addEventListener('load', init);