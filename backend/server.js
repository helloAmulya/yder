
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
//             url: f.url
//           });
//         }
//       });
//       const videoFormats = Array.from(uniqueFormats.values());

//       // Extract audio formats
//       const audioFormats = data.formats
//         .filter(f => f.url && f.vcodec === "none") // Ensure it's audio-only
//         .sort((a, b) => (b.abr || 0) - (a.abr || 0)) // Sort by audio bitrate (best quality first)
//         .map(f => ({
//           qualityLabel: `${f.abr} kbps Audio`,
//           url: f.url
//         }));

//       if (audioFormats.length === 0) {
//         console.warn("No audio formats found, checking alternative extraction...");
//       }

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

// const PORT = 5002;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(cors());

app.get("/video-info", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: "Missing video URL" });
  }

  const command = `yt-dlp -J ${videoUrl}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error("Error fetching video info:", error.message);
      return res.status(500).json({ error: "Failed to fetch video details" });
    }

    try {
      const data = JSON.parse(stdout);
      if (!data.formats) {
        return res.status(500).json({ error: "No formats found for this video" });
      }

      // Define allowed video resolutions
      const allowedVideoResolutions = ["144p", "240p", "360p", "480p", "720p", "1080p"];

      // Remove duplicate video formats
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

      // Extract unique audio formats, remove duplicates & invalid bitrates
      const uniqueAudioFormats = new Map();
      data.formats
        .filter((f) => f.url && f.vcodec === "none" && f.abr && f.abr > 0) // Ensure valid audio
        .sort((a, b) => b.abr - a.abr) // Sort by bitrate (best first)
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
      console.error("Error parsing video info:", parseError.message);
      res.status(500).json({ error: "Failed to parse video details" });
    }
  });
});

const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
