//for responsive navbar
function showSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "flex";
}
function hideSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = "none";
}

// for map
const map = L.map("map").setView([27.7293, 85.3343], 8); // Initializes map
const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map); // Adds OpenStreetMap layer to map

const googleStreets = L.tileLayer(
  "http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}",
  {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  }
).addTo(map);

// Adding layers to the map
const baseMaps = {
  OpenStreetMap: osm,
  "Google Streets": googleStreets,
};

const layerControl = L.control.layers(baseMaps).addTo(map);

// Leaflet current location
L.control.locate().addTo(map);

// Fullscreen view
let mapid = document.getElementById("map");

function fullScreenView() {
  mapid.requestFullscreen();
}

// Leaflet search bar
L.Control.geocoder().addTo(map);

let userLocation = null;
let routingControl = null;

// Function to get the user's current location
function getCurrentLocation(callback) {
  if (userLocation) {
    callback(userLocation);
  } else {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        userLocation = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        callback(userLocation);
      },
      function (error) {
        console.error("Error:", error);
        alert("Failed to get your current location.");
      }
    );
  }
}

// Define an array to store EV charging station markers
const evChargingStations = [];

// Adding JSON data to the map
const jsonData = [
  {
    name: "Hundai Service (L I Auto Service)",
    city: "Kathmandu",
    province: "3",
    address: "Hundai service, kupondole",
    telephone: "01-5550380",
    type: ["car"],
    latitude: "27.690739168677144",
    longitude: "85.31152580415048",
    plugs: [
      {
        plug: "type1",
        power: "7.2Kw",
        typeplug: "DC",
      },
    ],
    amenities: ["wifi", "parking", "restroom"],
  },
  {
    name: "Hyundai Sales/Service Tinkune",
    city: "Kathmandu",
    province: "3",
    address: "Hyundai Sales/Service Tinkune",
    telephone: "+97714111891",
    type: ["car"],
    latitude: "27.69166081858411",
    longitude: "85.31175442397266",
    plugs: [
      {
        plug: "type2",
        power: "7.2Kw",
        typeplug: "DC",
      },
    ],
  },
  {
    name: "Hotel Barahi",
    city: "Pokhara",
    province: "3",
    address: "Lakeside Rd 6",
    telephone: "61460617",
    type: ["car"],
    latitude: "28.20833041093028",
    longitude: "83.95804772177283",
    plugs: [
      {
        plug: "type2",
        power: "7.2Kw",
        typeplug: "AC",
      },
    ],
    amenities: [
      "wifi",
      "parking",
      "food",
      "coffee",
      "accomodation",
      "restroom",
    ],
  },
];

jsonData.forEach((station) => {
  let popupContent = `
    <h2>${station.name}</h2>
    <p>${station.address}, ${station.city}</p>
    <p>Phone: ${station.telephone}</p>
    <p>Type: ${station.type.join(", ")}</p>
  `;

  if (station.plugs && station.plugs.length > 0) {
    popupContent += `<p>Plugs:</p><ul>`;
    station.plugs.forEach((plug) => {
      popupContent += `<li>${plug.plug} - ${plug.power}</li>`;
    });
    popupContent += `</ul>`;
  }

  if (station.amenities && station.amenities.length > 0) {
    popupContent += `<p>Amenities: ${station.amenities.join(", ")}</p>`;
  }

  popupContent += `<a href="bookslot.html"><form action="/goToSlotBooking" method="POST"><button onclick="bookEvStation('${station.name}')">Book EV Station</button></form> ></a>`;

  const stationMarker = L.marker([station.latitude, station.longitude], {
    title: station.name,
    draggable: false,
  }).bindPopup(popupContent);

  stationMarker.addTo(map);

  // Add click event listener to open popup
  stationMarker.on("click", function () {
    this.openPopup();
  });

  evChargingStations.push(stationMarker);
});

