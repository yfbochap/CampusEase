<template>
  <div class="background-wrapper">
    <div class="container-fluid">
      <div v-if="alertVisible_errors" class="fixed-alert alert alert-danger d-flex justify-content-between align-items-center slide-down-enter-active slide-up-exit-active" role="alert">
        <h5 class="m-0">{{ errorText }}</h5>
        <button type="button" class="close close-icon alertclose" @click="closeAlert_errors" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>

      <div v-if="alertVisible" class="fixed-alert alert alert-success d-flex justify-content-between align-items-center slide-down-enter-active" role="alert">
        <h5 class="m-0">Event Created Successfully!</h5>
      </div>
    
      <form class="mt-4 d-flex justify-content-center flex-wrap">
        <div class= "me-4">
          <label for="thumbnailPhoto" class="form-label">Thumbnail Photo (Mandatory)</label>
          <div class="thumbnail-box" style="border-radius: 10px;">
            <input type="file" id="thumbnailPhoto" @change="handleThumbnailPhoto" accept="image/*" required>
            <div class="plus-icon">+</div>
            <img v-if="thumbnailPhoto" :src="thumbnailPreview" alt="Thumbnail" class="thumbnail-preview">
            <button v-if="thumbnailPhoto" @click="removeThumbnail" class="remove-icon">X</button>
          </div>

          <label for="eventPhotos1" class="form-label">Additional Photos (Optional)</label>
          <div class="small-photo-wrapper">
            <div class="small-photo-box" v-for="(photo, index) in 3" :key="index" style="border-radius: 7px;">
              <input type="file" class="form-control" :id="'eventPhotos' + (index + 1)" @change="(e) => { handlePhotos(index)(e); }" accept="image/*">
              <div class="plus-icon">+</div>
              <img v-if="eventPhotosPreview[index]" :src="eventPhotosPreview[index]" alt="Event Photo" class="small-photo-preview">
              <button v-if="eventPhotosPreview[index]" @click="removePhoto(index)" class="remove-icon">X</button>
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="mb-3 d-flex flex-wrap gap-2">
            <div class="flex-grow-1 same-width">
              <label for="eventName" class="form-label">Event Name</label>
              <input type="text" class="form-control" id="eventName" v-model="eventName" required>
            </div>
            <div class="flex-grow-1 same-width">
              <label for="eventType" class="form-label">Event Category</label>
              <select id="eventType" class="form-control" v-model="eventType" required>
                <option value="Academic">Academic</option>
                <option value="Sports">Sports</option>
                <option value="Arts">Arts</option>
                <option value="Networking">Networking</option>
                <option value="Charity">Charity</option>
                <option value="Community">Community</option>
                <option value="Welfare">Welfare</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>
        
     
          <!-- Location and Venue fields in one row for medium and above screens -->
          <div class="mb-3 d-flex flex-wrap gap-2 location-venue-container">
            <div class="flex-grow-1 same-width">
              <label for="location" class="form-label">Location</label>
              <select id="location" class="form-control" v-model="selectedLocation" required>
                <option value="Administration Building">Administration Building</option>
                <option value="Campus Green">Campus Green</option>
                <option value="Lee Kong Chian School of Business">Lee Kong Chian School of Business</option>
                <option value="Li Ka Shing Library">Li Ka Shing Library</option>
                <option value="Prinsep Street Residences">Prinsep Street Residences</option>
                <option value="School of Accountancy">School of Accountancy</option>
                <option value="School of Computing & Information Systems 1">School of Computing & Information Systems 1</option>
                <option value="School of Economics/School of Computing & Information Systems 2">School of Economics/School of Computing & Information Systems 2</option>
                <option value="School of Social Sciences/College of Integrative Studies">School of Social Sciences/College of Integrative Studies</option>
                <option value="SMU Connexion">SMU Connexion</option>
                <option value="Yong Pung How School of Law/Kwa Geok Choo Law Library">Yong Pung How School of Law/Kwa Geok Choo Law Library</option>
                <option value="T-Junction">T-Junction</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div v-if="selectedLocation === 'Other'" class="flex-grow-1 same-width">
              <label for="otherLocation" class="form-label">Google Maps Address</label>
              <input type="text" v-model="otherLocation" id="otherLocation" class="form-control" placeholder="Specify location" required autocomplete="off">
            </div>

            <div class="flex-grow-1 same-width">
              <label for="eventVenue" class="form-label">Venue</label>
              <input type="text" class="form-control" id="eventVenue" v-model="eventVenue" required>
            </div>
          </div>

          <!-- Start and End Date fields in one row for medium and above screens -->
          <div class="mb-3 d-flex flex-wrap gap-2">
            <div class="flex-grow-1 same-width">
              <label for="eventStartDateTime" class="form-label">Start Date</label>
              <input type="datetime-local" class="form-control" id="eventStartDateTime" v-model="eventStartDateTime" required>
            </div>

            <div class="flex-grow-1 same-width">
              <label for="eventEndDateTime" class="form-label">End Date</label>
              <input type="datetime-local" class="form-control" id="eventEndDateTime" v-model="eventEndDateTime" required>
            </div>
          </div>

          <div class="mb-3">
            <label for="eventDescription" class="form-label">Description</label>
            <textarea class="form-control" id="eventDescription" rows="3" v-model="eventDescription" required></textarea>
          </div>

          <div class="mb-3">
            <label for="eventOrganisation" class="form-label" >Organisation</label>
            <input type="text" class="form-control" id="eventOrganisation" required v-model="eventOrganisation">
          </div>

          <div class="mb-3">
            <label for="eventSignUp" class="form-label">Sign-up Link (Optional)</label>
            <input type="url" class="form-control" id="eventSignUp" v-model="eventSignUp" placeholder="https://example.com/sign-up">
          </div>

          <button type="button" @click="submitEvent" class="btn text-white" id="submitButton">Create Event</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch, nextTick, onMounted } from 'vue';
  import { supabase } from '../../utils/supabaseClient';
  import { addEvent, uploadImage, checkEventExists } from '../../utils/supabaseRequests';
  import { useUserStore } from '@/stores/counter';
  import router from '@/router';


  const userStore = useUserStore()

  if (userStore.getAuthToken() == null){ //immediately redirect
      router.push("/signin")
  }

  const user = ref(null);

  const fetchUser = async () => {
    user.value = userStore.getAuthToken()
    console.log(user.value)
  };

  onMounted(() => {
    fetchUser(); // Call the function when the component is mounted
  });

  const locations = reactive({
      "Administration Building": { lat: 1.2960323, lng: 103.8472966, location_short: "Admin Building" },
      "Campus Green": { lat: 1.29698, lng: 103.8496, location_short: "Campus Green" },
      "Lee Kong Chian School of Business": { lat: 1.295172, lng: 103.8505, location_short: "SOB" },
      "Li Ka Shing Library": { lat: 1.2964100987760936, lng: 103.85004366519945, location_short: "LKS Library" },
      "Prinsep Street Residences": { lat: 1.3021338939464382, lng: 103.8513315958835, location_short: "Prinsep Street Residences" },
      "School of Accountancy": { lat: 1.2961631509838585, lng: 103.84984088054155, location_short: "SOA" }, 
      "School of Computing & Information Systems 1": { lat: 1.2977150530105908, lng: 103.84942902287054, location_short: "SCIS1" }, 
      "School of Economics/School of Computing & Information Systems 2": { lat: 1.2976677192242823, lng: 103.84897900703378, location_short: "SOE/SCIS2" },
      "School of Social Sciences/College of Integrative Studies": { lat: 1.294767, lng: 103.8485, location_short: "SOSS/CIS" },
      "SMU Connexion": { lat: 1.295547, lng: 103.8493, location_short: "SMU Connex" },
      "Yong Pung How School of Law/Kwa Geok Choo Law Library": { lat: 1.295057, lng: 103.849, location_short: "YPHSOL" },
      "T-Junction": { lat: 1.296684, lng: 103.8504, location_short: "T-Junction" },
      "Other": { lat: null, lng: null } // For custom locations
  })

  const thumbnailPreview = ref('');
  const eventPhotosPreview = ref(Array(3).fill(''));

  const handleThumbnailPhoto = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Test functionality for removing alpha channel
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      const jpegBlob = await removeAlphaChannel(file);
      const jpegFile = new File([jpegBlob], `${fileNameWithoutExtension}.jpeg`, { type: "image/jpeg" });

      thumbnailPhoto.value = jpegFile;
      thumbnailPreview.value = URL.createObjectURL(jpegFile);
    } else {
      thumbnailPreview.value = null;
    }
  };

  const handlePhotos = (index) => async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Test functionality for removing alpha channel
      const fileNameWithoutExtension = file.name.replace(/\.[^/.]+$/, "");
      const jpegBlob = await removeAlphaChannel(file);
      const jpegFile = new File([jpegBlob], `${fileNameWithoutExtension}.jpeg`, { type: "image/jpeg" });


      eventPhotos.value[index] = jpegFile; // Store the file
      eventPhotosPreview.value[index] = URL.createObjectURL(jpegFile); // Create preview URL
    } else {
      eventPhotosPreview.value[index] = null; // Clear the preview if no file is selected
    }
  };

  const removeThumbnail = () => {
    thumbnailPhoto.value = null;
    thumbnailPreview.value = ''; // Clear preview
  };

  const removePhoto = (index) => {
    eventPhotos.value[index] = null; // Clear the file
    eventPhotosPreview.value[index] = ''; // Clear the preview
  };


  const selectedLocation = ref('');
  const place_lat = ref(null);
  const place_lng = ref(null);
  const location_short = ref(null);
  const eventName = ref('');
  const eventVenue = ref('');
  const eventStartDateTime = ref('');
  const eventEndDateTime = ref('');
  const eventDescription = ref('');
  const eventOrganisation = ref('');
  const eventSignUp = ref('');
  const eventPhotos = ref(Array(3).fill(null));
  const thumbnailPhoto = ref(null);
  const otherLocation = ref('');
  const eventType = ref('');
  const alertVisible = ref(false);
  const alertVisible_errors = ref(false)
  const errorText = ref('')
  const thumbnailSuccess = ref('')

  const autoCloseAlertErrors = () => {
  // setTimeout(() => {
  //   if (alertVisible_errors.value) {
  //     closeAlert_errors();
  //   }
  // }, 3000); // Closes the alert after 3 seconds
};
  const openAlert_errors = () => {
  alertVisible_errors.value = true;
  autoCloseAlertErrors(); // Automatically close the error alert after 3 seconds
};
  const closeAlert_errors = () => {
    alertVisible_errors.value = false;
  };

  
  const openAlert = () =>{
    alertVisible.value = true;
    autoCloseAlertErrors(); // Automatically hide after 3 seconds
  }
  const closeAlert = () => {
    alertVisible.value = false;
  };

  watch(selectedLocation, (newLocation) => {
    const locationData = locations[newLocation];
    if (locationData) {
      place_lat.value = locationData.lat;
      place_lng.value = locationData.lng;
      location_short.value = locationData.location_short;
    } 
  });

  watch(otherLocation, (newValue) => {
    if (newValue) {
      console.log(newValue)
      nextTick(() => {
        initAutocomplete();
      });
    }
  });


  const getCoordinates = async () => {
    const address = document.getElementById("otherLocation").value;
    console.log(address);
    otherLocation.value = address;
    const url = "https://maps.googleapis.com/maps/api/geocode/json";

    try {
      const response = await axios.get(url, {
        params: {
          address: address,
          key: "AIzaSyDeVgAhC9VSqh64BteBWNqi3EWDm9vJXvU"
        }
      });
      
      if (response.data.results.length === 0) {
        console.log("Location Not Found");
        return true;  // Indicating an error (no location found)
      }
      
      console.log("THIS SHOULDN'T HAVE CONTINUED PART 1");
      console.log(response.data.results)
      location_short.value = response.data.results[0].formatted_address.replace(/\d+/g, '').split(',')[0].trim();
      console.log(location_short.value)
      place_lat.value = response.data.results[0].geometry.location.lat;
      place_lng.value = response.data.results[0].geometry.location.lng;
      console.log("Information Processed, location found");
      return false;  // Indicating success
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      return true;  // Indicating an error occurred
    }
  };

  const removeAlphaChannel = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target.result;
      };

      reader.onerror = (err) => {
        reject("Error reading file: " + err);
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to image size
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image without alpha channel (JPEG format has no alpha)
        ctx.drawImage(img, 0, 0);
        
        // Convert canvas to JPEG (you can specify quality here)
        const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // 1.0 is for max quality
        
        // Convert base64 data URL to Blob and resolve with it
        fetch(dataUrl)
          .then(res => res.blob())
          .then(blob => resolve(blob))
          .catch(reject);
      };

      img.src = reader.readAsDataURL(file); // Start reading the file
    });
  };

  const uploadFiles = async (thumbnailFile, additionalFiles, eventName) => {
    let thumbnailPath;
    console.log("Thumbnail Success?", thumbnailSuccess.value)
    if (!thumbnailSuccess.value){
        if (typeof thumbnailFile === 'string') {
          // If it's a URL, use it directly
          thumbnailPath = thumbnailFile;
          console.log('Using existing thumbnail path:', thumbnailPath);
      } else {
          // If it's a File object, upload it
          thumbnailPath = await uploadImage(thumbnailFile, 'thumbnail', eventName);
          if (!thumbnailPath){
            errorText.value = "Error. Please Use Another Thumbnail";
            openAlert_errors();
            return;
          }
          thumbnailSuccess.value = thumbnailPath;
      }
    }
    
    const nonNullAdditionalFiles = additionalFiles.filter(file => file !== null);

    // Upload additional files
    const additionalImagePaths = nonNullAdditionalFiles.length > 0
    ? [] // Start with an empty array to store the valid paths
    : []; // If no files, we just return an empty array

    // Sequentially process each file
    for (let index = 0; index < nonNullAdditionalFiles.length; index++) {
      const file = nonNullAdditionalFiles[index];
      
      try {
        // Await each uploadImage call to ensure sequential execution
        const filePath = await uploadImage(file, 'additional', eventName, index);
        console.log('File path:', filePath); // Debugging: log the file path after awaiting

        // Check if filePath is valid, and handle errors if not
        if (!filePath) {
          console.log('Upload failed, filePath is null');
          errorText.value = "An Extra Image Has An Error. Please Use Another Image";
          openAlert_errors();
          return; // Stop the loop if an image fails
        }

        // Push the valid filePath to the result array
        additionalImagePaths.push(filePath);

      } catch (error) {
        console.error("Error during file upload:", error);
        errorText.value = "An Extra Image Has An Error. Please Use Another Image";
        openAlert_errors();
        return; // Exit the loop if there was an error during the upload
      }
    }

      // Now create an array with the non-null values at the front and nulls at the end
      const fullAdditionalImagePaths = [
          ...additionalImagePaths, // Add all the uploaded images first
          ...additionalFiles.filter(file => file === null) // Add the nulls at the end
      ];

      thumbnailPath = thumbnailSuccess.value;
    return { thumbnailPath, additionalImagePaths: fullAdditionalImagePaths };
  }

  const submitEvent = async (event) => {
    if(selectedLocation.value === 'Other'){
      let error = await getCoordinates()
      console.log(`Status: ${error}`) 
      console.log(otherLocation.value, place_lat.value, place_lng.value)
      if(error){
        console.log("Error Message Triggered")
        errorText.value = "Please input a valid address"
        openAlert_errors()
        return;
      }
    }
    const start = new Date(eventStartDateTime.value)
    const end = new Date(eventEndDateTime.value)
    console.log(start, end)
    if(start > end){
      console.log(event.start_date_time, event.end_date_time)
      errorText.value = "Invalid Date"
      openAlert_errors()
      return
    }
    
    console.log("THIS SHOULDNT HAVE CONTINUED PART 2")
    event.preventDefault();

    const form = document.querySelector('form'); 
    if (!form.checkValidity()) {
      let counter = 0
      for (const input of form.elements) {
        if (!input.checkValidity()) {
          console.log(input.id, input.classList)
          counter ++
          input.style.borderColor = 'red';
        } else {
          input.style.borderColor = ''; 
        }
        console.log(input.classList)
      }

      if (counter > 0) {
        errorText.value = "Missing Required Fields"
        openAlert_errors()
      }

      form.reportValidity();
      return;
    }

    const eventExists = await checkEventExists(eventName.value);
  
    if (eventExists) {
      errorText.value = 'Event exists. Please choose a different event name.'
      openAlert_errors()
      return; // Stop the submission if the event exists
    }

    const newEvent = {
      created_by: user.value,
      name: eventName.value,
      venue: eventVenue.value,
      place_lat: place_lat.value,
      place_lng: place_lng.value,
      location_short: location_short.value,
      start_date_time: eventStartDateTime.value,
      end_date_time: eventEndDateTime.value,
      description: eventDescription.value,
      organisation: eventOrganisation.value,
      external_url: eventSignUp.value,
      location: selectedLocation.value === 'Other' ? otherLocation.value : selectedLocation.value,
      event_type: eventType.value,
    };

    console.log('New event created:', newEvent);
    // alert('Event Created: ' + newEvent.name);

    if (!thumbnailPhoto) {
        errorText.value = "Please upload a thumbnail photo"
        openAlert_errors()
        return;
    }

    console.log("Before Upload Files: ", thumbnailPhoto.value, eventPhotos.value);

    const { thumbnailPath, additionalImagePaths } = await uploadFiles(thumbnailPhoto.value, eventPhotos.value, eventName.value);

    const createdEvent = await addEvent(newEvent, thumbnailPath, additionalImagePaths || []);
    console.log("Created Event ID: ", createdEvent[0].id);
            
      if (createdEvent) {
          console.log('Event added successfully:', createdEvent);
          closeAlert_errors()
          openAlert()
          setTimeout(() => {
            router.push({ name: 'event', params: { id: createdEvent[0].id, name: eventName.value } });
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }, 1000);
  
      }

    else {
        console.error('Error: Failure to create event.');
        alert('Error: Failure to create event.');
    }
  };

  const initAutocomplete = () => {
  // Ensure the Google Maps script is loaded
  if (!window.google) {
    console.error("Google Maps script is not loaded.");
    return;
  }

  const input = document.getElementById('otherLocation');
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input);
      autocomplete.setComponentRestrictions({ country: 'SG' });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          console.log("Selected place:", place.formatted_address);
          otherLocation.value = document.getElementById("otherLocation").value;
        } else {
          console.error("No details available for input: '" + place.name + "'");
        }
      });
    } else {
      console.error("Input field with id 'otherLocation' not found.");
    }
  };
 
