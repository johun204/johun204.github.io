function Scriptable(){
  try{
    localStorage.setItem("Scriptable","able");
    if(localStorage.getItem("Scriptable") != "able"){
      document.getElementById("index_page").innerHTML = "<p>본 브라우저에서는 기능을 사용할 수 없습니다.<br>본 페이지는 크롬 브라우저에 최적화되어있습니다.</p>";
    }
    localStorage.removeItem("Scriptable");
  }
  catch(err)
  {
    document.getElementById("index_page").innerHTML = "<p>본 브라우저에서는 기능을 사용할 수 없습니다.<br>본 페이지는 크롬 브라우저에 최적화되어있습니다.</p>";
  }
}
window.onload = function(){
  Scriptable();
}