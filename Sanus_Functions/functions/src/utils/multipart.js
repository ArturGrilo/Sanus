const busboy = require("busboy");

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const bb = busboy({headers: req.headers});
    const fields = {};
    let file = null;

    let fileDone = true;

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      if (String(name) !== "file") {
        stream.resume();
        return;
      }

      fileDone = false;

      const filename = info && info.filename ? info.filename : "";
      const mimeType = info && info.mimeType ? info.mimeType : "";

      const chunks = [];
      let size = 0;

      stream.on("data", (d) => {
        size += d.length;
        chunks.push(d);
      });

      stream.on("end", () => {
        file = {
          filename,
          mimeType,
          size,
          buffer: Buffer.concat(chunks),
        };
        fileDone = true;
      });

      stream.on("error", (err) => {
        fileDone = true;
        reject(err);
      });
    });

    bb.on("finish", () => {
      const wait = () => {
        if (fileDone) return resolve({fields, file});
        setTimeout(wait, 10);
      };
      wait();
    });

    bb.on("error", (err) => reject(err));

    if (req.rawBody && Buffer.isBuffer(req.rawBody)) {
      bb.end(req.rawBody);
      return;
    }

    req.pipe(bb);
  });
}

module.exports = {parseMultipart};