-- Popunjavanje dodatnih podataka za varijante automobila
-- SAMO AŽURIRA nova polja, NE MIJENJA postojeće podatke

-- ==================== VOLKSWAGEN GOLF MK7 ====================

-- Golf MK7 1.6 TDI (110 KS)
UPDATE car_variants SET
  weight = '1295 kg',
  length = '4255 mm',
  width = '1799 mm',
  height = '1452 mm',
  wheelbase = '2637 mm',
  trunk_capacity = '380 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Najpopularniji izbor za svakodnevnu vožnju. Motor 1.6 TDI s oznakom CXXB nudi idealnu ravnotežu između performansi i ekonomičnosti. Tihi rad, niska potrošnja i dugotrajnost čine ga omiljenim među vozačima koji godišnje prelaze veće kilometre. Odličan za gradsku vožnju, ali i za duže relacije autocestom gdje pokazuje svoju štedljivost.',
  pros = 'Izuzetno niska potrošnja goriva (prosječno 4.5L/100km)
Pouzdan i dugotrajan motor s dokazanom izdržljivošću
Miran i ugodan rad na autocesti
Nisko održavanje u usporedbi s benzincima
Odličan moment na niskim obrtajima',
  cons = 'Sporije ubrzanje u usporedbi s jačim verzijama
DPF filter može stvarati probleme pri kraćim gradskim vožnjama
Cijena servisa veća nego kod benzinskih verzija
Bučniji motor pri hladnom startu'
WHERE id = '87ef7645-ee62-4344-91d8-01004251a0be';

-- Golf MK7 2.0 TDI (150 KS)
UPDATE car_variants SET
  weight = '1350 kg',
  length = '4255 mm',
  width = '1799 mm',
  height = '1452 mm',
  wheelbase = '2637 mm',
  trunk_capacity = '380 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Zlatna sredina Golf dizelske ponude. Motor 2.0 TDI s oznakom CRLB pruža dovoljno snage za sve situacije dok zadržava razumnu potrošnju. Idealan za vozače koji traže više performansi od 1.6 TDI, ali ne žele platiti GTD premiju. Snažan moment od 340 Nm omogućuje lagano pretjecanje i sigurnu vožnju s punim opterećenjem.',
  pros = 'Savršena ravnoteža snage i potrošnje
Snažan okretni moment dostupan od niskih okretaja
Odličan za vuču prikolice i vožnju u brdovitom terenu
Manji pad vrijednosti od benzinskih verzija
Ugodan i tih rad na otvorenom putu',
  cons = 'AdBlue sustav povećava kompleksnost održavanja
Potencijalni problemi s EGR ventilom na većim kilometražama
Potreba za redovitom vožnjom na duže relacije
Viša početna cijena od 1.6 TDI'
WHERE id = 'f64840c8-9d03-4291-9abf-cd7e64bf6df4';

-- Golf MK7 1.4 TSI (125 KS)
UPDATE car_variants SET
  weight = '1249 kg',
  length = '4255 mm',
  width = '1799 mm',
  height = '1452 mm',
  wheelbase = '2637 mm',
  trunk_capacity = '380 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Popularan izbor za vozače koji preferiraju benzinske motore. Moderni 1.4 TSI s oznakom CZCA koristi tehnologiju aktivnog upravljanja cilindrima (ACT) koja deaktivira dva cilindra pri niskom opterećenju, smanjujući potrošnju. Živahan karakter motora čini ga zabavnim za vožnju, a ipak dovoljno štedljivim za svakodnevnu upotrebu.',
  pros = 'Živahan i responsivan motor s linearnom isporukom snage
ACT tehnologija značajno smanjuje potrošnju
Niži troškovi održavanja od dizelaša
Tiši rad i ugodniji zvuk motora
Lakši prednji kraj za bolju agilnost',
  cons = 'Veća potrošnja od dizelskih verzija pri dužim vožnjama
Manji okretni moment u odnosu na TDI motore
Lanac razvoda treba kontrolirati na većim kilometražama
Turbo lag osjetljiv pri naglom ubrzavanju iz niskih okretaja'
WHERE id = 'f5223d91-7264-42bd-977c-ee556e095128';

