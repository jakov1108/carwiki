import { db } from "./db";
import { carModels, carGenerations, carVariants } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  // Volkswagen Golf
  const [golf] = await db.insert(carModels).values({
    brand: "Volkswagen",
    model: "Golf",
    category: "Hatchback",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/2019_Volkswagen_Golf_R-Line_TSi_EVO_1.5_Front.jpg/1280px-2019_Volkswagen_Golf_R-Line_TSi_EVO_1.5_Front.jpg",
    description: "Volkswagen Golf je kompaktni automobil koji proizvodi Volkswagen od 1974. godine. Jedan je od najprodavanijih automobila u povijesti.",
  }).returning();
  console.log("✅ Added Volkswagen Golf");

  // Golf Generations
  const [golfMk4] = await db.insert(carGenerations).values({
    modelId: golf.id,
    name: "Golf IV (Mk4)",
    yearStart: 1997,
    yearEnd: 2003,
    description: "Četvrta generacija Golfa, poznata po kvaliteti izrade i uvođenju novih sigurnosnih standarda.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/VW_Golf_IV_front_20080715.jpg/1280px-VW_Golf_IV_front_20080715.jpg",
  }).returning();

  const [golfMk5] = await db.insert(carGenerations).values({
    modelId: golf.id,
    name: "Golf V (Mk5)",
    yearStart: 2003,
    yearEnd: 2008,
    description: "Peta generacija s novom platformom, boljom sigurnošću i uvođenjem DSG mjenjača.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/VW_Golf_V_front_20081127.jpg/1280px-VW_Golf_V_front_20081127.jpg",
  }).returning();

  const [golfMk7] = await db.insert(carGenerations).values({
    modelId: golf.id,
    name: "Golf VII (Mk7)",
    yearStart: 2012,
    yearEnd: 2019,
    description: "Sedma generacija na MQB platformi, lakša i efikasnija od prethodnika. Proglašena Europskim automobilom godine 2013.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/2017_Volkswagen_Golf_SE_Navigation_TDi_1.6_Front.jpg/1280px-2017_Volkswagen_Golf_SE_Navigation_TDi_1.6_Front.jpg",
  }).returning();

  const [golfMk8] = await db.insert(carGenerations).values({
    modelId: golf.id,
    name: "Golf VIII (Mk8)",
    yearStart: 2019,
    yearEnd: null,
    description: "Osma i trenutna generacija s digitalnom kontrolnom pločom i naprednim sustavima pomoći.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Volkswagen_Golf_Style_%28VIII%29_%E2%80%93_f_30082020.jpg/1280px-Volkswagen_Golf_Style_%28VIII%29_%E2%80%93_f_30082020.jpg",
  }).returning();

  console.log("✅ Added Golf generations (Mk4, Mk5, Mk7, Mk8)");

  // Golf Mk7 Variants
  await db.insert(carVariants).values([
    {
      generationId: golfMk7.id,
      engineName: "1.6 TDI",
      fuelType: "Diesel",
      displacement: "1598 ccm",
      power: "110 KS",
      torque: "250 Nm",
      transmission: "5-brzinski ručni",
      driveType: "FWD",
      acceleration: "10.5s",
      topSpeed: "192 km/h",
      consumption: "4.2 L/100km",
      reliability: 4,
    },
    {
      generationId: golfMk7.id,
      engineName: "2.0 TDI",
      fuelType: "Diesel",
      displacement: "1968 ccm",
      power: "150 KS",
      torque: "320 Nm",
      transmission: "6-DSG",
      driveType: "FWD",
      acceleration: "8.6s",
      topSpeed: "216 km/h",
      consumption: "4.4 L/100km",
      reliability: 4,
    },
    {
      generationId: golfMk7.id,
      engineName: "1.4 TSI",
      fuelType: "Benzin",
      displacement: "1395 ccm",
      power: "125 KS",
      torque: "200 Nm",
      transmission: "6-brzinski ručni",
      driveType: "FWD",
      acceleration: "9.1s",
      topSpeed: "203 km/h",
      consumption: "5.3 L/100km",
      reliability: 4,
    },
    {
      generationId: golfMk7.id,
      engineName: "2.0 TSI GTI",
      fuelType: "Benzin",
      displacement: "1984 ccm",
      power: "230 KS",
      torque: "350 Nm",
      transmission: "6-DSG",
      driveType: "FWD",
      acceleration: "6.4s",
      topSpeed: "250 km/h",
      consumption: "6.4 L/100km",
      reliability: 4,
    },
    {
      generationId: golfMk7.id,
      engineName: "2.0 TSI R",
      fuelType: "Benzin",
      displacement: "1984 ccm",
      power: "310 KS",
      torque: "400 Nm",
      transmission: "7-DSG",
      driveType: "AWD",
      acceleration: "4.6s",
      topSpeed: "250 km/h",
      consumption: "7.1 L/100km",
      reliability: 3,
    },
  ]);
  console.log("✅ Added Golf Mk7 variants (1.6 TDI, 2.0 TDI, 1.4 TSI, GTI, R)");

  // Golf Mk8 Variants
  await db.insert(carVariants).values([
    {
      generationId: golfMk8.id,
      engineName: "1.5 TSI",
      fuelType: "Benzin",
      displacement: "1498 ccm",
      power: "130 KS",
      torque: "200 Nm",
      transmission: "6-brzinski ručni",
      driveType: "FWD",
      acceleration: "9.2s",
      topSpeed: "210 km/h",
      consumption: "5.6 L/100km",
      reliability: 4,
    },
    {
      generationId: golfMk8.id,
      engineName: "2.0 TDI",
      fuelType: "Diesel",
      displacement: "1968 ccm",
      power: "150 KS",
      torque: "360 Nm",
      transmission: "7-DSG",
      driveType: "FWD",
      acceleration: "8.8s",
      topSpeed: "224 km/h",
      consumption: "4.3 L/100km",
      reliability: 4,
    },
    {
      generationId: golfMk8.id,
      engineName: "2.0 TSI GTI",
      fuelType: "Benzin",
      displacement: "1984 ccm",
      power: "245 KS",
      torque: "370 Nm",
      transmission: "7-DSG",
      driveType: "FWD",
      acceleration: "6.3s",
      topSpeed: "250 km/h",
      consumption: "6.7 L/100km",
      reliability: 4,
    },
  ]);
  console.log("✅ Added Golf Mk8 variants");

  // BMW 3 Series
  const [bmw3] = await db.insert(carModels).values({
    brand: "BMW",
    model: "3 Series",
    category: "Sedan",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2019_BMW_330i_M_Sport_automatic_2.0_Front.jpg/1280px-2019_BMW_330i_M_Sport_automatic_2.0_Front.jpg",
    description: "BMW serija 3 je kompaktna izvršna limuzina koju proizvodi BMW od 1975. godine. Poznata je po izvrsnim voznim karakteristikama.",
  }).returning();
  console.log("✅ Added BMW 3 Series");

  const [e90] = await db.insert(carGenerations).values({
    modelId: bmw3.id,
    name: "E90/E91/E92/E93",
    yearStart: 2005,
    yearEnd: 2013,
    description: "Peta generacija 3 serije s odličnim voznim karakteristikama i raznim karosernim verzijama.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/BMW_E90_front_20090301.jpg/1280px-BMW_E90_front_20090301.jpg",
  }).returning();

  const [g20] = await db.insert(carGenerations).values({
    modelId: bmw3.id,
    name: "G20/G21",
    yearStart: 2019,
    yearEnd: null,
    description: "Sedma generacija s naprednom tehnologijom i učinkovitijim motorima.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/2019_BMW_330i_M_Sport_automatic_2.0_Front.jpg/1280px-2019_BMW_330i_M_Sport_automatic_2.0_Front.jpg",
  }).returning();

  console.log("✅ Added BMW 3 Series generations (E90, G20)");

  await db.insert(carVariants).values([
    {
      generationId: e90.id,
      engineName: "320d",
      fuelType: "Diesel",
      displacement: "1995 ccm",
      power: "177 KS",
      torque: "350 Nm",
      transmission: "6-brzinski ručni",
      driveType: "RWD",
      acceleration: "7.5s",
      topSpeed: "230 km/h",
      consumption: "5.1 L/100km",
      reliability: 4,
    },
    {
      generationId: e90.id,
      engineName: "335i",
      fuelType: "Benzin",
      displacement: "2979 ccm",
      power: "306 KS",
      torque: "400 Nm",
      transmission: "6-automatik",
      driveType: "RWD",
      acceleration: "5.4s",
      topSpeed: "250 km/h",
      consumption: "9.1 L/100km",
      reliability: 3,
    },
  ]);

  await db.insert(carVariants).values([
    {
      generationId: g20.id,
      engineName: "320d xDrive",
      fuelType: "Diesel",
      displacement: "1995 ccm",
      power: "190 KS",
      torque: "400 Nm",
      transmission: "8-automatik",
      driveType: "AWD",
      acceleration: "6.8s",
      topSpeed: "235 km/h",
      consumption: "5.0 L/100km",
      reliability: 4,
    },
    {
      generationId: g20.id,
      engineName: "M340i xDrive",
      fuelType: "Benzin",
      displacement: "2998 ccm",
      power: "374 KS",
      torque: "500 Nm",
      transmission: "8-automatik",
      driveType: "AWD",
      acceleration: "4.4s",
      topSpeed: "250 km/h",
      consumption: "7.5 L/100km",
      reliability: 4,
    },
  ]);
  console.log("✅ Added BMW 3 Series variants");

  // Mercedes C-Class
  const [mercedesC] = await db.insert(carModels).values({
    brand: "Mercedes-Benz",
    model: "C-Class",
    category: "Sedan",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Mercedes-Benz_W205_C_220_d_AMG_Line_%282019%29_IMG_1667.jpg/1280px-Mercedes-Benz_W205_C_220_d_AMG_Line_%282019%29_IMG_1667.jpg",
    description: "Mercedes-Benz C-klasa je serija kompaktnih luksuznih vozila. Poznata je po vrhunskoj kvaliteti i udobnosti.",
  }).returning();

  const [w205] = await db.insert(carGenerations).values({
    modelId: mercedesC.id,
    name: "W205",
    yearStart: 2014,
    yearEnd: 2021,
    description: "Četvrta generacija C-klase s luksuznom unutrašnjošću i naprednim sigurnosnim sustavima.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Mercedes-Benz_W205_C_220_d_AMG_Line_%282019%29_IMG_1667.jpg/1280px-Mercedes-Benz_W205_C_220_d_AMG_Line_%282019%29_IMG_1667.jpg",
  }).returning();

  await db.insert(carVariants).values([
    {
      generationId: w205.id,
      engineName: "C 200",
      fuelType: "Benzin",
      displacement: "1991 ccm",
      power: "184 KS",
      torque: "300 Nm",
      transmission: "9G-TRONIC automatik",
      driveType: "RWD",
      acceleration: "7.5s",
      topSpeed: "239 km/h",
      consumption: "6.3 L/100km",
      reliability: 4,
    },
    {
      generationId: w205.id,
      engineName: "C 220 d",
      fuelType: "Diesel",
      displacement: "1950 ccm",
      power: "194 KS",
      torque: "400 Nm",
      transmission: "9G-TRONIC automatik",
      driveType: "RWD",
      acceleration: "6.9s",
      topSpeed: "243 km/h",
      consumption: "4.6 L/100km",
      reliability: 4,
    },
  ]);
  console.log("✅ Added Mercedes C-Class (W205) with variants");

  // Audi A4
  const [audiA4] = await db.insert(carModels).values({
    brand: "Audi",
    model: "A4",
    category: "Sedan",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Audi_A4_45_TFSI_quattro_S_line_%28B9%2C_Facelift%29_%E2%80%93_f_30012021.jpg/1280px-Audi_A4_45_TFSI_quattro_S_line_%28B9%2C_Facelift%29_%E2%80%93_f_30012021.jpg",
    description: "Audi A4 je serija kompaktnih izvršnih automobila koje proizvodi Audi od 1994. godine.",
  }).returning();

  const [b9] = await db.insert(carGenerations).values({
    modelId: audiA4.id,
    name: "B9",
    yearStart: 2015,
    yearEnd: null,
    description: "Peta generacija A4 s MLB Evo platformom, virtualni kokpit i naprednom tehnologijom.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Audi_A4_45_TFSI_quattro_S_line_%28B9%2C_Facelift%29_%E2%80%93_f_30012021.jpg/1280px-Audi_A4_45_TFSI_quattro_S_line_%28B9%2C_Facelift%29_%E2%80%93_f_30012021.jpg",
  }).returning();

  await db.insert(carVariants).values([
    {
      generationId: b9.id,
      engineName: "35 TFSI",
      fuelType: "Benzin",
      displacement: "1984 ccm",
      power: "150 KS",
      torque: "270 Nm",
      transmission: "S tronic 7-stupanjski",
      driveType: "FWD",
      acceleration: "8.9s",
      topSpeed: "210 km/h",
      consumption: "5.8 L/100km",
      reliability: 4,
    },
    {
      generationId: b9.id,
      engineName: "40 TDI quattro",
      fuelType: "Diesel",
      displacement: "1968 ccm",
      power: "190 KS",
      torque: "400 Nm",
      transmission: "S tronic 7-stupanjski",
      driveType: "AWD",
      acceleration: "7.1s",
      topSpeed: "240 km/h",
      consumption: "5.1 L/100km",
      reliability: 4,
    },
  ]);
  console.log("✅ Added Audi A4 (B9) with variants");

  // Škoda Octavia
  const [octavia] = await db.insert(carModels).values({
    brand: "Škoda",
    model: "Octavia",
    category: "Liftback",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/%C5%A0koda_Octavia_Combi_1.5_TSI_Style_%28IV%29_%E2%80%93_f_27072023.jpg/1280px-%C5%A0koda_Octavia_Combi_1.5_TSI_Style_%28IV%29_%E2%80%93_f_27072023.jpg",
    description: "Škoda Octavia je popularna obiteljska limuzina/karavan poznata po prostranosti i praktičnosti.",
  }).returning();

  const [octaviaMk3] = await db.insert(carGenerations).values({
    modelId: octavia.id,
    name: "Octavia III (Mk3)",
    yearStart: 2012,
    yearEnd: 2020,
    description: "Treća generacija s modernim tehnologijama i širokom paletom motora.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Skoda_Octavia_III_facelift_front_20170304.jpg/1280px-Skoda_Octavia_III_facelift_front_20170304.jpg",
  }).returning();

  const [octaviaMk4] = await db.insert(carGenerations).values({
    modelId: octavia.id,
    name: "Octavia IV (Mk4)",
    yearStart: 2020,
    yearEnd: null,
    description: "Četvrta generacija s naprednim asistencijama i hibridnim pogonima.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/%C5%A0koda_Octavia_Combi_1.5_TSI_Style_%28IV%29_%E2%80%93_f_27072023.jpg/1280px-%C5%A0koda_Octavia_Combi_1.5_TSI_Style_%28IV%29_%E2%80%93_f_27072023.jpg",
  }).returning();

  await db.insert(carVariants).values([
    {
      generationId: octaviaMk3.id,
      engineName: "1.6 TDI",
      fuelType: "Diesel",
      displacement: "1598 ccm",
      power: "110 KS",
      torque: "250 Nm",
      transmission: "5-brzinski ručni",
      driveType: "FWD",
      acceleration: "10.6s",
      topSpeed: "192 km/h",
      consumption: "4.1 L/100km",
      reliability: 4,
    },
    {
      generationId: octaviaMk3.id,
      engineName: "1.4 TSI",
      fuelType: "Benzin",
      displacement: "1395 ccm",
      power: "150 KS",
      torque: "250 Nm",
      transmission: "6-DSG",
      driveType: "FWD",
      acceleration: "8.1s",
      topSpeed: "220 km/h",
      consumption: "5.3 L/100km",
      reliability: 4,
    },
  ]);

  await db.insert(carVariants).values([
    {
      generationId: octaviaMk4.id,
      engineName: "1.5 TSI",
      fuelType: "Benzin",
      displacement: "1498 ccm",
      power: "150 KS",
      torque: "250 Nm",
      transmission: "7-DSG",
      driveType: "FWD",
      acceleration: "8.5s",
      topSpeed: "223 km/h",
      consumption: "5.7 L/100km",
      reliability: 4,
    },
    {
      generationId: octaviaMk4.id,
      engineName: "2.0 TDI",
      fuelType: "Diesel",
      displacement: "1968 ccm",
      power: "150 KS",
      torque: "360 Nm",
      transmission: "7-DSG",
      driveType: "FWD",
      acceleration: "8.7s",
      topSpeed: "228 km/h",
      consumption: "4.4 L/100km",
      reliability: 4,
    },
  ]);
  console.log("✅ Added Škoda Octavia (Mk3, Mk4) with variants");

  // Toyota Corolla
  const [corolla] = await db.insert(carModels).values({
    brand: "Toyota",
    model: "Corolla",
    category: "Hatchback",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2019_Toyota_Corolla_Hybrid_Icon_Tech_1.8_Front.jpg/1280px-2019_Toyota_Corolla_Hybrid_Icon_Tech_1.8_Front.jpg",
    description: "Toyota Corolla je globalno najprodavaniji automobil, poznat po pouzdanosti i ekonomičnosti.",
  }).returning();

  const [corollaE210] = await db.insert(carGenerations).values({
    modelId: corolla.id,
    name: "E210",
    yearStart: 2018,
    yearEnd: null,
    description: "Generacija s TNGA platformom i hibridnim pogonima.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/2019_Toyota_Corolla_Hybrid_Icon_Tech_1.8_Front.jpg/1280px-2019_Toyota_Corolla_Hybrid_Icon_Tech_1.8_Front.jpg",
  }).returning();

  await db.insert(carVariants).values([
    {
      generationId: corollaE210.id,
      engineName: "1.8 Hybrid",
      fuelType: "Hibrid",
      displacement: "1798 ccm",
      power: "122 KS",
      torque: "142 Nm",
      transmission: "e-CVT",
      driveType: "FWD",
      acceleration: "10.9s",
      topSpeed: "180 km/h",
      consumption: "3.9 L/100km",
      reliability: 5,
    },
    {
      generationId: corollaE210.id,
      engineName: "2.0 Hybrid",
      fuelType: "Hibrid",
      displacement: "1987 ccm",
      power: "184 KS",
      torque: "190 Nm",
      transmission: "e-CVT",
      driveType: "FWD",
      acceleration: "7.9s",
      topSpeed: "180 km/h",
      consumption: "4.0 L/100km",
      reliability: 5,
    },
  ]);
  console.log("✅ Added Toyota Corolla (E210) with hybrid variants");

  // Renault Clio
  const [clio] = await db.insert(carModels).values({
    brand: "Renault",
    model: "Clio",
    category: "Hatchback",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Renault_Clio_V_2020.jpg/1280px-Renault_Clio_V_2020.jpg",
    description: "Renault Clio je mali gradski automobil s bogatom poviješću na europskom tržištu.",
  }).returning();

  const [clioIV] = await db.insert(carGenerations).values({
    modelId: clio.id,
    name: "Clio IV",
    yearStart: 2012,
    yearEnd: 2019,
    description: "Četvrta generacija s atraktivnim dizajnom i štedljivim motorima.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Renault_Clio_IV_facelift_2018.jpg/1280px-Renault_Clio_IV_facelift_2018.jpg",
  }).returning();

  const [clioV] = await db.insert(carGenerations).values({
    modelId: clio.id,
    name: "Clio V",
    yearStart: 2019,
    yearEnd: null,
    description: "Peta generacija s naprednim infotainmentom i sigurnosnim sustavima.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Renault_Clio_V_2020.jpg/1280px-Renault_Clio_V_2020.jpg",
  }).returning();

  await db.insert(carVariants).values([
    {
      generationId: clioIV.id,
      engineName: "1.5 dCi",
      fuelType: "Diesel",
      displacement: "1461 ccm",
      power: "90 KS",
      torque: "220 Nm",
      transmission: "5-brzinski ručni",
      driveType: "FWD",
      acceleration: "11.9s",
      topSpeed: "175 km/h",
      consumption: "3.6 L/100km",
      reliability: 4,
    },
    {
      generationId: clioV.id,
      engineName: "1.0 TCe",
      fuelType: "Benzin",
      displacement: "999 ccm",
      power: "100 KS",
      torque: "160 Nm",
      transmission: "5-brzinski ručni",
      driveType: "FWD",
      acceleration: "11.8s",
      topSpeed: "187 km/h",
      consumption: "5.2 L/100km",
      reliability: 4,
    },
  ]);
  console.log("✅ Added Renault Clio (IV, V) with variants");

  // Hyundai Tucson
  const [tucson] = await db.insert(carModels).values({
    brand: "Hyundai",
    model: "Tucson",
    category: "SUV",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/2021_Hyundai_Tucson_%28NX4%29_front.jpg/1280px-2021_Hyundai_Tucson_%28NX4%29_front.jpg",
    description: "Hyundai Tucson je popularan kompaktni SUV s bogatom opremom i atraktivnim dizajnom.",
  }).returning();

  const [tucsonTL] = await db.insert(carGenerations).values({
    modelId: tucson.id,
    name: "Tucson TL",
    yearStart: 2015,
    yearEnd: 2020,
    description: "Druga generacija Tucson-a, široko prisutna na europskom tržištu.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/2016_Hyundai_Tucson_%28TL%29_front.jpg/1280px-2016_Hyundai_Tucson_%28TL%29_front.jpg",
  }).returning();

  const [tucsonNX4] = await db.insert(carGenerations).values({
    modelId: tucson.id,
    name: "Tucson NX4",
    yearStart: 2020,
    yearEnd: null,
    description: "Treća generacija s hibridnim pogonom i naprednim asistencijama.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/2021_Hyundai_Tucson_%28NX4%29_front.jpg/1280px-2021_Hyundai_Tucson_%28NX4%29_front.jpg",
  }).returning();

  await db.insert(carVariants).values([
    {
      generationId: tucsonTL.id,
      engineName: "1.6 CRDi",
      fuelType: "Diesel",
      displacement: "1598 ccm",
      power: "136 KS",
      torque: "320 Nm",
      transmission: "7-DCT",
      driveType: "FWD",
      acceleration: "11.2s",
      topSpeed: "180 km/h",
      consumption: "4.7 L/100km",
      reliability: 4,
    },
    {
      generationId: tucsonNX4.id,
      engineName: "1.6 T-GDi Hybrid",
      fuelType: "Hibrid",
      displacement: "1598 ccm",
      power: "230 KS",
      torque: "350 Nm",
      transmission: "6-automatik",
      driveType: "AWD",
      acceleration: "8.0s",
      topSpeed: "193 km/h",
      consumption: "5.6 L/100km",
      reliability: 4,
    },
  ]);
  console.log("✅ Added Hyundai Tucson (TL, NX4) with variants");

  console.log("\n🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
