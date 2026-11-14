/* ============================================================
   ΕΜΠΝΕΥΣΗ ΤΗΣ ΗΜΕΡΑΣ – πώς ενημερώνεται

   Επιλογή 1 (απλή): πρόσθεσε μια νέα γραμμή στη λίστα QUOTES παρακάτω.
     d = ημερομηνία (ΕΕΕΕ-ΜΜ-ΗΗ), t = κείμενο, a = ποιος το είπε, n = σχόλιο/μετάφραση (προαιρετικό)
     Η σελίδα δείχνει αυτόματα το πιο πρόσφατο κείμενο με ημερομηνία μέχρι σήμερα.

   Επιλογή 2 (εύκολη από το κινητό): φτιάξε ένα Google Sheet με στήλες
     d | t | a | n , κάνε το "Δημοσίευση στο web" ως CSV και βάλε τον σύνδεσμο στο SHEET_CSV_URL.
     Τότε η μητέρα προσθέτει μόνο μια γραμμή στο Sheet και η σελίδα ενημερώνεται μόνη της.
     (Δουλεύει όταν η σελίδα φιλοξενείται στο δικό της domain.)
   ============================================================ */
var SHEET_CSV_URL = "";
var QUOTES = [
  {t:"Γνῶθι σαυτόν.", a:"Δελφική επιγραφή", n:"Η γνώση του εαυτού μας είναι η αρχή κάθε μάθησης."},
  {t:"Μηδὲν ἄγαν.", a:"Δελφική επιγραφή", n:"Τίποτα με υπερβολή. Το μέτρο ως αρετή."},
  {t:"Ἀρχὴ ἥμισυ παντός.", a:"Αρχαία παροιμία", n:"Η αρχή είναι το μισό του παντός. Ό,τι ξεκινάμε σωστά, έχει ήδη προχωρήσει."},
  {t:"Ἓν οἶδα ὅτι οὐδὲν οἶδα.", a:"Σωκράτης (αποδίδεται)", n:"Ξέρω ότι δεν ξέρω τίποτα. Η αληθινή σοφία ξεκινά από την ταπεινότητα της γνώσης."}
];

(function(){
  var el=function(id){return document.getElementById(id)};
  var list=[],idx=0,start=0;
  var fmt=function(d){return d.toLocaleDateString('el-GR',{day:'numeric',month:'long',year:'numeric'})};
  var today=new Date(),iso=today.getFullYear()+'-'+('0'+(today.getMonth()+1)).slice(-2)+'-'+('0'+today.getDate()).slice(-2);

  function setup(items){
    items=items.filter(function(q){return q&&q.t});
    if(!items.length) return;
    var dated=items.every(function(q){return q.d});
    if(dated){
      items.sort(function(a,b){return a.d<b.d?-1:a.d>b.d?1:0});
      var vis=items.filter(function(q){return q.d<=iso});
      list=vis.length?vis:items; start=list.length-1;
    }else{
      list=items;
      var doy=Math.floor((today-new Date(today.getFullYear(),0,0))/864e5);
      start=doy%list.length;
    }
    idx=start; render();
  }
  function render(){
    var q=list[idx];
    el('inspText').textContent='«'+q.t+'»';
    el('inspBy').textContent=q.a||'';
    el('inspBy').style.display=q.a?'':'none';
    el('inspNote').textContent=q.n||'';
    el('inspNote').style.display=q.n?'':'none';
    el('inspDate').textContent=(idx===start)?('Σήμερα · '+fmt(today)):(q.d?fmt(new Date(q.d+'T12:00:00')):'Αρχείο');
    el('inspCount').textContent=(idx+1)+' / '+list.length;
    var single=list.length<2;
    el('inspPrev').style.visibility=el('inspNext').style.visibility=single?'hidden':'visible';
  }
  el('inspPrev').addEventListener('click',function(){idx=(idx-1+list.length)%list.length;render()});
  el('inspNext').addEventListener('click',function(){idx=(idx+1)%list.length;render()});

  function parseCSV(text){
    var rows=[],row=[],cur='',q=false;
    for(var i=0;i<text.length;i++){
      var c=text[i];
      if(q){ if(c==='"'){ if(text[i+1]==='"'){cur+='"';i++} else q=false } else cur+=c }
      else if(c==='"') q=true;
      else if(c===','){row.push(cur);cur=''}
      else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[i+1]==='\n') i++; row.push(cur);cur='';rows.push(row);row=[] }
      else cur+=c;
    }
    if(cur||row.length){row.push(cur);rows.push(row)}
    return rows;
  }
  setup(QUOTES.slice());
  if(SHEET_CSV_URL){
    fetch(SHEET_CSV_URL).then(function(r){return r.text()}).then(function(t){
      var rows=parseCSV(t);
      if(rows.length&&/^(d|date|ημερομηνία)$/i.test((rows[0][0]||'').trim())) rows.shift();
      var items=rows.map(function(r){return {d:(r[0]||'').trim(),t:(r[1]||'').trim(),a:(r[2]||'').trim(),n:(r[3]||'').trim()}});
      setup(items);
    }).catch(function(){});
  }
})();

document.getElementById('y').textContent=new Date().getFullYear();
var nav=document.getElementById('nav'),b=document.getElementById('menuBtn');
function setOpen(o){nav.classList.toggle('open',o);b.setAttribute('aria-expanded',o)}
b.addEventListener('click',function(){setOpen(!nav.classList.contains('open'))});
document.querySelectorAll('#menu a').forEach(function(a){a.addEventListener('click',function(){setOpen(false)})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')setOpen(false)});
