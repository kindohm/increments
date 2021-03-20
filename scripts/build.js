const fs = require("fs");
const whiskers = require("whiskers");
const { format, parse } = require("date-fns");

const isProd = process.env.prod === "true";
const urlPrefix = isProd ? "https://kindohm-increments.s3.amazonaws.com" : "";

console.log("reading sketches");
const sketchDirNames = fs.readdirSync(`${__dirname}/../sketches`);

console.log("mapping sketches");
const sketches = sketchDirNames
  .filter((s) => s !== ".DS_Store")
  .map((sketchDirName) => {
    const sketchNumber = sketchDirName.substr(0, 4);
    const rawDateString = sketchDirName.substr(5);
    const sketchDir = `${__dirname}/../sketches/${sketchDirName}`;
    const tidalPath = `${sketchDir}/${sketchNumber}.tidal`;
    const mp3SourcePath = `${sketchDir}/${sketchNumber}.mp3`;
    const date = parse(rawDateString, "yyyy-MM-dd", new Date());
    const tidalCode = fs.readFileSync(tidalPath, "utf8");
    const mp3DestFilename = `kindohm.incremental.${sketchNumber}.mp3`;
    const mp3DestUrl = `${urlPrefix}/increments/${mp3DestFilename}`;
    const mp3DestPath = `${__dirname}/../dist/increments/${mp3DestFilename}`;

    return {
      sketchNumber,
      date,
      dateDisplay: format(new Date(date), "yyyy-MM-dd"),
      tidalCode,
      mp3SourcePath,
      mp3DestFilename,
      mp3DestUrl,
      mp3DestPath,
    };
  })
  .sort((a, b) => {
    if (a.date.getTime() === b.date.getTime()) {
      return a.sketchNumber > b.sketchNumber ? -1 : 1;
    }
    return a.date.getTime() > b.date.getTime() ? -1 : 1;
  });

console.log(`building ${sketches.length} sketches`);
console.log(`last sketch: ${sketches[0].date} ${sketches[0].sketchNumber}`);

//#343434 : #a55ecd

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
];

const randColor = colors[getRandomIntInclusive(0, colors.length - 1)];
const cssrand = getRandomIntInclusive(0, 99999999);

const cssTemplatePath = `${__dirname}/../site/styles.css`;
const cssTemplate = fs.readFileSync(cssTemplatePath, "utf8");
const indexTemplatePath = `${__dirname}/../site/index.html`;
const indexTemplate = fs.readFileSync(indexTemplatePath, "utf8");
const globalTemplatePath = `${__dirname}/../site/template.html`;
const globalTemplate = fs.readFileSync(globalTemplatePath, "utf8");

const cssOutput = whiskers.render(cssTemplate, { ...randColor });

const indexContentOutput = whiskers.render(indexTemplate, { sketches });
const indexOutput = whiskers.render(globalTemplate, {
  content: indexContentOutput,
  title: "increments",
  cssrand,
});

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

const distFolder = `${__dirname}/../dist`;
if (fs.existsSync(distFolder)) {
  console.log("removing existing dist folder");
  fs.rmdirSync(distFolder, { recursive: true });
}

console.log("creating dist folder");
fs.mkdirSync(distFolder);

console.log("creating mp3 folder");
fs.mkdirSync(`${distFolder}/increments/`);

const outPath = `${__dirname}/../dist/index.html`;
fs.writeFileSync(outPath, indexOutput);

fs.writeFileSync(`${__dirname}/../dist/styles.css`, cssOutput);

fs.writeFileSync(`${__dirname}/../dist/functions.html`, functionsOutput);

fs.writeFileSync(`${__dirname}/../dist/license.html`, licenseOutput);

fs.copyFileSync(
  `${__dirname}/../site/favicon.ico`,
  `${distFolder}/favicon.ico`
);

if (!isProd) {
  sketches.forEach((sketch) => {
    fs.copyFile(sketch.mp3SourcePath, sketch.mp3DestPath, (err) => {
      if (err) {
        console.error("error copying", sketch.mp3);
      }
    });
  });
}

console.log("done");
