const fs = require("fs");
const { encode } = require("html-entities");
const patternsMetadata = require("./../data");
const whiskers = require("whiskers");
const { format, parse } = require("date-fns");

const isProd = process.env.prod === "true";
const urlPrefix = isProd ? "https://kindohm-increments.s3.amazonaws.com" : "";

const distFolder = `${__dirname}/../dist`;
if (fs.existsSync(distFolder)) {
  console.log("removing existing dist folder");
  fs.rmdirSync(distFolder, { recursive: true });
}

console.log("creating dist folder");
fs.mkdirSync(distFolder);
fs.mkdirSync(`${distFolder}/data`);

const sketches = patternsMetadata
  .map((patternMetadata) => {
    const { name, date } = patternMetadata;
    const tidalPath = `${__dirname}/../patterns/${name}.tidal`;
    const tidalCode = encode(fs.readFileSync(tidalPath, "utf8"));
    const mp3SourcePath = `${__dirname}/../mixes/${name}.mp3`;
    const mp3DestFilename = `kindohm.incremental.${name}.mp3`;
    const mp3DestPath = `${__dirname}/../dist/increments/${mp3DestFilename}`;
    const mp3DestUrl = `${urlPrefix}/increments/${mp3DestFilename}`;
    const dateDisplay = format(new Date(date), "yyyy-MM-dd");
    return {
      ...patternMetadata,
      sketchNumber: name,
      tidalCode,
      mp3DestUrl,
      dateDisplay,
      mp3SourcePath,
      mp3DestPath,
      date: new Date(date),
    };
  })
  .sort((a, b) => {
    if (a.date.getTime() === b.date.getTime()) {
      return a.sketchNumber > b.sketchNumber ? -1 : 1;
    }
    return a.date.getTime() > b.date.getTime() ? -1 : 1;
  });

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  // both min and max are inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const colors = [
  {
    bgcolor: "#a55ecd",
    forecolor: "#343434",
  },
  { forecolor: "#553764", bgcolor: "#3ea207" },
  { forecolor: "#b13808", bgcolor: "#50ccff" },
  { forecolor: "#385842", bgcolor: "#fa6eb3" },
  { forecolor: "#003264", bgcolor: "#be5f4b" },
  { forecolor: "#e81298", bgcolor: "#0bfb60" },
  { forecolor: "#a6b73f", bgcolor: "#5545b8" },
  { forecolor: "#23444a", bgcolor: "#d8bfba" },
  { forecolor: "#454b48", bgcolor: "#f264a1" },
  { forecolor: "#7aea24", bgcolor: "#8411df" },
  { forecolor: "#6f0e4c", bgcolor: "#91feb5" },
  { forecolor: "#69dd60", bgcolor: "#961ea0" },
  { forecolor: "#e8b558", bgcolor: "#1247a9" },
  { forecolor: "#62ca9f", bgcolor: "#a1315e" },
  { forecolor: "#cfd9b0", bgcolor: "#2c2448" },
  { forecolor: "#1d57c0", bgcolor: "#feab3e" },
  { forecolor: "#191790", bgcolor: "#f4ec6f" },
  { forecolor: "#2d2d2d", bgcolor: "#0175dd" },
  { forecolor: "#6b1584", bgcolor: "#96f37c" },
  { forecolor: "#373737", bgcolor: "#ef3b18" },
];

const randColor = colors[getRandomIntInclusive(0, colors.length - 1)];

const cssTemplatePath = `${__dirname}/../site/styles.css`;
const cssTemplate = fs.readFileSync(cssTemplatePath, "utf8");
const indexTemplatePath = `${__dirname}/../site/index.html`;
const indexTemplate = fs.readFileSync(indexTemplatePath, "utf8");
const globalTemplatePath = `${__dirname}/../site/template.html`;
const globalTemplate = fs.readFileSync(globalTemplatePath, "utf8");

const cssOutput = whiskers.render(cssTemplate, { ...randColor });
fs.writeFileSync(`${__dirname}/../dist/styles.css`, cssOutput);

const cssrand = getRandomIntInclusive(0, 99999999);
const indexContentOutput = whiskers.render(indexTemplate, { sketches });
const indexOutput = whiskers.render(globalTemplate, {
  content: indexContentOutput,
  title: "increments",
  cssrand,
});
const outPath = `${__dirname}/../dist/index.html`;
fs.writeFileSync(outPath, indexOutput);

const functions = fs.readFileSync(`${__dirname}/../functions.tidal`);
const functionsOutput = whiskers.render(globalTemplate, {
  content: `<article>
  <h1>Functions</h1>
  <pre><code>${functions}</code></pre>
</article>`,
  cssrand,
  title: "functions",
});

const license = fs.readFileSync(`${__dirname}/../license.txt`);
const licenseOutput = whiskers.render(globalTemplate, {
  content: `<article>
  <h1>License</h1>
  <pre><code>${license}</code></pre>
</article>`,
  title: "license",
  cssrand,
});

fs.writeFileSync(`${__dirname}/../dist/functions.html`, functionsOutput);

fs.writeFileSync(`${__dirname}/../dist/license.html`, licenseOutput);

fs.copyFileSync(
  `${__dirname}/../site/favicon.ico`,
  `${distFolder}/favicon.ico`
);

if (!isProd) {
  console.log("copying mp3s to local increments/ dir");
  fs.mkdirSync(`${distFolder}/increments/`);
  sketches.forEach((sketch) => {
    fs.copyFile(sketch.mp3SourcePath, sketch.mp3DestPath, (err) => {
      if (err) {
        console.error("error copying", sketch.mp3);
      }
    });
  });
}

console.log("done");