-- Golf MK7 GTI 2.0 TSI (230 KS)
UPDATE car_variants SET
  weight = '1351 kg',
  length = '4268 mm',
  width = '1799 mm',
  height = '1442 mm',
  wheelbase = '2631 mm',
  trunk_capacity = '380 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Legendarni hot hatch koji postavlja standarde segmentu već desetljećima. Golf GTI Mk7 donosi 2.0 TSI motor s oznakom CHHB koji pruža 230 KS u standardnoj verziji, uz mogućnost nadogradnje na 245 KS s Performance paketom. Progresivni diferencijal, sportski ovjes i karakterističan GTI interijer s tartan sjedalima čine ga kultnim automobilom.',
  pros = 'Savršena kombinacija svakodnevne praktičnosti i sportskih performansi
Odlična vozna dinamika i precizno upravljanje
Progresivni diferencijal za bolju trakciju
Prepoznatljiv GTI identitet i dobra vrijednost pri preprodaji
Dokazana pouzdanost EA888 motora',
  cons = 'Tvrđi ovjes može biti neugodan na lošim cestama
Prednji pogon limitira trakciju pri naglim startovima
Relativno visoka cijena servisa performansnih komponenti
IS20 turbo na granici mogućnosti za veće modifikacije'
WHERE id = '0c7a1450-b3d8-4c78-bb77-9056d14e4bf0';

-- Golf MK7 R 2.0 TSI (310 KS)
UPDATE car_variants SET
  weight = '1476 kg',
  length = '4268 mm',
  width = '1799 mm',
  height = '1436 mm',
  wheelbase = '2631 mm',
  trunk_capacity = '343 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Vrhunac Golf evolucije - diskretni supercar ubojica. Golf R kombinira 310 KS snažan 2.0 TSI motor s oznakom CJXC i 4Motion pogon na sva četiri kotača. Može ubrzati do 100 km/h za samo 4.6 sekundi, a istovremeno služiti kao udoban obiteljski automobil. Elektronski podesiv ispuh, progresivno upravljanje i Race način rada čine ga ultimativnim sportskim kompaktom.',
  pros = 'Brutalne performanse u diskretnom pakiranju
4Motion AWD pruža izvrsnu trakciju u svim uvjetima
Svakodnevna upotrebljivost unatoč performansama
Ogromni potencijal za modifikacije (Stage 2+ do 450+ KS)
Odlično drži vrijednost na tržištu',
  cons = 'Manji prtljažnik zbog AWD sustava
Viša potrošnja goriva (prosječno 8-10L/100km)
Skupa nabavna cijena i održavanje
Manje emocionalan zvuk od konkurencije'
WHERE id = 'f7541f8f-fa3b-4ebe-8a3e-b520eb999cac';

-- ==================== VOLKSWAGEN GOLF MK8 ====================

-- Golf MK8 1.5 TSI (130 KS)
UPDATE car_variants SET
  weight = '1310 kg',
  length = '4284 mm',
  width = '1789 mm',
  height = '1456 mm',
  wheelbase = '2636 mm',
  trunk_capacity = '381 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Nova generacija popularnog 1.5 TSI motora s oznakom DPCA donosi poboljšanu učinkovitost zahvaljujući Miller ciklusu i varijabilnoj geometriji turbine. Mild-hybrid sustav u nekim izvedbama dodatno smanjuje potrošnju. Moderan infotainment sustav i digitalna instrumentna ploča donose Golf u novu eru, iako su izazvali kontroverze zbog kapacitivnih tipki.',
  pros = 'Moderna tehnologija s mild-hybrid sustavom
Poboljšana aerodinamika i niža potrošnja
Napredni sustavi pomoći vozaču
Prostranija unutrašnjost od prethodnika
Atraktivan digitalni kokpit',
  cons = 'Kapacitivne tipke i touch komande frustriraju mnoge vozače
Kompleksnija elektronika može značiti više problema
Plastika u unutrašnjosti lošije kvalitete od Mk7
Viša cijena za sličnu opremu'
WHERE id = 'fca48d69-b515-44da-80cb-a79b7d9fe2bb';

