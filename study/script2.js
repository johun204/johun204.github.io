var all_idx = [];
var all_txt = [];
var all_answer = [];
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
function init(){
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
	for(var i=0;i<document.getElementsByTagName("h2").length;i++){
		document.getElementsByTagName("h2")[i].innerText = document.title + "(" + (i+1) + "주차)";
	}
	if(document.getElementsByTagName("h2").length > 0){
		document.getElementsByTagName("h2")[0].innerHTML = "<a href='index.html'>&#128281;</a> " + document.getElementsByTagName("h2")[0].innerHTML;
	}
	if(document.getElementsByTagName("h2").length > 0){
		document.getElementsByTagName("h2")[0].innerHTML = document.getElementsByTagName("h2")[0].innerHTML + "<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input type=checkbox onchange='shuffle(this.checked)' checked><span id='lb_chk2'>문제 보기 섞기</span></label>";
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