</script>


<style scoped>

.background-wrapper {
  background-image: url('@/assets/images/bg-11.jpg'); /* Background image applied here */
  background-size: cover;
  background-position: center;
  height: 100%; /* Full height to cover the viewport */
  width: 100vw; /* Full width to cover the viewport */
  display: flex;
  justify-content: center; /* Center the container horizontally */
  align-items: center; /* Center the container vertically */
}

.container-fluid {
  color: white;
  padding-top: 100px;
  padding-bottom: 25px;
  background-color: rgb(0, 0, 0, 0.7); /* Slight opacity for contrast */
  width: 100%;
  max-width: 1000px; /* Limit scaling */
  margin: auto; /* Center the form content */
}

/* Limit scaling to 1000px for large screens */
@media (min-width: 1000px) {
  .container-fluid {
    max-width: 1000px;
    margin: auto;
  }
}

@media (max-width: 768px) {
  .right-column {
    flex: 1 1 100%;
  }

  .location-venue-container {
    flex-direction: column; /* Stack the Location and Venue fields */
  }

  .mb-3.d-flex {
    flex-direction: column;
  }
}

.location-venue-container {
  display: flex;
  gap: 2rem;
}

@media (max-width: 564px) {
  .container-fluid {
    padding-top: 50px;
    margin: auto;
  }

  .right-column {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: auto;
  }

  

  /* Stretch input fields in right column */
  .right-column input[type="text"],
  .right-column input[type="datetime-local"],
  .right-column input[type="url"],
  .right-column select,
  .right-column textarea {
    width: 100%;
  }

  .location-venue-container {
    flex-direction: column;
  }

  /* Center the thumbnail box with fixed width */
  .thumbnail-box {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    max-width: 400px; /* Sets a fixed width for centering */
  }

  .small-photo-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
  }

  /* Ensure each small photo box is centered and has a defined size */
  .small-photo-box {
    width: 80px;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: auto;
  }
}


