function openNotice(){
  const notice_date = "20210411";
  const notice_text = "<table class='table table-sm table-borderless'>"
  + "<tr><td><b>2021.04.11</b></td><td>단어&문장 라벨링 시 일부 device 태그가 누락되던 오류를 수정했습니다." + " <sup class='new-badge'>NEW</sup>" + "</td></tr>"
  + "<tr><td><b>2021.04.02</b></td><td>단어&문장 라벨링 시 문장의 마지막에 '.)'와 같이 마침표 다음 괄호가 존재하는 경우 괄호를 이전 문장에 포함하도록 적용했습니다.</td></tr>"
  + "<tr><td><b>2021.03.30</b></td><td>다크 모드 기능을 추가했습니다.</td></tr>"
  + "<tr><td><b>2021.03.22</b></td><td>단어&문장 라벨링 시 'et al' 다음 문장을 줄 바꿈 하지 않도록 적용했습니다.</td></tr>"
  + "<tr><td><b>2021.03.09</b></td><td>줄 번호 제거 기능을 추가했습니다.</td></tr>"
  + "<tr><td><b>2021.02.18</b></td><td>단어&문장 라벨링 메뉴의 라벨링 시 각주 무시 기능을 추가했습니다.</td></tr>"
  + "<tr><td><b>2021.02.17</b></td><td>단어&문장 라벨링 메뉴의 최우선 라벨링 규칙 기능을 추가했습니다.<br>PDF 뷰어 기능을 추가했습니다.</td></tr>"
  + "</table>";

  try{
    document.getElementById("modal-text").innerHTML = notice_text;
    if(localStorage.getItem("notice") != notice_date){
      localStorage.setItem("notice", notice_date);
      $('#noticeModal').modal('show');
    }
  }catch(err){}
}
window.addEventListener('load', openNotice);