-- Golf MK8 2.0 TDI (150 KS)
UPDATE car_variants SET
  weight = '1390 kg',
  length = '4284 mm',
  width = '1789 mm',
  height = '1456 mm',
  wheelbase = '2636 mm',
  trunk_capacity = '381 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Najnovija evolucija legendarne 2.0 TDI jedinice s oznakom DTUA. Twin-dosing SCR sustav s dva AdBlue katalizatora drastično smanjuje emisije NOx, čineći ga jednim od najčišćih dizelaša na tržištu. Zadržava sve prednosti prethodnika uz poboljšanu kulturu rada i smanjenu buku. Idealan izbor za one koji prelaze velike godišnje kilometre.',
  pros = 'Izuzetno čist dizel zahvaljujući twin-dosing tehnologiji
Poboljšana izolacija buke i vibracija
Dugotrajnost i pouzdanost EA288 Evo motora
Odlična prosječna potrošnja od 4.2L/100km
Veći AdBlue spremnik za duže intervale dopunjavanja',
  cons = 'Najviša cijena među Golf Mk8 verzijama
Kompleksan sustav ispušnih plinova
Touch kontrole otežavaju upravljanje klimom
Dizelski motori gube na popularnosti'
WHERE id = '419546c8-b87b-4561-83af-d5c897829b23';

-- Golf MK8 GTI 2.0 TSI (245 KS)
UPDATE car_variants SET
  weight = '1430 kg',
  length = '4296 mm',
  width = '1789 mm',
  height = '1456 mm',
  wheelbase = '2636 mm',
  trunk_capacity = '374 L',
  fuel_tank_capacity = '45 L',
  detailed_description = 'Osma generacija legendarnog hot hatcha donosi 245 KS iz 2.0 TSI motora s oznakom DNUA. Novo vozno postolje s naprednim VAQ elektronskim diferencijalom prednje osovine pruža još bolje performanse u zavojima. Vehicle Dynamics Manager integrira kontrolu diferencijala, adaptivni ovjes i progresivno upravljanje u jedinstveni sustav za maksimalni vozački užitak.',
  pros = 'Napredni Vehicle Dynamics Manager sustav
Još oštrije performanse od prethodnika
Ekskluzivni GTI dizajn s LED svjetlosnom potpisom
Kvalitetna sportska sjedala s izvrsnim bočnim držanjem
Napredni DCC adaptivni ovjes',
  cons = 'Manji spremnik goriva (45L) od prethodnika
Kontroverzan digitalni interijer
Izgubljen je analogni karakter vožnje
Manje karakterističan zvuk ispuha'
WHERE id = '817659e6-8a86-4a61-8ee7-980d02a0b3f0';

-- ==================== BMW 3 SERIES ====================

-- BMW E90 320d (177 KS)
UPDATE car_variants SET
  weight = '1450 kg',
  length = '4531 mm',
  width = '1817 mm',
  height = '1421 mm',
  wheelbase = '2760 mm',
  trunk_capacity = '460 L',
  fuel_tank_capacity = '61 L',
  detailed_description = 'Legendarna E90 generacija BMW 3 Series u najpopularnijoj dizelskoj konfiguraciji. Motor N47 sa 177 KS pruža izniman balans performansi i ekonomičnosti. Poznati stražnji pogon i savršena raspodjela mase 50:50 čine ga jednim od najugodnijih automobila za vožnju u svojoj klasi. E90 320d je definirao što premium srednja klasa može biti.',
  pros = 'Izvanredna vozna dinamika i osjećaj upravljanja
Savršena raspodjela mase 50:50
Pouzdan i ekonomičan N47 motor (kasniji modeli)
Prostran i kvalitetan interijer
Odlična vrijednost na sekundarnom tržištu',
  cons = 'Rani N47 motori (2007-2009) imaju probleme s lancem razvoda
Relativno tvrd ovjes u standardnoj izvedbi
Skuplji dijelovi i servis od masovnih marki
Stražnji pogon može biti izazov na snijegu'
WHERE id = '007520d2-d88a-4783-89d0-44a649097a93';

-- BMW E90 335i (306 KS)
UPDATE car_variants SET
  weight = '1560 kg',
  length = '4531 mm',
  width = '1817 mm',
  height = '1421 mm',
  wheelbase = '2760 mm',
  trunk_capacity = '460 L',
  fuel_tank_capacity = '61 L',
  detailed_description = 'Kultni E90 335i s legendarnim N54 twin-turbo šestocilindričnim motorom. Ovaj motor je postavio temelje za BMW-ovu turbo eru i postao omiljen među entuzijastima zbog ogromnog potencijala za modifikacije. S 306 KS i 400 Nm momenta, 335i pruža iskustvo vožnje koje rijetko koji automobil može ponuditi u ovoj klasi.',
  pros = 'Legendarni N54 motor s ogromnim tuning potencijalom
