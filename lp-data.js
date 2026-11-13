/* 11.38: Lernpakete (iPad) zu Lektionen – Stationen, eigene Beispielinhalte und Lösungsbeschriftungen.
   Wird von lernpaket.html (Schüler) und vom Noten-Manager (Übersicht, Präsentationsmodus) geladen.
   Inhalte aus dem Schulbuch stehen NICHT hier, sondern nur in der privaten Lehrkraft-Datei (.cmeinheit, „ex“) –
   ist sie geladen, ersetzt sie die eigenen Beispiele Station für Station. */
(()=>{
const S=(k,t,d,min,type,own,book)=>({k,t,d,min,type,own,book:book===undefined?k:book});
const LP={
 l16a:{lesson:'16',part:'sach',title:'L16 · exempla – Wie die Römer an Vorbildern lernten',short:'Sachinfo',sub:'Latein · Lektion 16 · Sachinfo',bookId:'pontes-l16',
  text:'lie',steps:[
   S('lie','Wie die Römer an Vorbildern lernten','{T}Sachinfo · Sätze antippen',4,'read',{h:'Wie die Römer an Vorbildern lernten',task:'Lies den Text. Tippe dann zu jeder Frage den Satz an, in dem die Antwort steht.',src:'Eigener Lesetext (ohne Buchdatei)',
    paras:[['Die Römer erzählten sich gern Geschichten von Menschen, die für Rom Großes geleistet hatten.','Solche Vorbilder nannten sie exempla (Singular: exemplum = „Beispiel“, „Vorbild“).'],
     ['Um 500 v. Chr. griff der Etruskerkönig Porsenna Rom an.','Horatius Cocles verteidigte allein die Tiberbrücke, bis die Römer sie hinter ihm eingerissen hatten.','Dann sprang er in voller Rüstung in den Tiber und schwamm zurück nach Rom.','Später schlich sich der junge Mucius ins Lager der Etrusker, um Porsenna zu töten.','Er wurde gefangen und hielt zum Beweis seines Mutes seine rechte Hand ins Feuer.','Porsenna ließ ihn beeindruckt frei; seitdem trug Mucius den Beinamen Scaevola, „Linkshänder“.','Schließlich schlossen Rom und Porsenna Frieden, und die Römer mussten Geiseln stellen, darunter das Mädchen Cloelia.','Sie floh mit den anderen Mädchen aus dem Lager und schwamm durch den Tiber nach Rom.','Zur Ehre erhielt sie ein Reiterstandbild an der Via Sacra.'],
     ['Ob alles wirklich so geschah, weiß niemand: Es sind Sagen aus der Frühzeit Roms, die der Geschichtsschreiber Livius aufgeschrieben hat.'],
     ['Vor allem die Adelsfamilien pflegten solche exempla.','Starb ein berühmter Adliger, erzählte ein Sohn bei der Begräbnisfeier von den Taten des Toten und seiner Vorfahren.','Der Grieche Polybios hielt diese Reden für ein Erfolgsgeheimnis Roms: Sie spornten die Jugend an, für das Vaterland alles zu ertragen.','Auch Redner vor Gericht nutzten exempla, denn Beispiele aus der Geschichte galten als überzeugende Beweise.']],
    qs:[['Was bedeutet das Wort exemplum?',1],['Woher hat Mucius seinen Beinamen?',7],['Wie ehrten die Römer Cloelia?',10],['Sind die Geschichten sicher wahr?',11],['Warum hielt Polybios die Begräbnisreden für wichtig?',14],['Wozu nutzten Redner exempla?',15]],
    done:'Jetzt kennst du die drei Helden – weiter geht es mit den Stationen.'}),
   S('hel','Drei Helden, drei Taten','Cloelia, Horatius, Mucius · zuordnen',3,'sorter',{h:'Wer hat was getan?',task:'Ziehe jede Tat zum passenden Helden.',cats:['Cloelia','Horatius Cocles','Mucius Scaevola'],
    items:[['verteidigte eine Tiberbrücke gegen die Etrusker',1],['sprang in voller Rüstung in den Tiber und schwamm nach Rom',1],['schlich sich ins Lager, um Porsenna zu töten',2],['hielt seine rechte Hand ins Feuer',2],['erhielt den Beinamen „Linkshänder“',2],['floh mit den Mädchen aus dem Lager der Etrusker',0],['bekam ein Reiterstandbild an der Via Sacra',0]],done:'Alle drei gelten als exempla: Vorbilder für Mut und Einsatz für Rom.'},null),
   S('exe','Was ist ein exemplum?','Aussagen wischen',2,'swiper',{h:'Stimmt die Aussage?',task:'Wische nach rechts (stimmt) oder links (stimmt nicht).',l:'stimmt nicht',r:'stimmt',
    cards:[['Ein exemplum ist ein Beispiel oder Vorbild.',true,'exemplum = „Beispiel“, „Vorbild“.'],['Bei Begräbnissen berühmter Adliger erzählte ein Sohn von den Taten seiner Vorfahren.',true,'Diese Reden sollten an die Verdienste der Familie erinnern.'],['Der Grieche Polybios hielt diese Reden für ein Erfolgsgeheimnis Roms.',true,'Sie spornten die Jugend an, für das Vaterland alles zu ertragen.'],['exempla erzählen vor allem von den Leistungen der „kleinen Leute“.',false,'Sie zeigen vor allem die Verdienste des Adels.'],['Auch Redner nutzten exempla als überzeugende Beweise.',true,'Geschichtliche Beispiele galten als starkes Argument.'],['Die Geschichten von Cloelia, Horatius und Mucius sind sicher bewiesen.',false,'Es sind Sagen aus der Frühzeit Roms.']],done:'Die Römer lernten an Vorbildern – an exempla.'},null),
   S('seq','Rom gegen König Porsenna','Szenen in die richtige Reihenfolge',2,'order',{h:'Was geschah nacheinander?',task:'Tippe die Szenen in der richtigen Reihenfolge an.',
    items:['Der Etruskerkönig Porsenna greift Rom an.','Horatius Cocles verteidigt die Tiberbrücke, bis sie eingerissen ist.','Mucius Scaevola schleicht sich ins Lager der Etrusker.','Mucius hält seine Hand ins Feuer – Porsenna lässt ihn frei.','Rom schließt Frieden und gibt Porsenna Geiseln, darunter Cloelia.','Cloelia flieht mit den Mädchen durch den Tiber.'],done:'So erzählt es der Geschichtsschreiber Livius.'},null)]},
 l16b:{lesson:'16',part:'ueb',title:'L16 · Übungen 1–6',short:'Übungen 1–6',sub:'Latein · Lektion 16 · Ü 1–6 · D 1–3',bookId:'pontes-l16',
  steps:[
   S('ppp','Zurückführen erwünscht','{U}Ü 1 · D 1 · PPP antippen',2,'tarn',{h:'Finde alle PPP',task:'Tippe alle Formen an, die ein PPP sind (Partizip Perfekt Passiv).',
    words:[['vocātum','vocāre'],['templum'],['audītum','audīre'],['dōnum'],['laudātum','laudāre'],['nōndum'],['pūnītum','pūnīre'],['verbum'],['mūtātum','mūtāre'],['iterum']],done:'PPP auf -tum/-sum kommen vom Verb: vocātum ← vocāre.'}),
   S('whl','Vergangen und passiv','{U}Ü 2 · Form an drei Rädern einstellen',3,'wheels',{h:'Bestimme die Form',task:'Stelle Person, Numerus und Tempus an den Rädern ein.',
    forms:[['laudātī sumus',1,1,0,'wir sind gelobt worden'],['monitae erant',3,1,1,'sie waren ermahnt worden'],['vocātus sum',1,0,0,'ich bin gerufen worden'],['missa es',2,0,0,'du bist geschickt worden'],['audītī erātis',2,1,1,'ihr wart gehört worden'],['captum erat',3,0,1,'es war gefangen worden']]}),
   S('tar','Gut getarnt','{U}Ü 3 a · PPP antippen, Lösungswort finden',2,'tarn',{h:'Gut getarnt',task:'Tippe alle PPP an. Ihre Buchstaben ergeben ein lateinisches Wort.',sol:'VIRTUS',
    words:[['vocātus','vocāre','V','Subst.'],['amīcus',null,'A','Substantiv'],['missī','mittere','I','Subst.'],['templum',null,'E','Substantiv'],['rogāta','rogāre','R','Subst.'],['magna',null,'N','Adjektiv'],['captī','capere','T','Subst.'],['hortī',null,'O','Substantiv'],['ductum','dūcere','U','Subst.'],['bona',null,'L','Adjektiv'],['laudātās','laudāre','S','Subst.']],done:'virtūs – Tapferkeit, Tüchtigkeit: das große Thema der Lektion.'}),
   S('wor','Wortarten der übrigen Wörter','{U}Ü 3 b · Substantiv oder Adjektiv?',1,'sorter',{h:'Substantiv oder Adjektiv?',task:'Ziehe die Wörter, die kein PPP sind, in die passende Spalte.',cats:['Substantiv','Adjektiv'],
    items:[['amīcus',0],['templum',0],['magna',1],['hortī',0],['bona',1]]}),
   S('mem','Infinitive aus PPPs erschließen','{U}Ü 4 · Memory: PPP und Infinitiv',3,'memory',{h:'Memory: PPP und Infinitiv',task:'Decke zwei Karten auf: ein PPP und den passenden Infinitiv.',
    pairs:[['captum','capere'],['missum','mittere'],['vīsum','vidēre'],['datum','dare'],['positum','pōnere'],['mōtum','movēre'],['scrīptum','scrībere'],['ductum','dūcere']]}),
   S('end','Jeder Anfang hat auch ein Ende','{U}Ü 5 · Satzanfang und Ende verbinden',2,'pairs',{h:'Welches Ende passt?',task:'Tippe einen Satzanfang an und dann das passende Ende. Achte auf Kasus, Numerus und Genus.',
    pairs:[['Puellae ā mātre …','vocātae sunt.'],['Templum ā Rōmānīs …','aedificātum est.'],['Mārcus ā patre …','laudātus est.'],['Servī ā dominō …','pūnītī sunt.'],['Villa ab hostibus …','dēlēta est.']]}),
   S('bau','Formen-Baukasten','{U}D 2 · PPP und esse zusammenstecken',3,'build',{h:'Baue das Perfekt Passiv',task:'Wähle das PPP mit der passenden Endung und die Form von esse. Beachte die KNG-Regel.',
    items:[['Mārcus ā patre ___ (laudāre).','laudāt',['us','a','ī','ae','um'],0,['est','sunt','erat'],0,'Markus ist vom Vater gelobt worden.'],['Puellae ā magistrō ___ (vocāre).','vocāt',['us','a','ī','ae','um'],3,['est','sunt','erat'],1,'Die Mädchen sind vom Lehrer gerufen worden.'],['Templum ā Rōmānīs ___ (aedificāre).','aedificāt',['us','a','ī','ae','um'],4,['est','sunt','erant'],0,'Der Tempel ist von den Römern gebaut worden.'],['Servī ā dominō ___ (pūnīre).','pūnīt',['us','a','ī','ae','um'],2,['est','sunt','erat'],1,'Die Sklaven sind vom Herrn bestraft worden.']]}),
   S('cha','Chaos','{U}Ü 6 · D 3 · Pronomina in Spalten ziehen',2,'sorter',{h:'Welche Art von Pronomen?',task:'Ziehe jedes Pronomen in die passende Spalte.',cats:['Relativpronomen','Personalpronomen','Demonstrativpronomen'],
    items:[['quem',0],['quae',0],['cuius',0],['vōbīs',1],['ego',1],['nōbīs',1],['hic',2],['illa',2],['eius',2],['huius',2]]})]},
 l16c:{lesson:'16',part:'ueb',title:'L16 · Übungen 7–11',short:'Übungen 7–11',sub:'Latein · Lektion 16 · Ü 7–11 · D 4–5',bookId:'pontes-l16',
  steps:[
   S('sgl','Hier dreht sich alles um eine Person','{U}Ü 7 · D 4 · Satzglied antippen',3,'quiz',{h:'Welches Satzglied ist das Relativpronomen?',opts:['Subjekt','Akkusativobjekt','Dativobjekt','adverbiale Bestimmung','Attribut'],
    qs:[['Amīcus, **quī** in forō stat, Mārcum salūtat.',0,'quī ist Subjekt des Relativsatzes.'],['Amīcus, **quem** Mārcus salūtat, laetus est.',1,'quem = wen? → Akkusativobjekt.'],['Amīcus, **cui** Mārcus librum dat, gaudet.',2,'cui = wem? → Dativobjekt.'],['Amīcus, **quōcum** Mārcus ambulat, rīdet.',3,'quōcum = mit dem → adverbiale Bestimmung.'],['Der Hund, **dessen** Besitzer krank ist, bellt.',4,'dessen bestimmt das Nomen „Besitzer“ näher → Attribut.'],['Die Lehrerin, **mit der** wir sprechen, lacht.',3,'mit der → adverbiale Bestimmung (Begleitung).']]}),
   S('arr','Manches ist relativ','{U}Ü 8 · D 5 · Pronomen wählen, Pfeil zum Bezugswort',4,'arrow',{h:'Wähle das Relativpronomen – und zeige auf sein Bezugswort',task:'1. Tippe das passende Relativpronomen an. 2. Tippe dann das Wort an, auf das es sich bezieht.',
    items:[{s:['Mārcus','amīcōs','salūtat,','?','in','forō','vīdit.'],opt:['quōs','quās','quem'],ans:0,gap:3,ref:1,kng:'m',de:'Markus grüßt die Freunde, die er auf dem Forum gesehen hat.'},{s:['Puella,','?','māter','vocāverat,','domum','properāvit.'],opt:['quam','quae','cuius'],ans:2,gap:1,ref:0,kng:'f',de:'Das Mädchen, dessen Mutter gerufen hatte, eilte nach Hause.'},{s:['Templum,','?','Rōmānī','aedificāvērunt,','magnum','est.'],opt:['quem','quod','quae'],ans:1,gap:1,ref:0,kng:'n',de:'Der Tempel, den die Römer gebaut haben, ist groß.'},{s:['Senātor','servōs,','?','in','urbem','vēnerat,','dīmīsit.'],opt:['quibuscum','quōcum','quōs'],ans:0,gap:2,ref:1,kng:'m',de:'Der Senator entließ die Sklaven, mit denen er in die Stadt gekommen war.'}]}),
   S('pan','Pantomime','{U}Ü 9 · iPad als Spielkarte',1,'pant',{words:['currere','dormīre','rīdēre','legere','scrībere','clāmāre','natāre','ambulāre','dīcere','pūnīre','trānāre','pugnāre']},null),
   S('aci','AcI im Passiv: vorher oder gleichzeitig?','{U}Ü 10 · auf den Zeitstrahl ziehen',2,'sorter',{h:'Zeitverhältnis im AcI',task:'Ziehe jeden Satz zum passenden Zeitverhältnis. Achte auf den Infinitiv.',cats:['vorzeitig (Infinitiv Perfekt Passiv)','gleichzeitig (Infinitiv Präsens Passiv)'],
    items:[['Mārcus audit amīcum laudātum esse.',0],['Mārcus audit amīcum laudārī.',1],['Constat urbem dēlētam esse.',0],['Videō puellās vocārī.',1]]}),
   S('deu','Fit für Deutsch','{U}Ü 11 · Fremdwort und lateinisches Verb verbinden',2,'pairs',{h:'Woher kommt das Fremdwort?',task:'Tippe ein Fremdwort an und dann das lateinische Verb, von dessen PPP es stammt.',
    pairs:[['Diktat','dīcere (dictum)'],['Produkt','prōdūcere (prōductum)'],['Motiv','movēre (mōtum)'],['Version','vertere (versum)']]})]},
 l16d:{lesson:'16',part:'pont',title:'L16 · Ponticulus',short:'Ponticulus',sub:'Latein · Lektion 16 · Ponticulus 1–3',bookId:'pontes-l16',
  steps:[
   S('tab','Kasus und Numerus','{U}Ponticulus 1 · Formen ins Raster ziehen',3,'sorter',{h:'In welches Feld gehört die Form?',task:'Ziehe jede Form in das passende Feld. Manche Formen passen in zwei Felder – sie kommen zweimal vor.',grid:true,
    cats:['Nom. Sg.','Nom. Pl.','Gen. Sg.','Gen. Pl.','Dat. Sg.','Dat. Pl.','Akk. Sg.','Akk. Pl.','Abl. Sg.','Abl. Pl.'],
    items:[['rēgum',3],['mīlitī',4],['pācem',6],['patrēs',[1,7]],['patrēs',[1,7]],['homō',0],['corpore',8],['nōminibus',[5,9]],['nōminibus',[5,9]],['vōcis',2]]}),
   S('adj','Adjektiv anpassen','{U}Ponticulus 2 · Endung wählen',2,'quiz',{h:'Welche Form passt (KNG)?',
    qs:[['templō ___ (magnus)',['magnō','magnā','magnum'],0,'templō ist Dat./Abl. Sg. n. → magnō.'],['puellās ___ (bonus)',['bonōs','bonās','bona'],1,'puellās ist Akk. Pl. f. → bonās.'],['mīlitum ___ (fortis)',['fortium','fortibus','fortem'],0,'mīlitum ist Gen. Pl. → fortium.'],['nocte ___ (longus)',['longā','longō','longa'],0,'nocte ist Abl. Sg. f. → longā.']]}),
   S('rel','Relativsatz oder Hauptsatz?','{U}Ponticulus 3 · Unterschied erkennen',1,'quiz',{h:'Was ist der Unterschied?',
    qs:[['Mārcus amīcum, **quem** in forō vīdit, salūtat.',['Relativsatz – „den“ bezieht sich auf amīcum.','Hauptsatz – „ihn“ ist ein Personalpronomen.','AcI'],0,'quem leitet einen Relativsatz ein.'],['Mārcus amīcum salūtat. **Eum** in forō vīdit.',['Relativsatz','Zwei Hauptsätze – eum ist ein Personalpronomen („ihn“).','AcI'],1,'Statt eines Relativsatzes stehen zwei Hauptsätze.']]})]}
};
/* Beschriftungen (Aufgabe → Lösung) je Station – gleiche Reihenfolge wie die Fehlernummern in der Abgabe */
const TP=['','1. Person','2. Person','3. Person'],NU=['Singular','Plural'],TE=['Perfekt Passiv','Plusquamperfekt Passiv'];
function labels(st,d){const o=d||st.own;if(!o)return [];switch(st.type){
 case 'sorter':return o.items.map(([t,c])=>[t,(Array.isArray(c)?c:[c]).map(i=>o.cats[i]).join(' / ')]);
 case 'swiper':return o.cards.map(c=>[c[0],c[1]?o.r:o.l]);
 case 'quiz':return o.qs.map(q=>Array.isArray(q[1])?[q[0].replace(/\*\*/g,''),q[1][q[2]]]:[q[0].replace(/\*\*/g,''),o.opts[q[1]]]);
 case 'pairs':case 'memory':return o.pairs.map(p=>[p[0],p[1]]);
 case 'order':return o.items.map((t,i)=>['Schritt '+(i+1),t]);
 case 'tarn':return o.words.map(w=>[w[0],w[1]?'PPP ← '+w[1]:'kein PPP']);
 case 'wheels':return o.forms.map(f=>[f[0],TP[f[1]]+', '+NU[f[2]]+', '+TE[f[3]]+(f[4]?' – „'+f[4]+'“':'')]);
 case 'build':return o.items.map(it=>[it[0],it[1]+it[2][it[3]]+(it[7]?' '+it[7]:'')+' '+it[4][it[5]]]);
 case 'read':{const T=o.paras.flat();return o.qs.map(q=>[q[0],T[q[1]]])}
 case 'arrow':return o.items.map(it=>[it.s.map((w,i)=>i===it.gap?'___':w).join(' '),it.opt[it.ans]+' → '+it.s[[].concat(it.ref)[0]].replace(/[,.]$/,'')]);
 default:return []}}
const C={lie:'Lesen',hel:'Helden',exe:'exemplum',seq:'Reihenfolge',ppp:'PPP',mem:'Memory',whl:'Formen',bau:'Baukasten',end:'Satzenden',tar:'Getarnt',wor:'Wortarten',cha:'Chaos',arr:'Relativ',sgl:'Satzglied',tab:'Kasus',adj:'Adjektiv',aci:'AcI',deu:'Fremdwörter',rel:'Unterschied',pan:'Pantomime'};
for(const P of Object.values(LP))for(const st of P.steps)st.c=C[st.k]||st.k;
window.LP=LP;window.lpLabels=labels;
})();
