export const mustangs = [
  {
    id: "mustang-ecoboost-2026",
    year: 2026,
    name: "Mustang EcoBoost",
    trim: "Fastback",

    images: {
      hero: "/mustang/ecoboost/hero.webp",
      front: "/mustang/ecoboost/front.webp",
      side: "/mustang/ecoboost/side.webp",
      interior: "/mustang/ecoboost/interior.webp"
    },

    sound: {
      idle: "/mustang_engine_sounds/ecoboost/idle.wav",
      acceleration: "/mustang_engine_sounds/ecoboost/acceleration.wav"
    },

    specs: {
      engine: "2.3L EcoBoost Turbocharged I4",
      horsepower: 315,
      torqueLbFt: 350,
      transmission: "10-speed automatic",
      drivetrain: "Rear-wheel drive"
    },

    performance: {
      zeroTo60Mph: 4.5,
      zeroTo100Kph: null,
      zeroTo200Kph: null,
      topSpeedMph: null
    },

    performanceSource: "Independent instrumented test",
    officialSpecsSource: "Ford"
  },

  {
    id: "mustang-gt-2026",
    year: 2026,
    name: "Mustang GT",
    trim: "Fastback",

    images: {
      hero: "/mustang/gt/hero.webp",
      front: "/mustang/gt/front.webp",
      side: "/mustang/gt/side.webp",
      interior: "/mustang/gt/interior.webp"
    },

    sound: {
      idle: "/mustang_engine_sounds/gt/idle.wav",
      acceleration: "/mustang_engine_sounds/gt/acceleration.wav"
    },

    specs: {
      engine: "5.0L Coyote V8",
      horsepower: 480,
      horsepowerWithActiveExhaust: 486,
      torqueLbFt: 415,
      torqueWithActiveExhaustLbFt: 418,
      transmission: "6-speed manual / 10-speed automatic",
      drivetrain: "Rear-wheel drive"
    },

    performance: {
      zeroTo60Mph: 3.7,
      zeroTo100Kph: 5.5,
      zeroTo200Kph: null,
      topSpeedMph: 155
    },

    performanceSource: "Independent test/reference",
    officialSpecsSource: "Ford"
  },

  {
    id: "mustang-dark-horse-2026",
    year: 2026,
    name: "Mustang Dark Horse",
    trim: "Fastback",

    images: {
      hero: "/mustang/dark-horse/hero.webp",
      front: "/mustang/dark-horse/front.webp",
      side: "/mustang/dark-horse/side.webp",
      interior: "/mustang/dark-horse/interior.webp"
    },

    sound: {
      idle: "/mustang_engine_sounds/dark-horse/idle.wav",
      acceleration: "/mustang_engine_sounds/dark-horse/acceleration.wav"
    },

    specs: {
      engine: "Modified 5.0L Coyote V8",
      horsepower: 500,
      torqueLbFt: 418,
      transmission: "6-speed manual / 10-speed automatic",
      drivetrain: "Rear-wheel drive"
    },

    performance: {
      zeroTo60Mph: 4.1,
      zeroTo100Kph: null,
      zeroTo200Kph: null,
      topSpeedMph: 166
    },

    performanceSource: "Independent test/reference",
    officialSpecsSource: "Ford"
  },

  {
    id: "mustang-dark-horse-sc-2026",
    year: 2026,
    name: "Mustang Dark Horse SC",
    trim: "Fastback",

    images: {
      hero: "/mustang/dark-horse-sc/hero.webp",
      front: "/mustang/dark-horse-sc/front.webp",
      side: "/mustang/dark-horse-sc/side.webp",
      interior: "/mustang/dark-horse-sc/interior.webp"
    },

    sound: {
      idle: "/mustang_engine_sounds/dark-horse-sc/idle.wav",
      acceleration: "/mustang_engine_sounds/dark-horse-sc/acceleration.wav"
    },

    specs: {
      engine: "5.2L Supercharged V8",
      horsepower: 795,
      torqueLbFt: 660,
      transmission: "7-speed dual-clutch",
      drivetrain: "Rear-wheel drive"
    },

    performance: {
      zeroTo60Mph: 2.9,
      zeroTo100Kph: 3.1,
      zeroTo200Kph: 8.5,
      topSpeedMph: 195
    },

    performanceSource: "Verified Simulation Data",
    officialSpecsSource: "Ford"
  }
];
