function openNotice(){
  const notice_date = "20210411";
  const notice_text = "<table class='table table-sm table-borderless'><tr><td><b>2021.04.11</b></td><td>단어&문장 라벨링 시 일부 device가 누락되는 오류 수정. <sup class='new-badge'>NEW</sup></td></tr><tr><td><b>2021.03.30</b></td><td>다크모드 기능 추가.</td></tr><tr><td><b>2021.03.09</b></td><td>줄 번호 제거 메뉴 추가.</td></tr></table>";

  try{
    document.getElementById("modal-text").innerHTML = notice_text;
    if(localStorage.getItem("notice") != notice_date){
      localStorage.setItem("notice", notice_date);
      $('#noticeModal').modal('show');
    }
  }catch(err){}
}
window.addEventListener('load', openNotice);