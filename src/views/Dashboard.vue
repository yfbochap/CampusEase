<template>
  <br>
  <div class="container-fluid maincon">
    <div id="eventMapTitle">

    </div>
    <div class="row d-flex justify-content-center">
      <button
      class="col-3 btn viewbutton"
      :class="{ active: view === 'other' }"
      v-on:click="switchView('otherView')"
      >All Events</button>
      <!-- <div class="col-1"></div> -->
      <button
      class="col-3 btn viewbutton"
      :class="{ active: view === 'map' }"
      v-on:click="switchView('mapView')"
      >Map View</button>
    </div>

    <!-- All Events View -->
    <div v-if="view === 'other'" class="mt-2 mb-2">
        <h1 class="category-title">Events</h1>
        </div>
    <!-- </div> -->

    <!-- Map View -->
    <div v-else>
      <div id="mapDimensions">
        <div id="map"></div>
      </div>

      <div class="container-fluid mt-5">
      <h1 class="text-center">Events Around SMU</h1>

        <!-- Carousel -->
        <div id="carouselMap" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
            <div class="carousel-item" :class="{ active: index === activeIndex}" v-for="(eventGroup, index) in groupedEvents":key="index">
                <div class="row d-flex justify-content-center">
                  <div class="col-sm-8 col-md-5 col-lg-3 align-items-stretch" v-for="event in eventGroup" :key="event.id">

                    <!-- Cards -->
                    <div class="card mb-4">
                      <div class="card-body d-flex flex-column">
                        <router-link v-if= "event.id != 0" :to="{name: 'event', params: { id: event.id, name: event.event_name}}" class="event-link">
                          <img class="event-image" :src=getPhotoURL(event) alt="Event Image">
                        </router-link>
                        <div class="d-flex justify-content-center align-center" v-if='user_id != null'>
                          <HeartIcon v-if= "event.id != 0"  :isLiked="isLiked(event)" :eventId="event.id" :userId="user_id" @toggle-like="toggleLikeStatus"/> 
                          <span v-if= "event.id != 0" >
                            {{ eventLikes[event.id] || 0 }} People Liked
                          </span>
                        </div>
                        <router-link :to="{name: 'event', params: { id: event.id , name: event.event_name }}" class="event-link">
                          <h4 class="card-title">{{ event.event_name }}</h4>
                          <hr v-if= "event.id != 0" >
                          <h6>{{ getDates(event.start_date_time,event.end_date_time) }}</h6>
                          <h6>{{  getTime(event.start_date_time, event.end_date_time) }}</h6>
                          <h6 class="card-subtitle">{{ event.location_short }}</h6>
                        </router-link>
                      </div>
                    </div>

                  </div>
                </div>
            </div>
            </div>
    
            <!-- Carousel controls -->
            <button class="carousel-control-prev" @click ="changeSlide('prev')" type="button" data-bs-target="#carouselMap" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
            </button>

            <button class="carousel-control-next" type="button" @click ="changeSlide('next')"  data-bs-target="#carouselMap" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
            </button>
        </div>
      </div>
  </div>

  <!-- Search Function -->
  <div>
      <div>
        <div class="d-flex flex-column align-items-center">
          <!-- Search Bar Row -->
          <div class="search-bar-row d-flex justify-content-center align-items-center w-100">
            <i class="bx bx-search" style="font-size: 20px; margin-right: 8px;"></i>
            <input
              id="searchbar"
              class="i"
              v-model="searchTerm"
              @input="searchForEvents"
              type="text"
              placeholder="Search by Event or Organisation..."
              aria-label="Search"
              autocomplete="off"
            />
          </div>

          <!-- Category Buttons Row -->
          <div class="category-buttons-row d-flex flex-wrap justify-content-center mt-2">
            <button type="button" class="btn btn-secondary btn-pill all" :class="{ active: selectedCategory === 'All' }" @click="selectCategory('All')">All</button>
            <button type="button" class="btn btn-secondary btn-pill academic" :class="{ active: selectedCategory === 'Academic' }" @click="selectCategory('Academic')">Academic</button>
            <button type="button" class="btn btn-secondary btn-pill sports" :class="{ active: selectedCategory === 'Sports' }" @click="selectCategory('Sports')">Sports</button>
            <button type="button" class="btn btn-secondary btn-pill arts" :class="{ active: selectedCategory === 'Arts' }" @click="selectCategory('Arts')">Arts</button>
            <button type="button" class="btn btn-secondary btn-pill networking" :class="{ active: selectedCategory === 'Networking' }" @click="selectCategory('Networking')">Networking</button>
            <button type="button" class="btn btn-secondary btn-pill charity" :class="{ active: selectedCategory === 'Charity' }" @click="selectCategory('Charity')">Charity</button>
            <button type="button" class="btn btn-secondary btn-pill community" :class="{ active: selectedCategory === 'Community' }" @click="selectCategory('Community')">Community</button>
            <button type="button" class="btn btn-secondary btn-pill welfare" :class="{ active: selectedCategory === 'Welfare' }" @click="selectCategory('Welfare')">Welfare</button>
          </div>
        </div>
          <br>
          <div>
              <div>
                  <h1 class="category-title">
                      {{ selectedCategory }} Events Around Campus
                  </h1>
                  <div v-if="searchedEvents.length != 0" class="row d-flex p-5 justify-content-center">
                    <!-- <transition-group name="fade" tag="div" class="row"> -->
                        <div class="col-sm-8 col-md-4 col-lg-3 align-items-stretch fade-item" v-for="(event,index) in searchedEvents" :key="event.id">
                            <div class="card mb-4 fade-item">
                                <div class="card-body d-flex flex-column">
                                  <router-link :to="{name: 'event', params: {id: event.id, name:event.event_name} }" class="event-link">
                                    <img class="event-image" :src=getPhotoURL(event) alt="Event Image"/>
                                  </router-link>
                                    <div class="d-flex justify-content-center align-center" v-if='user_id != null'>
                                      <HeartIcon :isLiked="isLiked(event)" :eventId="event.id" :userId="user_id" @toggle-like="toggleLikeStatus"/> 
                                      <span>
                                          {{ eventLikes[event.id] || 0 }} People Liked
                                      </span>
                                    </div>
                                    <router-link :to="{name: 'event', params: {id: event.id, name:event.event_name} }" class="event-link">
                                      <h4 class="card-title" style="cursor: pointer;">{{ event.event_name }}</h4>
                                      <hr>
                                      <h6>{{ getDates(event.start_date_time,event.end_date_time) }}</h6>
                                      <h6>{{ getTime(event.start_date_time,event.end_date_time) }}</h6>
                                      <h6 class="card-subtitle ">{{ event.location_short}}</h6>
                                      <h6 class="card-subtitle" style="font-weight: bold">Organiser: {{ event.organisation}}</h6>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                      <!-- </transition-group> -->
                  </div>
                  <div class="p-5" v-else>
                    <h1 style="text-align: center;height: 200px;">There are currently no events matching your search</h1> <!-- to tell that there are no events happening according to search -->
                  </div>
              </div>
          </div>
      </div>
  </div>
