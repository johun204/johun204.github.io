function restore(txt){
  var crack = [{"c":"–", "o":"-"}, {"c":"ㅡ", "o":"-"}, {"c":"−", "o":"-"}];
  var crack2 = ["", "¼", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "󰡔", "󰡕", "", "", "", "", "", "", "", "", "", "", ""];
  try{
    for(var i=0;i<crack.length;i++){
      txt = txt.split(crack[i]["c"]).join(crack[i]["o"]);
    }for(var i=0;i<crack2.length;i++){
      txt = txt.split(crack2[i]).join(" ");
    }
  }catch(err){ }
  return txt;
}