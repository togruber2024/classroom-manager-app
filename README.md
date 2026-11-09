# Classroom-Manager

CLASSROOM-MANAGER – BEDIENUNGSANLEITUNG
Stand: 09.11.2026 · Version 9.94
Untertitel: Die lokale Unterrichts- & Notenverwaltung

Kurzfassung: Der „?“-Button oben rechts öffnet die Hilfe mit Suche (Kapitel „Neu“: die letzten zehn neuen Funktionen); dieselben Texte stehen
in der Kurzanleitung (Classroom-Manager-Kurzanleitung.pdf). Diese Anleitung beschreibt
alles ausführlicher. Ganz unten folgt der Änderungsverlauf aller Versionen.

STARTEN
Empfohlen ist die Nutzung als Web-App (Webadresse, z. B. GitHub Pages), am iPad als App auf
dem Home-Bildschirm, am Mac im Dock. Alternativ Classroom-Manager.html per Doppelklick öffnen.
Alle Eingaben und importierten Dateien werden lokal im Browser verarbeitet – ohne Cloud, ohne Konto.
Startansicht: War die App vor weniger als zwei Stunden in Benutzung, öffnet sie den zuletzt
benutzten Manager, sonst den Unterrichts-Manager.
Kopfzeile: Unterrichts-Manager und Noten-Manager (Umschalter in der Mitte), rechts „?“ (Hilfe),
„Rückgängig“ und „Backup“. Die Versionsnummer steht neben dem Titel.
Datenschutz (Augen-Symbol neben „?“): Vorführmodus – Namen werden unscharf, Bewertungen unleserlich und in
Zufallsfarben ohne Bezug zur echten Bewertung angezeigt. Drucken, Export, Backup und Kopieren sind gesperrt;
Daten werden nicht verändert. Der Modus endet mit dem Schließen der App oder per erneutem Klick.

NAVIGATION
Die Leiste unter der Kopfzeile zeigt den Ort: Fach › Klasse › Halbjahr › Quartal › Bereich.
Der Pfeil links (oder ein Klick auf die Leiste) klappt das vollständige Auswahlmenü auf.
Rechts in der Leiste steht dezent das aktuelle Schuljahr (z. B. „Schuljahr 2026/27“).
Auf kleinen Bildschirmen lassen sich Navigationsleisten horizontal wischen.

DATEN UND BACKUP
Daten werden im Browserprofil des jeweiligen Geräts gespeichert, nicht in der HTML-Datei.
„Backup“ öffnet den Backup-Dialog:
• Aufklappbare Bereiche mit Kurzstatus: „Speicherort“ (nur Chrome/Edge am Mac/PC: Downloads, jedes Mal
  fragen oder fester Ordner), „Speicher“, „Automatische Sicherung“, „Daten prüfen“.
  Es ist immer nur ein Bereich offen.
• Darunter das Dateiformat: JSON (reine Sicherungsdatei, Standard) oder Excel (XLSX: alle
  Bewertungstabellen plus eingebettetes Backup; lässt sich ebenfalls wiederherstellen).
• „Speichern“, „Wiederherstellen“, „Schließen“. Wiederherstellen ersetzt alle Daten nach Bestätigung.
• Schnell-Backup: Der kleine Download-Knopf rechts neben „Backup“ speichert sofort ein JSON-Backup
  (am gewählten Speicherort); ein grüner Haken bestätigt es. Klappt das nicht, öffnet sich der Backup-Dialog.
• Schnell-Wiederherstellen (⬆ ganz rechts): lädt das neueste Backup – am Mac in Chrome/Edge automatisch aus dem
  festen Ordner bzw. dem Ordner der automatischen Sicherung, sonst (Safari, iPad) über die Dateiauswahl. Rückfrage mit
  Datum des Backups.
• Jede Wiederherstellung lässt sich rückgängig machen: Vorher wird der aktuelle Stand im Browser gesichert. Danach
  erscheint oben „… wiederhergestellt · Rückgängig“; im Backup-Dialog bleibt „Letzte Wiederherstellung rückgängig
  machen“ bis zur nächsten Wiederherstellung.
• „Speicher“ (aufklappbar): zeigt, wie voll der Browserspeicher ist und welcher Bereich den meisten
  Platz braucht. Ab 85 % erscheint oben in der App eine Warnung („Backup öffnen“ · „Später“).
Das Backup enthält Fächer, Klassen, Namen, Geschlechtsangaben, Bewertungen, Hausaufgaben,
Material, Abwesenheiten, Sitzpläne, Räume, Historie und Raumvorlagen.
Ein orangefarbener Punkt am Backup-Button erinnert, wenn das letzte Backup älter als 7 Tage ist.
Automatische Sicherung: Am Desktop in Chrome/Edge kann ein Ordner gewählt werden; die App
speichert Änderungen dann selbstständig mit Datum und Uhrzeit (in Safari nicht verfügbar).
Safari/iPad: Safari kann Daten löschen, wenn eine Webseite 7 Tage nicht geöffnet wurde. Als App auf
dem Home-Bildschirm bzw. im Dock gilt das nicht. Trotzdem regelmäßig sichern. Große Datenmengen
werden beim Speichern automatisch verkleinert (leere, nicht zugeordnete Seiten entfallen), damit der
begrenzte Safari-Speicher reicht.
Daten prüfen: findet doppelte Bereiche, verwaiste Seiten, Zeilen ohne Namen und doppelte Namen und
behebt, was eindeutig ist; alles andere wird als Hinweis gemeldet.
Der globale „Rückgängig“-Button (orange, wenn etwas zurückgenommen werden kann) nimmt gespeicherte
Änderungen zurück. Dieser Verlauf ersetzt kein Backup.
Neue Version: Die Web-App prüft beim Öffnen, beim Zurückkehren ins Fenster und alle 30 Minuten, ob auf dem Server
eine neuere Version liegt. Dann erscheint oben „Neue Version … verfügbar“ mit „Jetzt aktualisieren“ (lädt sofort neu,
Daten bleiben erhalten) und „Später“. Ohne Klick wird nie neu geladen. Die einzelne HTML-Datei prüft nicht.
Gerät oder Speicherort wechseln (Ordner, Einzeldatei, Webadresse): vorher Backup speichern, danach
wiederherstellen – Daten werden je Speicherort getrennt gespeichert.
Fehlerprotokoll … (unter „Daten prüfen“): zeigt die zuletzt aufgezeichneten Fehlermeldungen dieses Geräts (ohne Schülerdaten)
zum Kopieren – hilfreich, wenn etwas nicht funktioniert. Reagiert der Noten- oder Unterrichts-Manager nicht, lädt die App
ihn einmal neu; Backup speichern und Wiederherstellen funktionieren notfalls auch ohne ihn (direkt über den Gerätespeicher).
Alle Daten löschen … (unter „Daten prüfen“): entfernt nach Rückfrage alle Daten dieses Geräts – auf Wunsch
zuerst ein Backup, zur Bestätigung „LÖSCHEN“ eintippen. Andere Geräte und Backup-Dateien bleiben erhalten.

ZWEI GERÄTE
Daten werden je Gerät getrennt gespeichert. Um auf einem anderen Gerät mit dem aktuellen Stand weiterzuarbeiten:
Backup speichern und auf dem anderen Gerät „Wiederherstellen“ (ersetzt dort alle Daten). Der frühere
Geräte-Abgleich (AirDrop-Zusammenführen) wurde in Version 7.49 entfernt.

SCHULJAHR, ARCHIV UND STUNDENPLAN
Klick auf „Schuljahr 2026/27“ rechts in der Navigationsleiste öffnet ein Menü:
• Stundenplan …: Stundenzeiten einmal eintragen (änderbar, „+ Stunde“, Minus entfernt). Welche Klasse wann Unterricht
  hat, erkennt die App selbst: Bewertungen, Hausaufgaben-Einträge und Abwesenheiten zum heutigen Datum werden der
  laufenden Stunde zugeordnet – auch Eingaben in der Pause direkt danach (bis zum Beginn der nächsten Stunde).
  Ab zwei verschiedenen Tagen mit derselben Klasse in derselben Stunde (und mehrheitlich) gilt sie als erkannt und
  erscheint im Stundenplan blau markiert; der Raum wird mitgelernt. Eigene Einträge haben immer Vorrang, „—“ schaltet
  eine erkannte Stunde ab. Beobachtungen der letzten 12 Wochen werden berücksichtigt.
  Während einer eingetragenen Stunde (ab 10 Minuten vorher) wählt die App beim Öffnen bzw. nach einer Pause von
  mindestens 10 Minuten automatisch Fach, Klasse und Raum und zeigt den Unterrichts-Manager. Jede Stunde wird nur
  einmal automatisch gewählt; danach gilt die eigene Auswahl. Der Hinweis unten bietet „Rückgängig“.
  Der Stundenplan ist im Backup enthalten.
• Archiv eines früheren Schuljahres öffnen …: zeigt die Übersichten eines Archivs (wie Quartals- und
  Halbjahresübersicht) nur zum Lesen, mit Personensuche und Drucken. Die aktuellen Daten bleiben unverändert.
• Schuljahr abschließen …: Jedes Schuljahr wird getrennt gehalten, damit die App schlank bleibt.
  1. Das ganze Schuljahr wird als Archivdatei gespeichert, optional mit Passwort (AES-Verschlüsselung im Browser;
     ohne Passwort ist das Archiv nicht lesbar).
  2. Nach einer Kontrollfrage („Datei vorhanden?“) werden Noten, Hausaufgaben, Abwesenheiten und Sitzplan-Verläufe
     entfernt.
  3. Angehakte Klassen gehen mit Schülerliste, Sitzplan und Räumen ins neue Schuljahr; die neue Bezeichnung wird
     vorgeschlagen (6e → 7e) und ist änderbar. Nicht angehakte Klassen werden entfernt. Jahrgang 11–13 erhält
     Notenpunkte. Jede Klasse beginnt mit „1. Halbjahr“.
  Danach auf einem zweiten Gerät einmal komplett übertragen (Backup → Wiederherstellen).
Ein Archiv kann auch über „Wiederherstellen“ vollständig geladen werden (ersetzt die aktuellen Daten).

SCHÜLERÜBERSICHT UND FEHLZEITEN
„Schülerübersicht“ (links in der Aktionszeile des Noten-Managers, vor „＋ Schüler:in“) zeigt links die Klasse mit der Zahl der Fehltage (sortierbar nach Name oder Fehltagen, Suche),
rechts das Profil der gewählten Person: Fehltage mit Datum und alle Übersichtswerte aus allen Fächern, Halbjahren
und Quartalen (Mittelwerte, fehlende Hausaufgaben, sonstige Mitarbeit, Klausuren, Selbsteinschätzung,
Quartals- und Halbjahresnoten) in hellen Notenfarben; die Einzelwerte sind aufklappbar. „Drucken“ erstellt ein Blatt
(z. B. für Elternsprechtag oder Zeugniskonferenz). Fehltage stammen aus der Abwesenheit im Unterrichts-Manager
(je Klasse, Person und Datum).

FÄCHER, KLASSEN UND QUARTALE
Im aufgeklappten Menü mit „+ Fach“ und „+ Klasse“ anlegen. Klassen stehen vor Kursen; innerhalb der
Gruppen wird alphabetisch mit natürlicher Zahlenfolge sortiert (6b vor 10a).
„+ Klasse“ legt eine Klasse mit 1. Halbjahr und 1. Quartal an. Weitere Halbjahre und Quartale werden
über ihre Plus-Buttons ergänzt. Ein neues Quartal startet ohne Rubriken; Mitarbeit, Hausaufgaben,
Tests, Klausuren und Übersichtsseiten werden bei Bedarf hinzugefügt.
Namen beim Anlegen: einfügen oder aus einer Datei übernehmen (Excel, CSV, TXT, JSON oder Klassenlisten-PDF
der Schule, eine Seite je Klasse mit „5a; Lehrkraft“ und „Nachname, Vorname (m/w)“). Beim PDF wählt die App
die Seite zum eingegebenen Klassennamen (sonst Auswahl), übernimmt Namen und Geschlecht und vergleicht die
Anzahl mit der Fußzeile „weiblich / männlich / divers“. Die Geschlechter verbessern zugleich die
Vorschläge („Gelernte Namen“).
Kurslisten der Oberstufe („Kursliste EK1e28 - Erdkunde Kurs 1 …“, Zeilen „1 Nachname, Vorname P3“):
„EK1e28“ findet den Kurs über den Kurscode, „11a“ im Fach Erdkunde die Seite „Erdkunde 11a“; ohne
eindeutigen Treffer erscheint die Auswahl. Notensystem → Notenpunkte; das Geschlecht wird aus dem Vornamen
vorgeschlagen (unbekannte und mehrdeutige Namen bleiben leer) und nicht gelernt. Kontrolle über die
lückenlose Nummerierung. Das PDF wird nur auf dem Gerät gelesen; der PDF-Leser (pdf.js, Mozilla,
Apache-2.0) wird erst beim Import geladen.
Die Quartalsauswahl gilt gemeinsam für die Rubriken. Klausuren gehören zu dem Quartal, in dem sie
angelegt wurden. Die Stifte bzw. Zahnräder öffnen die Verwaltung der jeweiligen Navigationszeile
(Umbenennen, Entfernen über das rote Minus; Löschen von Eintragungen wird bestätigt).
Gleichnamige Klassen teilen ihre Namen fachübergreifend („8d“ = „Klasse 8d“). Bewertungen bleiben je
Fach getrennt.
Beim Klassenwechsel bleibt die Rubrik erhalten, sofern sie in der Zielklasse vorhanden ist; Halbjahr
und Quartal werden nach Möglichkeit beibehalten.

BEZEICHNUNG EINER MITARBEITSSPALTE
Unter jedem Datum der mündlichen Mitarbeit steht ein Feld „Bezeichnung“ (z. B. „Kurzvortrag“
oder „Exkursion“). Leer bleibt nur ein blasser Platzhalter. Die Bezeichnung erscheint in der
Quartalsübersicht, der Schülerübersicht, im Excel-Export („MM · 03.11.2026 · Kurzvortrag“), in der
kompakten Ansicht und in der Schnelleingabe des Unterrichts-Managers. Gewichtung und Berechnung
bleiben unverändert; stärker zählen lässt sich die Spalte über ihr Prozentfeld.

NOTENSYSTEM PRO KLASSE ODER KURS
Beim Anlegen oder später über „Klassen bearbeiten“ zwischen „Noten“ (1–6) und „Notenpunkte“ (0–15)
wählen. Jahrgänge 11–13 werden als Notenpunkte vorausgewählt. Die Einstellung gilt fächerübergreifend.
Die Bezeichnung schriftlicher Arbeiten folgt dem Notensystem: Klassenarbeit(en) bzw. Klausur(en).
Oberstufe: Mitarbeit ++ = 14, + = 11, o = 8, - = 5, -- = 2, --- = 0; Zeichenanzeige 13–15 = ++,
12 = ++/+, 11 = +, 9–10 = +/o, 8 = o, 6–7 = o/-, 5 = -, 3–4 = -/--, 2 = --, 1 = --/---, 0 = ---.

NAMEN ANLEGEN UND IMPORTIEREN
Beim Anlegen einer Klasse Namen ins Textfeld kopieren oder Dateien (XLSX, CSV, TSV, TXT, JSON)
übernehmen; bei XLSX ist das Tabellenblatt wählbar. Empfohlen: ein Name pro Zeile, „Nachname, Vorname“.
Spalten „Nachname“, „Vorname“ und optional „Geschlecht“/„Gender“ werden erkannt.
„+ Schüler:in“ ergänzt eine Person; nach Eingabe des Namens sortiert sie sich alphabetisch ein. „Geschlecht“ öffnet die Klassenliste mit m/w-Feldern;
Für Personen ohne Angabe schlägt die App anhand einer lokalen Liste häufiger Vornamen m oder w vor
(gestrichelt markiert, „Vorschlag“). Uneindeutige Namen (z. B. Kim, Luca) und unbekannte Namen erhalten keinen
Vorschlag. Vorschläge werden erst mit „Speichern“ übernommen und lassen sich vorher per Klick ändern; ohne Auswahl
bleibt das Feld leer (keine automatische Zuordnung mehr). Die App lernt dazu: Unbekannte Vornamen, für die du m/w
wählst, werden gemerkt; korrigierte Vorschläge und widersprüchliche Angaben machen einen Namen „nicht eindeutig“
(kein Vorschlag mehr). Uneindeutige Namen wie Kim werden nicht gelernt. „Gelernte Namen (n)“ unten im Dialog zeigt
die Liste zum Ändern, Hinzufügen und Löschen. Gespeichert werden nur Vorname und m/w (im Backup).
Die Klassenliste gilt in allen Fächern und im Sitzplan.
Bei Namensfeldern schlägt der Browser keine Kontakte vor.

BEWERTUNGEN AUS EXCEL
„Import …“ übernimmt XLSX-Listen mit mündlichen Bewertungen und fehlenden Hausaufgaben (Spalten
„Nachname“, „Vorname“ und Datumsspalten wie 21.8. oder 21.8.2026). Vor Übernahme Tabellenblatt, Jahr,
Halbjahr und Quartal prüfen. HA = fehlende Hausaufgabe. Leere Zellen überschreiben nichts; vorhandene
abweichende Bewertungen bleiben, sofern Überschreiben nicht aktiviert wird.
Selbsteinschätzung und Quartalsnote: Excel-Zellen kopieren, erstes Zielfeld anklicken, einfügen.

ANSICHT UND AKTIONSLEISTEN (NOTEN-MANAGER)
Obere Zeile: Seitentitel links; rechts alle Anzeige-Schalter – je nach Seite „1. Quartal“, „Zeichen“ bzw.
„Noten“, „Tendenzen“, dann „Schraffuren“, „Kompaktansicht“ – und „Drucken“ (auch auf den Übersichten).
Zweite Zeile, nur Buttons: links „Schülerübersicht“, „+ Schüler:in“, „Geschlecht“; rechts „Import …“,
„Notenspiegel“, „Eingaben löschen“ (entfernt nach Bestätigung die Eintragungen der Seite; Namen und
Spalten bleiben). Im Tabellenkopf bleiben nur Schalter einer Spalte (z. B. Dezimal/Tendenz/Gerundet beim
Mittel, Prozent/Verhältnis bei der Gewichtung).
Schraffuren zeigen Zwischenstufen (z. B. 2–3) als gestreifte Notenfarben; die Einstellung gilt auch im
Unterrichts-Manager.
Der Schalter „1. Quartal“ blendet im 2. Quartal die Spalten des 1. Quartals zum Vergleich ein (nur lesend).

MÜNDLICHE MITARBEIT UND TESTS
Datum und Gewichtung im Spaltenkopf bearbeiten; Minus entfernt eine Spalte, Plus ergänzt eine.
Leere Termine werden beim Quartalsmittel nicht mitgerechnet. Gewichtungen ergeben zusammen 100 %.
Zeichen ↔ Noten per Schalter. Zuordnung: ++ = 1, ++/+ = 1,5, + = 2, +/o = 2,5, o = 3, o/- = 3,5,
- = 4, -/-- = 4,5, -- = 5, --/--- = 5,5, --- = 6. x = abwesend. 1-2 bzw. 1/2 = 1,5.
Enter wechselt zum Feld darunter. Das Quartalsmittel hat einen eigenen Schalter Dezimal/Tendenz.
Bei Tests schaltet ein Schalter im Tabellenkopf die Gewichtung zwischen Prozent und Verhältnis um.

HAUSAUFGABEN UND MATERIAL
Status als Symbol: ✓ erledigt, ✗ fehlt (rot), E entschuldigt, A abwesend, – nicht geprüft.
Ein Tipp aufs Symbol öffnet die Auswahl der fünf Symbole; Pfeiltasten und Esc funktionieren.
„Fehlend“ zählt fehlende Hausaufgaben übers ganze Halbjahr (im 2. bzw. 4. Quartal zählt das 1. bzw. 3. mit;
die Zelle nennt beim Darüberfahren den Anteil aus früheren Quartalen); ab 3 ist die Zahl rot. Ein Klick darauf öffnet eine
bearbeitbare Eltern-Mail (3 = erste Nachricht, ab 4 Folgenachricht; „Text kopieren“, nichts wird
versendet). Material wird getrennt gezählt und verändert keine Note.
Im Sitzplan werden fehlende Hausaufgaben und fehlendes Material übers ganze Halbjahr gezählt (siehe
„Hinweise am Tisch“ beim Unterrichts-Manager).