</div>
</template>

<script>
  import { getEvents } from '../../utils/supabaseRequests.js';
  import { searchEvents, checkUserLike, addUserLike, removeUserLike, getLikedUsersByEvents} from '../../utils/supabaseRequests.js';
  import { supabase } from '../../utils/supabaseClient.js';
  import { useUserStore } from '@/stores/counter.ts';
  import HeartIcon from '@/components/HeartIcon.vue';

  export default {
    data() {
      return {
        view: "other", //
        events: [], //change this to change events shown on the carousel 
        all_events: [], // keeping track of all events shown
        numEventsGroup: 3,
        selectedEvent: null, // Variable to hold the selected event details
        map:null, // Google Map holder
        debounceTimeout: null,
        searchTerm: "", //Search term input by user
        searchedEvents: [],
        selectedCategory: "All",
        likedEvents: [],
        user_id: '',
        event_id: '',
        eventLikes: {},
        activeIndex: 0,
      };
    },

  components: {
    HeartIcon
  },

  watch: {
    // Watch the groupedEvents to reset activeIndex to 0 when the events update
    groupedEvents(newVal) {
        this.activeIndex = 0; // Reset to the first carousel item
    },
  },


  computed: {
  groupedEvents() {
    const num = this.numEventsGroup; // Group events by numEventsGroup (3 by default)
    return this.events.reduce((acc, event, index) => {
      const groupIndex = Math.floor(index / num);
      if (!acc[groupIndex]) acc[groupIndex] = [];
      acc[groupIndex].push(event);
      console.log("Filted events: " ,acc)
      return acc;
    }, []);
  },
},
  async created() {
      this.fetchEvents();
      this.getUserID();
      this.fetchLikedEvents();
  },

  beforeDestroy() {
    if (this.map) {
      google.maps.event.clearListeners(this.map, 'bounds_changed');
      google.maps.event.clearListeners(this.map, 'zoom_changed');
    }
  },

  methods: {
      // Like Functionality
      preloadImages() {
        const images = this.all_events.map(event => {
          return this.getPhotoURL(event); // This will generate the URLs for the images
        });

        images.forEach((imageUrl) => {
          const img = new Image();
          img.src = imageUrl; // Preload image by setting the source
        });
      },

      async fetchLikedEvents(){
        try{
          console.log("Checking Profile ID: ", this.user_id)
          this.likedEvents = await checkUserLike(this.user_id);
          console.log("Liked Events: ", this.likedEvents);
        } catch(error){
          console.error("Error fetching liked events:", error);
        }
      },
      isLiked(event){
        return this.likedEvents.includes(event.id);
      },
      async toggleLikeStatus(event){
        console.log('Toggling Like for event:', event);
        const eventId = event;
        const isLiked = this.likedEvents.includes(eventId);

        try{
          console.log("Event ID: ", eventId);
          console.log("Profile ID: ", this.user_id);
          if(isLiked){
            this.eventLikes[eventId]--
            console.log(this.eventLikes[eventId])
            await removeUserLike(eventId, this.user_id);
            this.likedEvents = this.likedEvents.filter(id => id !== eventId);
          }
          else{
            if (this.eventLikes[eventId]) {
              this.eventLikes[eventId]++;
            } else {
              this.eventLikes[eventId] = 1
            }
            await addUserLike(eventId, this.user_id);
            this.likedEvents = [...this.likedEvents, eventId];
          }
        } catch (error){
          console.error("Error toggling like:", error);
        }
      },
      // View related functions:
      switchView(button_pressed){
          if(this.view === "other" && button_pressed === "mapView"){
              this.view = "map"
              this.initMap()
              console.log("Map View")  
            
          }else if (this.view === "map" && button_pressed === "otherView"){
              this.fetchEvents()
              this.view = "other"
              console.log("Other View")  
          }
      },

      

      // Card related functions:
      setNumEventsGroup() { //change number of cards displayed due to different breakpoints 
          const width = window.innerWidth;
          if (width >= 992) {
              this.numEventsGroup = 3; // Large 
          } else if (width >= 768) {
              this.numEventsGroup = 2; // Medium 
          } else {
              this.numEventsGroup = 1; // Small 
          } 
      },
        changeSlide(direction) {
          if (direction === 'prev') {
            if (this.activeIndex > 0) {
              this.activeIndex = this.activeIndex - 1;
            } else {
              this.activeIndex = this.groupedEvents.length - 1;
            }
          } 
          else if (direction === 'next') {
            if (this.activeIndex < this.groupedEvents.length - 1) {
              this.activeIndex = this.activeIndex + 1;
            } else {
              this.activeIndex = 0;
            }
          }
        },

      // Event fetching related functions:
      async fetchEvents() { // fetch events from database and sort according to date --> needs to run on initialisation
          try {
              const fetchedEvents = await getEvents();
              this.all_events = fetchedEvents;
              // console.log("All Events:", this.all_events); 
              this.all_events.sort((a, b) => new Date(a.start_date_time) - new Date(b.start_date_time)); // sort events based on start time
              this.preloadImages();
              return fetchedEvents;
          } catch (error) {
              console.error("Error fetching events:", error);
          }
      },

      // All Events View related functions:
      async searchForEvents() {
    // Fetch events by search term for both event name and organization
    const data = await searchEvents('event_name', this.searchTerm);
    const data1 = await searchEvents('organisation', this.searchTerm);
    
    // Combine both datasets and remove duplicates based on `event.id`
    const combinedData = [...data, ...data1];
    const uniqueEvents = Array.from(new Map(combinedData.map(event => [event.id, event])).values());
    console.log(uniqueEvents)

    // Filter unique events by category and search term
    const category = this.selectedCategory;
    let events_criteria = uniqueEvents.filter(event => 
        (category === "All" || event.event_type === category)
    );

    // Sort events by start time and assign to `searchedEvents`
    return this.searchedEvents = events_criteria.sort((a, b) => 
        new Date(a.start_date_time) - new Date(b.start_date_time)
    );
},

      selectCategory(category){ //update category selected and call search for events
          this.selectedCategory = category
          this.searchForEvents()
      },

      getDates(start, end) {
        if (start == "" && end == ""){
          return ""
        }
        const formatDate = (isoString) => {
          const date = new Date(isoString.substring(0, 10));
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${date.getDate()} ${months[date.getMonth()]} ${String(date.getFullYear()).substring(2)} (${days[date.getDay()]})`;
        };
        const displayedStartDate = formatDate(start);
        const displayedEndDate = formatDate(end);
        return displayedStartDate === displayedEndDate ? displayedStartDate : `${displayedStartDate} - ${displayedEndDate}`;
      },
    getTime(start, end) {
      if (start == "" && end == ""){
        return ""
      }
      const formatTime = (isoString) => {
        const [hour, minute] = isoString.substring(11, 16).split(':').map(Number);
        const period = hour >= 12 ? 'pm' : 'am';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minute.toString().padStart(2, '0')}${period}`;
      };
      const startTimeFormatted = formatTime(start);
      const endTimeFormatted = formatTime(end);
      return `${startTimeFormatted} - ${endTimeFormatted}`;
    },
          
      getPhotoURL(event){
          // console.log(event)
          const { data, error } = supabase.storage.from('eventPhotos').getPublicUrl(event.thumbnail);
          if (error) {
              console.error('Error fetching public URL for', event.photos, error);
          } else {
          return data.publicUrl;
          }

      },

      async getNumberOfLikes() {
        this.eventLikes = {}
        try {
          const events = await getLikedUsersByEvents();
          console.log(events)
          events.forEach(participant => {
          const eventId = participant.event_id;
          if (this.eventLikes[eventId]) {
            this.eventLikes[eventId]++;
          } else {
            this.eventLikes[eventId] = 1
          }
        });
        } catch (error) {
          console.error("Error fetching number of particiants:", error);
        }
        console.log(this.eventLikes)
      },



      // Map View related functions:
      async  initMap() { // map initialisation data, including getting centerpoint, marker placement and debouncing 
          const position = { lat: 1.2963, lng: 103.8502 };
          const { Map } = await google.maps.importLibrary("maps");
          // const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

          this.map = new Map(document.getElementById("map"), { // create map
          zoom: 18,
          minZoom: 14,
          maxZoom: 19,
          center: position,
          mapId: '731858d4ebe716cc',
          disableDefaultUI: true,
          });

          // Adding markers based on event location USE ALL EVENTS TO POPULATE ALL THE MARKERS SHOWN 
          await this.fetchEvents();
          this.showEventsOnCaurosel();
          await this.createMarkers();


          google.maps.event.addListener(this.map, 'bounds_changed', this.debounce(this.showEventsOnCaurosel,600));
          google.maps.event.addListener(this.map, 'zoom_changed', this.debounce(this.showEventsOnCaurosel,600));
          
      },

      showEventsOnCaurosel(){ // display all the events in the caurosel
          const dimensions = this.map.getBounds() //fi : lo left hi right, Jh: lo bottom hi top
          const all_events = this.all_events // sorted events
          let event_visible = []
          let array_keys = []

          array_keys = Object.keys(dimensions)
          // console.log(array_keys)
          let lat = array_keys[0]
          let lng = array_keys[1]

          event_visible = []
          all_events.forEach(event => {
              if(this.isBetween(event.place_lat,dimensions[lat].lo,dimensions[lat].hi) && this.isBetween(event.place_lng,dimensions[lng].lo,dimensions[lng].hi)){
                  event_visible.push(event)
              }
          });
          console.log("Number of events visible on the map: ",event_visible.length)

          if(event_visible.length == 0){
              // console.log("here")
              let dummy_event = {
                  created_at:"",
                  created_by:"",
                  description:"",
                  end_date_time:"",
                  event_name:"There are currently no events near here!",
                  event_type:"",
                  external_url:"",
                  id:"0",
                  location:"",
                  organisation:"",
                  photos:"",
                  place_id:"",
                  place_lat:"",
                  place_lng:"",
                  start_date_time:"",
                  venue:"",
                  thumbnail:"",
              }
              event_visible.push(dummy_event)
              console.log("dummy event has been added")
          }
          this.events = event_visible
          console.log("visible events appended")
      },
      debounce(func, delay) { //for reducing the API calls made
      return function (...args) {
          clearTimeout(this.debounceTimeout);
          this.debounceTimeout = setTimeout(() => {
              func.apply(this, args);
          }, delay);
          };
      },

      async createMarkers(){ // add all markers to map
          const markers = [];
          this.all_events.forEach(event => {
              console.log(event)
              const marker = new google.maps.Marker({
                  map: this.map,
                  position: { lat: event.place_lat, lng: event.place_lng },
              });
              markers.push(marker)
          });
          console.log(markers)
      },


      isBetween(value, min, max){
          return value >= min && value <= max
      },

      getUserID(){
        const userStore = useUserStore();
        this.user_id = userStore.getAuthToken()
      },
  },

  async mounted() {

      this.setNumEventsGroup(); // Set initial value based on current viewport
      window.addEventListener('resize', this.setNumEventsGroup); // Update on resize

    // -------- CODE TO INITIALISE GOOGLE MAPS ---------
    (g => {
      var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window;
      b = b[c] || (b[c] = {});
      var d = b.maps || (b.maps = {}), r = new Set(), e = new URLSearchParams(), u = () => h || (h = new Promise(async (f, n) => {
        await (a = m.createElement("script"));
        e.set("libraries", [...r] + "");
        for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]);
        e.set("callback", c + ".maps." + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => h = n(Error(p + " could not load."));
        a.nonce = m.querySelector("script[nonce]")?.nonce || "";
        m.head.append(a);
      }));
      d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n));
    })({
      key: "AIzaSyDeVgAhC9VSqh64BteBWNqi3EWDm9vJXvU",
      v: "weekly",
    });
    // -------- END CODE TO INITIALISE GOOGLE MAPS ---------
  this.searchForEvents(); //initial population
  await this.getNumberOfLikes();// get liked 

  },
};
</script>

