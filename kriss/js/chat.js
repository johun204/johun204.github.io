window.onresize = function(){
  try{
    document.getElementById("chat_btn").style.bottom = document.getElementById("chat_room").offsetHeight + "px";
  }catch(err){ }
}
function ChatBtnClick(obj)
{
  if(obj.innerHTML == "채팅 열기"){
    document.getElementById("chat_room").style.height = "50%";
    document.getElementById("chat_btn").style.bottom = document.getElementById("chat_room").offsetHeight + "px";
    obj.innerHTML = "채팅 닫기";
  }else{
    document.getElementById("chat_room").style.height = "0px";
    document.getElementById("chat_btn").style.bottom = document.getElementById("chat_room").offsetHeight + "px";
    obj.innerHTML = "채팅 열기";
  }
}