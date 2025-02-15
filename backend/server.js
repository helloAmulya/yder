
// const express = require("express");
// const cors = require("cors");
// const { exec } = require("child_process");

// const app = express();
// app.use(cors());

// app.get("/video-info", async (req, res) => {
//   const videoUrl = req.query.url;
//   if (!videoUrl) {
//     return res.status(400).json({ error: "Missing video URL" });
//   }

//   const command = `yt-dlp -J ${videoUrl}`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error("Error fetching video info:", error.message);
//       return res.status(500).json({ error: "Failed to fetch video details" });
//     }

//     try {
//       const data = JSON.parse(stdout);
//       if (!data.formats) {
//         return res.status(500).json({ error: "No formats found for this video" });
//       }

//       // Define allowed video resolutions
//       const allowedVideoResolutions = ["144p", "240p", "360p", "480p", "720p", "1080p"];

//       // Remove duplicate video formats
//       const uniqueFormats = new Map();
//       data.formats.forEach((f) => {
//         if (f.url && allowedVideoResolutions.includes(f.format_note)) {
//           uniqueFormats.set(f.format_note, {
//             qualityLabel: f.format_note,
//             url: f.url,
//           });
//         }
//       });
//       const videoFormats = Array.from(uniqueFormats.values());

//       const uniqueAudioFormats = new Map();
//       data.formats
//         .filter((f) => f.url && f.vcodec === "none" && f.abr && f.abr > 0)
//         .sort((a, b) => b.abr - a.abr)
//         .forEach((f) => {
//           if (!uniqueAudioFormats.has(f.abr)) {
//             uniqueAudioFormats.set(f.abr, {
//               qualityLabel: `${f.abr} kbps Audio`,
//               url: f.url,
//             });
//           }
//         });

//       const audioFormats = Array.from(uniqueAudioFormats.values());

//       res.json({
//         title: data.title,
//         thumbnails: data.thumbnails,
//         formats: [...videoFormats, ...audioFormats],
//       });

//     } catch (parseError) {
//       console.error("Error parsing video info:", parseError.message);
//       res.status(500).json({ error: "Failed to parse video details" });
//     }
//   });
// });


// const PORT = process.env.PORT || 5002;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
// // const PORT = 5002;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require("express");
const cors = require("cors");
const { exec, execSync } = require("child_process");

const app = express();
app.use(cors());

// ✅ Install yt-dlp on Railway during startup
try {
  execSync("pip install yt-dlp", { stdio: "inherit" });
  console.log("✅ yt-dlp installed successfully.");
} catch (err) {
  console.error("❌ Failed to install yt-dlp:", err.message);
}

// ✅ Root Route to prevent "Cannot GET /"
app.get("/", (req, res) => {
  res.send("✅ Server is running! Use /video-info with a URL parameter.");
});

// ✅ Video Info Route
app.get("/video-info", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "Missing video URL" });
  }

  const command = `yt-dlp -J ${videoUrl}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Error fetching video info:", error.message);
      return res.status(500).json({ error: "Failed to fetch video details" });
    }

    try {
      const data = JSON.parse(stdout);
      if (!data.formats) {
        return res.status(500).json({ error: "No formats found for this video" });
      }

      // ✅ Define allowed video resolutions
      const allowedVideoResolutions = ["144p", "240p", "360p", "480p", "720p", "1080p"];

      // ✅ Remove duplicate video formats
      const uniqueFormats = new Map();
      data.formats.forEach((f) => {
        if (f.url && allowedVideoResolutions.includes(f.format_note)) {
          uniqueFormats.set(f.format_note, {
            qualityLabel: f.format_note,
            url: f.url,
          });
        }
      });
      const videoFormats = Array.from(uniqueFormats.values());

      // ✅ Filter and sort audio formats
      const uniqueAudioFormats = new Map();
      data.formats
        .filter((f) => f.url && f.vcodec === "none" && f.abr && f.abr > 0)
        .sort((a, b) => b.abr - a.abr)
        .forEach((f) => {
          if (!uniqueAudioFormats.has(f.abr)) {
            uniqueAudioFormats.set(f.abr, {
              qualityLabel: `${f.abr} kbps Audio`,
              url: f.url,
            });
          }
        });

      const audioFormats = Array.from(uniqueAudioFormats.values());

      res.json({
        title: data.title,
        thumbnails: data.thumbnails,
        formats: [...videoFormats, ...audioFormats],
      });

    } catch (parseError) {
      console.error("❌ Error parsing video info:", parseError.message);
      res.status(500).json({ error: "Failed to parse video details" });
    }
  });
});

// ✅ Use Railway's assigned PORT
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