<style scoped>
.event-link {
  min-width: 250px;
  color: inherit; 
  text-decoration: none; 
  display: block; 
}
.event-card {
  border-radius: 8px;
  border: 1px solid #ddd;
  background-color: #ffffff;
}

.event-link:hover{
  background-color:transparent;
}
.card {
  background-color: transparent;
  color: whitesmoke;
  border: none;
  
}
.card-title {
  text-align: center;
  margin-bottom: 20px; 
}
.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.card-body h6 {
  margin-bottom: 15px; /* Adjust as needed */
}
.card-body .heart-icon {
  margin-top: auto;
}
.event-image {
  width: 200px;
  height: 278px;
  display: block; 
  margin: 0 auto; 
  margin-bottom: 20px; 
  
}

.viewbutton {
  color: white;
  border: solid 1px rgb(120, 117, 117);
  margin: 10px 30px 30px 30px;
  width: 200px;
  transition: background-color 0.3s ease;
}

.viewbutton:hover {
  background-color: #68686a;
  border-color: #68686a;
}

/* Active state styling for selected button */
.viewbutton.active {
  background-color: #032943; /* Change this to your desired active color */
  border-color: #ffffff;
}

/* Styling for the input */
.search-bar-row {
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid white;
  padding-bottom: 5px;
  max-width: 600px; /* Set a fixed max-width */
  width: 100%; /* Allow it to adjust based on screen size */
  margin: 0 auto; /* Center alignment */
}