Glatka isporuka snage karakteristična za redni šestocilindar
Možda najbolji zvuk u klasi
Ubrzanje 0-100 za samo 5.6 sekundi
Kultni status među entuzijastima',
  cons = 'N54 ima poznate probleme (HPFP, turbine, injektori)
Visoki troškovi održavanja i popravaka
Veća potrošnja goriva (10-14L/100km)
Injektori i vodene pumpe su uobičajene zamjene'
WHERE id = '329506fa-5925-44ba-a044-d516bc533053';

-- BMW G20 320d xDrive (190 KS)
UPDATE car_variants SET
  weight = '1595 kg',
  length = '4709 mm',
  width = '1827 mm',
  height = '1442 mm',
  wheelbase = '2851 mm',
  trunk_capacity = '480 L',
  fuel_tank_capacity = '59 L',
  detailed_description = 'Najnovija generacija 3 Series s inteligentnim xDrive pogonom na sva četiri kotača. Motor B47 s 190 KS koristi najnoviju generaciju common-rail ubrizgavanja i twin-scroll turbo za trenutni odziv. xDrive sustav distribuira snagu između osovina s naglaskom na stražnje kotače za zadržavanje karakterističnog BMW osjećaja vožnje.',
  pros = 'Napredni xDrive sustav s naglaskom na stražnju osovinu
Izuzetno niska potrošnja za AWD automobil
Modernizirana unutrašnjost s Live Cockpit Professional
Poboljšana sigurnost i sustavi pomoći vozaču
Veći i praktičniji od prethodnika',
  cons = 'Izgubljena je nešto izravnost upravljanja
Kompleksnija tehnika znači potencijalno skuplji popravci
Softverski problemi s iDrive 7 sustavom
Manje emotivan od E90 generacije'
WHERE id = 'fa78bb7a-99b3-4b82-9f2d-3e9be8f06473';

-- BMW G20 M340i xDrive (374 KS)
UPDATE car_variants SET
  weight = '1730 kg',
  length = '4709 mm',
  width = '1827 mm',
  height = '1442 mm',
  wheelbase = '2851 mm',
  trunk_capacity = '480 L',
  fuel_tank_capacity = '59 L',
  detailed_description = 'M340i predstavlja vrhunac nebrojno M Performance linije. Motor B58 s 374 KS je evolucija legendarnog rednog šestak turbo motora i pruža nevjerojatne performanse s daškom praktičnosti. M Sport diferencijal, adaptivni M ovjes i xDrive s mogućnošću prebacivanja više snage na stražnju osovinu čine ga najbržim 3 Series ispod punog M3.',
  pros = 'Fantastičan B58 motor - možda najbolji turbo I6 ikad
0-100 km/h za samo 4.4 sekunde
Savršen za svakodnevnu vožnju i track days
M Sport diferencijal za izvrsne performanse u zavojima
Diskretna agresivnost bez M3 premije',
  cons = 'Visoka cijena nove
Potrošnja može biti visoka pri sportskoj vožnji (12-15L/100km)
Adaptivni ovjes još uvijek tvrd u Comfort načinu
Launch control onemogućen s xDrive'
WHERE id = 'a48fcc33-aae7-4bd4-9ecf-c60fcd72e4e6';

-- ==================== MERCEDES-BENZ C-CLASS ====================

-- Mercedes W205 C 200 (184 KS)
UPDATE car_variants SET
  weight = '1450 kg',
  length = '4686 mm',
  width = '1810 mm',
  height = '1442 mm',
  wheelbase = '2840 mm',
  trunk_capacity = '480 L',
  fuel_tank_capacity = '66 L',
  detailed_description = 'Mercedes C 200 donosi luksuz S-Klase u kompaktnijem pakiranju. Motor M274 s 184 KS pruža glatku i refiniranu vožnju koja je postala zaštitni znak Mercedesa. Unutrašnjost odiše kvalitetom s materijalima i izradom koji definiraju segmentu. Airmatic zračni ovjes kao opcija dodatno podiže razinu udobnosti.',
  pros = 'Najluksuznija unutrašnjost u klasi
