const fs = require("fs");
const NodeID3 = require("node-id3");
const { format, parse } = require("date-fns");

const artist = "Kindohm";

const getFileUpdatedDate = (path) => {
  const stats = fs.statSync(path);
  return stats.mtime;
};

const setTags = async (sketchMeta) => {
  
  return new Promise((resolve, reject) => {
    const rawNumber = sketchMeta.name; //DirName.substr(0, 4);
    // const rawDateString = sketchDirName.substr(5);
    // const baseFilePath = `${__dirname}/../mixes/${rawNumber}`;
    const mp3Path = `${__dirname}/../mixes/${rawNumber}.mp3`;
    const tidalPath = `${__dirname}/../patterns/${rawNumber}.tidal`;
    const code = fs.readFileSync(tidalPath, "utf8");
    const date = new Date(sketchMeta.date); // parse(rawDateString, "yyyy-MM-dd", new Date());
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

    console.log(mp3Path);

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
  // const sketchDirNames = fs.readdirSync(`${__dirname}/../sketches`);
  const patternsMetadata = require("./../data");
 

  console.log("mapping sketches");
  const promises = patternsMetadata
    .map((sketch) => setTags(sketch));
  const results = Promise.all(promises);

  console.log("done");
};

main();
