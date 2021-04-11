function counterColor(){
  if(localStorage.getItem("darkmode") == "true"){
    document.getElementById("counter").innerHTML='<img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fkrisssmartit&amp;count_bg=%23F29102&amp;title_bg=%23F29102&amp;icon=&amp;icon_color=%23E7E7E7&amp;title=%E2%99%A5&amp;edge_flat=false" title="방문자" alt="방문자">';
  }else{
    document.getElementById("counter").innerHTML='<img src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fkrisssmartit&amp;count_bg=%230D6EFD&amp;title_bg=%230D6EFD&amp;icon=&amp;icon_color=%23E7E7E7&amp;title=%E2%99%A5&amp;edge_flat=false" title="방문자" alt="방문자">';
  }
}window.addEventListener('load', counterColor);