Izvanredan komfor vožnje i izolacija buke
Prestižni Mercedes imidž
Kvalitetna izrada i materijali
Napredni COMAND infotainment sustav',
  cons = 'Stražnji prostor manji od konkurencije
Skuplje održavanje od njemačke konkurencije
M274 motor ima poznate probleme s lancem razvoda
Osnovne verzije mogu djelovati nedovoljno opremljene'
WHERE id = 'e4a436aa-478a-4fda-bfde-29a8fb1f7413';

-- Mercedes W205 C 220 d (194 KS)
UPDATE car_variants SET
  weight = '1510 kg',
  length = '4686 mm',
  width = '1810 mm',
  height = '1442 mm',
  wheelbase = '2840 mm',
  trunk_capacity = '480 L',
  fuel_tank_capacity = '66 L',
  detailed_description = 'Najpopularnija varijanta C-Klase kombinira Mercedes luksuz s dizelskom ekonomičnošću. Motor OM654 s 194 KS predstavlja novu generaciju dizelaša s aluminijskim blokom i naprednim sustavom za smanjenje emisija. Nevjerojatno tih i gladak, ovaj motor redefinira što dizelski pogon može biti u premium segmentu.',
  pros = 'Iznimno tih i kulturan dizelski motor
Izvrsna prosječna potrošnja od 4.5L/100km
Velik doseg s 66L spremnikom
OM654 motor pouzdaniji od prethodnika
Premium iskustvo vožnje',
  cons = 'Kompleksan SCR sustav za smanjenje emisija
Relativno visoka cijena servisa
Manje sportski osjećaj od BMW-a
Potreba za redovitom vožnjom duže relacije'
WHERE id = '69231d5c-5bf2-4bfc-a4c7-4907245c7b10';

-- ==================== AUDI A4 ====================

-- Audi A4 B9 35 TFSI (150 KS)
UPDATE car_variants SET
  weight = '1395 kg',
  length = '4726 mm',
  width = '1842 mm',
  height = '1427 mm',
  wheelbase = '2820 mm',
  trunk_capacity = '480 L',
  fuel_tank_capacity = '54 L',
  detailed_description = 'Audijeva poslovna limuzina u pristupačnoj benzinskoj varijanti. Motor 1.4 TFSI (kasnije 35 TFSI oznaka) pruža dovoljno snage za sve svakodnevne potrebe uz razumnu potrošnju. Virtualni kokpit i MMI navigacija s touch zaslonom donose Audi u digitalnu eru. Kvaliteta izrade i materijala je referentna za segment.',
  pros = 'Najbolja kvaliteta izrade u klasi
Virtual Cockpit digitalni instrumenti
Prostraan prtljažnik (480L)
Tiha i udobna vožnja
Odlična aerodinamika (Cd 0.23)',
  cons = 'Ovjes može biti tvrd na lošijim cestama
Upravljanje manje izravno od BMW-a
1.4 motor može se činiti nedovoljno za veću masu
Opcije brzo podižu cijenu'
WHERE id = '415b309d-7c9a-4f9f-b304-acae92854c58';

-- Audi A4 B9 40 TDI quattro (190 KS)
UPDATE car_variants SET
  weight = '1595 kg',
  length = '4726 mm',
  width = '1842 mm',
  height = '1427 mm',
  wheelbase = '2820 mm',
  trunk_capacity = '480 L',
  fuel_tank_capacity = '54 L',
  detailed_description = 'Najpopularnija verzija A4 kombinira snažni 2.0 TDI motor s legendarnim quattro pogonom. Motor s 190 KS i 400 Nm momenta pruža impresivne performanse, dok quattro sustav s ultra tehnologijom osigurava trakciju u svim uvjetima. Idealan za poslovne ljude koji prelaze velike kilometre i trebaju pouzdanost bez kompromisa.',
  pros = 'Quattro AWD s ultra tehnologijom (odspaja prednju osovinu za uštedu)
Iznimno snažan 400 Nm okretni moment
Pouzdani EA288 motor
Izvrsna stabilnost pri velikim brzinama
Niska potrošnja za AWD automobil',
  cons = 'Veća masa od prednjepogonskih verzija
Kompleksnija tehnika quattro sustava
Viša cijena od S-line FWD verzija
Servisni intervali quattro sustava'
WHERE id = '8117d52f-a7f4-4fc1-a0b0-90992a06ec77';

