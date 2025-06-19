import React, { useState, useEffect } from "react";
import {
  Plus,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Trash2,
} from "lucide-react";

export default function DailyIdeasApp() {
  const [currentIdeas, setCurrentIdeas] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [allIdeas, setAllIdeas] = useState([]);
  const [pairedIdeas, setPairedIdeas] = useState([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(50);

  // Save data to memory storage
  const saveData = (ideas) => {
    window.dailyIdeasData = {
      ideas: ideas,
      lastUpdated: new Date().toISOString(),
    };
  };

  // Load data from memory storage
  const loadData = () => {
    if (window.dailyIdeasData && window.dailyIdeasData.ideas) {
      return window.dailyIdeasData.ideas;
    }
    return [];
  };

  // Initialize data on component mount
  useEffect(() => {
    const savedIdeas = loadData();
    setAllIdeas(savedIdeas);
  }, []);

  // Generate random pairings from all ideas
  const generatePairings = () => {
    if (allIdeas.length < 2) return [];

    const shuffled = [...allIdeas].sort(() => Math.random() - 0.5);
    const pairs = [];

    // Create pairs from shuffled ideas
    for (let i = 0; i < shuffled.length - 1; i += 2) {
      if (shuffled[i + 1]) {
        pairs.push(`${shuffled[i]} + ${shuffled[i + 1]}`);
      }
    }

    // If odd number of ideas, pair the last one with a random one from the beginning
    if (shuffled.length % 2 !== 0) {
      const lastIdea = shuffled[shuffled.length - 1];
      const randomIdea =
        shuffled[Math.floor(Math.random() * (shuffled.length - 1))];
      pairs.push(`${lastIdea} + ${randomIdea}`);
    }

    return pairs;
  };

  // Update current idea
  const updateIdea = (index, value) => {
    const newIdeas = [...currentIdeas];
    newIdeas[index] = value;
    setCurrentIdeas(newIdeas);
  };

  // Submit today's ideas
  const submitIdeas = () => {
    const validIdeas = currentIdeas.filter((idea) => idea.trim() !== "");
    if (validIdeas.length === 0) return;

    const newAllIdeas = [...allIdeas, ...validIdeas];
    setAllIdeas(newAllIdeas);
    saveData(newAllIdeas); // Save to persistent storage

    // Clear current ideas for next day
    setCurrentIdeas(["", "", "", "", "", "", "", "", "", ""]);

    // Generate new pairings
    const pairs = generatePairings();
    setPairedIdeas(pairs);
  };

  // Start/stop ticker
  const toggleTicker = () => {
    setIsScrolling(!isScrolling);
  };

  // Export ideas as JSON file
  const exportIdeas = () => {
    const dataStr = JSON.stringify(
      {
        ideas: allIdeas,
        exportDate: new Date().toISOString(),
        totalCount: allIdeas.length,
      },
      null,
      2
    );
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daily-ideas-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import ideas from JSON file
  const importIdeas = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.ideas && Array.isArray(data.ideas)) {
          const combinedIdeas = [...new Set([...allIdeas, ...data.ideas])]; // Remove duplicates
          setAllIdeas(combinedIdeas);
          saveData(combinedIdeas);
        }
      } catch (error) {
        alert("Error importing file. Please check the file format.");
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset file input
  };

  // Clear all ideas
  const clearAllIdeas = () => {
    if (
      confirm(
        "Are you sure you want to delete all ideas? This cannot be undone."
      )
    ) {
      setAllIdeas([]);
      setPairedIdeas([]);
      saveData([]);
    }
  };

  // Regenerate pairings
  const regeneratePairings = () => {
    const pairs = generatePairings();
    setPairedIdeas(pairs);
  };

  // Update allIdeas effect to save data
  useEffect(() => {
    if (allIdeas.length >= 2) {
      const pairs = generatePairings();
      setPairedIdeas(pairs);
    }
  }, [allIdeas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Daily Ideas Generator
        </h1>

        {/* Ticker Display */}
        {pairedIdeas.length > 0 && (
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 mb-8 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Idea Combinations
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={regeneratePairings}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Pairs
                </button>
                <button
                  onClick={toggleTicker}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
                >
                  {isScrolling ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isScrolling ? "Pause" : "Start"}
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden bg-black/50 rounded-lg h-16 flex items-center">
              <div
                className={`whitespace-nowrap text-lg font-medium text-green-400 ${
                  isScrolling ? "animate-scroll" : ""
                }`}
                style={{
                  animationDuration: `${scrollSpeed}s`,
                  animationIterationCount: "infinite",
                  animationTimingFunction: "linear",
                }}
              >
                {pairedIdeas.join(" • ")} • {pairedIdeas.join(" • ")}
              </div>
            </div>

            <div className="mt-2">
              <label className="text-white text-sm">
                Speed:
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Number(e.target.value))}
                  className="ml-2 w-24"
                />
              </label>
            </div>
          </div>
        )}

        {/* Ideas Input */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Today's 10 Ideas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentIdeas.map((idea, index) => (
              <div key={index} className="relative">
                <textarea
                  value={idea}
                  onChange={(e) => updateIdea(index, e.target.value)}
                  placeholder={`Idea ${index + 1}...`}
                  className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-20 text-sm"
                />
                <span className="absolute top-2 right-2 text-xs text-white/60">
                  {index + 1}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={submitIdeas}
            className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 mx-auto"
          >
            <Plus className="w-5 h-5" />
            Add Ideas to Collection
          </button>
        </div>

        {/* Stats and Data Management */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              Your Ideas Collection
            </h3>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".json"
                onChange={importIdeas}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </label>
              <button
                onClick={exportIdeas}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={clearAllIdeas}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-white">
                {allIdeas.length}
              </div>
              <div className="text-white/70 text-sm">Total Ideas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {pairedIdeas.length}
              </div>
              <div className="text-white/70 text-sm">Combinations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {currentIdeas.filter((idea) => idea.trim() !== "").length}
              </div>
              <div className="text-white/70 text-sm">Today's Ideas</div>
            </div>
          </div>

          {window.dailyIdeasData && window.dailyIdeasData.lastUpdated && (
            <div className="text-center mt-2 text-white/60 text-xs">
              Last updated:{" "}
              {new Date(window.dailyIdeasData.lastUpdated).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll {
          animation-name: scroll;
        }
      `}</style>
    </div>
  );
}