input[type="text"],input[type="datetime-local"],input[type="url"], select, textarea {
  background-color: #6e6868;
  color: #fafefb;
  border-color: #777676;
}

textarea:focus{
  background-color: #6e6868;
  color: #fafefb;
}

.thumbnail-box,
.small-photo-box {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  width: 100%;
  cursor: pointer;
  position: relative;
  margin-bottom: 1rem;
  border: 1px dashed #e4dede;
  
}


.thumbnail-box:hover,
.small-photo-box:hover {
  border-color: #007bff;
}

.thumbnail-box input[type="file"],
.small-photo-box input[type="file"] {
  opacity: 0;
  position: absolute;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.thumbnail-preview {
  width: 100%;
  height: 100%;
  object-fit: cover; 
  border-radius: 10px;
  position: absolute;
}

.small-photo-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 7px;
  position: absolute;
}

.thumbnail-box .plus-icon,
.small-photo-box .plus-icon {
  font-size: 2rem;
  color: #ccc;
}
.thumbnail-box:hover .plus-icon,
.small-photo-box:hover .plus-icon {
  color: #007bff;
}

.remove-icon {
    position: absolute;
    top: 5px;
    right: 5px;
    background: red;
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bolder;
    display: flex;
    align-items: center;
    justify-content: center;
}
.remove-icon:hover {
    background: darkred;
}

