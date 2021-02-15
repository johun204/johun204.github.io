function restore(txt){
  var crack = [{"o":"-","c":"–"}, {"o":"-","c":"ㅡ"}];
  var crack2 = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "󰡔", "󰡕", "", "", "", "", "", "", "", "", "", "", ""];
  try{
    for(var i=0;i<crack.length;i++){
      txt = txt.split(crack[i]["c"]).join(crack[i]["o"]);
    }for(var i=0;i<crack2.length;i++){
      txt = txt.split(crack2[i]).join(" ");
    }
  }catch(err){ }
  return txt;
}