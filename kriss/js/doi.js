function copyToClipboard(val) {
  var t = document.createElement("textarea");
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
  alert('텍스트가 복사되었습니다.\n원하는 곳에 붙여 넣으세요.');
}
function article_search(){
  if(location.hostname != "johun204.github.io" && location.hostname != "localhost"){alert("호스트 네임 오류!");return;}
  if(document.getElementById("keyword").value.trim() == ""){
    alert("검색어를 입력해 주세요!!");
  }else{
    $('#noticeModal').modal('show');
    let url = "https://johun203.herokuapp.com/article_search?q=" + document.getElementById("keyword").value;
    let myScript = document.createElement("script");
    myScript.setAttribute("src", url);
    let head = document.head;
    head.insertBefore(myScript, head.firstElementChild);
  }
}