.same-width {
  flex: 1 1 0;
  flex-grow: 1;
  min-width: 200px;
}

/* Layout adjustments for medium screens */
.flex-md-100 {
  flex: 1 1 100%;
}

.right-column {
  width: 60%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  flex: 2;
  min-width: 300px;
  margin-right: 20px;
}
.small-photo-wrapper {
  display: flex;
  gap: 30px;
}
.small-photo-box {
  width: 100px;
  height: 100px;
}
#submitButton {
  align-self: flex-end;
  margin-top: auto;
  background-color: #000000;
  border-color: #ccc;
  transition: background-color 0.3s, color 0.3s;
}
#submitButton:hover{
  color: #000000 !important;
  background-color: #ccc;
}
#brandname {
  font-size: 24px;
}
.links {
  color: rgb(249, 234, 27);
}
.location-venue-container {
  display: flex;
}
.flex-half {
  flex: 1;
}
.close-icon {
  font-size: 30px; 
  color: darkolivegreen; 
  background: transparent; 
  border: none; 
  cursor: pointer; 
}
/* ANIMATION FOR MODAL */
.fixed-alert {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1050;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.fixed-alert.slide-down-enter-active {
  animation: slideDown 0.5s ease forwards;
}
.slide-up-exit-active {
  transform: translate(-50%, -100%);
  opacity: 0;
}
@keyframes slideDown {
  0% {
    transform: translate(-50%, -100%);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 100px);
    opacity: 1;
  }
}
.invalid-input {
  border-color: red;
}
.alertclose {
  margin-left: 10px; /* Adjust this value as needed */
}

</style>

