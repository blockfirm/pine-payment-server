import crypto from 'crypto';
import { convert } from 'convert-svg-to-png';

const DEFAULT_OPTIONS = {
  size: 250,
  backgroundColor: '#F6F6F6'
};

const BODY_COLORS = [
  '#00DD82',
  '#FFC431',
  '#FF8135',
  '#FF3B57',
  '#FF573D',
  '#7178D0',
  '#9BE37C',
  '#FF8327',
  '#24E19C',
  '#FFBE00',
  '#00D4FF',
  '#5E7BFF',
  '#FF444D',
  '#FF971E',
  '#FF8DF0'
];

const MOUTH_COLORS = [
  '#009853',
  '#ED7A00',
  '#EA4600',
  '#C5293E',
  '#C93D26',
  '#494E8B',
  '#69B04B',
  '#CA5803',
  '#00A56E',
  '#D38C00',
  '#009CC4',
  '#2B44B5',
  '#AC0115',
  '#BD5C00',
  '#CF5EBD'
];

const MOUTHS = [
  '<path d="M12.4328358,34.25 C13.6169154,34.6108906 15.0547264,34.7913359 16.7462687,34.7913359 C18.4378109,34.7913359 19.9810934,34.6108906 21.376116,34.25" id="Mouth" stroke="${mouthColor}" stroke-linecap="round"></path>',
  '<path d="M12.5,34.5 C13.6840796,34.5 15.1218905,34.5 16.8134328,34.5 C18.5049751,34.5 20.0482576,34.5 21.4432802,34.5" id="Mouth" stroke="${mouthColor}" stroke-linecap="round"></path>',
  '<path d="M17,35.8284271 C19.7614237,35.8284271 22,34.9329966 22,33.8284271 C22,32.7238576 12,32.7238576 12,33.8284271 C12,34.9329966 14.2385763,35.8284271 17,35.8284271 Z" id="Mouth" fill="${mouthColor}"></path>',
  '<path d="M13,34.8385604 C14.7777778,34.3871465 16.4444444,34.1614396 18,34.1614396 C19.5555556,34.1614396 20.6809275,34.3871465 21.376116,34.8385604" id="Mouth" stroke="${mouthColor}" stroke-linecap="round"></path>',
  '<path d="M17,37.8284271 C19.7614237,37.8284271 22,36.6164141 22,35.1213203 C22,33.6262266 12,33.6262266 12,35.1213203 C12,36.6164141 14.2385763,37.8284271 17,37.8284271 Z" id="Mouth" fill="${mouthColor}"></path>',
  '<path d="M14,35.5 L20,35.5" id="Mouth" stroke="${mouthColor}" stroke-linecap="round"></path>',
  '<path d="M13,36.5 C13.8059701,36.0275573 15.0547264,35.7913359 16.7462687,35.7913359 C18.4378109,35.7913359 19.8557214,35.5275573 21,35" id="Mouth" stroke="${mouthColor}" stroke-linecap="round"></path>',
  '<path d="M12.5,34 C13.7895511,35.1666667 15.2800978,35.75 16.9716401,35.75 C18.6631824,35.75 20.1537291,35.1666667 21.4432802,34" id="Mouth" stroke="${mouthColor}" stroke-linecap="round"></path>'
];

const sha1 = (input) => {
  return crypto.createHash('sha1').update(input).digest();
};

const generateSvg = (input, overrideOptions = {}) => {
  const hash = sha1(input);

  const options = { ...DEFAULT_OPTIONS, ...overrideOptions };
  const { size, backgroundColor } = options;

  const bodyColorIndex = hash.readUInt8(0) % BODY_COLORS.length;
  const bodyColor = BODY_COLORS[bodyColorIndex];
  const mouthColor = MOUTH_COLORS[bodyColorIndex];

  const eyeOffsetX = (hash.readUInt8(1) % 7) - 3;
  const eyeOffsetY = (hash.readUInt8(2) % 7) - 3;

  const mouthIndex = hash.readUInt8(3) % MOUTHS.length;
  const mouth = MOUTHS[mouthIndex].replace('${mouthColor}', mouthColor);

  const svg = `
<svg width="${size}px" height="${size}px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g id="Avatar" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <rect fill="${backgroundColor}" x="0" y="0" width="60" height="60"></rect>
    <g id="Monster" transform="translate(13.000000, 14.000000)" fill-rule="nonzero">
      <path d="M34,46 L0,46 L0,16.75 C-1.13289253e-15,7.49923044 7.49923044,1.6993388e-15 16.75,0 L17.25,0 C26.5007696,-1.6993388e-15 34,7.49923044 34,16.75 L34,46 Z" id="Body" fill="${bodyColor}"></path>
      <g id="Eye" transform="translate(8.000000, 11.000000)">
        <circle id="Lens" fill="#FFFFFF" cx="9" cy="9" r="9"></circle>
        <path
          style="transform: translateX(${eyeOffsetX}px) translateY(${eyeOffsetY}px);"
          d="M5.14197881,7.9399374 C5.47474946,8.1871044 5.8869646,8.33333333 6.33333333,8.33333333 C7.43790283,8.33333333 8.33333333,7.43790283 8.33333333,6.33333333 C8.33333333,5.8869646 8.1871044,5.47474946 7.9399374,5.14197881 C8.27755276,5.0494239 8.63300459,5 9,5 C11.209139,5 13,6.790861 13,9 C13,11.209139 11.209139,13 9,13 C6.790861,13 5,11.209139 5,9 C5,8.63300459 5.0494239,8.27755276 5.14197881,7.9399374 Z" id="Pupil" fill="#335061"
        ></path>
      </g>
      ${mouth}
    </g>
  </g>
</svg>`;

  return svg;
};

/**
 * Generates a placeholder avatar based on the input string.
 *
 * @param {string} input - Arbitrary string to use when generating the avatar.
 * @param {object} options - Optional options.
 * @param {number} options.size - The size of the generated image in pixels.
 * @param {string} options.backgroundColor - The background color of the generated image.
 *
 * @returns {Promise} A promise that resolves to the generated png (Buffer).
 */
const generate = (input, options) => {
  const svg = generateSvg(input, options);
  return convert(svg);
};

export default generate;