-- ==================== ŠKODA OCTAVIA ====================

-- Škoda Octavia III 1.6 TDI (110 KS)
UPDATE car_variants SET
  weight = '1280 kg',
  length = '4659 mm',
  width = '1814 mm',
  height = '1461 mm',
  wheelbase = '2686 mm',
  trunk_capacity = '590 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Kralj vrijednosti u srednjoj klasi. Octavia III s 1.6 TDI motorom nudi nevjerojatan omjer prostora, opreme i ekonomičnosti za svoju cijenu. Ogroman prtljažnik od 590 litara nadmašuje mnoge automobile iz više klase. Dijeli platformu s Golfom VII, ali nudi značajno više prostora za manje novca.',
  pros = 'Najbolji omjer cijene i vrijednosti u segmentu
Golem prtljažnik od 590L (1580L preklopljeno)
Provjerena VW tehnologija po nižoj cijeni
Nizak trošak vlasništva
Prostrana i udobna unutrašnjost',
  cons = 'Unutrašnjost manje premium od konkurencije
Motor može djelovati sporo s punim opterećenjem
Infotainment zaostaje za VW Golfom
Resale value niža od njemačkih premijum marki'
WHERE id = '08e73b78-197f-46e3-98f3-59ed7fceed86';

-- Škoda Octavia III 1.4 TSI (150 KS)
UPDATE car_variants SET
  weight = '1240 kg',
  length = '4659 mm',
  width = '1814 mm',
  height = '1461 mm',
  wheelbase = '2686 mm',
  trunk_capacity = '590 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Benzinska varijanta koja nudi živahne performanse uz prihvatljivu potrošnju. Motor 1.4 TSI s ACT tehnologijom deaktivira dva cilindra pri niskom opterećenju. Kombinacija s DSG mjenjačem pruža iznimno ugodan i brz prijenos snage. Idealna za one koji preferiraju benzinske motore, a trebaju prostornost Octavie.',
  pros = 'Živahan 1.4 TSI motor s odličnim odzivom
ACT tehnologija za nižu potrošnju
DSG mjenjač iznimno gladak
Niži troškovi održavanja od dizela
Tiši rad od TDI verzija',
  cons = 'Veća potrošnja od dizela pri većim kilometražama
DSG mjenjač zahtijeva redovitu zamjenu ulja
Manji moment od dizelskih verzija
Lanac razvoda treba kontrolirati'
WHERE id = '1a056902-0dbc-4f09-8c14-8416db81cdaa';

-- Škoda Octavia IV 1.5 TSI (150 KS)
UPDATE car_variants SET
  weight = '1350 kg',
  length = '4689 mm',
  width = '1829 mm',
  height = '1468 mm',
  wheelbase = '2686 mm',
  trunk_capacity = '600 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Nova generacija Octavie donosi još više prostora i tehnologije. Motor 1.5 TSI s 150 KS koristi Miller ciklus za poboljšanu učinkovitost. Potpuno novi interijer s dva zaslona i ambijentalno osvjetljenje podižu kvalitetu na novu razinu. Octavia IV nastavlja tradiciju nevjerojatne praktičnosti po pristupačnoj cijeni.',
  pros = 'Još prostranija od prethodnika (600L prtljažnik)
Moderni 1.5 TSI motor s niskom potrošnjom
Digitalni interijer s dva zaslona
Napredni sustavi pomoći vozaču
Simply Clever rješenja (kišobran u vratima, strugač za led...)',
  cons = 'Složenija elektronika može značiti više problema
Plastika u unutrašnjosti još uvijek ispod premium razine
Kapacitivne tipke kao u Golfu
Viša cijena od prethodnika'
WHERE id = '9c334f4f-0252-4d46-a6a8-ababb78e1ec8';

-- Škoda Octavia IV 2.0 TDI (150 KS)
UPDATE car_variants SET
  weight = '1410 kg',
  length = '4689 mm',
  width = '1829 mm',
  height = '1468 mm',
  wheelbase = '2686 mm',
  trunk_capacity = '600 L',
  fuel_tank_capacity = '50 L',
  detailed_description = 'Najpraktičniji automobil na tržištu s nevjerojatnim omjerom prostora i ekonomičnosti. Motor 2.0 TDI EVO s twin-dosing tehnologijom je jedan od najčišćih dizelaša ikad proizveden. 360 Nm momenta osigurava da Octavia nikad ne ostaje bez snage, čak ni potpuno natovarena. Idealan izbor za obitelji i sve koji trebaju maksimalnu praktičnost.',
  pros = 'Najveći prtljažnik u klasi (600L/1555L)
