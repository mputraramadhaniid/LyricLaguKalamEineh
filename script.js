document.addEventListener("DOMContentLoaded", function () {
  const lyricsElement = document.getElementById("lyrics");
  const audioElement = document.getElementById("audio");
  const rewindButton = document.getElementById("rewindButton");
  const nextButton = document.getElementById("nextButton");
  const playPauseButton = document.getElementById("playPauseButton");
  const playPauseIcon = document.getElementById("playPauseIcon");
  const seekBar = document.getElementById("seekBar");

  let currentIndex = 0;
  let lyricsWithTiming = [];

  // Function to change the displayed lyric
  function changeLyric() {
    if (currentIndex < lyricsWithTiming.length) {
      lyricsElement.textContent = lyricsWithTiming[currentIndex].lyric;
    }
  }

  // Function to handle time updates of the audio
  function handleTimeUpdate() {
    const currentTime = Math.floor(audioElement.currentTime);

    // Check if the current time matches the next lyric time
    if (currentIndex < lyricsWithTiming.length && currentTime === lyricsWithTiming[currentIndex].time) {
      changeLyric();
      currentIndex++;
    }

    // If the current time is less than the next lyric time, reset the index
    if (currentIndex > 0 && audioElement.currentTime < lyricsWithTiming[currentIndex - 1].time) {
      currentIndex = 0;
      while (currentIndex < lyricsWithTiming.length && lyricsWithTiming[currentIndex].time <= audioElement.currentTime) {
        currentIndex++;
      }
      changeLyric();
    }

    // Update the seek bar
    const value = (audioElement.currentTime / audioElement.duration) * 100;
    seekBar.value = value;
  }

  // Function to rewind the audio to a specific time
  function rewindToTime(rewindTime) {
    audioElement.currentTime = rewindTime;
    currentIndex = 0;
    while (currentIndex < lyricsWithTiming.length && lyricsWithTiming[currentIndex].time <= audioElement.currentTime) {
      currentIndex++;
    }
    changeLyric();
  }

  // Function to go to the next lyric
  function goToNextLyric() {
    audioElement.currentTime += 5; // Advance 5 seconds
    let nextLyricTime = audioElement.currentTime + 5;

    while (currentIndex < lyricsWithTiming.length - 1 && lyricsWithTiming[currentIndex + 1].time <= nextLyricTime) {
      currentIndex++;
    }

    changeLyric();
  }

  // Fetching lyrics from JSON file
  fetch("assets/lyrics.json")
    .then((response) => response.json())
    .then((data) => {
      lyricsWithTiming = data;
      initializeAudioControls();
    })
    .catch((error) => console.error("Error fetching lyrics:", error));

  // Function to initialize audio controls
  function initializeAudioControls() {
    audioElement.addEventListener("timeupdate", handleTimeUpdate);

    audioElement.addEventListener("ended", function () {
      currentIndex = 0;
      lyricsElement.textContent = "";
    });

    rewindButton.addEventListener("click", function () {
      rewindToTime(audioElement.currentTime - 5); // Rewind 5 seconds from current position
    });

    nextButton.addEventListener("click", function () {
      goToNextLyric();
    });

    playPauseButton.addEventListener("click", () => {
      if (audioElement.paused) {
        audioElement.play();
        playPauseIcon.textContent = "pause";
      } else {
        audioElement.pause();
        playPauseIcon.textContent = "play_arrow";
      }
    });

    // Seek functionality
    seekBar.addEventListener("input", () => {
      const seekTime = (seekBar.value / 100) * audioElement.duration;
      audioElement.currentTime = seekTime;
      currentIndex = 0;
      while (currentIndex < lyricsWithTiming.length && lyricsWithTiming[currentIndex].time <= audioElement.currentTime) {
        currentIndex++;
      }
      changeLyric(); // Update lyrics based on seek time
    });

    // Set the maximum value of the seek bar when metadata is loaded
    audioElement.addEventListener("loadedmetadata", () => {
      seekBar.max = 100; // Set the maximum value of the seek bar
    });
  }
});