KOMPAKTANSICHT
Schmale Spalten, geneigte Überschriften, farbige Felder wie in der normalen Ansicht – zum Lesen; zum
Bearbeiten den Schalter ausschalten. Die Namensspalte bleibt beim Scrollen sichtbar; Antippen einer
Zeile hebt sie hervor. Eine Legende erklärt die Zeichen.

TESTS
Fortschritt (Klassenarbeiten): Button „Fortschritt“ blendet einen Balken „x / y korrigiert“ ein (Rot → Grün, klebt oben).
Notengrenzen (Tests und Klassenarbeiten): einklappbarer Kasten mit Kurzinfo, bunter Skala mit Schiebern und zweispaltiger
Tabelle; bei Klassenarbeiten sind die Schieber bei „Manuell“ beweglich.
Klassenarbeiten/Klausuren: Der Reiter „Klassenarbeiten“ (Oberstufe „Klausuren“) öffnet eine Übersicht aller Arbeiten des
Halbjahres (Datum, Thema, Note, Durchschnitt, Klassenschnitt). „Öffnen ›“ führt zur jeweiligen Arbeit, „Klassenarbeiten-Übersicht“ zurück.
Je Arbeit lässt sich ein Gewicht einstellen (z. B. 2 = zählt doppelt); der Durchschnitt rechnet dann gewichtet.
Lange Themen werden in der Übersicht gekürzt (Teil vor einer Klammer, einem Doppelpunkt oder Gedankenstrich);
der volle Titel erscheint beim Darüberfahren. „−“ entfernt eine Arbeit, „＋ Klassenarbeit“ (gestrichelter Kasten
im Kopf der rechten Spalte) legt eine neue an.
Sperren: Das Schloss auf der Seite einer Klassenarbeit, Klausur oder eines Tests sperrt die Eingaben nach der
Rückgabe; Ansehen, Notenspiegel und Drucken bleiben möglich. Gesperrte Arbeiten tragen in den Übersichten ein 🔒.
Tendenzen: Der Umschalter mit drei Symbolen (Aus | Schraffur | Rahmen) rechts über den Ergebnissen markiert
Tendenzen wie 2− gar nicht, schraffiert oder eingerahmt. 4 Notenpunkte bleiben immer schraffiert (nicht bestanden).
„＋ Test“ (gestrichelter Kasten im Kopf der rechten Spalte der Tests-Übersicht) öffnet „Test erstellen“: Name und Bewertungsart (Noten, Notenpunkte, Bewertungszeichen).
Variante „Rohpunkte und Ergebnis auf einer Detailseite“: Datum, maximale Rohpunkte, Prozentgrenze und
abgeleitete Punkteskala (auch halbe Punkte und A/B-Gruppen); mit „Manuell“ werden die Punktgrenzen
selbst festgelegt – mit dem Regler „Notengrenzen“ in Prozent (links ++, rechts ---; bei A/B ein Regler für beide
Gruppen, darunter die Punkte je Gruppe; Umschalter „Automatisch | Manuell“, darunter „Fachvorgabe wiederherstellen“).
Die Gruppe A/B wechselt per Klick auf das Feld. Rohpunkte: Enter schließt die Eingabe ab; ist keine weitere
Ziffer möglich (z. B. „19“ bei max. 21), wird sie automatisch abgeschlossen (kein Sprung in eine andere Zeile). Die Tests-Übersicht erhält eine verknüpfte Ergebnisspalte; der Button
„Tests-Übersicht“ führt zurück.

KLASSENARBEITEN UND KLAUSUREN
Eine gemeinsame Seite je Arbeit: Name, Datum und Thema (Feld neben dem Datum), zuerst die Ergebnisse,
darunter aufklappbar Übersetzung, Punkte bzw. weitere Berechnungsbereiche.
Rohpunkte/Fehler werden über die Notengrenzen umgerechnet; „+ Teilnoten“ blendet Teilnoten ein;
„Tendenzen“ wechselt zwischen Dezimal- und Plus-/Minusnoten (Drittelschritte, 1+ = 2/3).
Ganze Noten: Mitte zur besseren Note (bis 1,50 eine 1). Notenpunkte haben ihre eigene Rundung.
„Notenspiegel“: Verteilung und Durchschnitt, eigene Druckfunktion. Die Notengrenzen lassen sich mit
Schiebern verschieben; werden nur ganze Noten angezeigt (ohne Tendenzen), erscheinen auch nur deren Schieber.
Fachspezifische Notengrenzen: Zahnrad bei „Fächer umbenennen“ (Prozentwerte je Note, Tendenzen, 1+,
Gewichtung von Klausuren und sonstigen Leistungen).
Das Fenster heißt „Bewertungsgrenzen“. Reiter „Klassenarbeiten“: Gewichtung (% | x:y), Notengrenzen für Rohpunkte oder
Fehler mit Regler „Grenzen verschieben“ (Grenzen zwischen ganzen Noten) und Tabelle Note | Anteil | Beispiel. Reiter „Klausuren“
(Oberstufe, Notenpunkte): Standard KMK (4 Punkte ab 40 %), gleicher Aufbau mit Griffen an 13|12, 10|9, 7|6, 4|3, 1|0. Reiter „Tests“: Fachvorgabe für Tests mit Bewertungszeichen (alle Klassen, auch Oberstufe) –
Grenze für ausreichend, halbe Punkte, auf Wunsch eigene Prozentgrenzen je Zeichen; „Grenzen verschieben“ zeigt sie als Regler zum Ziehen. Neue Tests folgen der Vorgabe;
auf der Testseite zeigt ein Hinweis „Fachvorgabe“ oder „eigene Werte“ (umschaltbar). Bestehende Tests behalten ihre Werte.

QUARTALSNOTE UND HALBJAHRESNOTE
„+ Quartalsnote“ legt eine Übersicht an: Mitarbeit, Hausaufgaben (mit Fehlzähler), Material,
Tests, sonstige Mitarbeit, Klausuren, Selbsteinschätzung und Quartalsnote. Oben das Verhältnis
Mitarbeit/Tests (Vorgabe 80/20, Summe 100 %). Pfeil rechts/links wechselt zwischen
Selbsteinschätzung und Quartalsnote.
Halbjahresnote: Quartalsnote 1, Eintragungen des 2. Quartals, sonstige Mitarbeit (zu gleichen Teilen
aus beiden Quartalen), Klausuren, berechneter Vorschlag und eigene Halbjahresnote. Standard:
sonstige Mitarbeit 50 %, Klausuren zusammen 50 % (manuell änderbar).

DRUCKEN UND EXPORTIEREN
„Drucken“ steht auf jeder Tabellenseite. Der Dialog bietet PDF, DOCX und XLSX (aktuelle Seite) sowie
Farbig, Schwarz/weiß und – für Latein-Klassenarbeiten – Minimalistisch bzw. Notengrenzen.
PDF und Farbig sind vorausgewählt; Ausgabe in A4 hoch, lange Listen über mehrere Seiten.
Überschrift und Dateiname enthalten die Klasse.
„Leere Klassenliste erstellen“ (unten im Druckdialog): Namen links, 1–30 leere Spalten (Vorgabe 10).
Excel mit allen Bewertungstabellen aller Klassen: Backup-Dialog, Format „Excel“, „Speichern“.

UNTERRICHTS-MANAGER (SITZPLAN)
Fach und Klasse werden in der Navigation gewählt.
Linke Leiste (☰ in der Zoomleiste blendet sie ein/aus; am iPad hochkant standardmäßig eingeklappt,
quer eingeblendet – der Zustand wird je Lage gemerkt): Raum
(„+ Raum“, Stift zum Umbenennen, darunter „Tischanordnung …“), Datum, gespeicherte Sitzpläne („Version
löschen“, „Tag bereinigen“) und die Reiter Verteilung · Paare · Tabu · Anker.
Das Datum bestimmt, auf welcher Mitarbeitsseite Bewertungen landen.
Sitzplanmodus: Klick setzt/entfernt einen Tisch, Rechtsklick setzt das Pult (iPad/iPhone: tippen bzw. lange drücken). „Tischanordnung …“ bietet
Vorlagen (auswählen und „Anwenden“). Im Sitzplanmodus
erscheint das vollständige Raster (10 × 10, A–J); sonst werden leere Randreihen ausgeblendet.
Leere Rasterfelder sind helle Flächen mit feiner Strichlinie.
Bewertungsmodus: kurzer Klick auf einen Namen öffnet die Schnelleingabe (Mitarbeit, Hausaufgabe
fehlt, Material fehlt, abwesend); erneuter Klick auf die gewählte Bewertung löscht sie. Namen lassen
sich per Ziehen verschieben oder tauschen.
Zoomleiste (eine Zeile): ☰, −, Regler, +, „Einpassen“, „100 %“, Schalter „Bewertungen“, „Klassenansicht“.
Ist sie zu schmal, erscheint rechts „Mehr ▾“ mit zuerst „Klassenansicht“, dann „Bewertungen“, „100 %“, „Einpassen“.
Buttonreihe unter dem Plan (eine Zeile): ganz links „Schüler zuweisen“ │ „Perspektive“, „Schüler finden“, „Zufallsauswahl“,
„Zufallsgruppen“ │ „↓ Rollen ↑“ │ „Drucken“, „Mehr ▾“ (Vorlage speichern, Zurücksetzen …) …
ganz rechts „Verteilen“. Ist der Platz zu knapp, stehen zuerst „Drucken“, dann „Rollen“, „Zufallsgruppen“,
„Zufallsauswahl“ und „Perspektive“ oben im Menü „Mehr“. Auf dem iPhone bricht die Reihe notfalls um.
• Verteilen: setzt alle Schüler nach den Regeln der Seitenleiste auf die Tische.
• Schüler zuweisen: eine einzelne Person an einen freien Tisch setzen.
• Schüler finden: zeigt den Platz einer Person; Esc oder ein Klick daneben beendet die Suche.
• Zufallsgruppen: teilt die Klasse in Gruppen ein, ohne die Sitzordnung zu ändern – nach Anzahl Gruppen oder
  Gruppengröße, Abwesende ausgelassen, Tabu-Paare getrennt, optional gemischt m/w; „Neu mischen“, „Groß zeigen“, „Drucken“.
• Rollen: verschiebt alle Reihen nach vorn bzw. hinten (Anker und Pult bleiben; nicht im Gruppenmodus).
• Perspektive: dreht den Plan um 180 Grad (Sicht der Klasse); Namen bleiben lesbar.
Bewertungen (Schalter): blendet Bewertungsfarben, fehlende Hausaufgaben und die Hinweise an den
Plätzen ein oder aus; im Gruppenmodus erscheinen dann die Gruppenfarben.
Hinweise am Tisch (gezählt wird übers Halbjahr: im 2. bzw. 4. Quartal zählt das 1. bzw. 3. mit, mit dem
neuen Halbjahr beginnt es bei 0):
• Roter Rahmen: Hausaufgabe fehlt am gewählten Datum; ab der dritten fehlenden im Halbjahr wird er mit
  jeder weiteren dicker (höchstens doppelt so stark).
• Oranges „M“ unten links: Material fehlt am gewählten Datum; ab dem 3. Mal im Halbjahr steht dort die Anzahl.
• Getönter Tisch mit „0/3“, „1/3“ oder „2/3“ (Akzentfarbe): weniger als 3 mündliche Noten im Halbjahr.
  Erscheint erst, wenn mindestens eine Person schon 3 hat und die letzte mündliche Bewertung in der
  Lerngruppe 2 Stunden her ist.
In der Klassenansicht und bei ausgeschaltetem Schalter „Bewertungen“ sind die Hinweise unsichtbar.
Klassenansicht: vor dem Spiegeln per AirPlay/Beamer wählen. Bewertungen, Abwesenheiten,
Schnelleingabe, Einstellungen und der Noten-Manager werden ausgeblendet, Plätze sind nicht anklickbar.
„Klassenansicht beenden“ stellt alles wieder her.

ZOOM UND MOBILE GERÄTE
Der Plan wird mit 100 % gezeigt und nur verkleinert, wenn er zu breit ist; auf iPad und iPhone wird zusätzlich
eingepasst, wenn er zu hoch ist. Am Mac zählt nur die Breite (nach unten wird gescrollt).
Manuell 10–150 %. Bei Drehung des iPads wird neu angepasst. Menüs und Buttons werden nicht gezoomt.
Auf dem aufgeklappten iPhone Duo im Querformat bleibt die Seitenleiste sichtbar.

IPHONE
Das iPhone ist eine schlanke Version für den Unterricht: bewerten, nachschauen, die laufende Stunde finden.
Eingetragen werden mündliche Noten, Hausaufgaben und Material im Unterricht; im Noten-Manager nur
Selbsteinschätzung, Quartalsnote und Notizen. Tests, Klassenarbeiten, neue Seiten und Schülerlisten am Mac oder iPad.
Hochkant und quer verhalten sich gleich (quer steht die Leiste links). iPad und Mac bleiben unverändert.
Kopfzeile: App-Symbol (Farbgestaltung), Lerngruppe (antippen = Auswahl-Blatt mit Fach und Klasse; quer mit Fach),
  Datenschutzmodus 👁, Backup speichern ⬇ | neuestes Backup wiederherstellen ⬆, Rückgängig.
Leiste: Unterricht · Noten · Aktuell · Hilfe (Versionsnummer in der Hilfe).
Unterricht: nur der Sitzplan im Bewertungsmodus, ohne Knöpfe und Seitenleiste. Oben das Datum („Heute ▾“ –
  antippen zum Nachtragen, ein anderer Tag erscheint orange) und „⇅ Perspektive“; ein Tipp aufs Pult dreht ebenfalls.
  Ein Tisch öffnet das Bewertungsfenster als Blatt; „Weiter ›“ / „‹ Zurück“ gehen Tisch für Tisch durch die Reihen.
  Passt der Plan nicht aufs Display, werden leere Reihen und Spalten zu schmalen Gängen.
  Plätze tauschen, freie Tische zuweisen und Tische bearbeiten geht nur am Mac oder iPad.
Noten: Halbjahr und Quartal ergeben sich aus dem Datum (bei mehreren Halbjahren oben umschaltbar). Gezeigt wird die
  Quartalsübersicht als eine Karte pro Person, alphabetisch. Oben: „1. Quartal“ (blendet das 1. Quartal bei allen
  Karten ein/aus) und Aus / Schraffiert / Rahmen (Darstellung der Tendenzen),
  darunter Dezimal / Tendenz / Gerundet (Darstellung der errechneten Werte wie Ø und Sonstige Mitarbeit; bei Notenpunkten
  Dezimal / Ganze Punkte). Fehlt die Quartalsübersicht, bietet
  ein Hinweis „Quartalsübersicht anlegen“, „Andere Klasse wählen“ oder ✕ (schließen).
Karte: oben die Quartalsnote (bis zur Eingabe heller der errechnete Wert), mit eingeblendetem 1. Quartal links davon
  dessen Quartalsnote. Darunter Sonstige Mitarbeit mit Anteil, eingerückt Mündliche Mitarbeit und Tests (Anteil an der
  Gesamtnote, z. B. 40 % und 10 %, jeweils mit allen Einzelnoten als farbige Kästchen mit Datum und dem Ø rechts),
  fehlende Hausaufgaben und Material (rote Kästchen, rechts die Summe; zugeklappt nur das aktuelle Quartal, mit
  „1. Quartal“ das ganze Halbjahr), ganz unten die Klassenarbeit mit Anteil. Noten des 1. Quartals stehen vor denen
  des 2. Quartals, getrennt durch einen gestrichelten Strich. Selbsteinschätzung und Quartalsnote werden im
  Detailblatt eingetragen (Karte antippen).
Hinweise über den Karten, z. B. „5 · 3× HA fehlend“ (3× oder öfter im Halbjahr) oder „Ohne mündliche Note“ (im
  Quartal): antippen zeigt nur diese Personen, nochmal antippen wieder alle.
Detailblatt: Ein Tipp auf eine Karte zeigt alle Einträge der Person; ‹ › oder seitlich wischen = nächste Person,
  nach unten wischen = schließen. Oben eine Notiz (z. B. „Elterngespräch“); sie steht gelb in der Karte unter dem
  Namen und am Mac in der Quartalsübersicht (Symbol neben dem Namen, orange = Notiz vorhanden, Klick = bearbeiten).
  Notizen gelten je Fach und Klasse und sind in Backup und Rückgängig enthalten.
  Erinnerung: Über den Seiten des Noten-Managers (iPhone: über den Karten) steht „📝 2 Notizen in dieser Klasse“ –
  antippen zeigt die Liste mit „Bearbeiten“ und „✓ Erledigt“. Im Sitzplan hat der Tisch einen orangenen Punkt,
  und der Notiztext steht oben im Bewertungsfenster (ausgeblendet in Klassenansicht und Datenschutzmodus).
Aktuell: Läuft laut Stundenplan gerade eine Stunde (ab 10 Minuten vorher), öffnet „Aktuell“ direkt deren Sitzplan mit
  Raum und heutigem Datum. Sonst erscheint ein Blatt mit „Zuletzt unterrichtet“ (öffnet die Lerngruppe mit dem Datum
  dieser Stunde zum Nachtragen) und den Stunden von heute und dem nächsten Schultag. Der Stundenplan wird am Mac
  eingetragen und kommt per Backup aufs iPhone; beim Wiederherstellen zeigt die Abfrage, ob er im Backup enthalten ist.
Datenschutzmodus: auch in den Karten, im Detailblatt und im Stundenplan-Blatt (Namen unscharf, Noten mit
  Zufallsfarben); der Hinweis steht über der unteren Leiste.
Mac und iPhone aktuell halten: am Gerät mit dem neuesten Stand ⬇ (Backup in den festen Ordner, z. B. iCloud Drive),
  am anderen Gerät ⬆ und das neueste Backup wählen. Ein älteres Backup ersetzt neuere Einträge.

SITZREGELN, RÄUME, HISTORIE UND ABWESENHEIT
Verteilung: einzeln, Zufallspaare, gleichgeschlechtliche oder feste Paare; Reihenfolge und Richtung
wählbar. Tabu-Paare sitzen nicht direkt nebeneinander (bei Gruppen in verschiedenen Gruppen).
Anker sind feste Plätze (im Gruppenmodus ignoriert, bleiben gespeichert). Namensvorschläge erscheinen
ab dem ersten Buchstaben. „Alle löschen“ entfernt nur die jeweiligen Vorgaben.
Mehrere Räume pro Klasse: Tischanordnung, Verteilung, Anker und Versionen je Raum; vorgewählt wird
der Raum von vor sieben Tagen, sofern vorhanden.
Planänderungen werden als Versionen je Klasse und Datum gespeichert. Nach zwei Stunden ohne Änderung
werden Zwischenschritte auf den letzten Stand reduziert (Gruppeneinteilungen ausgenommen).
„Version löschen“ entfernt die ausgewählte Version, „Tag bereinigen“ die Zwischenstände des Tages.
Abwesenheit gilt je Klasse, Person und Datum fachübergreifend (x bei Mitarbeit, A bei Hausaufgaben)
und zählt nicht als Note oder fehlende Hausaufgabe.

FARBEN, HILFE UND TASTATUR
Ein Klick auf das App-Symbol oben links öffnet neun Farbgestaltungen; das Symbol nimmt die Farbe an
(Doppelklick: es hüpft). Im selben Fenster: Erscheinungsbild Hell | Automatisch | Dunkel
(Automatisch folgt der Systemeinstellung). Nach Eingaben erscheint kurz „Gespeichert ✓“ unter
„Rückgängig“; ab drei Plus-Buttons in einer Navigationszeile bündelt „＋ Hinzufügen ▾“ sie.
„?“ öffnet die Hilfe beim Kapitel des aktiven Managers; Suche oben, Esc leert erst die Suche und
schließt dann. Viele Buttons erklären beim Darüberfahren mit der Maus ihre Funktion.
Bestätigungen und Eingaben erscheinen als eigene Dialoge im Stil der App; Löschen/Entfernen/
Zurücksetzen ist rot hervorgehoben.
Esc schließt Dialoge, Menüs und die Schülersuche; Tab springt weiter, Enter bestätigt.

