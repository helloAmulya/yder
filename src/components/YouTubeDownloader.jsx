import { useState, useEffect } from "react";

export default function YouTubeDownloader() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFetchDetails = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setProgress(0);

    try {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 90) {
            clearInterval(interval);
            return 90;
          }
          return oldProgress + 10;
        });
      }, 300);

      // const response = await fetch(
      //   `http://localhost:5002/video-info?url=${encodeURIComponent(url)}`
      // );
      const response = await fetch(
        `https://yder-production.up.railway.app/video-info?url=${encodeURIComponent(
          url
        )}`
      );

      const data = await response.json();

      clearInterval(interval);
      setProgress(100);

      if (data.error) {
        alert(data.error);
        return;
      }

      setVideoInfo(data);
    } catch (error) {
      console.error("Error fetching video details:", error);
      alert("Failed to fetch video details. Please try again.");
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <div className="flex flex-col items-center bg-black text-white p-4 min-h-screen relative font-grotesk">
      <div
        className="absolute top-4 left-4 text-3xl font-bold cursor-pointer"
        onClick={() => window.location.reload()}
      >
        <span className="text-red-500">Y</span>
        <span className="text-white">T</span>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center md:mt-10 mt-20">
        <h1
          className="text-3xl md:text-4xl font-bold mb-4 cursor-pointer"
          onClick={() => window.location.reload()}
        >
          YouTube Video Downloader
        </h1>
        <div className="w-full">
          <div className="flex flex-row space-x-2 items-center">
            <input
              type="text"
              placeholder="Enter YouTube URL"
              className="w-full p-2 h-10 rounded-md outline-none text-black"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              className="h-10 bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded whitespace-nowrap"
              onClick={handleFetchDetails}
            >
              Fetch Video
            </button>
          </div>

          {loading && (
            <div className="mt-2 text-center">
              <p className="text-green-400">Loading formats...</p>

              <div className="w-full bg-gray-700 h-1 mt-2 rounded overflow-hidden">
                <div
                  className="h-1 bg-blue-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
          <p className="mt-6 md:mt-6 text-center text-4xl md:text-5xl text-gray-600  w-full px-4">
            {`{ Open source, No ads, and Secure }`}
          </p>
        </div>
      </div>

      {videoInfo && (
        <div className="mt-4 p-4 bg-gray-800 rounded-md w-full max-w-2xl">
          <h2 className="text-2xl md:text-2xl font-semibold">
            {videoInfo.title}
          </h2>
          <img
            src={videoInfo.thumbnails[videoInfo.thumbnails.length - 1].url}
            alt="Thumbnail"
            className="w-full rounded mt-2"
          />

          <p className="mt-2 font-medium">Available Video Formats:</p>
          <ul className="mt-2 space-y-2">
            {videoInfo.formats
              .filter((f) => !f.qualityLabel.includes("Audio"))
              .map((format, index) => (
                <li
                  key={index}
                  className="flex justify-between bg-gray-700 p-2 rounded"
                >
                  <span>{format.qualityLabel}</span>
                  <a
                    href={format.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded"
                  >
                    Download
                  </a>
                </li>
              ))}
          </ul>

          <p className="mt-4 font-medium">Available Audio Formats:</p>
          <ul className="mt-2 space-y-2">
            {videoInfo.formats
              .filter(
                (f) =>
                  f.qualityLabel.includes("Audio") &&
                  !f.qualityLabel.includes("0 kbps")
              )
              .map((format, index) => (
                <li
                  key={index}
                  className="flex justify-between bg-gray-700 p-2 rounded"
                >
                  <span>{format.qualityLabel}</span>
                  <a
                    href={format.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-500 hover:bg-green-700 text-white px-2 py-1 rounded"
                  >
                    Download
                  </a>
                </li>
              ))}
          </ul>
        </div>
      )}

      <footer className="fixed bottom-0 left-0 w-full bg-black text-white py-2 px-4 flex justify-between items-center">
        <div className="text-lg font-bold">@yder</div>
        <div className="text-sm">Made with ❤️ </div>
        <div className="text-sm">India</div>
      </footer>
    </div>
  );
}