Čisti dizel s twin-dosing sustavom
Impresivan moment od 360 Nm
Niska potrošnja od samo 4.3L/100km
Odličan za vuču prikolice',
  cons = 'Dizeli gube na popularnosti
Kompleksan SCR sustav
Cijena blizu Passatu
Ovjes može biti tvrd s manjim kotačima'
WHERE id = '736b4835-9f85-4af9-a9fe-1073e5df5784';

-- ==================== TOYOTA COROLLA ====================

-- Toyota Corolla E210 1.8 Hybrid (122 KS)
UPDATE car_variants SET
  weight = '1370 kg',
  length = '4630 mm',
  width = '1780 mm',
  height = '1435 mm',
  wheelbase = '2700 mm',
  trunk_capacity = '361 L',
  fuel_tank_capacity = '43 L',
  detailed_description = 'Najpouzdaniji hibrid na tržištu. Toyota Corolla s 1.8 hibridnim pogonom kombinira benzinski motor s električnim za izuzetnu učinkovitost. U gradu može voziti čisto električno do 50% vremena. Toyotin hibridni sustav četvrte generacije je dokazan kroz milijune kilometara diljem svijeta. Idealan za gradsku vožnju i vozače koji žele mirnu savjest.',
  pros = 'Legendarna Toyota pouzdanost
Izuzetno niska potrošnja u gradu (pod 5L/100km)
Tih rad u električnom načinu
Nisko održavanje (bez remena, bez kvačila)
Odlična vrijednost pri preprodaji',
  cons = 'CVT mjenjač može djelovati monotono
Manji prtljažnik zbog baterije (361L)
Slabije performanse na autocesti
Motor glasniji pri punom opterećenju'
WHERE id = '3e79d436-a8c8-4c48-8478-f51efe6cda10';

-- Toyota Corolla E210 2.0 Hybrid (184 KS)
UPDATE car_variants SET
  weight = '1400 kg',
  length = '4630 mm',
  width = '1780 mm',
  height = '1435 mm',
  wheelbase = '2700 mm',
  trunk_capacity = '361 L',
  fuel_tank_capacity = '43 L',
  detailed_description = 'Snažnija verzija Corolle za one koji žele više dinamike. Motor 2.0 s hibridnim pogonom pruža 184 KS što Corollu čini iznenađujuće brzom. Ubrzanje do 100 km/h za 7.9 sekundi nadmašuje mnoge konkurente. Zadržava sve prednosti manjeg hibrida uz dodatak sportskijeg karaktera i boljeg ponašanja na otvorenoj cesti.',
  pros = 'Sportskije performanse od 1.8 hibrida
Još uvijek izvrsna pouzdanost
Bolje ponašanje na autocesti
Ista ekonomičnost u gradskoj vožnji
Ugodniji zvuk motora',
  cons = 'Viša cijena od 1.8 verzije
Jednaka potrošnja na autocesti
Isti manji prtljažnik
CVT još uvijek prisutan'
WHERE id = 'ed120b95-198f-4c92-969f-dcaea167640d';

-- ==================== RENAULT CLIO ====================

-- Renault Clio IV 1.5 dCi (90 KS)
UPDATE car_variants SET
  weight = '1135 kg',
  length = '4062 mm',
  width = '1732 mm',
  height = '1448 mm',
  wheelbase = '2589 mm',
  trunk_capacity = '300 L',
  fuel_tank_capacity = '45 L',
  detailed_description = 'Mali francuski šarmer s iznimno štedljivim dizelskim motorom. Clio IV s 1.5 dCi motorom može postići potrošnju ispod 4L/100km na otvorenoj cesti. K9K motor je legenda u Renault-Nissan alijansi, proizveden u milijunima primjeraka. Moderan dizajn, kvalitetan interijer i pristupačna cijena čine ga popularnim izborom u B segmentu.',
  pros = 'Izuzetno niska potrošnja (3.5-4.5L/100km)
