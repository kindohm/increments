const fs = require("fs");
const NodeID3 = require("node-id3");
const { format, parse } = require("date-fns");

const artist = "Kindohm";

const getFileUpdatedDate = (path) => {
  const stats = fs.statSync(path);
  return stats.mtime;
};

const setTags = async (sketchDirName) => {
  return new Promise((resolve, reject) => {
    const rawNumber = sketchDirName.substr(0, 4);
    const rawDateString = sketchDirName.substr(5);
    const baseFilePath = `${__dirname}/../sketches/${sketchDirName}/${rawNumber}`;
    const mp3Path = `${baseFilePath}.mp3`;
    const tidalPath = `${baseFilePath}.tidal`;
    const code = fs.readFileSync(tidalPath, "utf8");
    const date = parse(rawDateString, "yyyy-MM-dd", new Date());
    const trackNumber = parseInt(rawNumber) + 1;
    const tags = {
      title: rawNumber,
      artist,
      composer: artist,
      TALB: "incremental",
      trackNumber,
      TDAT: parseInt(format(date, "ddMM")),
      date: parseInt(format(date, "ddMM")),
      TYER: date.getFullYear(),
      year: date.getFullYear(),
      artistUrl: "http://kindohm.com",
      comment: { language: "eng", text: code },
    };

    // const ttt = NodeID3.read(mp3Path);
    // console.log("tags", ttt);
    // resolve();
    NodeID3.write(tags, mp3Path, function (err) {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};

const main = async () => {
  console.log("reading sketches");
  const sketchDirNames = fs.readdirSync(`${__dirname}/../sketches`);
  console.log(`found ${sketchDirNames.length} sketches`);

  console.log("mapping sketches");
  const promises = sketchDirNames
    .filter((x) => x !== ".DS_Store")
    .map((sketchDirName) => setTags(sketchDirName));
  const results = Promise.all(promises);

  console.log("done");
};

main();