VERÖFFENTLICHUNG UND QUELLPROJEKT
Zwei Pakete je Version:
• Classroom-Manager_X.YY.zip – die kompakte Web-App im Ordner „Classroom-Manager“, die portable
  Einzeldatei Classroom-Manager.html und die Kurzanleitung (PDF). Zum Veröffentlichen (z. B. GitHub
  Pages) den Inhalt des Ordners hochladen und die alten Dateien ersetzen. Nach dem Hochladen ggf.
  mehrmals neu laden, bis die neue Versionsnummer im Titel steht.
• Classroom-Manager_X.YY_Quellprojekt.zip – das modulare Quellprojekt für die Weiterentwicklung.
Werkzeuge im Quellprojekt:
• python3 tools/bump-version.py X.YY "Änderungstext" – neue Version: Cache-Nummern, Kopfzeile,
  Service Worker, README.
• python3 tools/build-release.py [Zielordner] – kompakte Web-App und Einzeldatei.
• python3 tools/build-single-html.py – nur die Einzeldatei.
Die Einzeldatei eignet sich zum Weitergeben oder Öffnen per Doppelklick, nicht als Home-Bildschirm-App.

ÄNDERUNGSVERLAUF
Die folgenden Einträge dokumentieren die Entwicklung (ältere Einträge können durch spätere ersetzt sein;
maßgeblich ist die Anleitung oben).

Beispieldaten (4.43): Acht fiktive Lerngruppen in Erdkunde, Geschichte und Latein, Jahrgänge 5–12, mit 210 Schüler:innen. Das vollständige erste Halbjahr umfasst zwei Quartale mit Mitarbeit, Hausaufgaben, Material, Tests, Selbsteinschätzungen, Quartals- und Halbjahresnoten sowie thematisch passenden Klassenarbeiten/Klausuren. Bestehende eigene Daten werden nicht ersetzt.

Beispielarbeiten (4.47): Erdkunde/Geschichte bis Klasse 9 als ein Rohpunktergebnis; Latein bis Klasse 10 mit Übersetzung (Fehler) und Weiteren Aufgaben (Rohpunkte), gewichtet 2:1. Oberstufenklausuren mit drei Rohpunktaufgaben, deren Maximalpunkte der Gewichtung entsprechen (20/45/35 bzw. 20/40/40).

4.50: Sek-I-Beispieltests zeigen Bewertungszeichen. Klausuren in Kursen mit Notenpunkten verwenden auch für Skalen und Teilnoten das Notenpunktesystem; Schulnoten sind beim Anlegen dort gesperrt.

AKTUELLE ANZEIGE UND BEDIENUNG (4.58)
Halbjahresnoten und der zugehörige Plus-Button erscheinen nur im zweiten Quartal; die Berechnung berücksichtigt beide Quartale. Ist die Quartalsnotenseite im ausgewählten Quartal bereits vorhanden, wird „+ Quartalsnoten“ ausgeblendet.

Ergebnisanzeige: Bei Schulnoten schaltet der Ergebnistoggle zwischen Dezimal und Tendenz um (z. B. 2,75 / 3+ oder 2,5 / 2-3), bei Notenpunkten zwischen Dezimal und Gerundet (10,6 / 11). Die Farbe der Mitarbeit- und Testmittelwerte folgt auch bei Dezimalanzeige der zugehörigen Tendenznote: Eine glatte 4 ist orange, eine glatte 2 grün. Plus-/Minusnoten und Zwischenstufen werden schraffiert dargestellt.

Abwesenheit wird einheitlich als A angezeigt, auch bei mündlicher Mitarbeit und in bisherigen x-Einträgen. Alte x-Eingaben werden weiterhin erkannt. Der lange Strich — bedeutet kein Eintrag; beides zählt nicht zum Mittelwert. Das rote × kennzeichnet fehlende Hausaufgaben oder fehlendes Material.

Beispiel-Selbsteinschätzungen: In der Sek. I ganze Noten, Plus-/Minusnoten oder Zwischenstufen wie 3-4; in der Oberstufe auch halbe Notenpunkte wie 13,5. Eigene Eingaben werden dadurch nicht verändert.

Sitzplan – Richtung: Erste Zeile „von oben“ / „von unten“, zweite Zeile „von links“ / „von rechts“. Standardmäßig sind „von unten“ und „von rechts“ ausgewählt.

Startverhalten (seit 6.20): War die App vor weniger als zwei Stunden noch offen, startet sie im zuletzt benutzten Manager; sonst im Unterrichts-Manager.

Testmittel (4.60): Dreistufiger Schalter für Schulnoten: links Dezimal (2,75), mittig Tendenz (3+), rechts Gerundet (3). Auswahl wird je Testübersicht gespeichert; die zugrunde liegenden Werte bleiben unverändert.

4.61: Das Testmittel nutzt einen kompakten Schiebeschalter mit drei Rastpositionen: Dezimal / Tendenz / Gerundet. Die aktuelle Darstellung steht neben dem Schalter.

4.81: Standard für den dreistufigen Testmittel-Schalter ist Tendenz, sofern noch keine Position gewählt wurde. Eine gewählte Position bleibt pro Testübersicht gespeichert.

Sek I: Kompakter Dreifachschalter für mündliche Mitarbeit, Testmittel und Klassenarbeitsergebnisse (Dezimal / Tendenz / Gerundet). Tendenz ist die Voreinstellung; die Auswahl bleibt pro Seite erhalten. In der Oberstufe: Dezimal oder ganze Notenpunkte.

Dreifachschalter: Klick in die Mitte wechselt zyklisch zur nächsten Stellung; Ziehen und Tastatur bleiben verfügbar.

Beim Start öffnet jede Klasse die zuletzt gewählte Ansicht. Liegt seit dem letzten Besuch ein Quartals-
oder Halbjahreswechsel (Datum „Beginn …“ beim Stift neben dem Halbjahr), springt sie ins aktuelle Quartal.
Im 2. Quartal blendet der Schalter „1. Quartal“ die bisherigen Eintragungen als schreibgeschützten Vergleich ein und wieder aus; aktuelle Berechnungen bleiben unverändert.

Vorquartalsvergleich: Die schreibgeschützten Q1-Spalten erscheinen direkt links vor den bearbeitbaren Einträgen aus Q2 in derselben Tabelle.

Sitzplan: Effizientere Suche beim Geschlechterwechsel. Unmögliche Verteilungen werden mit Personenzahl und verfügbaren passenden Plätzen erklärt; der vorhandene Plan bleibt erhalten.

Ist der vollständige Geschlechterwechsel nicht möglich, erlaubt die Verteilung schrittweise gleichgeschlechtliche Nachbarschaften und meldet die Anzahl der Ausnahmen. Anker, feste Paare und Tabus bleiben verbindlich.

Belegung: Gleichgeschlechtliche Zufallspaare anhand der gespeicherten Geschlechter. Ankerplätze bleiben fest; ohne passenden Partner oder ohne Geschlechtsangabe wird einzeln platziert. Bei Geschlecht im Wechsel wechseln die gleichgeschlechtlichen Paare: mm–ww–mm–ww.

„Start“ verteilt die Schüler auch im Bewertungsmodus auf die gesetzten Tische.

Vereinfachte Optionen: Sitzverteilung und Reihenfolge. Der Wechsel heißt je nach Belegung „Abwechselnd m/w“ oder „Abwechselnd mm/ww“.

Richtungen entsprechen den Beschriftungen: Von unten beginnt in der untersten Reihe, von rechts am rechten Reihenende. Ohne Auswahl gilt oben beziehungsweise links.

4.82: Gleichgeschlechtliche Zufallspaare beginnen am gewählten Reihenanfang mit vollständigen Paaren. Einzelne Restpersonen werden am anderen Ende platziert; Ankerplätze bleiben fest.

4.83: Die Sitzplansuche platziert gleichgeschlechtliche Paare gemeinsam und vermeidet unnötige Ausnahmen beim Wechsel mm/ww.

4.84: Beim Stift neben dem Halbjahr lässt sich „Beginn 2. Quartal“ festlegen. Das Datum gilt übergreifend für gleich benannte Halbjahre aller Klassen und Fächer. Neue mündliche Bewertungen aus Sitzplan und Noten-Manager werden anhand ihres Bewertungsdatums dem passenden Quartal zugeordnet; fehlende Quartalsseiten werden angelegt. Ohne Stichtag bleibt die manuelle Auswahl erhalten. Bestehende Bewertungen werden nicht nachträglich umsortiert.

4.85: Beginn des Halbjahres direkt neben dem Halbjahresnamen im Bearbeitungsfenster. Der Beginn des ersten zugehörigen Quartals wird übernommen und dort schreibgeschützt angezeigt; der Beginn des zweiten zugehörigen Quartals wird in der Quartalszeile festgelegt. Im zweiten Halbjahr lauten die Standardbezeichnungen 3. und 4. Quartal.

4.86: Quartals- und Halbjahresname sowie Beginn stehen im Bearbeitungsfenster nebeneinander ohne Überlagerung.

4.87: Der zuletzt ausgewählte gespeicherte Sitzplan wird pro Klasse und Raum beim erneuten Öffnen wiederhergestellt, auch wenn neuere Versionen vorhanden sind. Das aktuelle Unterrichtsdatum bleibt beim Start unverändert. Die automatische Historienbereinigung schützt die gemerkte Version.

4.88: Sitzplan-Bewertungsbuttons übertragen das gewählte Mitarbeitssymbol eindeutig, sodass es in Oberstufenkursen nicht als niedrige Notenpunktzahl fehlinterpretiert wird. Hausaufgabe-fehlt erhält mehr Platz, Material-fehlt wird schmaler.

4.89: Einzelne mündliche Bewertungen werden in Oberstufenkursen ausschließlich als Mitarbeitssymbole eingegeben und angezeigt. Der Notenpunkte/Zeichen-Schalter entfällt dort; Mittelwerte und Abschlussnoten behalten die Notenpunkteberechnung. Vorhandene Bewertungen bleiben erhalten.

Tests mit A-/B-Gruppen: Beim Erstellen eines Rohpunktetests können zwei Gruppen aktiviert werden. Jede Gruppe besitzt eigene maximale Rohpunkte, Notengrenzen und Einstellungen für halbe Punkte und Tendenzen. Die Gruppe wird pro Schüler:in gewählt; die Ergebnisse erscheinen gemeinsam in der Tests-Übersicht.

Die Test-Erstellung beginnt mit der Gruppenauswahl „Ganze Klasse“ (Standard) oder „A- & B-Gruppen“. A-/B-Gruppen verwenden die Rohpunkte-Detailseite.

Test-Erstellung: Das Namensfeld steht vor der Gruppenauswahl. Die Zufallsauswahl im Sitzplan bleibt auch nach dem Neuaufbau aktiv, sofern anwesende Personen platziert sind; die ausgewählte Person wird sichtbar umrandet.

Ein Klick auf den zufällig ausgewählten Tisch entfernt im Bewertungsmodus die Zufallsmarkierung. Ein weiterer Klick öffnet wieder die Bewertung.

Auch der letzte Test lässt sich über das Minus nach Bestätigung löschen. Die Tests-Seite verschwindet dadurch im betreffenden Quartal.

Das Fenster „Test erstellen“ verwendet kompaktere Abstände zwischen Optionen und Gruppen.

Leere Quartals-Seitenverweise nach dem Löschen des letzten Tests werden sicher übersprungen, auch beim Neustart. Die Navigation wechselt zu einem verfügbaren Bereich des aktuellen Quartals.

„Schüler finden“ steht in der Sitzplan-Buttonleiste direkt rechts neben „Schüler zuweisen“.

Der Stift zum Umbenennen eines Raums ist wie im Noten-Manager ausgerichtet.

Nach dem Löschen einer Quartalsseite wird diese beim erneuten Anlegen korrekt wiederhergestellt; neue Tests erscheinen dadurch auch in Quartal 2 direkt.

Test-Erstellung: Die Notensysteme stehen in der Reihenfolge Bewertungszeichen, Noten, Notenpunkte.

Bei jedem Öffnen von „Test erstellen“ sind Bewertungszeichen vorausgewählt.

Test-Detailseiten verwenden in Rohpunkteskala und Ergebnissen die runden und kräftigen Bewertungszeichen des Unterrichts-Managers.

Bei Tests mit Bewertungszeichen wird „Tendenzen“ nicht angeboten. Die Rohpunkteskala verwendet die sechs bisherigen Bewertungszeichen, auch bei älteren Tests mit zuvor aktivierten Tendenzen.

Die Übersichten und der Excel-Export zeigen Klassenarbeiten/Klausuren ohne den Zusatz „Ergebnis“ und die berechnete Halbjahresnote ohne den Zusatz „berechnet“.

Auch die manuell eingetragene Halbjahresnote trägt in Übersicht und Excel-Export nur die Überschrift „Halbjahresnote“.

Standardnamen für Klassenarbeiten lauten „1. Klassenarbeit“, „2. Klassenarbeit“ usw.; bestehende Standardnamen werden entsprechend übernommen.

Eine einzelne Klausur heißt „Klausur“. Bei mehreren Klausuren im Halbjahr werden die Standardnamen automatisch zu „1. Klausur“, „2. Klausur“ usw.

Auch eine einzelne Klassenarbeit heißt „Klassenarbeit“; ab zwei Klassenarbeiten im Halbjahr lauten die Standardnamen „1. Klassenarbeit“, „2. Klassenarbeit“ usw.

Neue Tests werden anhand des heutigen Datums und des eingestellten Quartalsbeginns zugeordnet, auch wenn ein älteres Quartal geöffnet ist. Ohne hinterlegten Beginn gilt die manuelle Auswahl.

Auf Testdetailseiten stehen die Schalter neben den Zahlenfeldern mit der Beschriftung rechts daneben.

Testdetailseiten haben keinen Zeichen-Toggle mehr; das gewählte Bewertungssystem bestimmt die Darstellung.

Das Testdatum steht oben rechts bei den Ansichts- und Druckaktionen.

Klausuren in der Oberstufe bieten beim Erstellen die Bewertungsarten „Rohpunkte“ und „Teilnoten“; Fehler entfallen. Teilnoten werden direkt als Notenpunkte eingegeben.

Die Berechnungsrubrik „Punkte“ heißt „Rohpunkte“, auch bei bestehenden Arbeiten.

Die aufklappbare Berechnungsrubrik bei Klassenarbeiten und Klausuren heißt „Rohpunkteskala“.

Auch bei Tests lautet die Skalenüberschrift einheitlich „Rohpunkteskala“.

Beim Erstellen von Klassenarbeiten heißt die Option „Rohpunkte“. Notensystem und Ergebnisse müssen nicht mehr ausgewählt werden: Das Klassensystem gilt automatisch, und Ergebnisse werden immer angelegt.

Im Unterrichts-Manager sind Fach und Klasse dauerhaft in zwei Navigationszeilen auswählbar und mit dem Noten-Manager synchronisiert.

Sonstige Mitarbeit: Ohne bewertete Tests wird der Mittelwert der mündlichen Mitarbeit vollständig übernommen. Liegen beide Bereiche vor, gilt die eingestellte Gewichtung. Dies gilt auch für die Halbjahresberechnung und den Excel-Export.

Die Fach- und Klassenauswahl im Unterrichts-Manager übernimmt die Darstellung direkt aus dem Noten-Manager.

Der Schalter Schraffuren links neben Kompaktansicht blendet Bewertungsmuster ein oder aus. Die Einstellung bleibt gespeichert und gilt auch im Unterrichts-Manager.

Im Notenspiegel können Notenpunkte per Toggle zu den Noten 1–6 zusammengefasst werden (13–15: 1, 10–12: 2, 7–9: 3, 4–6: 4, 1–3: 5, 0: 6). Die Auswahl bleibt gespeichert.

Klausuren und Klassenarbeiten gehören zum Halbjahr und erscheinen unabhängig von der Quartalsauswahl in beiden Quartalen. Beim Löschen eines Quartals bleiben sie erhalten.

Die Fach- und Klassenauswahl im Unterrichts-Manager steuert die gemeinsame Auswahl direkt. Fehlt eine gespeicherte Klassenauswahl, wird die erste vorhandene Klasse geöffnet.

Klassenarbeiten/Klausuren: Ein Hinweis unter den Ergebnissen und im Notenspiegel warnt bei mehr als 30 % Noten 5/6 (Sek. I) bzw. mehr als 50 % mit 0–4 Notenpunkten (Sek. II). Grundlage sind vollständige Ergebnisse, auf ganze Noten bzw. Notenpunkte gerundet; fehlende Ergebnisse zählen nicht mit.

Quartals- und Halbjahresübersichten zeigen Hausaufgaben und Material nur als Fehlenssummen (HA Fehlend / MA Fehlend), ohne einzelne Datumsspalten. Dies gilt auch für den globalen Excel-Export.

Die eingeblendeten Q1-Felder übernehmen die Feldformatierung des aktuellen Quartals, auch in der Kompaktansicht.

Q1-Vergleich in den Notenübersichten mit schrägen Überschriften und nur Fehlenssummen für HA und Material.

Beim Fach- und Klassenwechsel wird zunächst nur die ausgewählte Bewertungsseite aufgebaut. Weitere Seiten werden beim Öffnen geladen.

Bei Klassenarbeiten wird die Bewertungsskala je Aufgabe ausgewählt. Fehler und Rohpunkte erzeugen beim gemeinsamen Anlegen zwei Spalten; in Latein ist das Verhältnis 2:1 voreingestellt.


Automatische Sicherung: Unter Backup einen Ordner auswählen (Chrome/Edge auf Mac/PC). Solange die App geöffnet ist, werden Änderungen alle 30 Sekunden geprüft und in einer JSON-Datei je Tag gesichert. Die Datei des aktuellen Tages wird aktualisiert, ältere Tage bleiben erhalten. Der Ordner wird lokal gemerkt; nach einem Neustart gegebenenfalls „Zugriff erlauben“ anklicken. Fehler und die letzte erfolgreiche Sicherung werden im Backup-Fenster angezeigt. „Deaktivieren“ entfernt keine Sicherungsdateien. Wiederherstellung über Backup → Wiederherstellen. Bei geschlossener App gibt es keine Hintergrundsicherung.

Rückgängig: Aufeinanderfolgende Sitzplan-Aktionen werden einzeln zurückgenommen; die aktuelle Fach- und Klassenauswahl bleibt erhalten.

Gleichgeschlechtliche Paare: Bei U-förmigen Tischanordnungen werden Paarplätze entlang des äußeren Bogens (auch senkrecht) und anschließend an den inneren Doppeltischen gebildet. Ankerplätze bleiben erhalten.

Version 5.48: Sitzplan-Bewertungen und Tischfarben verwenden nach automatischer Quartalszuordnung denselben Bewertungsbereich.

5.48: Bewertungen im Sitzplan über den Button rechts neben 100 % ein- und ausblenden. Die Auswahl wird gespeichert.

5.48: Vollbild steht neben 100 %. Hinweise zu Ausnahmen der Paarregel nennen nur Vornamen.

5.48: Bei der Gruppenbildung werden Ankerplätze und feste Paare ignoriert; für normale Sitzpläne bleiben sie gespeichert.

5.49: Klassenarbeiten bauen die Ergebnistabelle auch beim verzögerten Seitenaufbau auf. Sek-I-Klassenarbeitsnoten erscheinen in der Quartalsübersicht einheitlich als Tendenz.

5.50: „Schüler zuweisen“ steht in der Sitzplan-Aktionsleiste an erster Stelle links.

5.51: Selbsteinschätzung und Quartalsnote lassen sich mit allen vier Pfeiltasten zeilen- und spaltenweise durchlaufen.

5.52: Excel-Blätter nach Jahrgang und Klasse sortiert; gleiche Klassen verschiedener Fächer getrennt und mit Fach im Blattnamen. Farbgrenzen einschließlich 2,5 grün, 3,5 gelb und 4,5 orange.

5.53: Manuelle Backups enthalten Datum und lokale Uhrzeit im Dateinamen (JJJJ-MM-TT-HH-MM).

5.54: Auch automatische Sicherungen enthalten die lokale Uhrzeit (JJJJ-MM-TT-HH-MM-automatisch.json). Sicherungen derselben Minute werden aktualisiert; frühere Dateien bleiben erhalten.

5.55: Im Bewertungsmodus öffnet ein Klick auf einen freien Tisch direkt die Schülerzuweisung. Belegte Tische öffnen weiterhin die Bewertung; im Sitzplanmodus bleibt die Tischbearbeitung erhalten.