.i {
  flex-grow: 1;
  min-width: 0; /* Allows shrinking */
  max-width: 100%; /* Ensures input respects the parent width */
  height: 40px;
  padding-left: 5px;
  color: white;
  background-color: transparent;
  box-sizing: border-box;
  appearance: none;
  outline: none;
  border: none;
}

.i::placeholder {
  color: white;
  opacity: 1;
}

.category-buttons-row {
  display: flex;
  flex-wrap: wrap; /* Allows wrapping for smaller screens */
  gap: 8px;
  justify-content: center;
  max-width: 100%; /* Allow full width on small screens */
}

.category-buttons-row .btn-pill {
  padding: 8px 16px;
  white-space: nowrap; /* Prevents text from breaking */
  flex: 0 1 auto; /* Default to auto size based on content */
  margin: 5px;
  border: none;
}

@media (min-width: 992px) {
  .category-buttons-row {
    flex-wrap: nowrap; /* Prevent wrapping on large screens */
    justify-content: center;
    max-width: 100%; /* Allow full row width on large screens */
  }
  .category-buttons-row .btn-pill {
    flex: 0 0 auto; /* Prevents buttons from expanding */
  }
  .search-bar-row {
    max-width: 600px; /* Match category buttons' width on large screens */
  }
}

@media (min-width: 768px) and (max-width: 991px) {
  .category-buttons-row {
    flex-wrap: nowrap; /* Single row on medium screens */
    justify-content: center;
    max-width: 100%;
  }
  .category-buttons-row .btn-pill {
    flex: 0 1 auto; /* Adjusts to content */
  }
}


