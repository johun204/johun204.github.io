window.onresize = function(){
  try{
    if(chat_state == 1){
      document.getElementById("chat_btn").style.bottom = document.getElementById("chat_room").offsetHeight + "px";
    }
  }catch(err){ }
}
function ChatBtnClick(obj)
{
  var chat_state = localStorage.getItem("chat_state");
  if(chat_state == "1"){
    localStorage.setItem("chat_state", "0");
    document.getElementById("chat_btn").style.bottom = "0px";
    document.getElementById("chat_room").style.display = "none";
    obj.innerHTML = "채팅 열기";
  }else{
    localStorage.setItem("chat_state", "1");
    document.getElementById("chat_room").style.display = "block";
    document.getElementById("chat_btn").style.bottom = document.getElementById("chat_room").offsetHeight + "px";
    obj.innerHTML = "채팅 닫기";
  }
}
function ChatOnload()
{
  var chat_state = localStorage.getItem("chat_state");
  if(chat_state == "1"){
    document.getElementById("chat_room").style.display = "block";
    document.getElementById("chat_btn").style.bottom = document.getElementById("chat_room").offsetHeight + "px";
    document.getElementById("chat_btn_btn").innerHTML = "채팅 닫기";
  }else{
    document.getElementById("chat_btn").style.bottom = "0px";
    document.getElementById("chat_room").style.display = "none";
    document.getElementById("chat_btn_btn").innerHTML = "채팅 열기";
  }
}