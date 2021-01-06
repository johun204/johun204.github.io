function removeSpecial(txt){
  for(var i=0;i<txt.length;i++){
    if(/\w/.test(txt[i]) == false) continue;
    txt = txt.substring(i, txt.length);
    break;
  }
  for(var i=0;i<txt.length;i++){
    if(/\w/.test(txt[txt.length - i - 1]) == false) continue;
    txt = txt.substring(0, txt.length - i);
    break;
  }return txt;
}
function isMaterial(txt){
  if(/[0-9]/.test(txt[0])) return false;
  if(/\w/.test(txt) == false) return false;
  var chemi1 = ["Li", "Be", "Ne", "Na", "Mg", "Al", "Si", "Cl", "Ar", "Ca", "Sc", "Ti", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "Se", "Br", "Kr", "Rb", "Sr", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "Sn", "Sb", "Te", "Xe", "Cs", "Ba", "Hf", "Ta", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "Rn", "Fr", "Ra", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Ac", "Th", "Pa", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr"];
  var chemi2 = ["He", "As", "In", "At", "H", "B", "C", "N", "O", "F", "P", "S", "K", "V", "Y", "I", "W", "U", "x"];
  var index = 0, level = 2;
  while(index < txt.length){
    if(/[0-9]/.test(txt[index])){
      index++;
      continue;
    }var flag = true;
    for(var i=0;i<chemi1.length;i++){
      if(index + chemi1[i].length > txt.length) continue;
      if(txt.substring(index, index + chemi1[i].length) == chemi1[i]){
        index += chemi1[i].length;
        flag = false;
        level = 1;
        break;
      }
    }
    if(flag == false) continue;
    for(var i=0;i<chemi2.length;i++){
      if(index + chemi2[i].length > txt.length) continue;
      if(txt.substring(index, index + chemi2[i].length) == chemi2[i]){
        index += chemi2[i].length;
        flag = false;
        break;
      }
    }
    if(flag) return 0;
  }return level;
}
function isDevice(txt){
  if(txt.indexOf("/") == -1)return false;
  var arr = txt.split("/");
  for(var i=0;i<arr.length;i++){
    if(isMaterial(arr[i]) == 0) return false;
  }return true;
}
function isNumeric(txt){
  var regex = /^[+\-]?(([1-9][0-9]{0,2}(,[0-9]{3})*)|[0-9]+){1}(\.[0-9]+)?$/g;
  txt = txt.replace(/,/g, "").replace(/±/g, "");
  if(regex.test(txt)){
    return isNaN(txt) ? false : true;
  }return false;
}
function isUnit(txt){
  if(/\w/.test(txt) == false) return false;
  var unit1 = ["℃", "Å", "Δ", "τ", "±", "≒", "°C", "Ω", "Θ", "eV", "Gb", "GB", "mA", "ml", "mL", "nm", "μm", "mm", "V", "W", "A", "°", "μ", "%", "^", "_", "+", "-", "*", "/"];
  var unit2 = ["g", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ","];
  var index = 0, level = 0;
  while(index < txt.length){
    var flag = true;
    for(var i=0;i<unit1.length;i++){
      if(index + unit1[i].length > txt.length) continue;
      if(txt.substring(index, index + unit1[i].length) == unit1[i]){
        index += unit1[i].length;
        flag = false;
        level = 1;
        break;
      }
    }
    if(flag == false) continue;
    for(var i=0;i<unit2.length;i++){
      if(index + unit2[i].length > txt.length) continue;
      if(txt.substring(index, index + unit2[i].length) == unit2[i]){
        index += unit2[i].length;
        flag = false;
        break;
      }
    }
    if(flag) return 0;
  }return level;
}
function WordLabeling(txt){
  var word1 = ["material", "device", "performance", "properties",  "conduction",  "electronic",  "thermochemical",  "electrochemical",  "charge",  "electrically",  "driving",  "doping",  "doped",  "intrinsic",  "electrons",  "detrapping",  "trapping",  "frequencies",  "force",  "endothermic",  "transmittance",  "bands",  "stretching",  "absorbance",  "vibrational",  "energy",  "chemical",  "atomic",  "electromagnetic",  "space‐charge‐limited",  "opacity",  "electric",  "field",  "transport",  "metal",  "scattering",  "mass",  "excited",  "semiconductor",  "insulator",  "carbon-rich",  "phase",  "holes",  "barrier",  "chemically",  "valence",  "solid-state",  "physical",  "metallic",  "structure",  "electrode",  "conventional",  "dielectric",  "electrolyte",  "buffer",  "active",  "bottom",  "top",  "layer",  "substrate",  "thick",  "tox",  "thickness",  "vertical",  "multistack",  "Cluster",  "channel",  "cross-point",  "nanowire",  "nanodot",  "nanomesh",  "X-point",  "oxram",  "CBRAM",  "terminal",  "surface",  "ReRAM",  "width",  "pitch",  "film",  "application",  "selector",  "memristors",  "memristive",  "Memory",  "neuromorphic",  "switch",  "mulit-level",  "memories",  "Neural",  "storage",  "floating‐gate",  "nonvolatile",  "transistors",  "Power",  "consumption",  "current",  "Ion",  "Iset",  "Ioff",  "leakage",  "Ileak",  "Ireset",  "compliance",  "Iprog",  "Ierase",  "Icc",  "voltage",  "Vset",  "Vreset",  "Vforming",  "Vread",  "Verase",  "Vprogram",  "resistance",  "resistive",  "conductivity",  "Roff",  "Ron",  "resistance-state",  "low-resistance",  "high‐resistance",  "operating",  "semi-forming",  "Forming-free",  "unipolar",  "bipolar",  "complementary",  "operation",  "Program",  "erase",  "write",  "read",  "rupture",  "slow",  "fast",  "forming",  "formation",  "Electroforming",  "switching",  "breakdown",  "high",  "low",  "set",  "reset",  "positive",  "negative",  "threshold",  "sweep",  "dissolution",  "current–voltage",  "I–V",  "polarity",  "speed",  "endurance",  "cycles",  "cycling",  "cyclability",  "retention",  "lifetime",  "reliability",  "stability",  "variability",  "disturbance",  "uniformity",  "dispersion",  "distributions",  "cumulative",  "Fluctuation",  "deviation",  "window",  "non-uniformity",  "uniform",  "reproducible",  "probabilities",  "selectivity",  "ratio",  "Non-linearity",  "mechanism",  "interface-switching",  "filament",  "thermal-chemical mechanism",  "frenkel",  "electrochemical",  "path",  "Schottky",  "ohmic",  "Poole",  "precipitation",  "oxidized",  "reduction",  "environment",  "humidity",  "temperature",  "pressure",  "time",  "heat",  "air",  "dry",  "synthesis",  "RF-sputtering",  "sputtering",  "e-beam",  "evaporator",  "spin-coated",  "sputtering",  "annealing",  "laser",  "lithography",  "photolithography",  "etching",  "etched",  "patterning",  "Atomic Layer Deposition",  "Chemical Vapor Deposition",  "Physical Vapor Deposition",  "Pulsed Laser Deposition",  "plasma",  "deposition",  "process",  "solution",  "self-assembly",  "drying",  "thermal",  "angled",  "beam",  "vapor",  "printing"];
  var tag1 = ["m_", "d_", "p", "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "mp",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "ds",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "da",  "pp",  "pp",  "pc",  "pc",  "pc",  "pc",  "pc",  "pc",  "pc",  "pc",  "pc",  "pc",  "pc",  "pv",  "pv",  "pv",  "pv",  "pv",  "pv",  "pv",  "pr",  "pr",  "pr",  "pr",  "pr",  "pr",  "pr",  "pr",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "po",  "ps",  "pe",  "pe",  "pe",  "pe",  "pt",  "pt",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "pab",  "plec",  "plec",  "plec",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "e",  "e",  "e",  "e",  "e",  "e",  "e",  "e",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s",  "s"];

  var word2 = ["HOMO",  "LUMO",  "TE",  "BE",  "MIM",  "PMC",  "MLC",  "NVM",  "IHRS",  "ILRS",  "HRS",  "LRS",  "RH",  "RL",  "VCM",  "ECM",  "CRS",  "BRS",  "TCM",  "URS",  "SCLC",  "ALD",  "CVD",  "PVD",  "PLD",  "OFF",  "ON"];
  var tag2 = ["mp",  "mp",  "ds",  "ds",  "ds",  "ds",  "da",  "da",  "pc",  "pc",  "pr",  "pr",  "pr",  "pr",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "mc",  "s",  "s",  "s",  "s",  "po",  "po"];

  if(isNumeric(txt)) return {"tag":"n", "level":1, "similar":txt};
  var u_result = isUnit(txt);
  if(u_result) return {"tag":"u", "level":u_result, "similar":txt}; //숫자는 level2

  txt = removeSpecial(txt);
  var exception = [{"word":"In","tag":"o"}, {"word":"At","tag":"o"}, {"word":"As","tag":"o"}, {"word":"I","tag":"o"}, {"word":"ON/OFF","tag":"po"}, {"word":"OFF/ON","tag":"po"}];
  for(var i=0;i<exception.length;i++){
    if(txt == exception[i]["word"]){
      return {"tag":exception[i]["tag"], "level":2, "similar":txt};
    }
  }

  for(var i=0;i<word1.length;i++){
    if(txt.toLowerCase() == word1[i].toLowerCase()){
      return {"tag":tag1[i], "level":1, "similar":word1[i]};
    }
  }
  for(var i=0;i<word2.length;i++){
    if(txt == word2[i]){
      return {"tag":tag2[i], "level":1, "similar":word2[i]};
    }
  }

  var mt_result = isMaterial(txt);
  if(mt_result > 0) return {"tag":"m", "level":mt_result, "similar":txt};
  if(isDevice(txt)) return {"tag":"d", "level":1, "similar":txt};

  var transform = ["ning", "ical", "ies", "ion", "ism", "ity", "ing", "yed", "or", "ors", "ly", "ed", "es", "e", "s", "y", "d"];
  var tr_txt = [txt];

  for(var i=0;i<transform.length;i++){
    if(txt.length - transform[i].length > 0 && txt.substring(txt.length - transform[i].length, txt.length) == transform[i]){
      tr_txt.push(txt.substring(0, txt.length - transform[i].length));
    }
  }
  for(var i=0;i<word1.length;i++){
    for(var j=0;j<tr_txt.length;j++){
      for(var k=0;k<transform.length;k++){
        if((tr_txt[j] + transform[k]).toLowerCase() == word1[i].toLowerCase()){
          return {"tag":tag1[i], "level":2, "similar":word1[i]};
        }
      }if(tr_txt[j].toLowerCase() == word1[i].toLowerCase()){
        return {"tag":tag1[i], "level":2, "similar":word1[i]};
      }
    }
  }

  if(isNumeric(txt)) return {"tag":"n", "level":2, "similar":txt};
  return {"tag":"o", "level":3, "similar":txt};
}