@media (max-width: 600px) {
  .search-bar-row {
    max-width: 100%; /* Allow full width on screens smaller than 600px */
  }
}

@media (max-width: 576px) {
  .category-buttons-row .btn-pill {
    flex: 1 1 calc(33.33% - 10px); /* Each button takes about 3 columns */
  }
}


/* .i { original code
  width: 100%;
  max-width: 600px; 
  height: 40px; 
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  outline: none;
} */

.maincon{
  background-image: url('@/assets/images/bg-4.jpg'); /* Ensure this path matches your project structure */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  margin: 0;
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
  color: white;
}
/* .carousel-control-prev,
.carousel-control-next {
  width: 80px;
} */

#eventMapTitle {
  margin-top: 50px;
  text-align: center;
  color: white;
}

#map {
  height: 500px;
  width: 70%;
  border-radius: 10px;

}

#mapDimensions{
  display:flex;
  justify-content: center;
}

.modal-title,
.modal-body {
  color: black;
}

/* .card-body {
  height: 200px; 
} */

#otherView{
  height: 400px
}

.btn-pill:hover{
  transform:scale(1.1);
}

.category-title{
  text-align: center;
}

.input-size{
  width: 80%;
}

/* CATEGORY BUTTON STYLING */
.all {
  background-color: #7B8794;
  border: none;
}

.academic {
  background-color: #4A90E2;
  border:none;
}

.sports {
  background-color: #50C878;
}

.arts {
  background-color: #9B59B6;
}

.networking {
  background-color: #F5A623;
}

.charity {
  background-color: #E74C3C;
}

.community {
  background-color: #F1C40F;
}

.welfare {
  background-color: #1ABC9C;
}
/* 
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 0.5s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
 */

</style>
