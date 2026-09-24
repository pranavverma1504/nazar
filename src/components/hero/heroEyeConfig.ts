export const HERO_ARTBOARD = {
  width: 1672,
  height: 941,
} as const;

export type HeroEyeConfig = {
  id: string;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  movement: {
    pupilMaxX: number;
    pupilMaxY: number;
    innerIrisRatio: number;
  };
  assets: {
    cleanedBed: string;
    innerIris: string;
    pupil: string;
    apertureMask: string;
  };
};

function eye(
  id: string,
  crop: HeroEyeConfig["crop"],
  movement: HeroEyeConfig["movement"],
): HeroEyeConfig {
  const assetRoot = `/images/hero/eyes/${id}`;

  return {
    id,
    crop,
    movement,
    assets: {
      cleanedBed: `${assetRoot}/cleaned-bed.png`,
      innerIris: `${assetRoot}/inner-iris.png`,
      pupil: `${assetRoot}/pupil.png`,
      apertureMask: `${assetRoot}/aperture-mask.png`,
    },
  };
}

export const heroEyeConfigs = [
  eye(
    "eye-left-large",
    { x: 0, y: 110, width: 540, height: 350 },
    { pupilMaxX: 7.5, pupilMaxY: 5, innerIrisRatio: 0.45 },
  ),
  eye(
    "eye-top-center",
    { x: 680, y: 130, width: 320, height: 200 },
    { pupilMaxX: 4, pupilMaxY: 2.7, innerIrisRatio: 0.42 },
  ),
  eye(
    "eye-top-right",
    { x: 1000, y: 80, width: 480, height: 260 },
    { pupilMaxX: 6, pupilMaxY: 4, innerIrisRatio: 0.44 },
  ),
  eye(
    "eye-left-small",
    { x: 0, y: 500, width: 210, height: 180 },
    { pupilMaxX: 3.8, pupilMaxY: 2.5, innerIrisRatio: 0.38 },
  ),
  eye(
    "eye-bottom-left-large",
    { x: 120, y: 620, width: 560, height: 321 },
    { pupilMaxX: 6.5, pupilMaxY: 4.3, innerIrisRatio: 0.46 },
  ),
  eye(
    "eye-bottom-center",
    { x: 710, y: 650, width: 260, height: 200 },
    { pupilMaxX: 3.8, pupilMaxY: 2.5, innerIrisRatio: 0.4 },
  ),
  eye(
    "eye-right-large",
    { x: 1080, y: 470, width: 592, height: 471 },
    { pupilMaxX: 7.8, pupilMaxY: 5.2, innerIrisRatio: 0.48 },
  ),
] as const satisfies readonly HeroEyeConfig[];