Pouzdan K9K motor s dugom tradicijom
Atraktivan dizajn
Ugodan interijer s kvalitetnim materijalima
Pristupačna cijena',
  cons = 'Smanjena popularnost dizela u malim autima
Manji prtljažnik od konkurencije
Motor može biti bučan
Automatski mjenjač EDC ima poznate probleme'
WHERE id = 'fa288173-84ab-4cf2-9532-1b0bd55323cf';

-- Renault Clio V 1.0 TCe (100 KS)
UPDATE car_variants SET
  weight = '1095 kg',
  length = '4050 mm',
  width = '1798 mm',
  height = '1440 mm',
  wheelbase = '2583 mm',
  trunk_capacity = '391 L',
  fuel_tank_capacity = '42 L',
  detailed_description = 'Potpuno nova generacija Clia s revolucionarnim interijerom. Vertikalni zaslon od 9.3" donosi premium osjećaj u B segment. Motor 1.0 TCe s 100 KS je savršeno dimenzioniran za ovaj automobil - živahan u gradu, a dovoljno snažan za autocestu. Nova CMF-B platforma donosi značajno poboljšanu kvalitetu i sigurnost.',
  pros = 'Revolucionaran interijer s velikim zaslonom
Povećan prtljažnik (391L)
Živahan trocilindarski turbo motor
Kompaktne dimenzije idealne za grad
Pristupačna cijena s bogatom opremom',
  cons = 'Trocilindarski motor ima karakteristične vibracije
Manji od konkurenata kao Polo ili Fabia
Infotainment može biti spor
Plastika na nekim mjestima djeluje jeftino'
WHERE id = 'c92a7d9e-b314-48af-8a45-0c5d0eda01ec';

-- ==================== HYUNDAI TUCSON ====================

-- Hyundai Tucson TL 1.6 CRDi (136 KS)
UPDATE car_variants SET
  weight = '1540 kg',
  length = '4475 mm',
  width = '1850 mm',
  height = '1660 mm',
  wheelbase = '2670 mm',
  trunk_capacity = '513 L',
  fuel_tank_capacity = '62 L',
  detailed_description = 'Korejski SUV koji je osvojio Europu. Tucson TL kombinira atraktivan dizajn s izvrsnom opremom po konkurentnoj cijeni. Motor 1.6 CRDi s 136 KS pruža dovoljno snage za svakodnevnu vožnju. 7-godišnja garancija bez ograničenja kilometara daje dodatnu sigurnost. Prostran interijer i bogata oprema čine ga izvrsnom vrijednosti.',
  pros = '7 godina garancije bez ograničenja kilometara
Izvrsna oprema za cijenu
Prostran interijer i prtljažnik (513L)
Dobar komfor vožnje
Atraktivan dizajn',
  cons = 'Upravljanje manje precizno od europskih konkurenata
Dizelski motor može biti bučan
Infotainment sustav zaostaje za konkurencijom
Resale value niža od premium marki'
WHERE id = 'c484f264-9f4a-48d5-be36-143572316b5f';

-- Hyundai Tucson NX4 1.6 T-GDi Hybrid (230 KS)
UPDATE car_variants SET
  weight = '1700 kg',
  length = '4500 mm',
  width = '1865 mm',
  height = '1650 mm',
  wheelbase = '2680 mm',
  trunk_capacity = '558 L',
  fuel_tank_capacity = '54 L',
  detailed_description = 'Revolucionarni Tucson koji je šokirao industriju svojim dizajnom. Parametrijski dizajn s integriranim LED svjetlima čini ga jednim od najprepoznatljivijih SUV-ova na cesti. Hibridni pogon s 230 KS kombinira 1.6 turbo benzinac s elektromotorom za impresivne performanse i nisku potrošnju. Potpuno digitalni interijer i najnoviji sustavi sigurnosti.',
  pros = 'Revolucionaran dizajn koji privlači poglede
Snažan hibridni pogon s 230 KS
Napredna tehnologija i sigurnosni sustavi
Prostran interijer i prtljažnik (558L)
Izvrsna oprema u svim verzijama',
  cons = 'Polariziran dizajn - ne sviđa se svima
Viša cijena od prethodnika
Kompleksniji hibridni sustav
Kapacitivne tipke za klimu'
WHERE id = '4d478082-6fd9-4dc8-9412-c89dab8c488f';
