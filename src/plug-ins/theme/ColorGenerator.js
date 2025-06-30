/**
 * ColorFunctions - A comprehensive collection of nature and sci-fi inspired color transformations
 * Based on real-world light phenomena and fictional energy effects
 */
class ColorFunctions {
  constructor() {
    this.time = 0;
    this.animationId = null;
    this.startTime = Date.now();
  }

  // Utility methods
  static clamp(value, min = 0, max = 255) {
    return Math.max(min, Math.min(max, value));
  }

  static hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
    };
  }

  updateTime() {
    this.time = (Date.now() - this.startTime) * 0.001;
  }

  // NATURE - DARK ATMOSPHERES
  darkOceanDepths(baseColor, depth = 0.5) {
    this.updateTime();
    const pressure = Math.pow(depth, 2);
    const currentFlow = Math.sin(this.time * 0.3 + depth * 2) * 0.1 + 0.9;
    const bioLuminescence = Math.sin(this.time * 0.8) * 0.05 * (1 - depth);

    return {
      r: ColorFunctions.clamp(baseColor.r * (0.1 + pressure * 0.2) * currentFlow),
      g: ColorFunctions.clamp(baseColor.g * (0.3 + pressure * 0.1) * currentFlow + bioLuminescence * 30),
      b: ColorFunctions.clamp(baseColor.b * (0.8 - pressure * 0.3) * currentFlow + bioLuminescence * 80),
    };
  }

  nightLakeReflection(baseColor, stillness = 0.5) {
    this.updateTime();
    const ripple = Math.sin(this.time * 0.5 + stillness * 3) * (1 - stillness) * 0.15;
    const moonlight = Math.cos(this.time * 0.2) * 0.1 + 0.9;
    const reflection = 0.6 + ripple;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.4 * reflection * moonlight),
      g: ColorFunctions.clamp(baseColor.g * 0.5 * reflection * moonlight),
      b: ColorFunctions.clamp(baseColor.b * 0.9 * reflection * moonlight + 20),
    };
  }

  foxfire(baseColor, intensity = 0.5) {
    this.updateTime();
    const flicker = Math.sin(this.time * 4 + intensity * 2) * 0.3 + 0.7;
    const glow = Math.cos(this.time * 2.5) * 0.2 + 0.8;
    const phosphorescence = intensity * flicker * glow;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.2 + phosphorescence * 50),
      g: ColorFunctions.clamp(baseColor.g * 0.3 + phosphorescence * 150),
      b: ColorFunctions.clamp(baseColor.b * 0.1 + phosphorescence * 30),
    };
  }

  moonlessForest(baseColor, density = 0.5) {
    this.updateTime();
    const shadow = Math.pow(density, 1.5);
    const whisper = Math.sin(this.time * 0.1 + density * 4) * 0.05 + 0.95;
    const mystery = Math.cos(this.time * 0.3) * 0.02 + 0.98;

    return {
      r: ColorFunctions.clamp(baseColor.r * (0.15 - shadow * 0.1) * whisper),
      g: ColorFunctions.clamp(baseColor.g * (0.25 - shadow * 0.05) * whisper * mystery),
      b: ColorFunctions.clamp(baseColor.b * (0.35 - shadow * 0.15) * mystery),
    };
  }

  deepCaveAmbient(baseColor, depth = 0.5) {
    this.updateTime();
    const echo = Math.sin(this.time * 0.2 + depth * 5) * 0.03 + 0.97;
    const minerals = Math.cos(this.time * 0.15) * 0.02 + 0.98;
    const dampness = 0.9 - depth * 0.3;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.1 * echo * dampness),
      g: ColorFunctions.clamp(baseColor.g * 0.2 * minerals * dampness),
      b: ColorFunctions.clamp(baseColor.b * 0.3 * echo * minerals),
    };
  }

  // GAMING - NIGHT EFFECTS
  terminatorVision(baseColor, scanline = 0.5) {
    this.updateTime();
    const scan = Math.sin(this.time * 8 + scanline * 10) * 0.2 + 0.8;
    const targeting = Math.cos(this.time * 12) * 0.1 + 0.9;
    const hud = Math.sin(this.time * 6) * 0.05 + 0.95;

    return {
      r: ColorFunctions.clamp(baseColor.r * 1.2 * scan * targeting),
      g: ColorFunctions.clamp(baseColor.g * 0.3 * hud),
      b: ColorFunctions.clamp(baseColor.b * 0.1 * scan),
    };
  }

  predatorThermal(baseColor, heatSignature = 0.5) {
    this.updateTime();
    const thermal = Math.sin(this.time * 3 + heatSignature * 5) * 0.3 + 0.7;
    const interference = Math.cos(this.time * 7) * 0.1 + 0.9;
    const signature = heatSignature * thermal;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.2 + signature * 200 * interference),
      g: ColorFunctions.clamp(baseColor.g * 0.1 + signature * 100),
      b: ColorFunctions.clamp(baseColor.b * 0.05 + signature * 50),
    };
  }

  nightVisionGoggles(baseColor, amplification = 0.5) {
    this.updateTime();
    const grain = Math.sin(this.time * 20) * 0.05 + 0.95;
    const boost = 1 + amplification * 2;
    const greenFilter = Math.cos(this.time * 0.5) * 0.1 + 0.9;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.1 * grain),
      g: ColorFunctions.clamp(baseColor.g * boost * greenFilter * grain),
      b: ColorFunctions.clamp(baseColor.b * 0.2 * grain),
    };
  }

  cyberpunkNeon(baseColor, voltage = 0.5) {
    this.updateTime();
    const flicker = Math.sin(this.time * 15 + voltage * 8) * 0.2 + 0.8;
    const buzz = Math.cos(this.time * 25) * 0.1 + 0.9;
    const neon = voltage * flicker * buzz;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.3 + neon * 150),
      g: ColorFunctions.clamp(baseColor.g * 0.2 + neon * 100),
      b: ColorFunctions.clamp(baseColor.b * 0.1 + neon * 200),
    };
  }

  ghostlySpectral(baseColor, manifestation = 0.5) {
    this.updateTime();
    const phase = Math.sin(this.time * 1.5 + manifestation * 3) * 0.4 + 0.6;
    const ethereal = Math.cos(this.time * 2.2) * 0.3 + 0.7;
    const spectral = manifestation * phase * ethereal;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.4 * spectral),
      g: ColorFunctions.clamp(baseColor.g * 0.6 * spectral),
      b: ColorFunctions.clamp(baseColor.b * 0.9 * spectral + 40),
    };
  }

  // UNIVERSE - DEEP SPACE
  nebulaDust(baseColor, density = 0.5) {
    this.updateTime();
    const drift = Math.sin(this.time * 0.1 + density * 2) * 0.2 + 0.8;
    const stellar = Math.cos(this.time * 0.3) * 0.1 + 0.9;
    const cosmic = density * drift * stellar;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.6 * cosmic + 30),
      g: ColorFunctions.clamp(baseColor.g * 0.4 * cosmic + 10),
      b: ColorFunctions.clamp(baseColor.b * 0.8 * cosmic + 60),
    };
  }

  plutoAtmosphere(baseColor, altitude = 0.5) {
    this.updateTime();
    const methane = Math.sin(this.time * 0.2 + altitude * 3) * 0.1 + 0.9;
    const nitrogen = Math.cos(this.time * 0.15) * 0.05 + 0.95;
    const frozen = 0.3 - altitude * 0.2;

    return {
      r: ColorFunctions.clamp(baseColor.r * frozen * methane),
      g: ColorFunctions.clamp(baseColor.g * (frozen + 0.1) * nitrogen),
      b: ColorFunctions.clamp(baseColor.b * (frozen + 0.2) * methane * nitrogen),
    };
  }

  blackHoleAccretion(baseColor, eventHorizon = 0.5) {
    this.updateTime();
    const gravity = Math.pow(eventHorizon, 2);
    const redshift = Math.sin(this.time * 0.8 + eventHorizon * 4) * 0.3 + 0.7;
    const spacetime = Math.cos(this.time * 1.2) * 0.2 + 0.8;

    return {
      r: ColorFunctions.clamp(baseColor.r * (1 - gravity * 0.8) * redshift),
      g: ColorFunctions.clamp(baseColor.g * (1 - gravity * 0.9) * spacetime),
      b: ColorFunctions.clamp(baseColor.b * (1 - gravity * 0.7) * redshift * spacetime),
    };
  }

  voidCold(baseColor, emptiness = 0.5) {
    this.updateTime();
    const absolute = Math.pow(emptiness, 3);
    const quantum = Math.sin(this.time * 0.05) * 0.01 + 0.99;
    const void_ = absolute * quantum;

    return {
      r: ColorFunctions.clamp(baseColor.r * (0.05 + void_ * 0.1)),
      g: ColorFunctions.clamp(baseColor.g * (0.08 + void_ * 0.12)),
      b: ColorFunctions.clamp(baseColor.b * (0.12 + void_ * 0.15)),
    };
  }

  cosmicRadiation(baseColor, intensity = 0.5) {
    this.updateTime();
    const gamma = Math.sin(this.time * 5 + intensity * 6) * 0.3 + 0.7;
    const particle = Math.cos(this.time * 8) * 0.2 + 0.8;
    const radiation = intensity * gamma * particle;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.3 + radiation * 80),
      g: ColorFunctions.clamp(baseColor.g * 0.4 + radiation * 120),
      b: ColorFunctions.clamp(baseColor.b * 0.2 + radiation * 180),
    };
  }

  // ======================
  // ATMOSPHERIC EFFECTS
  // ======================

  atmosphericScatter(baseColor, scatterAmount = 0.3) {
    const r = baseColor.r * (1 - scatterAmount * 0.8);
    const g = baseColor.g * (1 - scatterAmount * 0.6);
    const b = baseColor.b * (1 - scatterAmount * 0.2);
    return {
      r: ColorFunctions.clamp(r),
      g: ColorFunctions.clamp(g),
      b: ColorFunctions.clamp(b),
    };
  }

  sunsetGradient(baseColor, elevation = 0.5) {
    const sunsetFactor = Math.sin(elevation * Math.PI);
    const orangeShift = sunsetFactor * 0.8;
    const redShift = sunsetFactor * 0.6;

    return {
      r: ColorFunctions.clamp(baseColor.r + orangeShift * 100 + redShift * 50),
      g: ColorFunctions.clamp(baseColor.g + orangeShift * 60 - redShift * 30),
      b: ColorFunctions.clamp(baseColor.b - orangeShift * 80 - redShift * 100),
    };
  }

  mistEffect(baseColor, density = 0.4) {
    const mistFactor = 1 - density;
    const whiteBlend = density * 0.7;

    return {
      r: ColorFunctions.clamp(baseColor.r * mistFactor + 255 * whiteBlend),
      g: ColorFunctions.clamp(baseColor.g * mistFactor + 255 * whiteBlend),
      b: ColorFunctions.clamp(baseColor.b * mistFactor + 255 * whiteBlend),
    };
  }

  // ======================
  // OPTICAL PHENOMENA
  // ======================

  chromaticAberration(baseColor, intensity = 0.1) {
    return {
      r: ColorFunctions.clamp(baseColor.r + intensity * 50),
      g: baseColor.g,
      b: ColorFunctions.clamp(baseColor.b - intensity * 30),
    };
  }

  iridescence(baseColor, angle = 0, intensity = 0.8) {
    this.updateTime();
    const shimmer = Math.sin(angle + this.time * 2) * intensity;
    const hueShift = shimmer * 60;

    // Convert to HSL-like manipulation
    const max = Math.max(baseColor.r, baseColor.g, baseColor.b);
    const min = Math.min(baseColor.r, baseColor.g, baseColor.b);
    const delta = max - min;

    if (delta === 0) return baseColor;

    let h = 0;
    if (max === baseColor.r) h = ((baseColor.g - baseColor.b) / delta) % 6;
    else if (max === baseColor.g) h = (baseColor.b - baseColor.r) / delta + 2;
    else h = (baseColor.r - baseColor.g) / delta + 4;

    h = (h * 60 + hueShift) % 360;
    if (h < 0) h += 360;

    const l = (max + min) / 2 / 255;
    const s = delta === 0 ? 0 : delta / (255 - Math.abs(2 * l * 255 - 255));

    return ColorFunctions.hslToRgb(h, s * 100, l * 100);
  }

  oilSlick(baseColor, thickness = 0.5) {
    this.updateTime();
    const interference = Math.sin(thickness * 10 + this.time * 3) * 0.5 + 0.5;
    const hueShift = interference * 180 + 180;

    return ColorFunctions.hslToRgb(hueShift, 80 + interference * 20, 30 + interference * 40);
  }

  soapBubble(baseColor, surfaceAngle = 0) {
    this.updateTime();
    const t = this.time * 0.5 + surfaceAngle;
    const r = Math.sin(t) * 0.5 + 0.5;
    const g = Math.sin(t + 2.094) * 0.5 + 0.5; // 2π/3
    const b = Math.sin(t + 4.188) * 0.5 + 0.5; // 4π/3

    return {
      r: ColorFunctions.clamp(r * 255 * 0.8 + baseColor.r * 0.2),
      g: ColorFunctions.clamp(g * 255 * 0.8 + baseColor.g * 0.2),
      b: ColorFunctions.clamp(b * 255 * 0.8 + baseColor.b * 0.2),
    };
  }

  prismDispersion(wavelength) {
    let r = 0,
      g = 0,
      b = 0;

    if (wavelength >= 380 && wavelength <= 440) {
      r = -(wavelength - 440) / (440 - 380);
      b = 1.0;
    } else if (wavelength >= 440 && wavelength <= 490) {
      g = (wavelength - 440) / (490 - 440);
      b = 1.0;
    } else if (wavelength >= 490 && wavelength <= 510) {
      g = 1.0;
      b = -(wavelength - 510) / (510 - 490);
    } else if (wavelength >= 510 && wavelength <= 580) {
      r = (wavelength - 510) / (580 - 510);
      g = 1.0;
    } else if (wavelength >= 580 && wavelength <= 645) {
      r = 1.0;
      g = -(wavelength - 645) / (645 - 580);
    } else if (wavelength >= 645 && wavelength <= 750) {
      r = 1.0;
    }

    return {
      r: ColorFunctions.clamp(r * 255),
      g: ColorFunctions.clamp(g * 255),
      b: ColorFunctions.clamp(b * 255),
    };
  }

  // ======================
  // CELESTIAL EFFECTS
  // ======================

  sunlightTransform(baseColor, timeOfDay = 0.5) {
    // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset, 1 = midnight
    const sunAngle = Math.sin(timeOfDay * Math.PI * 2);
    const warmth = Math.max(0, sunAngle);
    const coolness = Math.max(0, -sunAngle);

    return {
      r: ColorFunctions.clamp(baseColor.r + warmth * 50 - coolness * 30),
      g: ColorFunctions.clamp(baseColor.g + warmth * 30 - coolness * 10),
      b: ColorFunctions.clamp(baseColor.b - warmth * 30 + coolness * 50),
    };
  }

  moonlightTransform(baseColor, phase = 0.5) {
    const moonIntensity = Math.sin(phase * Math.PI);
    const silverShift = moonIntensity * 0.3;

    return {
      r: ColorFunctions.clamp(baseColor.r * (0.4 + silverShift)),
      g: ColorFunctions.clamp(baseColor.g * (0.5 + silverShift)),
      b: ColorFunctions.clamp(baseColor.b * (0.8 + silverShift)),
    };
  }

  starlight(baseColor, twinkle = true) {
    this.updateTime();
    const sparkle = twinkle ? Math.sin(this.time * 8) * 0.3 + 0.7 : 1;
    const cosmic = 0.1 + sparkle * 0.2;

    return {
      r: ColorFunctions.clamp(baseColor.r * cosmic + 40),
      g: ColorFunctions.clamp(baseColor.g * cosmic + 60),
      b: ColorFunctions.clamp(baseColor.b * cosmic + 100),
    };
  }

  // ======================
  // BIOLOGICAL EFFECTS
  // ======================

  bioluminescence(baseColor, glowIntensity = 0.5) {
    this.updateTime();
    const pulse = Math.sin(this.time * 2) * glowIntensity + 1;

    return {
      r: ColorFunctions.clamp(baseColor.r * pulse * 0.3),
      g: ColorFunctions.clamp(baseColor.g * pulse * 1.2),
      b: ColorFunctions.clamp(baseColor.b * pulse * 0.8),
    };
  }

  butterflyWing(baseColor, scale = 0.5) {
    this.updateTime();
    const iridescent = this.iridescence(baseColor, scale * 10, 0.6);
    const metallic = Math.sin(this.time + scale * 5) * 0.3 + 0.7;

    return {
      r: ColorFunctions.clamp(iridescent.r * metallic),
      g: ColorFunctions.clamp(iridescent.g * metallic),
      b: ColorFunctions.clamp(iridescent.b * metallic),
    };
  }

  firefly(baseColor, energy = 1.0) {
    this.updateTime();
    const flicker = Math.random() < 0.95 ? 1 : 0.3;
    const glow = Math.sin(this.time * 3) * 0.4 + 0.6;

    return {
      r: ColorFunctions.clamp(255 * energy * flicker * glow),
      g: ColorFunctions.clamp(255 * energy * flicker * glow * 0.8),
      b: ColorFunctions.clamp(50 * energy * flicker * glow),
    };
  }

  // ======================
  // AQUATIC EFFECTS
  // ======================

  underwaterCaustics(baseColor, depth = 0.5) {
    this.updateTime();
    const wave1 = Math.sin(this.time * 0.7 + depth * 3) * 0.3;
    const wave2 = Math.cos(this.time * 1.1 + depth * 2) * 0.2;
    const causticEffect = (wave1 + wave2) * 0.5 + 1;

    return {
      r: ColorFunctions.clamp(baseColor.r * (1 - depth * 0.7)),
      g: ColorFunctions.clamp(baseColor.g * (1 - depth * 0.4) * causticEffect),
      b: ColorFunctions.clamp(baseColor.b * causticEffect),
    };
  }

  deepSeaGlow(baseColor, depth = 0.8) {
    const pressure = Math.min(1, depth);
    const abyssal = 1 - pressure;

    return {
      r: ColorFunctions.clamp(baseColor.r * abyssal * 0.1),
      g: ColorFunctions.clamp(baseColor.g * abyssal * 0.3),
      b: ColorFunctions.clamp(baseColor.b * (0.5 + abyssal * 0.5)),
    };
  }

  // ======================
  // NATURAL PHENOMENA
  // ======================

  auroraTransform(baseColor, altitude = 0.5) {
    this.updateTime();
    const dance = Math.sin(this.time * 0.5 + altitude * 2) * 0.5 + 0.5;
    const greenIntensity = Math.sin(altitude * Math.PI) * 0.8 * dance;
    const purpleIntensity = Math.cos(altitude * Math.PI * 0.7) * 0.6 * dance;

    return {
      r: ColorFunctions.clamp(baseColor.r + purpleIntensity * 100),
      g: ColorFunctions.clamp(baseColor.g + greenIntensity * 150),
      b: ColorFunctions.clamp(baseColor.b + (greenIntensity + purpleIntensity) * 80),
    };
  }

  lightning(baseColor, intensity = 1.0) {
    this.updateTime();
    const strike = Math.random() < 0.05 ? 1 : 0;
    const afterglow = Math.max(0, Math.sin(this.time * 10) * 0.3);
    const flash = strike + afterglow;

    return {
      r: ColorFunctions.clamp(baseColor.r + flash * 200 * intensity),
      g: ColorFunctions.clamp(baseColor.g + flash * 220 * intensity),
      b: ColorFunctions.clamp(baseColor.b + flash * 255 * intensity),
    };
  }

  canopyFilter(baseColor, density = 0.6) {
    const greenShift = Math.random() * 0.3 + 0.2;
    const dappling = Math.sin(Math.random() * Math.PI * 2) * 0.4 + 0.6;

    return {
      r: ColorFunctions.clamp(baseColor.r * (1 - density * 0.7) * dappling),
      g: ColorFunctions.clamp(baseColor.g * (1 + greenShift) * dappling),
      b: ColorFunctions.clamp(baseColor.b * (1 - density * 0.5) * dappling),
    };
  }

  // ======================
  // SCI-FI GAME EFFECTS
  // ======================

  xenCrystal(baseColor, resonance = 0.5) {
    this.updateTime();
    const harmonic = Math.sin(this.time * 4 + resonance * 6) * 0.4 + 0.6;
    const energy = Math.cos(this.time * 2.3) * 0.3 + 0.7;

    return {
      r: ColorFunctions.clamp(baseColor.r * 0.2 + 100 * harmonic),
      g: ColorFunctions.clamp(baseColor.g * 0.8 + 150 * energy),
      b: ColorFunctions.clamp(baseColor.b * 1.2 + 200 * harmonic),
    };
  }

  gravityGun(baseColor, charge = 0.5) {
    this.updateTime();
    const field = Math.sin(this.time * 6) * charge * 0.5 + charge;
    const distortion = Math.cos(this.time * 8) * 0.2 + 0.8;

    return {
      r: ColorFunctions.clamp(baseColor.r * (1 - field * 0.5) + field * 50),
      g: ColorFunctions.clamp(baseColor.g * distortion + field * 100),
      b: ColorFunctions.clamp(baseColor.b * (1 + field * 0.8) + field * 150),
    };
  }

  combine(baseColor, suppression = 0.7) {
    const dystopian = 1 - suppression;
    const orangeOverlay = suppression * 0.6;

    return {
      r: ColorFunctions.clamp(baseColor.r * dystopian + 255 * orangeOverlay),
      g: ColorFunctions.clamp(baseColor.g * dystopian + 120 * orangeOverlay),
      b: ColorFunctions.clamp(baseColor.b * dystopian + 0 * orangeOverlay),
    };
  }

  headcrabInfestation(baseColor, corruption = 0.4) {
    this.updateTime();
    const pulse = Math.sin(this.time * 3) * corruption * 0.3 + corruption;
    const decay = 1 - corruption * 0.5;

    return {
      r: ColorFunctions.clamp(baseColor.r * decay + pulse * 150),
      g: ColorFunctions.clamp(baseColor.g * decay + pulse * 80),
      b: ColorFunctions.clamp(baseColor.b * decay + pulse * 40),
    };
  }

  lambdaCore(baseColor, stability = 0.8) {
    this.updateTime();
    const quantum = Math.sin(this.time * 5) * (1 - stability) * 0.5 + stability;
    const resonance = Math.cos(this.time * 3.7) * 0.3 + 0.7;

    return {
      r: ColorFunctions.clamp(baseColor.r * quantum + 255 * (1 - stability) * resonance),
      g: ColorFunctions.clamp(baseColor.g * quantum + 180 * (1 - stability) * resonance),
      b: ColorFunctions.clamp(baseColor.b * quantum + 50 * (1 - stability) * resonance),
    };
  }

  // ======================
  // ADDITIONAL SCI-FI EFFECTS
  // ======================

  portalEnergy(baseColor, instability = 0.3) {
    this.updateTime();
    const vortex = Math.sin(this.time * 8 + instability * 10) * instability + (1 - instability);
    const dimensional = Math.cos(this.time * 6) * 0.4 + 0.6;

    return {
      r: ColorFunctions.clamp(baseColor.r * vortex * 0.3 + 255 * dimensional * instability),
      g: ColorFunctions.clamp(baseColor.g * vortex * 0.1 + 100 * dimensional * instability),
      b: ColorFunctions.clamp(baseColor.b * vortex + 255 * dimensional),
    };
  }

  radioactive(baseColor, decay = 0.5) {
    this.updateTime();
    const geiger = Math.random() < 0.1 ? 1.5 : 1;
    const contamination = Math.sin(this.time * 2) * decay * 0.3 + decay;

    return {
      r: ColorFunctions.clamp(baseColor.r * (1 - contamination * 0.5)),
      g: ColorFunctions.clamp(baseColor.g * (1 + contamination * 0.8) * geiger),
      b: ColorFunctions.clamp(baseColor.b * (1 - contamination * 0.7)),
    };
  }

  // ======================
  // UTILITY METHODS
  // ======================

  getAllEffects() {
    return [
      'darkOceanDepths', 'nightLakeReflection', 'foxfire', 'moonlessForest', 'deepCaveAmbient', 'terminatorVision', 'predatorThermal', 'nightVisionGoggles', 'cyberpunkNeon', 'ghostlySpectral', 'nebulaDust', 'plutoAtmosphere', 'blackHoleAccretion', 'voidCold', 'cosmicRadiation',
      'atmosphericScatter', 'sunsetGradient', 'mistEffect', 'chromaticAberration', 'iridescence', 'oilSlick', 'soapBubble', 'prismDispersion', 'sunlightTransform', 'moonlightTransform', 'starlight', 'bioluminescence', 'butterflyWing', 'firefly', 'underwaterCaustics', 'deepSeaGlow', 'auroraTransform', 'lightning', 'canopyFilter', 'xenCrystal', 'gravityGun', 'combine', 'headcrabInfestation', 'lambdaCore', 'portalEnergy', 'radioactive',
    ];
  }

  getRandomEffect() {
    const effects = this.getAllEffects();
    return effects[Math.floor(Math.random() * effects.length)];
  }

  applyEffect(effectName, baseColor, ...params) {
    if (typeof this[effectName] === "function") {
      return this[effectName](baseColor, ...params);
    }
    return baseColor;
  }

  // Chain multiple effects
  chain(baseColor, ...effectsWithParams) {
    return effectsWithParams.reduce((color, effect) => {
      if (typeof effect === "string") {
        return this.applyEffect(effect, color);
      } else if (Array.isArray(effect)) {
        const [effectName, ...params] = effect;
        return this.applyEffect(effectName, color, ...params);
      }
      return color;
    }, baseColor);
  }

  // Convert RGB to hex
  static rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
    );
  }

  // Convert hex to RGB
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }
}