5.56: Die Fach- und Klassenleiste im Unterrichts-Manager scrollt mit dem Inhalt wie im Noten-Manager.

5.57: Position, Breite und unterer Abstand der Sitzplan-Navigation entsprechen dem Noten-Manager.

5.66: Gemeinsame, unter dem Header fixierte Kompaktleiste für beide Manager. Beim Start ist die vollständige Auswahl geöffnet. Nach der ersten Benutzung schließt das Menü beim Verlassen mit der Maus oder beim Tippen außerhalb. Die Chips öffnen die jeweilige Auswahlebene; nachfolgende Ebenen werden erneut ausgewählt. Gespeicherte Daten bleiben erhalten.

5.66: Gestaltung der Kompaktleiste an die Navigation angepasst: weißer Rahmen, hellblaues Auswahlband, kräftige Chips und dezente Trennpfeile.

5.66: Der Pfeil links in der Kompaktleiste klappt das geöffnete Auswahlmenü per Klick wieder ein.

5.66: Kompaktleiste und ausgeklapptes Menü bilden einen durchgehenden abgerundeten Rahmen ohne Trennkante.

5.66: Zahnräder ersetzen die Stifte im Navigationsmenü. Ein Klick öffnet die Bearbeitung und klappt die Navigation sofort ein.

5.66: Größeres, kräftiges Zahnrad als einheitliches Vektorsymbol im Navigationsmenü.

5.67: Zahnrad-Buttons haben dieselbe Größe und denselben Rahmen wie der Ein-/Ausklapp-Button.

5.68: Das ausgeklappte Auswahlmenü blockiert Klicks auf den Hintergrund. Freie Menüflächen schließen es. Bei Klassenarbeiten und Klausuren entfällt das Quartal in der kompakten Leiste.

5.69: Fachspezifische Notengrenzen für Sek I und Gewichtung von Klassenarbeiten und Sonstiger Mitarbeit über das Zahnrad neben dem Fach konfigurieren. Notentendenzen und 1+ sind getrennt einstellbar. Die Vorgaben werden gespeichert und in Sicherungen übernommen. Navigationszahnräder sind kleiner und mittig.

5.70: Notentendenzen auf Klassenarbeitsseiten wieder schaltbar; fachspezifische Notengrenzen überschreiben keine Seitenschalter mehr. „Grenze für ausreichend“ ist bei Tendenzen die Grenze zwischen 4− und 5+ (bei ganzen Noten zwischen 4 und 5). Das Fenster „Notengrenzen – Fach“ (Zahnrad rechts neben jedem Fach in „Fächer umbenennen“) zeigt die farbige Notenskala wie die Rohpunkte-/Fehlerskala. Ohne 1+ besteht der sehr gute Bereich aus 1 und 1−. Die Gewichtung Sonstige Mitarbeit/Klassenarbeiten lässt sich in Prozent oder im Verhältnis eingeben und gilt verbindlich für die Halbjahresnote von Sek-I-Klassen.

