
// const express = require("express");
// const cors = require("cors");
// const { exec, execSync } = require("child_process");

// const app = express();
// app.use(cors());

// // ✅ Install yt-dlp on Railway during startup
// try {
//   execSync("pip install yt-dlp", { stdio: "inherit" });
//   console.log("✅ yt-dlp installed successfully.");
// } catch (err) {
//   console.error("❌ Failed to install yt-dlp:", err.message);
// }

// // ✅ Root Route to prevent "Cannot GET /"
// app.get("/", (req, res) => {
//   res.send("✅ Server is running! Use /video-info with a URL parameter.");
// });

// // ✅ Video Info Route
// app.get("/video-info", async (req, res) => {
//   const videoUrl = req.query.url;
//   if (!videoUrl) {
//     return res.status(400).json({ error: "Missing video URL" });
//   }

//   const command = `yt-dlp -J ${videoUrl}`;

//   exec(command, (error, stdout, stderr) => {
//     if (error) {
//       console.error("❌ Error fetching video info:", error.message);
//       return res.status(500).json({ error: "Failed to fetch video details" });
//     }

//     try {
//       const data = JSON.parse(stdout);
//       if (!data.formats) {
//         return res.status(500).json({ error: "No formats found for this video" });
//       }

//       // ✅ Define allowed video resolutions
//       const allowedVideoResolutions = ["144p", "240p", "360p", "480p", "720p", "1080p"];

//       // ✅ Remove duplicate video formats
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

//       // ✅ Filter and sort audio formats
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
//       console.error("❌ Error parsing video info:", parseError.message);
//       res.status(500).json({ error: "Failed to parse video details" });
//     }
//   });
// });

// // ✅ Use Railway's assigned PORT
// const PORT = process.env.PORT || 5002;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


// const express = require("express");
// const cors = require("cors");
// const youtubedl = require("youtube-dl-exec");

// const app = express();
// app.use(cors());

// app.get("/", (req, res) => {
//   res.send("✅ Server is running! Use /video-info with a URL parameter.");
// });

// app.get("/video-info", async (req, res) => {
//   const videoUrl = req.query.url;
//   if (!videoUrl) {
//     return res.status(400).json({ error: "Invalid or missing video URL" });
//   }

//   try {
//     const data = await youtubedl(videoUrl, {
//       dumpSingleJson: true,
//       noCheckCertificates: true,
//       noWarnings: true,
//       preferFreeFormats: true,
//       addHeader: ["referer:youtube.com", "user-agent:googlebot"],
//     });

//     if (!data.formats) {
//       return res.status(500).json({ error: "No formats found for this video" });
//     }

//     // ✅ Allowed resolutions
//     const allowedResolutions = ["144p", "240p", "360p", "480p", "720p", "1080p"];

//     // ✅ Remove duplicate video formats and include audio in videos
//     const videoFormats = new Map();
//     const audioFormats = new Map();

//     data.formats.forEach((f) => {
//       if (f.url) {
//         if (f.vcodec !== "none" && f.acodec !== "none" && allowedResolutions.includes(f.format_note)) {
//           videoFormats.set(f.format_note, {
//             qualityLabel: f.format_note,
//             url: f.url,
//           });
//         } else if (f.vcodec === "none" && f.acodec !== "none" && f.abr) {
//           audioFormats.set(f.abr, {
//             qualityLabel: `${f.abr} kbps Audio`,
//             url: f.url,
//           });
//         }
//       }
//     });

//     res.json({
//       title: data.title,
//       thumbnails: data.thumbnails,
//       formats: [...videoFormats.values(), ...audioFormats.values()],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching video info:", error);
//     res.status(500).json({ error: "Failed to fetch video details" });
//   }
// });

// const PORT = process.env.PORT || 5002;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

 
const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// ✅ Root Route
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

  exec(command, (error, stdout) => {
    if (error) {
      console.error("❌ Error fetching video info:", error.message);
      return res.status(500).json({ error: "Failed to fetch video details" });
    }

    try {
      const data = JSON.parse(stdout);
      if (!data.formats) {
        return res.status(500).json({ error: "No formats found for this video" });
      }

      const allowedResolutions = ["144p", "240p", "360p", "480p", "720p", "1080p"];

      let videoFormats = [];
      let audioFormats = [];

      data.formats.forEach((f) => {
        if (f.url && f.vcodec !== "none" && f.format_note) {
          if (allowedResolutions.includes(f.format_note)) {
            videoFormats.push({
              qualityLabel: f.format_note,
              url: f.url,
              hasAudio: f.acodec !== "none",
              formatId: f.format_id,
            });
          }
        }

        if (f.url && f.vcodec === "none" && f.acodec !== "none" && f.abr) {
          audioFormats.push({
            qualityLabel: `${f.abr} kbps Audio`,
            url: f.url,
            formatId: f.format_id,
          });
        }
      });

      // ✅ Remove duplicate video formats
      const uniqueVideoFormats = Object.values(
        videoFormats.reduce((acc, f) => {
          acc[f.qualityLabel] = acc[f.qualityLabel] || f;
          return acc;
        }, {})
      );

      // ✅ Remove duplicate audio formats
      const uniqueAudioFormats = Object.values(
        audioFormats.reduce((acc, f) => {
          acc[f.qualityLabel] = acc[f.qualityLabel] || f;
          return acc;
        }, {})
      );

      // ✅ Mark videos that need merging
      const finalVideoFormats = uniqueVideoFormats.map((video) => {
        if (!video.hasAudio) {
          return { ...video, needsMerging: true };
        }
        return video;
      });

      res.json({
        title: data.title,
        thumbnails: data.thumbnails,
        formats: [...finalVideoFormats, ...uniqueAudioFormats],
      });
    } catch (parseError) {
      console.error("❌ Error parsing video info:", parseError.message);
      res.status(500).json({ error: "Failed to parse video details" });
    }
  });
});

// ✅ Merge & Download Video with Audio
app.get("/download", async (req, res) => {
  const { url, quality } = req.query;
  if (!url || !quality) {
    return res.status(400).json({ error: "Missing URL or quality parameter" });
  }

  const videoFile = path.join(__dirname, `video_${quality}.mp4`);
  const audioFile = path.join(__dirname, `audio_${quality}.m4a`);
  const outputFile = path.join(__dirname, `final_${quality}.mp4`);

  // ✅ Download video & audio separately
  const videoCommand = `yt-dlp -f "bestvideo[height=${quality}]+bestaudio" -o ${videoFile} ${url}`;
  const mergeCommand = `ffmpeg -i ${videoFile} -i ${audioFile} -c:v copy -c:a aac ${outputFile} -y`;

  exec(videoCommand, (error) => {
    if (error) {
      console.error("❌ Error downloading video:", error.message);
      return res.status(500).json({ error: "Failed to download video" });
    }

    exec(mergeCommand, (mergeError) => {
      if (mergeError) {
        console.error("❌ Error merging video and audio:", mergeError.message);
        return res.status(500).json({ error: "Failed to merge video and audio" });
      }

      res.download(outputFile, () => {
        fs.unlinkSync(videoFile);
        fs.unlinkSync(audioFile);
        fs.unlinkSync(outputFile);
      });
    });
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
