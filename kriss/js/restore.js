function restore(txt){
  var origin = ["α", "β", "ε", "τ", "σ", "ω", "Θ", "γ", "μ", "Ω", "ν", "∂", "δ", "°", "{", "}", "(", ")", "[", "]", "=", "+", "*", "-", "/", ".", ",", ">", "<", "|", "|", ";", "ρ", "Σ", "•", "∫", "『", "』", "Ψ", "Π", "ζ", "˙", "λ", "Φ", "Φ", "˙˙", ":", "Δ", "±"];
  var crack = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "󰡔", "󰡕", "", "", "", "", "", "", "", "", "", "", "" ];
  for(var i=0;i<origin.length;i++){
    txt = txt.replace(crack[i], origin[i]);
  }return txt;
}