function openNotice(){
  const notice_date = "20210421";
  const notice_text = [
      {"date":"2021.04.21", "text":"DOI 검색기 기능을 추가했습니다."},
      {"date":"2021.04.20", "text":"단어&문장 라벨링 속도를 개선했습니다."},
      {"date":"2021.04.19", "text":"단어&문장 라벨링 시 단어 개수에 맞춰 필드(열)를 생성하도록 변경했습니다."},
      {"date":"2021.04.18", "text":"업무 분담표를 두 번째 시트의 내용으로 적용했습니다."},
      {"date":"2021.04.17", "text":"논문 다운로드 시 간헐적으로 로그인 오류가 발생하던 현상을 수정했습니다."},
      {"date":"2021.04.14", "text":"업무 분담표의 논문 다운로드 기능을 추가했습니다."},
      {"date":"2021.04.12", "text":"업무 분담표 기능을 추가했습니다."},
      {"date":"2021.04.11", "text":"단어&문장 라벨링 시 일부 device 태그가 누락되던 오류를 수정했습니다."},
      {"date":"2021.04.02", "text":"단어&문장 라벨링 시 문장의 마지막에 '.)'와 같이 마침표 다음 괄호가 존재하는 경우 괄호를 이전 문장에 포함하도록 적용했습니다."},
      {"date":"2021.03.30", "text":"다크 모드 기능을 추가했습니다."},
      {"date":"2021.03.22", "text":"단어&문장 라벨링 시 'et al.' 다음 문장을 줄 바꿈 하지 않도록 적용했습니다."},
      {"date":"2021.03.20", "text":"메인 페이지에 방문자 수 카운터를 추가했습니다."},
      {"date":"2021.03.09", "text":"줄 번호 제거 기능을 추가했습니다."},
      {"date":"2021.02.18", "text":"단어&문장 라벨링 메뉴의 라벨링 시 각주 무시 기능을 추가했습니다."},
      {"date":"2021.02.17", "text":"단어&문장 라벨링 메뉴의 최우선 라벨링 규칙 기능을 추가했습니다."},
  ];

  try{
    var tmp = "<table class='table table-sm table-borderless'>";
    for(var i=0;i<notice_text.length;i++){
      tmp += "<tr><td><b>" + notice_text[i]["date"] + "</b></td><td>" + notice_text[i]["text"];
      if(i == 0) tmp += " <sup class='new-badge'>NEW</sup>";
      tmp += "</td></tr>";
    }tmp += "</table>";
    document.getElementById("modal-text").innerHTML = tmp;
    if(localStorage.getItem("notice") != notice_date){
      localStorage.setItem("notice", notice_date);
      $('#noticeModal').modal('show');
    }
  }catch(err){}
}
window.addEventListener('load', openNotice);