// Function to search for nearest EV station from the user's current location
function searchNearestEvStation() {
  getCurrentLocation(function (location) {
    const userLat = location.latitude;
    const userLon = location.longitude;

    // Calculate distances to each EV charging station
    let nearestMarker = null;
    let nearestDistance = Infinity;
    evChargingStations.forEach((station) => {
      const stationLatLon = station.getLatLng();
      const stationLat = stationLatLon.lat;
      const stationLon = stationLatLon.lng;
      const distance = Math.sqrt(
        Math.pow(userLat - stationLat, 2) + Math.pow(userLon - stationLon, 2)
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestMarker = station;
      }
    });

    if (nearestMarker) {
      const nearestLatLon = nearestMarker.getLatLng();
      const nearestLat = nearestLatLon.lat;
      const nearestLon = nearestLatLon.lng;

      // Remove previous route, if any
      if (routingControl !== null) {
        map.removeControl(routingControl);
        routingControl = null; // Set routingControl to null after removing
      }

      // Display route to the selected EV station
      routingControl = L.Routing.control({
        waypoints: [
          L.latLng(userLat, userLon), // User's current location
          L.latLng(nearestLat, nearestLon), // Selected EV station location
        ],
        routeWhileDragging: true, // Show route while dragging waypoints
        show: true, // Show route initially
        router: L.Routing.osrmv1({
          serviceUrl: "http://router.project-osrm.org/route/v1", // OSRM service URL
        }),
      }).addTo(map);

      // Open the popup for the nearest marker
      nearestMarker.openPopup();
    } else {
      alert("No EV charging station found near your location.");
    }
  });
}

// Event listener for clicking on EV station markers
evChargingStations.forEach((marker) => {
  marker.on("click", function () {
    displayRouteToEvStation(marker);
  });
});

function displayRouteToEvStation(marker) {
  getCurrentLocation(function (location) {
    const userLat = location.latitude;
    const userLon = location.longitude;

    // Remove previous route, if any
    if (routingControl !== null) {
      map.removeControl(routingControl);
      routingControl = null; // Set routingControl to null after removing
    }

    const markerLatLon = marker.getLatLng();
    const markerLat = markerLatLon.lat;
    const markerLon = markerLatLon.lng;

    // Display route to the selected EV station
    routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLon), // User's current location
        L.latLng(markerLat, markerLon), // Selected EV station location
      ],
      routeWhileDragging: true, // Show route while dragging waypoints
      show: true, // Show route initially
      router: L.Routing.osrmv1({
        serviceUrl: "http://router.project-osrm.org/route/v1", // OSRM service URL
      }),
    }).addTo(map);

    marker.openPopup();
  });
}

// Function to handle booking an EV station
// function bookEvStation(stationName) {
//   // alert(`You have booked the EV station: ${stationName}`);
//   // Here you can add more functionality, such as making an API call to book the station.
// }

// Update the cached location when the locate control is used
map.on("locationfound", function (e) {
  userLocation = {
    latitude: e.latitude,
    longitude: e.longitude,
  };
});

// Function to toggle filter modal
function toggleFilterModal() {
  const filterModal = document.getElementById("filterModal");
  filterModal.classList.toggle("active");
}

// Function to filter stations based on criteria
let filterCriteria = {
  type: null,
  plug: null,
  current: null,
};

function filterStations(criteria) {
  switch (criteria) {
    case "car":
    case "bike":
      filterCriteria.type = criteria;
      break;
    case "type1":
    case "type2":
      filterCriteria.plug = criteria;
      break;
    case "ac":
    case "dc":
      filterCriteria.current = criteria;
      break;
  }

  evChargingStations.forEach((marker) => {
    const station = jsonData.find(
      (station) => station.name === marker.options.title
    );

    if (station) {
      const matchesType = filterCriteria.type
        ? station.type.includes(filterCriteria.type)
        : true;
      const matchesPlug = filterCriteria.plug
        ? station.plugs.some((plug) => plug.plug === filterCriteria.plug)
        : true;
      const matchesCurrent = filterCriteria.current
        ? station.plugs.some(
            (plug) => plug.typeplug.toLowerCase() === filterCriteria.current
          )
        : true;

      if (matchesType && matchesPlug && matchesCurrent) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    }
  });
}

