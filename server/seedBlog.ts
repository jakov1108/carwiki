import "dotenv/config";
import { db } from "./db";
import { blogPosts } from "@shared/schema";

const articles = [
  {
    title: "Zašto je Volkswagen Golf najprodavaniji europski automobil?",
    content: `# Legenda kompaktne klase

Volkswagen Golf je sinonim za kompaktni automobil u Europi. Od svog predstavljanja 1974. godine, Golf je prodao preko 35 milijuna primjeraka diljem svijeta, čineći ga jednim od najprodavanijih automobila u povijesti.

## Početak legende

Kada je prvi Golf predstavljen, zadatak mu je bio zamijeniti legendarnu "Bubu" (Beetle). Giorgetto Giugiaro dizajnirao je automobil koji je bio revolucionaran - praktičan hatchback s pogonom na prednje kotače koji je postavio standarde za cijelu industriju.

## Što čini Golf posebnim?

### Kvaliteta izrade
Golf je oduvijek bio poznat po solidnoj konstrukciji i kvalitetnim materijalima. Vrata koja se zatvaraju s "teškim" zvukom, precizni spojevi i dugotrajna izdržljivost samo su neke od karakteristika koje kupci cijene.

### Vozne karakteristike
Njemački inženjeri su kroz generacije usavršavali vozne osobine. Golf nudi savršenu ravnotežu između udobnosti i sportskog karaktera, s preciznim upravljačem i izvrsnim ovjesom.

### Široka paleta motora
Od štedljivih dizela do snažnih GTI i R verzija, Golf pokriva sve potrebe kupaca. TDI motori su postali legendarni po pouzdanosti i ekonomičnosti.

## Golf kroz generacije

- **Mk1 (1974-1983)** - Začetnik legende
- **Mk2 (1983-1992)** - Veći i praktičniji
- **Mk3 (1992-1997)** - Uvođenje VR6 motora
- **Mk4 (1997-2003)** - Kvantni skok u kvaliteti
- **Mk5 (2003-2008)** - Nova platforma, DSG mjenjač
- **Mk6 (2008-2012)** - Evolucija Mk5
- **Mk7 (2012-2019)** - MQB platforma, lakši i efikasniji
- **Mk8 (2019-)** - Digitalizacija i elektrifikacija

## Zaključak

Golf nije samo automobil - on je kulturni fenomen koji predstavlja pouzdanost, kvalitetu i praktičnost. Bez obzira vozite li stari Mk4 ili najnoviji Mk8, Golf uvijek pruža ono što obećava: besprijekornu svakodnevnu upotrebljivost.`,
    author: "Auto Wiki Tim",
    date: "2026-01-01",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2019_Volkswagen_Golf_R-Line_TSi_EVO_1.5_Front.jpg/1280px-2019_Volkswagen_Golf_R-Line_TSi_EVO_1.5_Front.jpg",
    category: "Automobili",
    excerpt: "Istražite povijest i razloge zašto je Volkswagen Golf već pola stoljeća najprodavaniji automobil u Europi.",
  },
  {
    title: "Dizel vs. Benzin: Koji motor odabrati u 2026?",
    content: `# Vječna dilema kupaca automobila

Odabir između dizelaša i benzinca jedna je od prvih odluka pri kupnji automobila. U 2026. godini, ta odluka postala je složenija nego ikad, s obzirom na elektrifikaciju i nove emisijske standarde.

## Prednosti dizelskih motora

### Ekonomičnost
Dizelski motori i dalje nude 15-25% manju potrošnju goriva u odnosu na benzince iste snage. Za vozače koji godišnje prelaze više od 20.000 km, ušteda na gorivu može biti značajna.

### Okretni moment
Dizelski motori proizvode više okretnog momenta pri nižim okretajima, što ih čini idealnim za vuču prikolica i vožnju autocestom.

### Izdržljivost
Dizelski motori tradicionalno imaju dulji životni vijek zbog robusnije konstrukcije.

## Prednosti benzinskih motora

### Niža cijena vozila
Benzinski modeli obično su 1.000-3.000€ jeftiniji od ekvivalentnih dizelaša.

### Manji troškovi održavanja
Benzinci ne trebaju AdBlue, nemaju probleme s DPF filterom i općenito su jednostavniji za održavanje.

### Ugodnija vožnja
Moderniji benzinski motori, posebno turbobenzinci, nude glatkiji rad i bolji zvuk.

### Pristup gradovima
Sve više europskih gradova ograničava pristup starijim dizelskim vozilima.

## Kada odabrati dizel?

- Vozite više od 25.000 km godišnje
- Većinom vozite autocestom
- Trebate vući prikolicu ili kamper
- Planirate zadržati auto 7+ godina

## Kada odabrati benzin?

- Vozite manje od 15.000 km godišnje
- Većinom vozite u gradu
- Želite niže troškove održavanja
- Planirate često mijenjati automobile

## A što s hibridima i električnim vozilima?

Plug-in hibridi nude kompromis - električni pogon za grad i benzinski motor za duže relacije. Potpuno električni automobili idealni su za gradsku vožnju i kratke relacije, ali zahtijevaju promjenu navika.

## Zaključak

Ne postoji univerzalno ispravan odgovor. Analizirajte svoje vozačke navike, izračunajte ukupne troškove vlasništva (TCO) i odaberite motor koji najbolje odgovara vašim potrebama.`,
    author: "Auto Wiki Tim",
    date: "2025-12-28",
    image: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?w=1280",
    category: "Savjeti",
    excerpt: "Detaljna analiza prednosti i nedostataka dizelskih i benzinskih motora koja će vam pomoći pri kupnji.",
  },
  {
    title: "Povijest BMW M odjela: Od utrka do ulice",
    content: `# 50 godina BMW M performansi

BMW M GmbH, poznatija jednostavno kao "M", sinonim je za performanse, preciznost i vozačku strast. Od skromnih početaka u motorsportu do danas, M odjel je stvorio neke od najpoznatijih sportskih automobila.

## Početci u motorsportu (1972)

BMW Motorsport GmbH osnovan je 1972. godine s ciljem razvoja trkačkih automobila. Prvi projekt bio je legendarni BMW 3.0 CSL - "Batmobile" koji je dominirao europskim trkama.

## Prvi M automobil - BMW M1 (1978)

M1 je bio prvi serijski automobil s M oznakom. Ovaj superautomobil sa središnje postavljenim motorom producirao je 277 KS iz 3.5-litrenog rednog šesteroca. Proizvedeno je samo 453 primjerka.

## M5 - Početak legende (1984)

Kada je BMW stavio M88 motor iz M1 u E28 seriju 5, rođena je legenda. Prvi M5 bio je najbrži serijski sedan na svijetu s 286 KS i ubrzanjem 0-100 km/h za 6.5 sekundi.

## Generacije legendarnih M automobila

### M3
- **E30 M3 (1986)** - Homologacijski special, 195 KS četverocilindraš
- **E36 M3 (1992)** - Redni šesterac, 286 KS
- **E46 M3 (2000)** - Savršeni balans, 343 KS
- **E90/E92 M3 (2007)** - V8 motor, 420 KS
- **F80 M3 (2014)** - Povratak turbo šesterca, 431 KS
- **G80 M3 (2020)** - 480/510 KS, kontroverzni dizajn

### M5
- **E28 M5 (1984)** - Početak, 286 KS
- **E34 M5 (1988)** - 315 KS, savršena kombinacija
- **E39 M5 (1998)** - V8, 400 KS, mnogi kažu najbolji M5
- **E60 M5 (2005)** - V10 iz Formule 1, 507 KS
- **F10 M5 (2011)** - Twin-turbo V8, 560 KS
- **G30 M5 (2017)** - 600 KS, prvi M5 s xDrive

## Filozofija M odjela

M automobili nisu samo brži BMW-i. Svaki detalj je promijenjen - ovjes, kočnice, ispuh, aerodinamika. M inženjeri provode tisuće sati na Nürburgringu usavršavajući svaki model.

### Ključne karakteristike M vozila:
- Specifično podešen ovjes
- Veće i snažnije kočnice
- M sportski diferencijal
- M način upravljanja
- Ekskluzivni materijali unutrašnjosti

## Budućnost M odjela

S nadolazećom elektrifikacijom, BMW M priprema električnu budućnost. XM je prvi elektrficirani M model, a najavljeni su i potpuno električni M automobili. Bez obzira na pogon, M filozofija ostaje ista - pružiti ultimativno vozačko iskustvo.

## Zaključak

BMW M nije samo odjel - to je filozofija. Automobili s M oznakom predstavljaju strast inženjera i vozača ujedinjenu u savršeni stroj. Od E30 M3 do najnovijeg M5, tradicija izvrsnosti nastavlja se već 50 godina.`,
    author: "Auto Wiki Tim",
    date: "2025-12-20",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/2019_BMW_M5_Competition_Automatic_4.4_Front.jpg/1280px-2019_BMW_M5_Competition_Automatic_4.4_Front.jpg",
    category: "Povijest",
    excerpt: "Od trkačkih staza do ulica - priča o tome kako je BMW M odjel postao sinonim za performanse.",
  },
  {
    title: "Kako prepoznati dobro održavan rabljeni automobil?",
    content: `# Vodič za kupnju rabljenog automobila

Kupnja rabljenog automobila može biti odlična investicija, ali i skupogreška ako ne znate na što obratiti pozornost. Evo detaljnog vodiča koji će vam pomoći prepoznati dobro održavan automobil.

## Prije pregleda

### Provjerite dokumentaciju
- **Servisna knjižica** - Redoviti servisi su ključni
- **Računi** - Dokaz o obavljenim radovima
- **Broj vlasnika** - Manje vlasnika obično znači bolje održavanje
- **Povijest vozila** - Provjerite HAK ili slične servise

### Provjerite oglase
- Usporedite cijenu s tržištem
- Obratite pozornost na detalje u opisu
- Previše savršen oglas može biti sumnjiv

## Vanjski pregled

### Lim i boja
- **Razlike u nijansi** - Znak prethodnog popravka
- **Valovitost lima** - Loše odrađeno klepanje
- **Rđa** - Provjerite pragove, blatobrane i podvozje
- **Spojevi** - Moraju biti ravnomjerni

### Gume
- **Dubina profila** - Minimum 3mm za siguran voznju
- **Ravnomjerno trošenje** - Neravnomjerno ukazuje na probleme s ovjesom
- **Starost** - DOT oznaka pokazuje godinu proizvodnje

### Stakla
- **Originalna stakla** - Provjerite oznake proizvođača
- **Zamijenjeno vjetrobransko staklo** - Može ukazivati na nesreću

## Unutrašnjost

### Opće stanje
- **Istrošenost sjedala i volana** - Usporedite s kilometražom
- **Mirisi** - Plijesan ili dim teško je ukloniti
- **Funkcionalnost** - Testirajte sve tipke i prekidače

### Znakovi poplave
- Mrlje na tepisima i sjedalima
- Kondenzacija u svjetlima
- Korozija na kontaktima

## Mehanički pregled

### Motor
- **Hladan start** - Dođite nenajavno da motor bude hladan
- **Dim iz ispuha** - Bijeli = voda, plavi = ulje, crni = gorivo
- **Zvukovi** - Neobični zvukovi mogu značiti skupe popravke
- **Razina ulja** - Provjerite boju i razinu

### Mjenjač
- **Ručni** - Testiranje svih brzina, kvačilo
- **Automatski** - Glatke promjene, bez trzanja

### Ovjes i kočnice
- **Testna vožnja** - Obratite pozornost na škripanje, lupanje
- **Ravno kočenje** - Auto ne smije povlačiti u stranu
- **Stanje diskova** - Vizualni pregled

## Testna vožnja

Obvezno obavite testnu vožnju koja uključuje:
- Gradsku vožnju (frekvente promjene brzina)
- Vožnju autocestom (veće brzine)
- Brdo (test snage i kvačila)

## Profesionalni pregled

Za mirnu savjest, odvedite auto na pregled u nezavisnu radionicu:
- Dijagnostika računalom
- Pregled na dizalici
- Mjerenje kompresije
- Provjera geometrije

## Crvene zastavice

Odustanite od kupnje ako primijetite:
- Prodavač izbjegava pitanja
- Dokumentacija nije potpuna
- Kilometraža ne odgovara stanju
- Motor je bio upaljivan prije vašeg dolaska
- Previsok tlak u klimatizaciji (maskiranje problema)

## Zaključak

Strpljenje je ključno. Bolje je propustiti "odličnu priliku" nego kupiti problematičan automobil. Dobro održavan rabljeni auto može pružiti godine pouzdane vožnje uz značajnu uštedu u odnosu na novo vozilo.`,
    author: "Auto Wiki Tim",
    date: "2025-12-15",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1280",
    category: "Savjeti",
    excerpt: "Kompletan vodič za prepoznavanje dobro održavanih rabljenih automobila i izbjegavanje skupih grešaka.",
  },
  {
    title: "Električni automobili: Mitovi i stvarnost",
    content: `# Razbijamo mitove o električnim vozilima

Električni automobili postaju sve popularniji, ali oko njih i dalje kruže brojni mitovi. Analizirajmo najčešće zablude i stvarno stanje stvari.

## Mit 1: "Električni auti nemaju dovoljno dometa"

### Mit
Mnogi vjeruju da električna vozila mogu prijeći samo 100-150 km prije punjenja.

### Stvarnost
Moderna električna vozila nude 400-600 km dometa na jednom punjenju:
- **Tesla Model 3 Long Range** - 602 km
- **Mercedes EQS** - 780 km
- **BMW iX** - 630 km

Za 95% svakodnevnih potreba (prosječni Europljanin vozi 37 km dnevno), čak i osnovni električni automobili su više nego dovoljni.

## Mit 2: "Punjenje traje predugo"

### Mit
"Moram čekati 8 sati da napunim auto."

### Stvarnost
- **Kućno punjenje (7kW)** - Preko noći za punu bateriju
- **Javne punionice (50kW)** - 80% za sat vremena
- **Brze punionice (150-350kW)** - 80% za 20-30 minuta

Većina vlasnika puni auto kod kuće preko noći - kao što punite mobitel.

## Mit 3: "Baterije su štetne za okoliš"

### Mit
Proizvodnja baterija toliko zagađuje da električni auti nisu ekološki.

### Stvarnost
Studije pokazuju da električni automobili imaju 50-70% manje emisije CO2 tijekom životnog vijeka u usporedbi s konvencionalnim vozilima. Recikliranje baterija napreduje - Tesla reciklira 92% materijala iz starih baterija.

## Mit 4: "Električni auti su dosadni za vožnju"

### Mit
Bez zvuka motora, električni auti nemaju karakter.

### Stvarnost
Električni motori nude:
- **Trenutačan okretni moment** - Maksimalna snaga od 0 km/h
- **Impresivna ubrzanja** - Tesla Model S Plaid: 0-100 za 2.1s
- **Nizak centar težišta** - Izvrsno ponašanje u zavojima

Mnogi vozači nakon vožnje električnim autom više ne žele natrag na konvencionalne motore.

## Mit 5: "Nema dovoljno punionica"

### Mit
Infrastruktura punjenja nije spremna za električne automobile.

### Stvarnost
Hrvatska već ima preko 1.000 javnih punionica, a mreža se brzo širi. Uz to:
- Većina punjenja obavlja se kod kuće
- Supermarket parkinge sve češće nude punjenje
- Autoceste imaju brze punionice na većini odmorišta

## Mit 6: "Električni auti su preskupi"

### Mit
Električna vozila su samo za bogate.

### Stvarnost
Da, početna cijena je viša, ali ukupni troškovi vlasništva mogu biti niži:
- **Gorivo** - Struja je 3-4x jeftinija od benzina po kilometru
- **Servis** - Nema ulja, filtera, svjećica, remen...
- **Poticaji** - Mnoge zemlje nude značajne poticaje

Primjer izračuna za 150.000 km:
- Benzinac: 12.000€ gorivo + 5.000€ servis = 17.000€
- Električni: 4.000€ struja + 1.500€ servis = 5.500€

## Stvarna ograničenja električnih vozila

Da budemo pošteni, postoje i realna ograničenja:
- **Duža putovanja** zahtijevaju planiranje
- **Stambene zgrade** često nemaju mogućnost punjenja
- **Cijena** je i dalje viša na početku
- **Vrijednost baterije** opada s vremenom

## Zaključak

Električni automobili nisu za svakoga, ali za većinu vozača koji imaju mogućnost kućnog punjenja i voze pretežno u gradu i na kraćim relacijama, oni su izvrsna opcija. Tehnologija brzo napreduje, a mitovi iz prošlosti postaju sve manje relevantni.`,
    author: "Auto Wiki Tim",
    date: "2025-12-10",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1280",
    category: "Tehnologija",
    excerpt: "Razbijamo najčešće mitove o električnim vozilima i otkrivamo što je zapravo istina o EV revoluciji.",
  },
];

async function seedBlog() {
  console.log("📝 Dodajem blog članke...");

  for (const article of articles) {
    await db.insert(blogPosts).values(article);
    console.log(`✅ Dodan članak: ${article.title}`);
  }

  console.log("\n🎉 Svi članci uspješno dodani!");
}

seedBlog()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Greška:", err);
    process.exit(1);
  });