5.71: Kompaktleiste repariert: Sie erhält die Navigation jetzt per Nachricht aus dem Noten-Manager und funktioniert damit auch beim Öffnen als lokale Datei (file://). Fach- und Klassenwechsel in der Leiste werden sofort an den Unterrichts-Manager weitergegeben.

5.72: In der Notengrenzen-Tabelle (Rohpunkte-/Fehlerskala und fachspezifisches Fenster) werden Tendenznoten wie 1−, 2+ oder 4− schraffiert dargestellt, solange „Schraffuren“ aktiviert ist. Im Unterrichts-Manager zeigt die Kompaktleiste nur Fach und Klasse.

5.73: Mehrere Klassenarbeiten/Klausuren erscheinen als eigene Reiter in der Bereichszeile (5. Zeile) statt in einer zusätzlichen Kategorie „Klassenarbeiten“/„Klausuren“ mit eigener Zeile. Der Sitzplan wird fest im A4-Hochformat gedruckt (@page size: A4 portrait im Druckbereich von design.css); die Skalierung passt den Plan in Breite und Höhe auf eine Seite ein.

5.74: Beim Öffnen der App ist das Navigationsmenü eingeklappt; die Kompaktleiste zeigt die aktuelle Auswahl, ein Klick klappt das Menü aus. Neue App-Symbole (Tabelle mit Häkchen) als Standard für Classroom-Manager, Noten- und Unterrichts-Manager: Kopfzeile, Browser-Tab, Startbildschirm/PWA.

5.75: „Notengrenzen – Fach“: Speichern wird nicht mehr durch die Browser-Feldprüfung blockiert; Probleme (falsche Reihenfolge, Gewichtung, voller Browser-Speicher) erscheinen als Hinweis über den Buttons. Prozentfelder sind breiter und bündig ausgerichtet, sodass zwei Nachkommastellen neben den Pfeiltasten vollständig sichtbar sind – auch in der Rohpunkte-/Fehlerskala der Klassenarbeiten.

5.76: Die Pfeile zwischen den Rubriken der Kompaktleiste stehen mittig zwischen den Chips. „＋ Details“ wird im Navigationsmenü nicht mehr angezeigt.

5.77: Nach dem Import oder Einfügen von Schülernamen bleibt keine leere Namenszeile mehr am Ende der Liste; vorhandene leere Zeilen ohne Eintragungen werden einmalig entfernt. Mit „＋ Schüler:in“ bewusst angelegte leere Zeilen bleiben erhalten.

5.78: Quartalsübersicht: Klassenarbeiten (Sek. I) erscheinen mit Tendenz (z. B. 2−), Klausuren (Sek. II) als gerundete Notenpunkte (z. B. 9 statt 8,8).

5.79: Sek. II: Die gerundeten Klausurpunkte gehen auch in die Halbjahresnote (Übersicht und Excel-Export) ein.

5.80: Gewichtungsfelder der Quartals- und Halbjahresnote stehen direkt neben ihrer Bezeichnung; „Mündliche Mitarbeit“ und die übrigen Bezeichnungen bleiben einzeilig.

5.81: Quartalsübersicht: Beim Einblenden des 1. Quartals erscheint keine zusätzliche senkrechte Linie mehr im Kopfbereich neben der ersten Spaltenüberschrift.

5.82: Schnellbewertung im Sitzplan: „Hausaufgabe fehlt“ ohne Symbol; „Hausaufgabe fehlt“ und „Material fehlt“ sind gleich breit und gleich hoch.

5.83: Untertitel „Deine Klassen im Blick“. Der Sitzplan-Manager heißt jetzt „Unterrichts-Manager“ (Umschalter in der Kopfzeile, Hinweise und Bedienungsanleitung).

5.84: Zoomleiste im Unterrichts-Manager: Alle Buttons, auch „Bewertungen ausblenden“, haben die einheitliche Höhe von „Vollbild“.

5.85: Klassenarbeiten/Klausuren: Tendenznoten (z. B. 2+, 3−) werden in Rohwerten, Teilnoten und Ergebnis schraffiert, solange „Schraffuren“ aktiviert ist. Ausgeschaltet zeigen die Felder die Grundfarbe der jeweiligen Note.

5.86: Unterrichts-Manager: „Schüler finden“ wird beim Anklicken zum Suchfeld im Button – statt „Schüler“ erscheint ein Eingabefeld, darunter passende Namen (Anfangsbuchstaben von Vor- oder Nachname). Nach Auswahl springt „finden“ zum Sitzplatz. Das Feld wächst mit der Namenslänge; Pfeiltasten und Enter wählen aus, Esc schließt.

5.87: Oberstufe: Notenpunkte mit Tendenz werden wie die entsprechenden Schulnoten schraffiert (z. B. 9 Punkte wie 3+, 13 wie 1−), solange „Schraffuren“ aktiviert ist. 4 Notenpunkte sind immer schraffiert, auch bei ausgeschalteten Schraffuren; alle anderen Felder sind dann einfarbig.

5.88: „Schüler finden“ schlägt nur Vornamen vor und sucht nach dem Anfang des Vornamens. Bei gleichen Vornamen wird der Anfangsbuchstabe des Nachnamens ergänzt (z. B. „Leon K.“). Der Sitzplatz wird weiterhin eindeutig über den vollständigen Namen gefunden.

5.89: Fenster „Notengrenzen – Fach“: Der Schalter Prozent/Verhältnis steht über den beiden Gewichtungsfeldern; „Notentendenzen“ und „1+“ stehen als „Notenskala“ oben rechts auf Höhe der Gewichtung. Ist 1+ eingeschaltet, lautet der Schalter „1+ deaktivieren“.

5.90: Raumauswahl im Unterrichts-Manager: Das Auswahlfeld ist in Chrome und Safari genau so hoch wie „+ Raum“ und der Stift und steht mit beiden auf einer Linie (einheitlicher Pfeil statt Browser-Darstellung).

5.91: Fenster „Notengrenzen – Fach“: Der Schalter „1+ aktivieren“ steht auf einer Höhe mit den Gewichtungsfeldern „Sonstige Mitarbeit“ und „Klassenarbeiten/Klausuren“.

5.92: Gespeicherte Sitzpläne: „Version löschen“ und „Tag bereinigen“ teilen sich genau die Breite des Auswahlfelds darüber.

5.93: Backup-Fenster: Der Kasten „Automatische Sicherung“ erscheint nur in Browsern, die Ordnerzugriff unterstützen (Chrome/Edge auf Mac/PC). Auf iPhone, iPad und in nicht unterstützten Browsern (z. B. Safari, Android ohne Ordnerzugriff) ist er ausgeblendet; manuelles Speichern und Wiederherstellen bleiben überall verfügbar.

5.94: Rollen in beide Richtungen: geteilter Button „Rollen ↑ | ↓“ – links eine Reihe nach vorn (zur Tafel/zum Pult), rechts nach hinten. Vorn ist die Seite des Pults (ohne Pult die obere Reihe); die Pfeile drehen sich mit der Lehrer-/Schülerperspektive. Excel-Export enthält zusätzlich ein vollständiges Backup auf dem ausgeblendeten Blatt „Classroom-Backup“. „Backup → Wiederherstellen“ akzeptiert neben JSON-Sicherungen auch diese Excel-Datei (auch nach dem Speichern in Excel oder LibreOffice). Nachträgliche Änderungen in Excel werden dabei nicht übernommen.

5.95: Sitzverteilung: „Abwechselnd m/w“ ist als Reihenfolge voreingestellt. „Elternmail“ heißt jetzt „Eltern-Mail“; im Fenster steht „Text kopieren“ links, „Schließen“ rechts.

5.96: Backup-Fenster: Auswahl des Dateiformats über zwei Karten direkt über den Buttons – „JSON“ (Standard, reine Sicherungsdatei) oder „Excel (XLSX)“ (Bewertungstabellen mit eingebettetem Backup). Beim Öffnen ist immer JSON vorausgewählt. „Wiederherstellen“ erkennt beide Formate automatisch.

5.97: Rollen-Button „↓ Rollen | ↑“: linke Hälfte rollt die Reihen auf dem Bildschirm nach unten, rechte Hälfte nach oben (auch in der Schülerperspektive passend). „Rückgängig“ funktioniert wieder, wenn die App als lokale Datei geöffnet ist, und erscheint dann wie gewohnt orange, sobald eine Änderung rückgängig gemacht werden kann.

5.98: Strukturprüfung beim Start: Doppelt angelegte Bereiche (z. B. zwei „Mündliche Mitarbeit“ im selben Halbjahr) werden zusammengeführt, verwaiste Seiten mit Eintragungen wieder ihrem Quartal zugeordnet und Quartale mit Eintragungen immer angezeigt und exportiert. Dadurch erscheinen u. a. die Q1-Mitarbeitsnoten von EK1e28 wieder im Excel-Export. Der Button „Excel-Export“ in der Kopfzeile entfällt; der Export erfolgt über „Backup → Excel (XLSX)“.

5.99: Fenster „Notengrenzen – Fach“: Prozentwerte lassen sich wieder ohne erneutes Anklicken mehrstellig eintippen. Bei ganzen Noten werden die Tendenzen (z. B. 3+, 3, 3−) automatisch in gleichen Abständen innerhalb des Notenbereichs verteilt; dadurch entfällt die Fehlermeldung „Note 1− passt nicht“ beim Speichern.

6.00: Unterrichts-Manager: Welche Seite der mündlichen Mitarbeit angezeigt und bewertet wird, bestimmt das Datum links – unabhängig davon, welches Quartal zuletzt im Noten-Manager geöffnet war. Maßgeblich sind Halbjahresbeginn und Quartalsgrenze bzw. – ohne hinterlegte Grenze – die bereits eingetragenen Termine. Eine manuelle Auswahl gilt für das jeweilige Datum.

6.01: Kopfzeile: Hinter dem Untertitel steht das aktuelle Schuljahr (z. B. „Schuljahr 2026/27“), automatisch ermittelt aus Halbjahres- und Quartalsbeginn im Noten-Manager; ohne hinterlegte Daten gilt der 1. August als Wechsel.

6.02: Rollen-Button „↓ Rollen ↑“ besteht aus zwei gleich großen Hälften: links (↓) nach unten, rechts (↑) nach oben; „Rollen“ steht mittig, beim Überfahren wird die jeweilige Hälfte hervorgehoben.

6.03: Drucken in Chrome immer im A4-Hochformat – Notenspiegel, Seitendruck und PDF-Ausgaben des Noten-Managers (bisher teils Querformat), ebenso der Sitzplan.

6.04: Unterrichts-Manager: Menü-Button (☰) ganz links in der Zoomleiste blendet die linke Einstellungsleiste (Raum, Datum, gespeicherte Sitzpläne …) mit einer Gleitbewegung aus und wieder ein. Eingeklappt nimmt sie keinen Platz ein; der Sitzplan nutzt die volle Breite („Einpassen“ passt sich an). Auf iPhone und iPad ist die Leiste standardmäßig eingeklappt; der zuletzt gewählte Zustand wird gemerkt. Der Vollbild-Button entfällt.

6.05: Unterrichts-Manager: „Tischanordnung“ und „Gruppen“ sind auch in Safari normal hoch (40 px, einzeilig) – Safari hatte die Zeilenhöhe dieser Buttons stark überschätzt.

6.06: Neues, kräftigeres App-Symbol im macOS-Stil: leuchtender Blauverlauf, weiße Tabelle mit deutlichem Raster und Karte mit blauem Haken, mit Tiefenschatten. Gilt für Kopfzeile, Browser-Tab, Dock/Startbildschirm (PWA) und iPhone/iPad.

6.07: Reiter in der Kopfzeile getauscht: Unterrichts-Manager steht jetzt links, Noten-Manager rechts – passend zum Ablauf (im Unterricht erfassen, danach benoten). Die App öffnet weiterhin den zuletzt genutzten Manager; beim allerersten Start den Noten-Manager.

6.08: Kleines Easteregg: Das App-Symbol neben dem Titel nimmt die unter „Farbgestaltung“ (Klick aufs Symbol) gewählte Farbe an – als kräftige, leuchtende Version des dezenten Farbtons. Bei „Blau“ bleibt das gewohnte Symbol.

6.09: Das App-Symbol in der Kopfzeile blendet beim Farbwechsel weich in die neue Farbe über. Doppelklick aufs Symbol lässt es kurz hüpfen wie im Mac-Dock; ein einfacher Klick öffnet wie gewohnt die Farbgestaltung.

6.10: Kopfzeile: neuer Untertitel „Die lokale Unterrichts- & Notenverwaltung“, Versionsnummer dezent grau. Das Schuljahr steht klein und unaufdringlich rechtsbündig über den Buttons „Rückgängig“ und „Backup“ (auf schmalen Bildschirmen links neben bzw. über den Buttons).

6.11: Unterrichts-Manager auf dem iPhone Duo: Aufgeklappt im Querformat – wo Einstellungsleiste und Sitzplan nebeneinander passen – ist die linke Leiste standardmäßig ausgeklappt. Zugeklappt und im Hochformat bleibt sie wie bisher eingeklappt, weil sie dort über dem Plan stünde. Die Lage wird getrennt gemerkt; beim Auf-/Zuklappen oder Drehen wechselt die Leiste automatisch.

6.12: Das Schuljahr steht jetzt klein und grau ganz rechts in der kompakten Navigationsleiste (senkrecht mittig, in beiden Managern) statt über den Buttons. Wird der Navigationspfad lang, wird es auf „2026/27“ gekürzt und notfalls ausgeblendet.

6.13: Noten-Manager: Das Datumsfeld auf Testseiten (Rohpunkte, Gruppe A/B) sieht jetzt aus wie bei Klassenarbeiten und Klausuren – gleiche Schrift und Größe, abgerundeter Rahmen, mehr Innenabstand.

6.14: Noten-Manager: Der Button „Tests-Übersicht“ auf Testseiten (zurück zur Übersicht) ist jetzt ein gefüllter Button in der Akzentfarbe mit weißer Schrift – gleiche Form und Größe wie „Drucken“, passt sich der Farbgestaltung an.

6.15: Gesperrte Datumsfelder sind grau hinterlegt – z. B. der Beginn des 1. Quartals im Dialog „Quartale bearbeiten“, der automatisch vom Halbjahresbeginn übernommen wird.

6.16: Tests mit Rohpunkten: Die Rohpunkteskala lässt sich – wie die Notengrenzen bei Klassenarbeiten/Klausuren – über „Manuell“ (rechts neben „Rohpunkteskala“) selbst festlegen, bei A/B-Gruppen getrennt je Gruppe. Beim Einschalten werden die automatischen Werte übernommen; dann lässt sich die Untergrenze jeder Note direkt eintragen, die Obergrenzen ergeben sich daraus, die niedrigste Note beginnt immer bei 0. Ergebnisse und Tests-Übersicht werden sofort neu berechnet. ↺ stellt die automatischen Werte wieder her. Im manuellen Modus ist „Grenze für ausreichend“ ausgegraut; überschneidende Grenzen werden rot markiert.

6.17: Datenschutz: „Schüler finden“ zeigt keine Vorschläge aus den eigenen Kontakten mehr (Safari/iOS). Das Feld ist jetzt ein Suchfeld mit Platzhalter „Suchen …“; auch die Namensfelder der Schülerlisten im Noten-Manager sind gegen Kontakte-Vorschläge gesperrt.

6.18: Unterrichts-Manager: Der Button „Raum umbenennen“ zeigt einen gezeichneten Stift im Linienstil des Menü-Symbols (gleiche Strichstärke, Akzentfarbe) statt des Schriftzeichens ✎ – auf allen Geräten gleich.

6.19: Die App startet immer im Unterrichts-Manager – unabhängig davon, welcher Manager zuletzt geöffnet war.

6.20: Startverhalten verfeinert: Nach einer kurzen Unterbrechung (unter zwei Stunden) öffnet die App wieder den zuletzt benutzten Manager, z. B. beim Notenmachen. War sie länger geschlossen, startet sie im Unterrichts-Manager.

6.21: Größeres Update: (1) Schutz vor Datenverlust – die App merkt sich das letzte Backup; ist es älter als 7 Tage (oder gibt es noch keins), zeigt der Backup-Button einen orangefarbenen Punkt und der Backup-Dialog das Datum. In Safari (nicht als Home-Bildschirm-/Dock-App) erscheint einmalig ein Hinweis, dass Safari Daten nach 7 Tagen ohne Nutzung löschen kann. (2) Kopfzeile auf dem iPad (651–1000 px) einzeilig, Untertitel ausgeblendet. (3) Eigene Dialoge im App-Design statt der grauen Browserfenster für Hinweise, Rückfragen und Eingaben (z. B. Raum umbenennen, Löschen bestätigen); Lösch-Aktionen mit rotem Button. (4) Beamer-Modus im Unterrichts-Manager (Zoomleiste): blendet Bewertungen, Abwesenheiten, Schnelleingabe, Einstellungsleiste, bearbeitende Aktionen sowie Noten-Manager, Rückgängig, Backup und Auswahlmenü aus; Sitzplätze sind nicht anklickbar. Zufallsauswahl, Rollen, Perspektive und Schüler finden bleiben. (5) „Daten prüfen“ im Backup-Dialog: behebt doppelte Bereiche, verwaiste Quartalsseiten und ausgeblendete Quartale mit Eintragungen automatisch und meldet Seiten ohne Zuordnung, Zeilen ohne Namen mit Eintragungen sowie doppelte Namen. (6) Technik: tools/bump-version.py setzt bei neuen Versionen alle Cache-Nummern einheitlich (behebt veraltete Dateien im Zwischenspeicher); fehlende Datei im Offline-Cache ergänzt.

6.22: „Beamer-Modus“ heißt jetzt geräteunabhängig „Präsentieren“ (aktiv: „Präsentation beenden“) – passend zum Spiegeln per AirPlay, Smartboard oder Beamer. Der Button zeigt wie die übrigen Buttons nur Text, ohne Symbol.

6.23: Kompaktere Veröffentlichung: Die Web-App besteht jetzt aus 15 statt 84 Dateien – alle Skripte je Bereich zu einer Datei gebündelt (app.js, noten/noten.js, sitzplan/sitzplan.js), Icons und Manifest nur noch einmal, Tests und Werkzeuge nur im separaten Quellprojekt. Zusätzlich liegt die portable Einzeldatei Classroom-Manager.html bei. Funktionen unverändert.

6.24: Unterrichts-Manager: Der Abstand unter der kompakten Navigationsleiste ist jetzt so groß wie darüber – wie im Noten-Manager.

6.25: Backups lassen sich auch in Safari (iPad, Mac-Web-App) wieder laden. Ursache war der begrenzte Browserspeicher von Safari (ca. 5 MB): Der Noten-Manager hatte für jede Klasse leere Datenblätter aller Seiten des Fachs gespeichert – rund 85 % der Daten. Diese leeren, keiner Rubrik zugeordneten Blätter werden jetzt beim Speichern und beim Wiederherstellen weggelassen; Blätter mit Eintragungen bleiben immer erhalten. Bestehende Daten werden beim ersten Start automatisch verkleinert (Beispiel: 3,8 → 0,8 Mio. Zeichen).

6.26: Unterrichts-Manager: „Bewertungen ausblenden“ blendet jetzt immer auch die roten Rahmen für fehlende Hausaufgaben aus. Im Gruppenmodus erscheinen dabei die ursprünglichen Gruppenfarben statt weißer Plätze. Gilt ebenso beim Präsentieren.

6.27: Sitzplan-Zoom: Am Desktop und auf dem iPad im Querformat wird der Sitzplan immer mit 100 % angezeigt. Auf dem iPad (und iPhone) im Hochformat wird er automatisch eingepasst, wenn er mit 100 % zu groß wäre. Manuelle Anpassungen (−/+, Regler, 100 %, Einpassen) bleiben bis zum nächsten Drehen bzw. Neustart erhalten. Präsentieren passt nicht mehr automatisch ein.

6.28: Unterrichts-Manager: Der Button „Schülerperspektive/Lehrerperspektive“ heißt jetzt kurz „Perspektive“; ist die Schülerperspektive aktiv, erscheint er hervorgehoben. „Schüler finden“: Esc oder ein Klick/Tipp irgendwo außerhalb beendet die Suche – die Hervorhebung verschwindet und der Name wird aus dem Suchfeld entfernt.

6.29: Unterrichts-Manager: Die Gruppenlegende endet jetzt immer bündig am rechten Rand des Sitzplans – auch bei anderer Zoomstufe oder schmalerem Plan.

6.30: Unterrichts-Manager: Buttonreihe unter dem Sitzplan neu geordnet – Schüler zuweisen │ Zufallsauswahl, Schüler finden │ Rollen, Perspektive … rechts Drucken, „Mehr ▾“ und „Verteilen“ (bisher „Start“) als Hauptaktion ganz rechts. „Vorlage speichern“ und „Zurücksetzen …“ liegen im Menü „Mehr“. Alle Buttons gleich hoch; bei wenig Platz rutscht die rechte Gruppe geschlossen in die nächste Zeile und bleibt rechtsbündig.

6.31: Unterrichts-Manager: Die Buttons unter dem Sitzplan haben jetzt dieselbe Größe wie die Zoomleiste darüber (36 px hoch, gleiche Schrift, etwas engere Abstände). Dadurch passt die Reihe bei eingeklappter Seitenleiste in eine Zeile.

6.32: Unterrichts-Manager: Buttonreihe nach Funktion gruppiert – Zufallsauswahl, Schüler finden │ Rollen, Perspektive │ Drucken, Mehr … rechts „Schüler zuweisen“ und „Verteilen“ (Sitzplan erstellen). „Rollen“ ist im Gruppenmodus gleichmäßig ausgegraut (samt Pfeilen) und erklärt beim Darüberfahren, warum es nicht verfügbar ist.

6.33: Unterrichts-Manager: Die Einträge im Menü „Mehr“ (Vorlage speichern, Zurücksetzen …) sind größer und luftiger – 15 px Schrift, 44 px hohe Zeilen, linksbündig, gut antippbar.

6.34: Unterrichts-Manager: Menü „Mehr“ in mittlerer Größe – 14,5 px Schrift, 36 px hohe Einträge, kompakter Abstand.

6.35: Unterrichts-Manager: Das Menü „Mehr“ ist nur noch so breit wie seine Einträge – kein unnötiger Leerraum mehr.

6.36: Unterrichts-Manager, Tischanordnung: Der Button „Auf Sitzplan anwenden“ heißt jetzt kurz „Anwenden“ und hat normale Buttongröße (36 px), rechtsbündig unter den Vorlagen.

6.37: Notenspiegel (Oberstufe): Ist die Verteilung auf „Noten“ umgeschaltet, zeigt „Notengrenzen verschieben“ nur die fünf Grenzen zwischen ganzen Noten (1/2 = 13/12, 2/3 = 10/9, 3/4 = 7/6, 4/5 = 4/3, 5/6 = 1/0). Beim Verschieben wandern die Notenpunkt-Grenzen dazwischen anteilig mit. In der Ansicht „Notenpunkte“ bleiben alle 15 Schieber.

6.38: Einheitliche Buttonbeschriftungen: „Abbrechen“ = verwerfen, „Speichern“ (oder konkrete Aktion) = übernehmen, „Schließen“ = nichts zu verwerfen, „OK“ = nur zur Kenntnis nehmen. Geändert: Farbgestaltung „Fertig“ → „Schließen“; Geschlecht festlegen „OK“ → „Speichern“; Eingabefenster (Raum, Tischanordnung, Klasse, Fach, Seite, Klausurthema) „OK“ → „Speichern“; „Schließen“ im Notenspiegel als normaler statt gefüllter Button.

6.39: Hausaufgaben und Material: Der Status wird als Symbol angezeigt – ✓ erledigt (grün), ✗ fehlt (rot, ab dem 3. Fehlen dunkelrot), E entschuldigt, A abwesend, – nicht geprüft. Ein Tipp öffnet eine kleine Leiste mit allen fünf Symbolen. Die Spalten sind dadurch deutlich schmaler und übersichtlicher. Außerdem behoben: Beim Ändern eines Hausaufgabenstatus lief die Abgleichung mit der gemeinsamen Klassenliste (Abwesenheiten) wegen eines Fehlers ins Leere.

6.40: Hilfe in der App: Der Button „?“ oben rechts öffnet kurze Anleitungen in fünf Kapiteln (Erste Schritte, Unterrichts-Manager, Noten-Manager, Backup und Datenschutz, Tipps) mit Suchfeld. Geöffnet wird das Kapitel des gerade aktiven Managers; Esc leert die Suche bzw. schließt. Dazu gibt es eine ausdruckbare Kurzanleitung als PDF (Classroom-Manager-Kurzanleitung.pdf).

6.41: Kopfzeile: Der Hilfe-Button „?“ steht jetzt links von „Rückgängig“, „Backup“ bleibt ganz rechts.

6.42: Kompaktansicht: Hausaufgaben- und Materialstatus erscheinen farbig wie in der normalen Ansicht – ✓ grün, ✗ rot (ab dem 3. Fehlen dunkelrot), E blau, A grau. Auch beim Drucken farbig.

6.43: Geräte abgleichen: Abgleich-Datei per AirDrop senden und zusammenführen (neuere Änderung gewinnt), mit Vorschau und Rückgängig.

6.44: Blauer Punkt am Backup-Button: Änderungen seit dem letzten Abgleich noch nicht gesendet (mit Tooltip).

6.45: Backup-Dialog aufgeräumt: Hauptaktionen oben, Format-Umschalter, aufklappbare Bereiche mit Kurzstatus; Geräte abgleichen öffnet sich bei ungesendeten Änderungen.

6.46: Backup-Dialog: Dateiformat-Kacheln und Buttonreihe wieder unten, aufklappbare Bereiche darüber.

6.47: Kompaktansicht: Hausaufgaben-/Material-Symbole in derselben Schrift wie in der normalen Ansicht.

6.48: Eingeblendetes 1. Quartal: Felder mittig unter dem Spaltenkopf.

6.49: Hausaufgaben-Symbole: breiter in der normalen Ansicht, Kreuz in der Kompaktansicht exakt mittig; Endlosschleife in der Kompaktansicht behoben.

6.50: Sitzplan: Schalter „Bewertungen im Sitzplan“, „Präsentieren“ heißt jetzt „Klassenansicht“.

6.51: Sitzplan: leere Rasterfelder als ruhige hellgraue Fläche ohne unscharfe Strichlinie.

6.52: Sitzplan: Buttons der linken Leiste so groß wie im Hauptfenster (36 px, 13,6 px Schrift).

6.53: README: Bedienungsanleitung auf den aktuellen Stand gebracht (Abgleich, Backup-Dialog, Klassenansicht, Sitzplan-Buttons, Zoom, Hilfe u. a.); Änderungsverlauf darunter.

6.54: Neu: Schuljahr abschließen (Archiv, optional mit Passwort) und Archiv ansehen, Stundenplan mit automatischer Klassen- und Raumwahl, Schülerübersicht mit Profil und Fehlzeiten, Zufallsgruppen.

6.55: Stundenplan lernt die Klassen aus den Eingaben (auch in der Pause danach); Sitzplan wird automatisch eingepasst, wenn er bei 100 % nicht vollständig sichtbar ist.

6.56: Schülerübersicht: Button links vor „＋ Schüler:in“, nur im Noten-Manager; Notenfarben wie in den Tabellen.

6.57: Backup-Dialog: Auswahlpunkt in den Formatkästen entfernt.

6.58: Hilfe und README: Schülerübersicht im Kapitel Noten-Manager bzw. bei den Aktionsbuttons beschrieben.

6.59: Schülerübersicht: wieder helle Notenfarben.

6.60: Sitzplan-Zoom: am Mac nur bei zu großer Breite verkleinern (Höhe nur auf iPad/iPhone).

6.61: Unterrichts-Manager: Seitenleiste auf dem iPad im Querformat standardmäßig eingeblendet.

6.62: Schneller: Hinweistexte prüfen nur neue Inhalte, Übersichten nur bei Anzeige berechnet, Abgleich vergleicht nur geänderte Klassen, Schülerprofil gezielt und zwischengespeichert, Sitzplan zeichnet im Hintergrund nicht neu, Abwesenheit nur bei Änderung weitergegeben.

6.63: Geschlecht: Vorschläge aus dem Vornamen (lokale Namensliste, gestrichelt, erst mit Speichern übernommen); ohne Auswahl bleibt das Feld leer.

6.64: Geschlecht: Button heißt nur „Speichern“ (übernimmt weiterhin alle Vorschläge).

6.65: Geschlecht: App lernt unbekannte Vornamen dazu, korrigierte Vorschläge werden „nicht eindeutig“; Liste „Gelernte Namen“ zum Bearbeiten.

6.66: Aufgeräumt: nicht mehr verwendete Funktionen (alter Sitzplan-Im-/Export und Vollbackup, ersetzte Sitzplan-Erzeugung, alte Umbenennen-Funktionen), abgeschaltete Offline-Reste und überflüssige Dateien in den Unterordnern entfernt. Keine Änderung der Bedienung. Einzeldatei korrigiert: Schülerübersicht und Schuljahr-Menü funktionieren dort wieder, die Datei ist rund 60 % kleiner.

6.67: Weiter aufgeräumt: alte Berechnung der Halbjahresübersicht (lief beim Start unnötig mit) und ein verwaister Sitzplan-Eingabeabgleich entfernt. Projekttests an die aktuelle Oberfläche angepasst. Keine Änderung der Bedienung.

6.68: Mündliche Mitarbeit: Jede Datumsspalte kann eine Bezeichnung erhalten (z. B. „Kurzvortrag“); sie erscheint in Quartalsübersicht, Schülerübersicht, Excel-Export, Kompaktansicht und Schnelleingabe. iPhone: „?“, „Rückgängig“ und „Backup“ stehen in einer Zeile.

6.69: Geräte abgleichen: Lehnt der Browser das Teilen ab (z. B. Chrome am Mac), wird die Abgleich-Datei gespeichert, mit Hinweis zum Senden per AirDrop aus dem Finder. Schuljahr-Menü: eigene Hinweistexte statt „… ausführen“.

6.70: Unterrichts-Manager: „Schüler zuweisen“ ganz links, „Verteilen“ ganz rechts; die Buttonreihe bleibt einzeilig – was nicht passt (zuerst Drucken, dann Perspektive, Rollen …), steht im Menü „Mehr“. Notengrenzen-Fenster: Zeilen bei Rohpunkten und Fehlern gleich hoch.

6.71: Zoomleiste über dem Sitzplan einzeilig: Was nicht passt (zuerst Klassenansicht, dann Bewertungen, 100 %, Einpassen), steht im Menü „Mehr“ ganz rechts. Schalter heißt jetzt „Bewertungen“.

6.72: Menü „Mehr“ der Zoomleiste: Schalter steht direkt neben „Bewertungen“.

6.73: Klasse anlegen: Namen und Geschlecht aus dem Klassenlisten-PDF der Schule übernehmen (passende Seite wird gesucht, Kontrolle mit der Fußzeile); die Geschlechter füttern „Gelernte Namen“.

6.74: PDF-Import auch für Kurslisten der Oberstufe: Kurscode (z. B. EK1e28) oder Fach + Klasse (11a in Erdkunde), Notenpunkte voreingestellt, Geschlecht aus dem Vornamen vorgeschlagen.

6.75: Noten-Manager: Buttonleisten vereinheitlicht – alle Anzeige-Schalter oben rechts (1. Quartal als Schalter, Zeichen/Noten, Notentendenzen, Schraffuren auch auf Übersichten), darunter nur Buttons („Geschlecht“, „Import …“ ohne +); Klausurthema als Feld neben dem Datum. Dreifach-Schalter im Tabellenkopf unverändert.

6.76: „Notentendenzen“ heißt überall „Tendenzen“; Auswahlfeld „Rohpunkte“ im Aufgabenkopf so breit wie die Punktefelder darunter.

6.77: Neue Schüler:innen (+ Schüler:in, Klassenliste) sortieren sich nach Eingabe des Namens alphabetisch ein. Backup-Dialog: „Alle Daten löschen …“ mit optionalem Backup und Bestätigung durch „LÖSCHEN“.

6.78: Navigationsleiste: zweiter Klick auf die kompakte Leiste klappt das Menü wieder ein. Unterrichts-Manager: „Gruppen“ entfernt (vorhandene Gruppen-Sitzpläne werden zum normalen Sitzplan), „Tischanordnung …“ steht unter Raum.

6.79: Sitzplan: Leere Rasterfelder mit feiner, scharfer Strichlinie (Vorschlag A).

6.80: Einheitliche Buttongröße: Unterrichts-Manager und Kopfzeile wie der Noten-Manager (40 px hoch, 16 px Schrift).

6.81: Alle Buttons: 40 px hoch, Schrift 14,4 px, Beschriftung exakt mittig.

6.82: Backup-Dialog: „Alle Daten löschen …“ ohne roten Kasten, aufgebaut wie „Daten prüfen“ (feine Trennlinie, kürzerer Text).

6.83: iPad/iPhone: Langes Drücken auf ein Feld setzt oder entfernt das Pult (statt einen Tisch zu setzen); keine Textmarkierung mehr im Sitzplan.

6.84: Mehr Sicherheit: Antwortet der Noten- oder Unterrichts-Manager nicht, wird er neu geladen; Backup speichern/wiederherstellen notfalls direkt über den Gerätespeicher; Rückgängig-Liste auf etwa 1 MB begrenzt; Fehlerprotokoll unter „Daten prüfen“.

6.85: Tests: Fachvorgabe für Notengrenzen (Zahnrad am Fach → Reiter „Tests“, auch Oberstufe; neue Tests folgen ihr, bestehende per „Fachvorgabe übernehmen“). Schraffuren-Schalter nur, wenn etwas schraffiert ist. iPhone: Buttons unter dem Sitzplan in einer Zeile („Schüler finden“ und „Schüler zuweisen“ notfalls im Menü „Mehr“).

6.86: Klassenarbeit: Aufgabennamen änderbar (z. B. „Übersetzung“); „Thema“ steht vor „Datum“ und wächst mit dem Text.

6.87: Spaltenköpfe einheitlich: Name bzw. Bezeichnung oben (mit „−“), dann Datum, Gewichtung und Skala – in Klassenarbeiten, Tests und Mündlicher Mitarbeit.

6.88: Fehler behoben: Mit fachspezifischen Notengrenzen startete der Noten-Manager in der Release-Fassung nicht (leere Navigationsleiste, Backup „antwortet nicht“).

6.89: Zahnrad-Fenster heißt „Bewertungsgrenzen“; im Reiter „Tests“ neue Rubrik „Grenzen verschieben“ mit Regler.

6.90: Datenschutzmodus zum Vorführen (Button „Datenschutz“ in der Kopfzeile): Namen unscharf, Bewertungen unleserlich mit Zufallsfarben; Drucken, Export, Backup und Kopieren gesperrt.

6.91: Datenschutz-Button nur noch als Augen-Symbol (wie „?“).

6.92: Ergebnis-Darstellung als Umschalter mit festen Feldern: „2,4 | 2− | 2“ (Dezimal, Tendenz, Gerundet), bei Notenpunkten „10,6 | 11“ – nichts verrutscht mehr.

6.93: Design-Paket: Umschalter mit zwei Feldern (Gewichtung, Zeichen/Noten), „1+ erlauben“, Hinweis „Gespeichert ✓“, freundliche leere Seiten, „＋ Hinzufügen ▾“ bei vielen Plus-Buttons, einheitliche Überschriften, Erscheinungsbild Hell/Automatisch/Dunkel.

6.94: Startansicht: Nach einem Quartals- oder Halbjahreswechsel seit dem letzten Besuch (laut „Beginn …“-Daten) öffnet jede Klasse beim Start das aktuelle Quartal – auch nach dem Wiederherstellen eines Backups. Bewusst geöffnete ältere Quartale bleiben erhalten. Die zuletzt geöffnete Ansicht aus einem Backup wird beim Wiederherstellen nicht mehr überschrieben.

6.95: Tests: Gruppe A/B per Klick umschalten (Feld statt Auswahlliste, A blau, B orange). Schieberegler für die Rohpunkteskala auf der Testseite – links ++ (grün), rechts --- (rot); Griffe zeigen Punkte und Prozent, Ziehen schaltet auf „Manuell“, bei A/B je Gruppe ein Regler.

6.96: Tests: Rohpunktefelder mit Rahmen und ohne Pfeile. Enter schließt die Eingabe ab und springt zur nächsten Zeile; ist keine weitere Ziffer möglich (z. B. „19“ bei max. 21), geschieht das automatisch. Zu große Werte lassen sich nicht eintippen. Der Regler „Grenzen verschieben“ im Fenster „Bewertungsgrenzen – Fach“ ist gespiegelt (links ++, rechts ---).

6.97: Tests: Ein gemeinsamer Regler „Notengrenzen“ in Prozent – bei A/B für beide Gruppen, mit den Punkten je Gruppe darunter. Verschieben nur bei „Manuell“. Die Skalen der Gruppen zeigen nur noch die Punktbereiche. Ältere manuelle Punktgrenzen werden einmalig (nach Gruppe A) in Prozent umgerechnet. Datenschutz-Button: offenes Auge, im aktiven Modus mit Strich (von unten links nach oben rechts).

6.98: Tests: Über dem Regler „Notengrenzen“ der Umschalter „Automatisch | Manuell“, darunter rechts „Fachvorgabe wiederherstellen“ (bei Tests mit Noten/Notenpunkten „Zurücksetzen“). „Manuell“ übernimmt die Fachvorgabe als Ausgangswerte. Rohpunkte: Nach der Eingabe springt kein anderes Feld mehr an – Enter oder eine vollständige Zahl (z. B. 19 bei max. 21) schließen nur ab.

6.99: Backup: Neuer Bereich „Speicherort“ (Chrome/Edge am Mac/PC): Downloads, jedes Mal fragen oder fester Ordner – gilt für JSON und Excel. Tests: Button „Fachvorgabe wiederherstellen“ unter dem Regler wieder entfernt (dafür gibt es den Hinweis oben).

7.00: Gewichtung bei Klassenarbeiten: Umschalter „% | x:y“ statt „% | Verhältnis“ – kürzer, überdeckt die erste Spalte nicht mehr.

7.01: Bewertungsgrenzen – Klassenarbeiten im Stil der Tests: Gewichtung mit „% | x:y“, Schalter Tendenzen/1+ unter „Notengrenzen“, neuer Kasten „Grenzen verschieben“ (fünf Grenzen zwischen ganzen Noten, Tendenzen werden gleichmäßig verteilt; bei Fehlern links 0 %) und dritte Spalte „Beispiel“ (40 Punkte bzw. 100 Wörter). Klassenarbeiten: Rohpunkte-/Fehlerfelder neutral wie bei Tests (Farbe nur in der Teilnote), ohne Pfeile; Enter schließt ab, ohne in ein anderes Feld zu springen; passt keine weitere Ziffer mehr, endet die Eingabe automatisch.

7.02: Bewertungsgrenzen: neuer Reiter „Klausuren“ (rechts) für die Oberstufe mit Gewichtung, Regler „Grenzen verschieben“ (Griffe an 13|12, 10|9, 7|6, 4|3, 1|0) und Tabelle Punkte | Anteil | Beispiel. Standard für alle Fächer in Klassen mit Notenpunkten ist der KMK-Beschluss (4 Punkte ab 40 %, 1 Punkt ab 20 %); eigene Prozentwerte einer einzelnen Klausur haben Vorrang. Im Fenster „Bewertungsgrenzen“ werden die Reiternamen nicht mehr umbenannt.

7.03: Klassenarbeiten/Klausuren wie Tests: In der Navigation ein Reiter „Klassenarbeiten“ (bzw. „Klausuren“), der eine Übersicht öffnet – je Arbeit Datum, Thema und Note, rechts der Durchschnitt, unten Klassenschnitt und Anzahl unter 4 (bzw. unter 5 Punkten). „Öffnen ›“ führt zur Seite der jeweiligen Arbeit, dort führt „Klassenarbeiten-Übersicht“ zurück. Bestehende Daten und ältere Backups bleiben unverändert nutzbar.

7.04: Seite einer Klassenarbeit/Klausur: Aufgaben als Karten über der Tabelle (Name, Gewicht, Fehler/Rohpunkte, entfernen, „＋ Aufgabe“), der Umschalter „% | x:y“ rechts daneben; die Tabelle zeigt im Kopf nur noch Name und Gewicht. Bewertungsgrenzen – Klausuren: 4 Punkte immer schraffiert (nicht bestanden), auch im Regler; Hinweis „Bestanden ab 5 Punkten“.

7.05: Ergebnistabellen von Klassenarbeiten/Klausuren, Testseiten und der Übersicht sind nur noch so breit wie nötig (feste Namensspalte); „Schüler:in“ steht links über den Namen.

7.06: Gleiches Layout für Tests und Klassenarbeiten: Jede Skala steht in einem einklappbaren Kasten „Notengrenzen“ (mit Kurzinfo, Auf/Zu wird gemerkt) – Einstellungen, bunte Skala mit Schiebern und darunter die Tabelle, in der Mitte in zwei Spalten umbrochen. Bei Klassenarbeiten lassen sich die Schieber verschieben, wenn „Manuell“ eingeschaltet ist; 4 Notenpunkte bleiben schraffiert.

7.07: Klassenarbeiten: Die Notentabelle unter dem Regler ist ab mittlerer Fensterbreite in zwei Spalten umbrochen – jetzt auch bei „Manuell“ (Reihenfolge der Eingaben und Tab-Taste bleiben erhalten). Auf sehr breiten Bildschirmen (ab ca. 1900 px, z. B. großer Monitor) läuft auch die Schülerliste der Ergebnisse in zwei Spalten.

7.08: Notentabelle (zweispaltig): Zellen mittig, durchgehende Zeilenlinien. In den Notengrenzen-Kästen der Klassenarbeiten entfällt die dort wirkungslose Leiste (1. Quartal/Schraffuren, Kompaktansicht, Drucken). Tests-Übersicht: Button „Öffnen ›“ statt „Rohpunkte“, wie bei Klassenarbeiten.

7.09: Klassenarbeiten mit nur einer Aufgabe: keine Aufgabenkarte, nur „＋ Aufgabe“; „Bewertung nach: Rohpunkte/Fehler“ steht über den Notengrenzen, nicht benötigte Skalen werden ausgeblendet. Schalter „Tendenzen“ bei den Ergebnissen entfällt (der Dreifach-Umschalter regelt das). Notenspiegel der Tests ohne Zwischenstufen (nur ++ bis ---). Durchschnittszeile ohne „Punkte“, damit sich nichts überlagert.

7.10: Klassenarbeiten: Notentabelle wie bei Tests – nur „Rohpunkte | Note“, ohne Prozentspalte und Pfeilfelder, schlicht ohne Farben, links und rechts je ein Rahmen (4 Notenpunkte bleiben schraffiert). Grenzen bei „Manuell“ über den Regler; mit Tendenzen werden die Zwischenstufen gleichmäßig verteilt. Fehler behoben: Die Skalen einer Arbeit erschienen teils erst nach dem Neuladen.

7.11: Klassenarbeiten: Bei nur einer Aufgabe kein Aufgabenbereich mehr – „＋ Aufgabe“ als Button zwischen „Import …“ und „Notenspiegel“. Notengrenzen wie bei Tests: Hinweis „Grenzen: Fachvorgabe/automatisch“ (blau) bzw. „eigene Werte“ (orange) mit Button „Fachvorgabe übernehmen“/„Automatisch berechnen“ statt Kreispfeil, dazu der Umschalter „Automatisch | Manuell“. Neu: „Fortschritt“ – Balken über der Schülerliste zeigt, wie viele Arbeiten korrigiert sind (Rot → Grün, bleibt beim Scrollen sichtbar).

7.12: Ergebnis-Umschalter „2−“ zeigt Tendenzen unabhängig vom Schalter „Tendenzen“ der Skala; Fortschrittsbalken in hellen Notenfarben (Rot → Orange → Gelb → Grün).

7.13: Klassenarbeit: Automatisch/Manuell rechts; Tests: Grenzen-Kasten innerhalb von „Notengrenzen“, Rohpunkte und Grenze bei A/B oberhalb der Skala; umbrochene Schülerliste ohne Leerspalten, Ergebnis direkt neben den Aufgaben.

7.14: Klassenarbeit: Automatisch/Manuell wirklich rechtsbündig; Ergebnis „2,4“ rechnet mit den feinen Tendenzwerten (2− = 2,33); neuer Umschalter Schraffur | Rahmen für Tendenzen und 4 Notenpunkte.

7.15: Rahmen-Modus mit weißer Trennlinie, 4− mit kräftigerem Rot, 4 Notenpunkte bleiben schraffiert; Klassenarbeit: Halbe Punkte/Tendenzen und Automatisch/Manuell in der Zeile der Eingabefelder; Tests: Eingabefelder mit Rahmen und Einheit wie bei Klassenarbeiten, Trennlinie über dem Grenzen-Kasten entfernt; Titelzeile mit gleich hohen Feldern und Knöpfen.

7.16: „Grenze für ausreichend“: bei „Automatisch“ gesperrt (zeigt die Vorgabe), bei „Manuell“ bearbeitbar und verschiebt den Griff 4/5 bzw. − / −− auf der Skala – bei Klassenarbeiten und Tests gleich.

7.17: Test-Detailseite: Titel „Test“, Thema als Eingabefeld (wie bei Klassenarbeiten), Kopfzeile Tests-Übersicht · Thema · Datum · Drucken, Kompaktansicht entfernt; Klassenarbeit: Kopfzeile von „Notengrenzen“ zeigt im Modus Manuell die aktuelle Grenze.

7.18: Dezimalnoten (2,4) werden nach der nächstgelegenen Tendenz markiert (Schraffur bzw. Rahmen wie 2−); gerundete Noten bleiben unmarkiert.

7.19: Klassenarbeit/Klausur: Kopfzeile wie bei Tests – Übersicht mittig, rechts daneben Thema und Datum, Drucken ganz rechts.

7.20: Kopfzeile von Klassenarbeit, Klausur und Test: Thema direkt neben dem Titel, Übersichts-Knopf genau mittig, Datum und Drucken rechts; Ergebnis-Umschalter zeigt „2,3 | 2− | 2“.

7.21: Ansichts-Schalter in der Zeile „Ergebnisse“: „Aus | Schraffur | Rahmen“ (ersetzt den Schalter „Schraffuren“), Kompaktansicht, Drucken; bei Tests „Drucken“ ebenfalls in der Zeile „Ergebnisse“.

7.22: „Bewertung nach“ bzw. die Skalen-Auswahl je Aufgabe erscheint nur noch, wenn es mehr als eine Bewertungsgrundlage gibt (Klassenarbeiten, Klausuren und Tests).

7.23: Klassenarbeiten/Klausuren: Gewicht je Arbeit in der Übersicht (Standard 1×), wirkt auf den Durchschnitt und die Halbjahresnote; Tests-Übersicht: Spaltenkopf wie bei Klassenarbeiten (Name, Datum als Text, Gewicht, Öffnen).

7.24: Tests-Übersicht reduziert wie die Klassenarbeiten-Übersicht (1. Quartal, Kompaktansicht, Drucken) mit Knopf „＋ Test“; Testseite mit Knopfleiste: Schülerübersicht, ＋ Schüler:in, Geschlecht, Import, Fortschritt, Notenspiegel, Eingaben löschen (nur dieser Test).

7.25: „Aus | Schraffur | Rahmen“ landet zuverlässig in der Zeile „Ergebnisse“; Notengrenzen-Kästen tragen den Namen der Aufgabe(n), die die Skala nutzen (z. B. „Notengrenzen · Aufgabe 1“), bei nur einer Aufgabe nur „Notengrenzen“.

7.26: Klassenarbeiten-/Klausuren-Übersicht: „−“ neben dem Titel entfernt eine Arbeit (mit Rückfrage); Vergleich „1. Quartal“ bei Tests ohne doppelte Datumsfelder.

7.27: Klassenarbeiten-/Klausuren-Übersicht: Umschalter „2,3 | 2− | 2“ (Klausur „10,6 | 11“) über „Durchschnitt“, lange Themen gekürzt (vollständig beim Darüberfahren); „1. Quartal“ zeigt einen Hinweis, wenn es nichts zum Vergleichen gibt.

7.28: Fehler behoben: Schalter „1. Quartal“ ließ sich auf vielen Seiten nicht bedienen – zwei Anzeige-Skripte schoben die Schalter endlos hin und her (Endlosschleife). Entlastet auch den Rechner.

7.29: Halbjahresnote ohne Schalter „1. Quartal“ (Q1 und Q2 stehen dort bereits); App-Symbol erscheint auch in der direkt geöffneten Einzeldatei.

7.30: „Aus | Schraffur | Rahmen“ ersetzt den Schalter „Schraffuren“ auf allen Seiten (auch Klausuren, Mündliche Mitarbeit); kein Verdoppeln mehr beim Umschalten von „2,3 | 2− | 2“; bleibt auch im Rahmen-Modus sichtbar.

7.31: Klassenarbeiten-Übersicht: Tendenz und Dezimalnote rechnen mit den feinen Werten wie auf der Detailseite (2− statt 2), „Durchschnitt“ steht über dem Umschalter; Farbgestaltung färbt jetzt auch nachgeladene Bereiche um (keine blauen Reste bei Rosé usw.); Dialog „Farbgestaltung“ ohne Fokusrahmen beim Öffnen.

7.32: Sperre „🔒 Zurückgegeben“ für Klassenarbeiten, Klausuren und Tests (nur noch ansehen/drucken, Entsperren jederzeit); Klausur-Notenfelder ohne Doppelpfeil, Enter bestätigt ohne Weiterspringen; Farbdialog öffnet ohne Fokusrahmen.

7.33: Übersicht: Umschalter „2,3 | 2− | 2“ steht auf Höhe von „Gewicht“, mit Abstand unter „Durchschnitt“.

7.34: Fortschritt auf der Testseite funktioniert auch bei vollem Browserspeicher; Fortschritt-Knopf mit gleichem Rahmen wie die anderen Knöpfe; neue Hilfe-Rubrik „Gut zu wissen“ mit nützlichen Funktionen und dem Weg dorthin.

7.35: Notenspiegel zeigt Art und Thema der Arbeit (z. B. „Test – L16 (Wdh.)“, „Klassenarbeit – Demographie“), lange Titel gekürzt, darunter Fach · Klasse; von der Testseite aus zählt er nur diesen Test.

7.36: Prüflauf: Einzahl „Klausur/Klassenarbeit/Test“ bei genau einer Arbeit; Notenspiegel-Titel im Ausdruck einzeilig gekürzt, Umschalter wird nicht mitgedruckt; Anzeige-Schalter funktionieren auch bei vollem Browserspeicher (Schraffur/Rahmen, 1. Quartal, Durchschnitt-Umschalter); ungenutzter Code entfernt.

7.37: Interner Umbau (keine sichtbare Änderung): Die Zusatzmodule des Noten-Managers hängen sich jetzt über eine zentrale Stelle an Seitenwechsel, Seitenaufbau und Navigation statt sich gegenseitig zu umhüllen; ein Fehler in einem Modul bricht die anderen nicht mehr ab.

7.38: Interner Umbau, Teil 2 (keine sichtbare Änderung): auch der Unterrichts-Manager nutzt die zentralen Erweiterungspunkte (Tischaufbau, Klassenwechsel, Stunde aktualisieren); ein Fehler in einem Modul bricht die anderen nicht mehr ab.

7.39: Speicheranzeige: Backup → „Speicher“ zeigt, wie voll der Browserspeicher ist (mit Farbbalken und größtem Anteil); ab 85 % erscheint oben eine Warnung mit „Backup öffnen“ und „Später“.

7.40: „＋ Test“/„＋ Klassenarbeit“ als Kasten im Tabellenkopf, Aus/Schraffur/Rahmen als Bildsymbole, Schnell-Backup-Doppelknopf

7.41: Hinweis „weniger als 3 mündliche Noten“ im Sitzplan, dickerer Hausaufgaben-Rahmen ab der 3., Klassenarbeits-Titel in der Übersicht gekürzt

7.42: Mündliche Noten, Hausaufgaben und Material werden übers ganze Halbjahr gezählt; „M“ am Tisch bei fehlendem Material

7.43: Hilfe: neues Kapitel „Neu“ mit den letzten zehn Funktionen; Hilfe-Kapitel und README auf den aktuellen Stand gebracht

7.44: Kopfzeile von Klassenarbeit, Klausur und Test passt aufs iPad: „Zurückgegeben“ dort nur als Schloss, hochkant zweizeilig

7.45: Sitzplan: Bei ausgeschalteten Bewertungen sind alle Tische weiß (auch ohne Tönung für fehlende mündliche Noten)

7.46: Sitzplan: „Schüler finden“ steht jetzt links von „Zufallsauswahl“

7.47: Fehler behoben: Fehlende Hausaufgaben und Material ließen sich im Sitzplan nicht speichern, solange im Noten-Manager noch das vorige Quartal ausgewählt war

7.48: Hausaufgaben und Material: Spalte „Fehlend“ zählt übers ganze Halbjahr (auch für die Eltern-Mail)

7.49: „Geräte abgleichen“ entfernt (Backup-Dialog, blauer Punkt, Hilfe); Reste des Änderungsprotokolls werden aufgeräumt

7.50: Notenspiegel (Notenpunkte): 4 Punkte werden schraffiert dargestellt – Punktzahl und Balken

7.51: Quartals-/Halbjahresübersicht: Spalten Selbsteinschätzung und Quartalsnote 1/3 schmaler

7.52: Hinweis auf neue Versionen („Jetzt aktualisieren“); Web-App fragt beim Server nach, damit Updates nicht im Zwischenspeicher hängen bleiben

7.53: Datenschutzmodus im Sitzplan: Namen auch auf bewerteten Tischen unscharf, jeder Tisch eine echte Zufallsfarbe, Rahmen und Hinweise ausgeblendet

7.54: Sitzplan: „Perspektive“ steht jetzt links neben „Schüler finden“

7.55: Backup sofort wiederherstellen (⬆ neben „Backup“); jede Wiederherstellung lässt sich rückgängig machen; Rückfrage nennt das Datum des Backups

7.56: Kopfzeile: Umschalter Unterrichts-/Noten-Manager exakt mittig (am Mac)

7.57: „1. Quartal“ und „Kompaktansicht“ als beschriftete Knöpfe (an = hellblau), überall einheitlich, Kompaktansicht direkt rechts neben 1. Quartal

7.58: Leere Eingabefelder: Platzhalter („Punkte“, „Fehler“) heller; Kompaktansicht-Symbol zeigt waagrecht zusammenrückende Spalten

7.59: „Bewertungen“ im Sitzplan (Auge) und „Als Noten“ im Notenspiegel als beschriftete Knöpfe wie 1. Quartal/Kompaktansicht

7.60: Notenspiegel: neues Symbol für „Als Noten“ (waagrechte Balken: viele dünne → wenige breite)

7.61: iPad: Knöpfe rechts in der Kopfzeile enger zusammen

7.62: iPad hochkant: App-Name ausgeblendet (nur Symbol), Umschalter Unterrichts-/Noten-Manager mittig zwischen Symbol und Knöpfen

7.63: Klassenarbeit/Klausur: Übersichts-Knopf auch bei mittlerer Breite (iPad quer) exakt mittig

7.64: iPhone (Schritt 1): schmale Kopfzeile mit Auswahl als Blatt von unten, Leiste unten (Unterricht · Noten · Backup · Mehr), Ansichts-Knöpfe als wischbare Pillen-Reihe

7.65: iPhone: Leiste unten höher und mit Abstand zum Home-Balken und zu den Display-Rundungen

7.66: Version auf dem iPhone sichtbar: unten im Blatt „Mehr“ und in der Hilfe; iPhone quer ohne abgeschnittenen App-Namen

7.67: iPhone: Bewertungsfenster als Blatt mit Zurück/Weiter, bleibt nach der Bewertung offen, aktueller Tisch blau umrandet; quer Leiste links

7.68: iPhone-Sitzplan kompakter: ohne Koordinaten und Hinweistext, Zoom nur mit −/+, Raumtitel und Moduswechsel in einer Zeile

7.69: iPhone: Quartals- und Halbjahresübersicht als Karten mit Umschalter Karten/Tabelle; Selbsteinschätzung und Quartalsnote in der Karte eintragbar

7.70: iPhone: Karte antippen öffnet ein Blatt mit allen Einträgen der Person; ‹ › oder Wischen zur nächsten Person

7.71: iPhone: mündliche Noten auf den Eingabeseiten mit dem bunten Fenster als Blatt (ohne Tastatur), Zurück/Weiter je Termin

7.72: Klassenarbeiten/Klausuren erscheinen in der Quartalsübersicht nicht mehr als „Q1 · …“ (sie gehören nur zum Halbjahr); iPhone-Detailblatt zeigt das 1. Quartal getrennt

7.73: Excel-Export: Klassenarbeiten/Klausuren nur noch in der Halbjahresübersicht, nicht mehr in den Quartalsblöcken

7.74: iPhone: Karten-Ansicht lässt sich nicht mehr seitlich verschieben (nur senkrecht scrollen); Halbjahresübersicht zeigt groß die Halbjahresnote

7.75: iPhone-Karten: Noten als farbige Balken je Bereich (je länger, desto besser); Eintragefelder in einer Zeile

7.76: iPhone-Karten zeigen die Gewichtung: Balken als Rechenbaum mit Prozenten (Halbjahresnote = Sonstige + KA; Sonstige = 1./2. Quartal bzw. MM + Tests)

7.77: iPhone-Karten: alle Balken beginnen auf gleicher Höhe; Stufen nur links eingerückt, Unterpunkte mit dünnerem Balken

7.78: iPhone: Gewichtungen als Schieberegler mit Schnellwahl (1:1, 2:1, 3:1, 4:1 bzw. 1:1, 2:1, 1:2 – exakt gerechnet)

7.79: iPhone: Auswahl-Blatt und „Mehr“ lassen sich nach unten wegwischen

7.80: iPhone-Karten: alle mündlichen Noten des Quartals als farbige Kästchen mit Datum unter „MM Ø“

7.81: Schraffur-Schalter gilt jetzt auch für die iPhone-Karten, das Detailblatt und das bunte Eingabefenster

7.82: iPhone: Noten-Manager als schlanke Lese-Version – nur Fach und Klasse wählen, Karten der Quartalsübersicht nach Datum, 1. Quartal je Karte aufklappbar, Sortierung nach Name oder Note

7.83: iPhone-Karten: fehlende Hausaufgaben (und Material) des ganzen Halbjahres als rote Kästchen mit Datum, ab 3× rot; Balken bei ausgeschalteter Schraffur wieder gefüllt; Karten-Ansicht ohne Dauer-Neuaufbau (schont den Akku)

7.84: iPhone-Kopfzeile: Backup speichern ⬇ | wiederherstellen ⬆ als runde Doppel-Pille, runder Rückgängig-Knopf, schmalere Auswahl; Version als Marke hinter „Hilfe“ im Blatt „Mehr“

7.85: iPhone: Leiste unten Unterricht · Noten · Aktuell · Hilfe; „Aktuell“ öffnet die Lerngruppe laut Stundenplan (sonst die zuletzt unterrichtete); oben nur Lerngruppe, Datenschutz, Backup und Rückgängig

7.86: iPhone-Kopfzeile: Rückgängig-Pfeil mittig, alle runden Knöpfe gleich groß, Kopfzeile passt wieder in die Breite

7.87: iPhone-Unterricht: nur Sitzplan im Bewertungsmodus, oben Datum („Heute ▾“) und Perspektive; Pult antippen dreht den Plan; Seitenleiste und übrige Knöpfe ausgeblendet

7.88: iPhone: quer wieder Fach · Klasse in der Auswahl; Karten: „Selbsteinschätzung“ ausgeschrieben, „1. Quartal“ mit Auge und bündig mit den Eingabefeldern

7.89: iPhone-Unterricht: passt der Sitzplan nicht aufs Display, werden leere Reihen/Spalten zu schmalen Gängen und Tische nötigenfalls flacher; Bewertungsansicht auch quer; Stundenplan: je Klasse nur ihre Räume wählbar

7.90: iPhone quer: schlanker Noten-Manager (Karten) wie hochkant

7.91: iPhone-Karten: Mündlich, Tests und Klassenarbeit als farbige Kästchen mit Datum statt schmaler Balken

7.92: iPhone-Karten: keine Balken mehr, Noten rechts im farbigen Kästchen, fehlende HA rot; oben Tendenzen-Schalter Aus/Schraffiert/Rahmen statt Sortierung

7.93: iPhone-Karten: „1. Quartal“ blendet die Noten des 1. Quartals blass vor dem 2. Quartal ein (Quartalsnote Q1 blau umrandet oben); HA/Material quartalsweise, aufgeklappt mit Halbjahressumme; Werte auf Höhe der Kästchen; Klassenarbeit ganz unten

7.94: iPhone: Datenschutzmodus auch in den Noten-Karten (Namen unscharf, Noten mit Zufallsfarben), Hinweis über der unteren Leiste; „Mündliche Mitarbeit“, „Sonstige Mitarbeit“, ohne „Halbjahr“-Marken

7.95: iPhone-Karten: Werte rechts exakt auf Höhe der Kästchen, Mündliche Mitarbeit/Tests unter der Sonstigen Mitarbeit eingerückt, Detailblatt nach unten wegwischen, Q1-Rahmen auch im Rahmen-Modus

7.96: iPhone-Karten: Quartalsnote des 1. Quartals so groß wie die aktuelle Note mit Trennstrich, keine grauen Rahmen um Tests/Klassenarbeit, keine 100 % ohne Tests

7.97: iPhone: fehlende HA als rotes Symbol mit weißem ×, Gewichtung auch bei Sonstiger Mitarbeit und Klassenarbeit, Backup-Knöpfe breiter, Klasse mittig in der Kopfzeile

7.98: iPhone: fehlende HA/Material unter der Sonstigen Mitarbeit eingerückt, Hinweis „Noch keine Quartalsübersicht“ schließbar bzw. andere Klasse wählen, Klasse mittig im blauen Feld

7.99: iPhone-Karten: Anteile von Mündlich/Tests auf die Halbjahresnote umgerechnet (z. B. 40 % / 10 %); „Aktuell“ sagt genauer, ob kein Stundenplan gespeichert ist oder nur keine passende Stunde

8.00: iPhone-Karten: Noten des 1. Quartals nicht mehr blass, Klassenarbeit-Kästchen gleich groß; Wiederherstellen zeigt, ob das Backup einen Stundenplan enthält

8.01: iPhone: „Aktuell“ springt in die laufende Stunde (mit Datum und Raum), sonst Stundenplan für heute und den nächsten Schultag; Hinweise über den Karten (3× HA fehlend, ohne mündliche Note) zum Filtern; Notiz je Person (iPhone im Detailblatt, Mac in der Quartalsübersicht)

8.02: Code aufgeräumt: ungenutztes „Mehr“-Blatt, nicht mehr erreichbares iPhone-Eingabeblatt und veraltete Stilregeln entfernt, Kopfzeilen-Regeln zusammengefasst (keine sichtbare Änderung)

8.03: Code aufgeräumt: Stilregeln der iPhone-Karten zusammengefasst (eine Regel je Zeile, überschriebene Angaben entfernt) – keine sichtbare Änderung

8.04: iPhone-Karten: Schalter „1. Quartal“ oben blendet das 1. Quartal bei allen Karten ein/aus (einzelne Karten weiter umschaltbar)

8.05: Hilfe, Kurzanleitung und README: eigenes Kapitel „Auf dem iPhone“ mit allen aktuellen Funktionen; veraltete iPhone-Absätze ersetzt

8.06: iPhone: Detailblatt im selben Aufbau wie die Karte (Abschnitte, Werte rechts, 1. Quartal immer eingeblendet, größer), bei Tests der Name unter dem Datum

8.07: iPhone-Detailblatt: Zeile „Halbjahresnote“ über den Quartalsnoten (eingetragen in voller Farbe, sonst heller der errechnete Wert)

8.08: iPhone: Selbsteinschätzung und Quartalsnote mit kompakter Marke „Q1“/„Q2“; „Quartalsnote“ wird erst mit zwei eingetragenen Noten zu „Quartalsnoten“; Gewichtung Sonstige Mitarbeit/Klassenarbeit immer angezeigt, wenn hinterlegt

8.09: iPhone-Karten: Schalter Dezimal / Tendenz / Gerundet für errechnete Werte (bei Notenpunkten Dezimal / Ganze Punkte); „Quartalsnoten“ auch neben dem vorgeschlagenen Wert

8.10: iPhone-Karten: Klassenarbeit auch ohne Note (mit Gewichtung) aufgeführt, Quartalsmarke „Q2“ hinter dem Namen statt in den Feldern, beide Dreifachschalter mit Symbolen wie am Mac

8.11: iPhone-Detailblatt: Halbjahresnote immer unter der Notiz – ohne Klassenarbeit hell als Vorschlag aus der Sonstigen Mitarbeit; doppelte „Q2“-Marke bei den Quartalsnoten entfernt

8.12: iPhone-Karten: oben links Dezimal/Tendenz/Gerundet, rechts Schraffur-Schalter; darunter „1. Quartal“ links und die HA-Hinweise rechts

8.13: iPhone-Karten: Schalter getauscht (links Schraffur, rechts Dezimal/Tendenz/Gerundet); bei Tests nur das Datum; Klassenarbeit mit Datum unter der Note

8.14: iPhone-Karten: oben „1. Quartal“ (runde Pille) und HA-Hinweise, darunter die beiden Dreifachschalter

8.15: iPhone-Karten: Überschrift „1. Halbjahr · 2. Quartal“ oben, Hinweis „Antippen zeigt alle Einträge“ über den Karten; Schraffur „Aus“ wird in Karten und Detailblatt sofort angewendet (robuster)

8.16: iPhone-Karten: Σ vor den Summen bei Hausaufgaben und Material fehlend (wie Ø beim Durchschnitt)

8.17: Notizen: Hinweis „📝 Notizen in dieser Klasse“ mit Liste (Bearbeiten/Erledigt) im Noten-Manager und auf dem iPhone; im Sitzplan orangener Punkt am Tisch und Notiztext im Bewertungsfenster

8.18: iPhone-Karten: untere Zeile (1. Quartal, Selbsteinschätzung, Quartalsnote) entfernt – eingetragen wird im Detailblatt, das 1. Quartal blendet der Schalter oben ein

8.19: iPhone-Unterricht: Bewertungsfenster lässt sich nach unten wegwischen

8.20: iPhone-Karten: Hinweise kürzer („3× HA fehlend“, „Ohne mündliche Note“; bei mehreren „3× HA“, „ohne MM“), damit sie neben „1. Quartal“ in die erste Zeile passen

8.21: Datenschutzmodus: bei jedem Einschalten neue, zufällig gemischte Farben (vorher blieben sie im Sitzplan durch die Farbgestaltung eingefroren und wiederholten sich)

8.22: iPhone: App-Name, Version und Untertitel oben im Hilfefenster

8.23: iPhone: Hilfe als Blatt von unten (Griff, ✕, nach unten wegwischen) wie alle anderen Blätter; Notizen-Liste wegwischbar; ✕ im Bewertungsblatt

8.24: Hilfe: Rubrik „Neu“ auf den aktuellen Stand gebracht (zusammengefasst nach Themen)

8.25: Notenpunkte: Durchschnitte werden nach der gerundeten Punktzahl eingefärbt – z. B. 3,5 Punkte wie 4 Punkte (immer schraffiert), 3,4 Punkte wie 3 Punkte

8.26: Hilfe: „Erfunden von Torsten Gruber“ – im Kopf des Hilfefensters und als Eintrag „Über den Classroom-Manager“

8.27: Hilfe: Erfinder-Hinweis nur noch unter „Gut zu wissen“ → „Über den Classroom-Manager“

8.28: iPhone-Unterricht: Plätze lassen sich nicht mehr verschieben/tauschen und freie Tische nicht zuweisen – nur noch bewerten
8.29: iPad/iPhone: Kein Hineinzoomen mehr per Zwei-Finger-Geste oder Doppeltippen (Kopfleiste, Seiten); Scrollen bleibt
8.30: Umbenennen: Sitzpläne (auch Räume, gespeicherte Versionen, Paare/Tabu) und Notizen ziehen den neuen Namen mit – auch nach dem Wiederherstellen eines Backups auf einem anderen Gerät; frühere Umbenennungen mit kleinem Tippfehler werden beim Laden repariert
8.31: Nach einem Update (auch wenn die App direkt mit der neuen Version startet) erscheint einmal kurz „✓ Aktualisiert auf Version …“ mit „Was ist neu?“ (öffnet die Hilfe bei „Neu“); Update-Prüfungen legen keine Einträge mehr im Offline-Speicher ab
8.32: Kompaktansicht mit eingeblendetem 1. Quartal: Q1-Spalten haben die gleiche Größe wie die übrigen, lesbare Überschriften („Q1 · L14 · 10.09.2026“) und eine Trennlinie zum 2. Quartal
8.33: Kompaktansicht: Q1-Tests nur mit Datum („Q1 · 10.09.2026“), ohne Titel
8.34: Tests-Übersicht: der gestrichelte „＋ Test“ öffnet „Test erstellen“ (Rohpunkte mit Detailseite oder direkte Eingabe in der Spalte)
8.35: Update-Hinweis: „Was ist neu?“ erscheint nur, wenn es seit der zuletzt benutzten Version neue Einträge gibt; diese sind in der Hilfe grün markiert („Neu für dich“)
8.36: Schalter „2,3 | 2− | 2“ (bzw. „10,6 | 11“): solange alle Ergebnisse glatt sind, sind Dezimal/Tendenz ausgegraut (Tabellen, Klassenarbeits-Übersicht, iPhone-Karten); gespeicherte Auswahl gilt wieder bei Zwischenwerten
8.37: Tests-Übersicht: Schraffur-Schalter (Aus/Schraffiert/Rahmen) über dem Testmittel-Schalter, beide gleich groß; iPhone: Wischfenster ohne ✕
8.38: Testmittel-Kopf: Schalter 5 px höher, „Testmittel“ 5 px tiefer
8.39: „Schüler finden“ markiert beim Tippen alle passenden Plätze im Sitzplan blau (Vor- oder Nachname) statt einer Vorschlagsliste; ein Treffer: Enter öffnet das Bewertungsfenster
8.40: Tests-Übersicht: Schraffur-Schalter wieder in der Kopfzeile zwischen „Kompaktansicht“ und „Drucken“; Testmittel-Kopf wieder in normaler Größe, mittig
8.41: Alle Auswahlschalter (z. B. „2,3 | 2− | 2“, „Zeichen | Noten“, „% | x:y“, Schraffur) in Pillenform – auf Mac, iPad und iPhone
8.42: iPhone: Fachkürzel-Chip neben der Klasse (Ek, Ge, En, Ma, De, La, Fr …); Hilfe startet beim ersten Öffnen in „Erste Schritte“, danach auf dem iPhone in „Auf dem iPhone“, am Mac passend zur Ansicht
8.43: iPhone: Auswahl-Blatt für Fach und Klasse zeigt auch im Unterricht keine Zahnräder und kein „+ Fach“/„+ Klasse“ mehr
8.44: iPhone: kein Pfeil mehr neben Klasse und Fach – ein Tipp auf das Feld öffnet die Auswahl
8.45: Schraffur-Schalter auf allen Seiten mit Noten immer an derselben Stelle (zwischen „Kompaktansicht“ und „Drucken“); ohne Tendenzen oder 4 ausgegraut; Hausaufgaben/Material ohne
8.46: Sitzplan (Bewertungsmodus): Felder ohne Tisch unsichtbar, freie Tische blass (iPhone unsichtbar), leere Reihen/Spalten als Gänge (hochkant ½, quer ⅓); iPhone/iPad: belegte Reihen größer (Obergrenze), Mac nur verdichtet; Sitzplanmodus, Beamer, Druck unverändert
8.47: Fehlerbehebung: Nach dem Ausschalten der Tendenzen in den Notengrenzen zeigte die Ergebnisspalte noch alte Tendenz-Noten (mit Rahmen/Schraffur), bis man den Darstellungs-Schalter antippte – jetzt wird sie sofort neu gezeichnet
8.48: iPhone: Sitzplan springt im Querformat nicht mehr zwischen groß und klein; quer stehen „Heute“ und „Perspektive“ untereinander rechts neben dem Plan; Pult ausgeblendet (mehr Platz für die Klasse)
8.49: iPhone: „Heute“ und „Perspektive“ gleich gestaltet (Höhe, Schrift, Farbe); ein anderer Tag bleibt orange markiert
8.50: Klassenarbeiten mit Rohpunkten: Sind in den Notengrenzen die Tendenzen aus, zeigt das Ergebnis nur ganze Noten (keine Feinwerte mit Rahmen/Schraffur) – passend zum Schalter „2“; gilt auch in der Klassenarbeitsübersicht
8.51: iPhone: Pult wieder sichtbar – als schmale Leiste, die beim Einpassen nicht mitzählt (Platz bleibt für die Klasse)
8.52: iPhone: Sitzplan mit zwei Fingern zoomen (nur der Plan, um den Punkt zwischen den Fingern); klein gezogen rastet er eingepasst ein
8.53: iPhone: Nach dem Zoomen mit zwei Fingern wird der Sitzplan neu gezeichnet – keine verschwundenen Tische mehr
8.54: Wichtige Fehlerbehebung: Beim Zoomen mit zwei Fingern konnte der zweite Finger im Bewertungsmodus das Werkzeug „Tische setzen/entfernen“ auslösen und Schüler zu freien Tischen machen – jetzt nur noch im Sitzplanmodus und mit einem Finger
8.55: Sitzplan-Änderungen von 8.46 bis 8.53 zurückgenommen (verdichtete Darstellung, unsichtbare freie Tische, Pult-Leiste, Knöpfe rechts im Querformat, Zoomen mit zwei Fingern, angeglichene Knöpfe) – Sitzplan wieder wie in 8.45; die Schutzkorrektur aus 8.54 bleibt
8.56: iPhone quer: Tische ragen nicht mehr in die schmalen Gänge, Pult-Reihe nicht mehr abgeschnitten
8.57: iPhone quer: Datum und „Perspektive“ untereinander rechts neben dem Plan (mehr Platz für den Sitzplan); hochkant: „2/3“-Plaketten am rechten Rand nicht mehr abgeschnitten
8.58: iPhone: „Heute“ und „Perspektive“ gleich gestaltet (Höhe, Schrift, Farbe); ein anderer Tag bleibt orange
8.59: iPhone quer – Sitzplan füllt die Höhe aus (Reihen bis 1,6-fach höher); Datum/Perspektive werden bei Platzmangel zu Kreisen (H/G, P)
8.60: iPhone quer – kompakte Knöpfe behalten ihr Symbol (H/G ▾, ⇅ P)
8.61: iPhone quer – kompakte Knöpfe mit gleichem Abstand zwischen Buchstabe und Symbol
8.62: Neues Quartal wird automatisch in allen Lerngruppen (gleiches Halbjahr) angelegt
8.63: iPhone quer – oberste Tischreihe bündig mit dem Datumsknopf, Sitzplan weiter oben
8.64: iPhone – Sitzplan links und rechts bündig mit den Knöpfen
8.65: Keine Meldung „Stunde: …“ mehr beim automatischen Wechsel zur aktuellen Stunde
8.66: iPhone quer – Sitzplan und Eingabe als zwei gleich hohe Karten, Knöpfe in Pillenform
8.67: iPhone quer – „H“/„P“ während der Eingabe ausgeblendet, Tische größer
8.68: iPhone – neues Noten-Symbol (Karte mit Häkchen aus dem App-Icon)
8.69: iPhone Noten – runder Knopf neben „1. Quartal“ verkleinert alle Karten (Antippen klappt einzelne auf)
8.70: Schalter einheitlich von schlicht nach ausführlich: 2 | 2− | 2,3 und Aus | Rahmen | Schraffiert (überall)
8.71: iPhone – Selbsteinschätzung und Quartalsnote per Notenauswahl statt Tastatur
8.72: Notenauswahl mit Zwischennoten (1–2 … 5–6); Notenpunkte zeilenweise je Note, 4 Punkte schraffiert
8.73: iPhone – Detailblatt einer Person öffnet immer ganz (bis unter die Kopfleiste)
8.74: iPhone – leere Spalten im Sitzplan nur schmal, wenn die Breite knapp ist
8.75: iPhone Noten – Zwischennoten wie „3-4“ brechen bei langen Namen nicht mehr um
8.76: Hilfe → „Neu“ wieder aktuell (Neuerungen 8.62–8.74 ergänzt)
8.77: iPhone Noten – Ansicht „Halbjahr | Q2“ (Standard: ganzes Halbjahr mit Halbjahresnote aus der App, Q1/Q2 klein darunter); Leiste neu angeordnet
8.78: iPhone Halbjahresansicht ohne Zeile unter der Note; beide Dreifachschalter oben gleich groß
8.79: iPhone – Hinweise über den Karten (z. B. „3× HA fehlend“) rund
8.80: Fehlerbehebung: iPhone-Notenliste flackerte und stockte beim Scrollen (Halbjahr + kleine Karten)
8.81: Mac/iPad – Knopf „Noten“ im Unterrichts-Manager zeigt die Notenkarten der Klasse in der linken Spalte (Schnellansicht)
8.82: Noten-Schnellansicht – beim Antippen eines Schülers im Sitzplan springt die Liste zu seiner Karte
8.83: Detailblatt als Quartalsgespräch – erst nur das Quartal, nach Selbsteinschätzung und Quartalsnote Klassenarbeiten, Halbjahres-Vorschlag und Feld für die Halbjahresnote
8.84: iPhone – Wischfenster von Aktuell, Hilfe und Noten fahren gleich weit aus
8.85: Klassenarbeit/Klausur rechts immer mit Ø
8.86: iPhone – bleibt nach Q2-Beginn im 1. Quartal, solange Q1-Quartalsnoten fehlen (max. 4 Wochen, Hinweis mit „Zu Q2“)
8.87: iPhone 1. Quartal – Leiste kompakt: „Q1 offen“ + runder Knopf, darunter beide Dreifachschalter
8.88: iPhone Halbjahresansicht – Sonstige Mitarbeit zeigt Q1- und Q2-Quartalsnote als Kästchen, rechts Ø des Halbjahres
8.89: Mac/iPad – linke Spalte über zwei verbundene Knöpfe ganz links: ☰ Einstellungen | ☑ Noten (ersetzt ☰ und „Noten“)
8.90: Verschlüsselte Backups (Backup → Verschlüsselung): AES-256, Touch ID/Face ID per Passkey (PRF) und Notfall-Passwort; Wiederherstellen fragt automatisch nach Touch ID
8.91: Noten-Schnellansicht sitzt genau an der Stelle der Einstellungen; zweiter Klick auf ☑ Noten holt die Einstellungen zurück
8.92: Backup-Fenster – Reihenfolge: Speicherort · Automatische Sicherung · Verschlüsselung · Speicher · Daten prüfen
8.93: iPhone Noten – Rand um das Kartenfenster rundum 6 px; kleine Karten zeigen wieder den Mitarbeitswert
8.94: Mac/iPad – Abstand zwischen linker Spalte und Klassenraum wie zur Navigationsleiste (10 px)
8.95: Eingebaute fiktive Beispieldaten realistischer: Profile mit Brüchen, Einträge nur bis 06.11.2026, Stundenplan und Quartalsgrenze für die Demo-Klassen, Klasse 6b mit offenen Q1-Noten (eigene Daten bleiben unberührt)
8.96: iPhone hochkant – Unterrichtsfenster wie die Noten-Karte (6 px Rand, füllt die Höhe), Stundenplan und Hilfe mit 6 px Abstand links/rechts
8.97: Fiktive Beispielklassen mit passenden Sitzordnungen (Reihen, Gruppentische, U-Form, Doppel-U); doppelte alte Sitzplan-Beispiele 7a/9b ausgeblendet
8.98: Testseite – Dreifachschalter (Aus | Rahmen | Schraffur) in der Zeile „Ergebnisse“ links neben „Drucken“, „Zurückgegeben“ oben ganz rechts
8.99: Unterrichts-Manager – Datum mit Pfeilen zur vorigen/nächsten gehaltenen Stunde, eigener Kalender mit markierten Unterrichtstagen, Stunde und Raum unter dem Datum; „Verteilen“ direkt neben „Mehr“
9.00: Stundenplan mit A-/B-Wochen (Startpunkte, geteilte Stunden, Wochenanzeige in „Aktuell“ und Kalender); Datum: Knopf „Heute“ zwischen den Pfeilen statt Text darunter
9.01: iPhone – „Aktuell“, „Hilfe“ und die Noteneingabe als normale Seiten (kein Wischen), Noteneingabe mit „‹ Übersicht“ und ‹ ›, zweiter Tipp auf „Noten“ schließt; Mac ohne bunte Notenauswahl
9.02: Mac/iPad-Schnellansicht – Klick auf eine Karte klappt sie auf bzw. zu, keine Noteneingabe-Seite mehr
9.03: iPhone – Doppelstunden in „Aktuell“ als eine Zeile; Datum über dem Sitzplan mit ‹ ◉ › und demselben Kalender wie am Mac
9.04: Spalte per ⇄ links oder rechts (pro Gerät); iPad-Schnellansicht öffnet die Noteneingabe wie am iPhone; „Tischanordnung …“ im Klassenraum, nur im Sitzplanmodus
9.05: Zoomleiste – „Mehr ▾“ direkt nach „Bewertungen“
9.06: Fehler behoben – Schalter ☰ ☑ ⇄ am Mac nach dem Seitenwechsel ohne Funktion (Endlosschleife); Knöpfe vereinheitlicht (40 px, 10 px Ecken), Tischanordnung als Aktionsknopf, passender Hinweis in der Mac-Schnellansicht
9.07: Schalter ☰ ☑ ⇄ – Klick auf den aktiven Knopf blendet die Spalte aus (auch bei Noten), ⇄ bei ausgeblendeter Spalte ausgegraut
9.08: Spalte rechts – ⇄ im Schalter auf der Seite des Klassenraums (⇄ ☰ ☑)
9.09: Fehler behoben – „Bewertungen“ am iPad doppelt (Leiste und „Mehr“); „Bewertungen“ wandert als Letztes ins Menü
9.10: Aufräumen (Paket 1, ohne sichtbare Änderung) – gemeinsame Geräteerkennung device.js, totes Wisch-Code entfernt (Hilfe, Aktuell, Noteneingabe), überholte iPhone-Stilregeln 8.84/8.96 entfernt
9.11: Aufräumen (Paket 2a, ohne sichtbare Änderung) – 100 überflüssige „!important“/„:not(#_)“ in den iPhone-Kartendateien entfernt, geprüft per Stilvergleich (iPhone, iPad, Mac)
9.12: Zufallsgruppen nicht mehr von der Noten-Spalte verdeckt; iPhone quer ohne ‹ ◉ ›; linke Spalte: Datum → Raum → gespeicherte Sitzpläne
9.13: Mündliche Mitarbeit – Vierfachschalter „+ | 2 | 2− | 2,3“ statt „Zeichen | Noten“ (Notenpunkte: „+ | 11 | 10,6“)
9.14: Aufräumen (Paket 3, ohne sichtbare Änderung) – gemeinsamer gedrosselter Beobachter je Seite (classroomOnDomChange) statt neun einzelner, mit Schutz vor Dauer-Änderungsschleifen
9.15: Aufräumen (Paket 2b, ohne sichtbare Änderung) – 89 überflüssige „!important“/„:not(#_)“ in phone.js entfernt, per Stilvergleich geprüft
9.16: Ergebnisübersicht bei Klassenarbeiten/Klausuren – bildschirmfüllende Liste (Name, Punkte mit Balken, Note in App-Farben, Ø Note/Punkte, Bestanden), automatische Spaltenzahl, nur Ansicht
9.17: Ergebnisübersicht – nur gerundete Noten bzw. ganze Notenpunkte, drei Spalten auf breiten Fenstern, Punkte nicht mehr abgeschnitten (Balken in eigener Spalte)
9.18: Fehlerbehebung – Ergebnisübersicht öffnet auch bei älteren Klassenarbeiten/Klausuren (ohne gespeicherten Typ); Datum notfalls aus dem Datumsfeld der Seite
9.19: Knopf „Ergebnisübersicht“ heißt jetzt „Ergebnisse“
9.20: Klassenarbeit/Klausur drucken – eine DIN-A4-Seite: ohne Teilnoten Notenspiegel, Notengrenzen von–bis, Ergebnisse dreispaltig, Bemerkungen, Unterschriften; mit Teilnoten Kennzahlen, Notenspiegel, Teilnoten-Tabelle, Ergebnisse mit T1…Tn und Endnote
9.21: Ergebnisse und A4-Druck mit Teilnoten (Oberstufe T1–T3; Latein Fehler/Punkte je mit Teilnote, zweispaltig); Spalte „Punkte“ nur bei echten Rohpunkten; Export-Dialog: Bereich „Druckvorlagen“ mit Leerer Klassenliste und Ergebnisseite der Klassenarbeit
9.22: Notengrenzen-Schieber – im Modus „Automatisch“ nur Anzeige (keine Griffe); im manuellen Modus Schalter „Dynamisch“ (4/5 als Anker, anteiliges Mitziehen) und Live-Notenspiegel beim Ziehen
9.23: Notengrenzen – Wechsel von „Manuell“ zu „Automatisch“ verwirft die eigenen Grenzen jetzt nach Rückfrage (vorher galten sie unbemerkt weiter)
9.24: Schuljahresseite liest die Halbjahresnoten wieder (eigene vor berechneter); fehlende Klassenarbeit → Halbjahresnote aus vorhandenen Arbeiten, markiert mit *
9.25: Quartalsnoten – im 2. Quartal Spalten Q1, SoMi · Halbjahr, Halbjahr ∑/✎; im 4. Quartal Halbjahr 1, Halbjahr 2 ∑/✎, Schuljahr ∑/✎ (∑ berechnet, Stift = eigene Note, geht vor); Seite „Schuljahr“ mit Spalte für die eigene Note
9.26: Testseite – bei ausgeschalteten Tendenzen zeigen Rahmen/Schraffur die Tendenz der ganzen Note (Dreifachschalter wirkt auch dann)
9.27: Vierfachschalter entfernt (wieder „Zeichen | Noten“) – behebt eine Endlosschleife, durch die „1. Quartal“ und der Dreifachschalter nicht reagierten; „Aus“ nach „Rahmen“ wirkt wieder; Mittelwert-Köpfe (Bezeichnung 1/3, Schalter 2/3), Schalter in der Vergleichsspalte 1. Quartal; „＋ Termin“ als großer Kasten
9.28: iPhone quer – Datum, ‹ ◉ › und Perspektive hinter Knopf „⋯“, Tische volle Breite; Noten-Spalte bleibt bei offenem Fenster (z. B. Zufallsgruppen) eingefroren stehen
9.29: Stift in den Spaltenköpfen aufrecht (Spitze unten links); Mündliche Mitarbeit ohne Schalter „Zeichen | Noten“ (immer Zeichen)
9.30: „Ergebnisse“ und A4-Druck folgen dem Dreifachschalter (Aus | Rahmen | Schraffur)
9.31: Epochalfach (Klassen bearbeiten: Epoche 1./2. Hj.) – Halbjahresnote = Schuljahresnote, Spalten bei Q2/Q4, anderes Halbjahr ausgegraut; Test-Druck als A4-Seite (mit A-/B-Gruppen); Stift in Schreibrichtung
9.32: Sprachrichtigkeit bei Klausuren (Notenpunkte) – Fehler/Seiten nur bei Betroffenen, ab 5 F/S −1, ab 7 F/S −2 Notenpunkte auf die Endnote
9.33: Schieber im Notenspiegel-Fenster entfernt (doppelt – Notengrenzen nur noch auf der Seite); Stift in den Spaltenköpfen wie der Stift bei „Raum“, mitgeneigt
9.34: Dunkler Modus – Statusleiste/Browserrand oben wird mit eingefärbt (theme-color folgt dem Erscheinungsbild)
9.35: Dunkler Modus – Hilfe auf dem iPhone (nicht-modales Fenster) wurde doppelt umgefärbt und erschien hell; behoben
9.36: Knopf „Ergebnisse“ heißt „Übersicht“; doppelter Spaltenabstand in der Übersicht; „Epochal (1. Hj.)“ / „Epochal (2. Hj.)“
9.37: Klassen bearbeiten – Auswahlfelder nicht mehr abgeschnitten/übereinander; dunkler Modus: Statusleistenfarbe wird an bestehenden Angaben umgestellt
9.38: iPhone-App – Statusleiste im dunklen Erscheinungsbild schwarz mit weißer Schrift (wird beim Start der App gelesen)
9.39: Statusleiste wieder wie in 9.34 (theme-color wird neu angelegt); iOS-Statusleisten-Einstellung aus 9.38 entfernt
9.40: Reihenfolge Fortschritt · Übersicht · Notenspiegel; Aufgaben in Übersicht/Druck als A1, A2 …; Aufgabenspalten mit fester Breite (lange Titel mit …)
9.41: Aufgabenspalten der Klassenarbeit gleich breit (170 px), Eingabefelder fest 110 px
9.42: Assistent „Schuljahr einrichten“ (Fächer, PDF-Listen, Lerngruppen mit Fach/Notensystem/Epochal); leere App zeigt nur die Startkarte; „＋ Aus Listen“
9.43: Schuljahr einrichten – Liste springt nicht mehr nach oben, Fächer alphabetisch, Oberstufe nach Jg. 11/12/13 sortiert (Abiturjahr aus Kurskürzel), nichts vorausgewählt; Mündliche Mitarbeit wird je Lerngruppe angelegt; Fächer ohne Lerngruppe werden ausgeblendet
9.44: „Sitzplan bearbeiten“-Knopf mit oranger Leiste (Tischanordnung, Fertig) statt Modus-Schalter; Bewertungsfenster mit Knöpfen „Abwesend“ und „Notiz“ (aufklappbares Textfeld)
9.45: Pfad über dem Auswahlmenü als schlichter Text (aktuelle Stelle blau); iPhone-Schülerkarte: Notiz kompakt („＋ Notiz“ bzw. gelber Kasten)
9.46: „Einpassen“ mit Rand rechts (Gruppen-Pillen); Dunkelmodus-CSS wieder wie 9.34 (iOS-Statusleiste), Hilfe am iPhone per Klasse ausgenommen
9.47: Notengrenzen-Tabellen komplett farbig; „＋ Aufgabe“ quadratisch; schräge Spaltenköpfe am Kopfband abgeschnitten
9.48: Dialog „Klausur erstellen“: „Rohpunkte → Notenpunkte“ / „Notenpunkte direkt“ mit Erklärzeilen
9.49: Hinweis auf Fachvorgaben beim ersten Anlegen einer Klassenarbeit/Klausur je Klasse; iOS-Statusleiste black-translucent mit Streifen im hellen Modus
9.50: „Fertig“ übernimmt gewählte Tischanordnung, „Abbrechen“ daneben, „Anwenden“ unten entfällt; Zahnrad B; „＋ Aufgabe“ in der Knopfzeile repariert; Statusleisten-Änderungen (9.34–9.49) entfernt
9.51: Vierfach-Schalter Markierungen: „Aus“ (alles weiß, auch 4 NP) · Nur Farbe · Rahmen · Schraffur – appweit, auch iPhone
9.52: Sprachrichtigkeits-Spalte per „＋ Abzug“/„− Abzug“ (Rückfrage, wenn Abzüge eingetragen sind)
9.53: „Aus“ (ohne Farben) auch in Übersicht und Druck; Hilfstext Sprachrichtigkeit („Bei schwerwiegenden und gehäuften Verstößen …“)
9.54: „＋ Abzug“ blau gestrichelt, „− Abzug“ rot gestrichelt
9.55: A4-Druck ohne leere zweite Seite (Seitenhöhe 258 mm)
9.56: Geschlecht in der Schülerübersicht (Knopf im Kopf, m | w je Zeile); Knopf „Geschlecht“ auf den Bewertungsseiten entfällt
9.57: Übersicht bei Tests, Kompaktansicht in der Ergebnis-Zeile, Kopf „Testmittel / 1. Quartal“; Einpassen bis zum Ende der Schalterzeile (+20 px links); Geschlecht-Vorschläge in der Schülerübersicht
9.58: Testdruck nutzt manuelle Grenze; Schülerübersicht/＋ Schüler:in wieder links; Testmittel-Schalter höher
9.59: Test-Übersicht mit eigener Spalte „Gr.“ wie im Druck; Testmittel-Schalter höher
9.60: Stundenplan am iPad ohne automatische Uhrzeit-Auswahl; Schülerkarte: Klassenarbeit vor „Sonstige Mitarbeit · Halbjahr“, SoMi ausgeschrieben
9.61: Testmittel-Schalter 3 px tiefer
9.62: Schülerkarte – Ø der Klassenarbeit folgt dem Darstellungs-Schalter
9.63: Erinnerungen (Glocke) bei 3./5. fehlenden Hausaufgaben bzw. Material, Elternbrief-Vorlagen
9.64: Elternbrief-Vorlagen bearbeitbar (Platzhalter, Unterschrift, zurücksetzen), „wie bereits angekündigt“ entfernt; Erinnerungs-Status im Backup
9.65: Klausur-Fachvorgaben: Gewichtung bei 1/2 Klausuren, Bewertungsart „Direkt“; Elternbrief als formatierter Text kopiert (Leerzeilen)
9.66: Elternbrief Hausaufgaben 5.: Unterstützung zu Hause + Bestätigung statt Gesprächsbitte
9.67: Sortierung A–Z | Note (Tabellen + iPhone-Karten), Erinnerung „Nicht nötig“, Klausur-Dialog mit Fachvorgabe/3 Optionen
9.68: Zweiter Tipp auf A–Z bzw. Note kehrt die Sortierung um
9.69: Notenknopf der Sortierung zeigt die Richtung (6–1/1–6 bzw. 0–15/15–0)
9.70: Sortierung auch auf den Einzelseiten (MM, Tests, Test, Klassenarbeit, Übersicht); Hausaufgaben/Material nach Anzahl fehlend
9.71: Flackern/tote Schalter bei MM, Hausaufgaben/Material, Quartalsnoten behoben; „A“ zählt nicht als offen
9.72: iPhone: Sortierung nach Note erst bei vollständigen Karten, Hinweis beim Antippen
9.73: PDF-Dateiname beim Drucken mit Klasse, Fach, KA-Nummer/Test und Datum
9.74: Endlosschleife des Sortierschalters behoben (Ruckeln iPhone/iPad, träge Navigation Mac); Hinweis in der Seitenleiste sichtbar
9.75: Optimierung: Beobachter-Schleifen im Unterrichts-Manager behoben, Begriffe/Dezimal/Drucken-Knopf effizienter, Sortier-Eingriff durch Datenreihenfolge ersetzt; Ruhe- und Zuordnungstest
9.76: Halbjahreszeilen: SoMi · Halbjahr übernimmt eigene Q2-Note sofort, Klassenarbeit nach SoMi · Halbjahr, Halbjahr ∑ 100 %; keine KA-Spalte auf Quartalsseiten
9.77: iPhone-Kopfzeile: Rückgängig links neben Backup (wie am Mac)
9.78: Erinnerungen – Erledigt ausklappbar; Vorlagen-Fenster schließt nicht mehr beim Markieren/Klick daneben/Esc
9.79: Q2 – Quartalsnoten-Seite ersetzt Halbjahresnoten in der Navigation, KA-Spalte auch leer; iPhone Q2 ohne Q1-Ersatznote, Q1-Chip farbig
9.80: Hilfe überarbeitet (Mac, iPad, iPhone) – aktueller Stand aller Kapitel
9.81: Notenbesprechung zweistufig (erst mündlich, dann Halbjahr); Halbjahresnote wird bei Bedarf still angelegt (Klausur in der Karte, Ø korrekt)
9.82: Notenpunkte – Zeichen ++/+ (12,5 P.) wird nicht mehr als ++ angezeigt
9.83: „Halbjahr im Überblick“ (auch ohne Selbsteinschätzung); Druck/Übersicht von KA/Klausur/Test in Seitensortierung
9.84: Sortieren nach Note immer möglich – offene am schwachen Ende; Ergebnis mit Sprachrichtigkeits-Abzug richtig erkannt
9.85: Q-Noten dezimal in Kästchen, Notenbesprechung in der Mac-Seitenleiste, Notenspiegel-Druck vereinheitlicht, kein „1. Quartal“ bei Klausuren
9.86: Notenspiegel-Fenster als Säulendiagramm; Beschriftung (Note/Punkte, darunter Anzahl) auch im Druck
9.87: Dreifachschalter Rohpunkte | Fehler | Direkt auch für Klassenarbeiten und Tests (Vorauswahl beim Anlegen); Tests mit Fehlereingabe; iPad/iPhone: Seite positionsfest
9.88: Datenschutzmodus – Teilnoten auch bei gesperrten Arbeiten und ohne Farbe unkenntlich, Tendenz-Rahmen ausgeblendet
9.89: Backups zusammenführen (Änderungsprotokoll mit Zeitstempeln); Sitzplan mittig, Mac 100 %, iPad eingepasst; Test-Gewichtung in der Sonstigen Mitarbeit als Fachvorgabe
9.90: Zusammenführen – Spalten mit gleichem Datum (Mitarbeit, Hausaufgaben, Material) und Halbjahresbereiche werden vereint, Gewichte neu verteilt
9.91: Speichern einer Bewertung im Unterrichts-Manager deutlich schneller (Klassenlisten-Abgleich mit Nachschlagetabellen)
9.92: Bewerten im Unterrichts-Manager auch auf dem iPad sofort (Noten-Manager zeichnet erst beim Wechsel neu, Namensabgleich gemerkt)
9.93: Zusammenführen – Änderungsprotokoll prüft selbst alle 2 s (Safari meldet Änderungen aus eingebetteten Fenstern nicht zuverlässig); Hinweis bei Backups ohne Zeitangaben
9.94: Fenster „Backup laden“ fürs iPhone angepasst; Tausenderpunkt bleibt
