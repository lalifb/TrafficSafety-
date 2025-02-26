// Dark Mode Toggle
const themeToggle = document.querySelector(".theme-toggle");
const body = document.body;

themeToggle.addEventListener("click", () => {
  body.dataset.theme = body.dataset.theme === "dark" ? "light" : "dark";
  themeToggle.querySelector("i").classList.toggle("fa-moon");
  themeToggle.querySelector("i").classList.toggle("fa-sun");
  localStorage.setItem("theme", body.dataset.theme);
});

// Check saved theme preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  body.dataset.theme = savedTheme;
  if (savedTheme === "dark") {
    themeToggle.querySelector("i").classList.replace("fa-moon", "fa-sun");
  }
}

// Traffic Incidents Data (Example)
const incidents = [
  {
    type: "accident",
    location: "Highway 101, Mile 25",
    description: "Multiple vehicle collision",
    time: "2 mins ago",
  },
  {
    type: "roadwork",
    location: "Main Street",
    description: "Road maintenance in progress",
    time: "15 mins ago",
  },
];

// Populate Traffic Incidents
function populateIncidents() {
  const container = document.querySelector(".traffic-incidents");
  container.innerHTML = incidents
    .map(
      (incident) => `
        <div class="incident-card ${incident.type}">
            <h4>${
              incident.type.charAt(0).toUpperCase() + incident.type.slice(1)
            }</h4>
            <p>${incident.location}</p>
            <p>${incident.description}</p>
            <span class="time">${incident.time}</span>
        </div>
    `
    )
    .join("");
}

// Filter Buttons
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active").classList.remove("active");
    btn.classList.add("active");
    // Add filter functionality here
  });
});

// Voice Assistant
const voiceBtn = document.querySelector(".voice-btn");
let isListening = false;

voiceBtn.addEventListener("click", () => {
  if (!isListening) {
    // Start voice recognition
    voiceBtn.style.background = "#f44336";
    isListening = true;
    // Add voice recognition code here
  } else {
    // Stop voice recognition
    voiceBtn.style.background = "var(--primary-color)";
    isListening = false;
  }
});

// Form Submission
const reportForm = document.getElementById("incident-form");
reportForm.addEventListener("submit", (e) => {
  e.preventDefault();
  // Add form submission logic here
  alert("Incident reported successfully!");
  reportForm.reset();
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Initialize map (example using leaflet.js)
// Note: You'll need to include leaflet.js and its CSS in your HTML
function initMap() {
  if (typeof L !== "undefined") {
    const map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);
  }
}

// Call functions when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  populateIncidents();
  initMap();
});

// Speed Monitoring System
class SpeedMonitor {
  constructor() {
    this.currentSpeed = 0;
    this.speedLimit = 50;
    this.alertThreshold = 10;
    this.isAlerting = false;
    this.speedHistory = [];
    this.violations = [];

    this.initializeGeolocation();
    this.initializeSpeedChart();
    this.setupEventListeners();
  }

  initializeGeolocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          if (position.coords.speed !== null) {
            this.updateSpeed(position.coords.speed * 3.6); // Convert m/s to km/h
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );
    }
  }

  initializeSpeedChart() {
    const ctx = document.getElementById("speedChart").getContext("2d");
    this.speedChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Speed (km/h)",
            data: [],
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  updateSpeed(speed) {
    this.currentSpeed = Math.round(speed);
    this.updateSpeedDisplay();
    this.checkSpeedLimit();
    this.updateSpeedHistory();
  }

  updateSpeedDisplay() {
    const gaugeValue = document.querySelector(".gauge-value");
    gaugeValue.textContent = this.currentSpeed;

    // Update gauge color based on speed
    const speedGauge = document.querySelector(".speed-gauge");
    if (this.currentSpeed > this.speedLimit) {
      speedGauge.style.background = "var(--danger-color)";
    } else {
      speedGauge.style.background = "var(--primary-color)";
    }
  }

  checkSpeedLimit() {
    const exceedingBy =
      ((this.currentSpeed - this.speedLimit) / this.speedLimit) * 100;

    if (exceedingBy > this.alertThreshold) {
      this.triggerSpeedAlert();
    } else if (this.isAlerting) {
      this.stopSpeedAlert();
    }
  }

  triggerSpeedAlert() {
    if (!this.isAlerting) {
      this.isAlerting = true;

      // Visual alert
      if (document.getElementById("visualAlerts").checked) {
        document.querySelector(".speed-gauge").classList.add("speed-warning");
      }

      // Audio alert
      if (document.getElementById("audioAlerts").checked) {
        this.playAlertSound();
      }

      // Vibration alert
      if (
        document.getElementById("vibrationAlerts").checked &&
        navigator.vibrate
      ) {
        navigator.vibrate([200, 100, 200]);
      }

      // Record violation
      this.recordViolation();
    }
  }

  stopSpeedAlert() {
    this.isAlerting = false;
    document.querySelector(".speed-gauge").classList.remove("speed-warning");
  }

  playAlertSound() {
    const audio = new Audio("alert-sound.mp3");
    audio.play().catch((e) => console.log("Error playing sound:", e));
  }

  recordViolation() {
    const violation = {
      speed: this.currentSpeed,
      limit: this.speedLimit,
      timestamp: new Date(),
      location: "Current Location", // This should be replaced with actual location data
    };

    this.violations.unshift(violation);
    this.updateViolationsList();
  }

  updateViolationsList() {
    const container = document.querySelector(".violations-list");
    container.innerHTML = this.violations
      .slice(0, 5)
      .map(
        (v) => `
      <div class="violation-item ${
        v.speed >= this.speedLimit * 1.3 ? "severe" : ""
      }">
        <div class="violation-info">
          <strong>${v.speed} km/h</strong> in a ${v.limit} km/h zone
        </div>
        <div class="violation-time">
          ${this.formatTime(v.timestamp)}
        </div>
      </div>
    `
      )
      .join("");
  }

  updateSpeedHistory() {
    const timestamp = new Date().toLocaleTimeString();
    this.speedHistory.push({
      time: timestamp,
      speed: this.currentSpeed,
    });

    if (this.speedHistory.length > 20) {
      this.speedHistory.shift();
    }

    this.updateSpeedChart();
  }

  updateSpeedChart() {
    this.speedChart.data.labels = this.speedHistory.map((h) => h.time);
    this.speedChart.data.datasets[0].data = this.speedHistory.map(
      (h) => h.speed
    );
    this.speedChart.update();
  }

  formatTime(date) {
    return new Date(date).toLocaleTimeString();
  }

  setupEventListeners() {
    // Alert threshold slider
    document.getElementById("alertThreshold").addEventListener("input", (e) => {
      this.alertThreshold = parseInt(e.target.value);
      document.querySelector(
        ".threshold-value"
      ).textContent = `${this.alertThreshold}%`;
    });
  }
}

// Initialize speed monitor when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  const speedMonitor = new SpeedMonitor();
});