function resetFilters() {
  filterCriteria = {
    type: null,
    plug: null,
    current: null,
  };
  evChargingStations.forEach((marker) => {
    marker.addTo(map);
  });
}

// for blog section

function showMore(blogId) {
  const blogPost = document.getElementById(blogId);
  const moreContent = blogPost.querySelector(".more-content");
  moreContent.style.display = "block";

  //document.querySelector('.overlay').style.display = 'block';
  //document.querySelector("main").style.filter = "blur(5px)";
}

function hideMore() {
  const moreContent = document.querySelectorAll(".more-content");
  moreContent.forEach((content) => (content.style.display = "none"));
  document.querySelector(".overlay").style.display = "none";
  document.querySelector("main").style.filter = "none";
}

const wrapper = document.querySelector(".wrapper");
const carousel = document.querySelector(".carousel");
const firstCardWidth = carousel.querySelector(".card").offsetWidth;
const arrowBtns = document.querySelectorAll(".wrapper i");
const carouselChildrens = [...carousel.children];

let isDragging = false,
  isAutoPlay = true,
  startX,
  startScrollLeft,
  timeoutId;

// Get the number of cards that can fit in the carousel at once
let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

// Insert copies of the last few cards to beginning of carousel for infinite scrolling
carouselChildrens
  .slice(-cardPerView)
  .reverse()
  .forEach((card) => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
  });

// Insert copies of the first few cards to end of carousel for infinite scrolling
carouselChildrens.slice(0, cardPerView).forEach((card) => {
  carousel.insertAdjacentHTML("beforeend", card.outerHTML);
});

// Scroll the carousel at appropriate postition to hide first few duplicate cards on Firefox
carousel.classList.add("no-transition");
carousel.scrollLeft = carousel.offsetWidth;
carousel.classList.remove("no-transition");

// Add event listeners for the arrow buttons to scroll the carousel left and right
arrowBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth;
  });
});

const dragStart = (e) => {
  isDragging = true;
  carousel.classList.add("dragging");
  // Records the initial cursor and scroll position of the carousel
  startX = e.pageX;
  startScrollLeft = carousel.scrollLeft;
};

const dragging = (e) => {
  if (!isDragging) return; // if isDragging is false return from here
  // Updates the scroll position of the carousel based on the cursor movement
  carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
};

const dragStop = () => {
  isDragging = false;
  carousel.classList.remove("dragging");
};

const infiniteScroll = () => {
  // If the carousel is at the beginning, scroll to the end
  if (carousel.scrollLeft === 0) {
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.scrollWidth - 2 * carousel.offsetWidth;
    carousel.classList.remove("no-transition");
  }
  // If the carousel is at the end, scroll to the beginning
  else if (
    Math.ceil(carousel.scrollLeft) ===
    carousel.scrollWidth - carousel.offsetWidth
  ) {
    carousel.classList.add("no-transition");
    carousel.scrollLeft = carousel.offsetWidth;
    carousel.classList.remove("no-transition");
  }

  // Clear existing timeout & start autoplay if mouse is not hovering over carousel
  clearTimeout(timeoutId);
  if (!wrapper.matches(":hover")) autoPlay();
};

const autoPlay = () => {
  if (window.innerWidth < 800 || !isAutoPlay) return; // Return if window is smaller than 800 or isAutoPlay is false
  // Autoplay the carousel after every 2500 ms
  timeoutId = setTimeout(() => (carousel.scrollLeft += firstCardWidth), 2500);
};
autoPlay();

carousel.addEventListener("mousedown", dragStart);
carousel.addEventListener("mousemove", dragging);
document.addEventListener("mouseup", dragStop);
carousel.addEventListener("scroll", infiniteScroll);
wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
wrapper.addEventListener("mouseleave", autoPlay);
