<template>
  <div class="background-wrapper">
  <div class="container-fluid">

    <!-- Error Alert -->
    <div v-if="alertVisible_errors" class="fixed-alert alert alert-danger  d-flex justify-content-between align-items-center slide-down-enter-active" role="alert">
      <h4 class="m-0">{{ errorText }}</h4>
      <button type="button" class="close close-icon alertclose" @click="closeAlert_errors" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <!-- Success Alert -->
    <div v-if="alertVisible" class="fixed-alert alert alert-success  d-flex justify-content-between align-items-center slide-down-enter-active" role="alert">
      <h4 class="m-0">Event Updated Succesfully!</h4>
      <button type="button" class="close close-icon alertclose" @click="closeAlert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <h2>Update Event</h2>
    <form class="mt-4 d-flex justify-content-center flex-wrap">
      <div class="me-4">
        <label for="thumbnailPhoto" class="form-label">Thumbnail Photo (Mandatory)</label>
        <div class="thumbnail-box" style="border-radius: 10px;">
          <input type="file" id="thumbnailPhoto" @change="handleThumbnailPhoto" accept="image/*">
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
          <input type="text" id="otherLocation" v-model="otherLocation" class="form-control" placeholder="Specify location" required autocomplete="off">
        </div>

        <div class="flex-grow-1 same-width">
          <label for="eventVenue" class="form-label">Venue</label>
          <input type="text" class="form-control" id="eventVenue" v-model="eventVenue" required>
        </div>
      </div>

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
          <label for="eventOrganisation" class="form-label">Organisation (Optional)</label>
          <input type="text" class="form-control" id="eventOrganisation" v-model="eventOrganisation">
        </div>

        <div class="mb-3">
          <label for="eventSignUp" class="form-label">Sign-up Link (Optional)</label>
          <input type="url" class="form-control" id="eventSignUp" v-model="eventSignUp" placeholder="https://example.com/sign-up">
        </div>

        <button type="button" @click="submitEvent" class="btn text-white" id="submitButton">Update Event</button>
      </div>
    </form>
  </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch, onMounted } from 'vue';
  import { supabase } from '../../utils/supabaseClient';
  import { updateEvent, deleteImage, uploadFiles, getEventByEventId, uploadImage } from '../../utils/supabaseRequests';
  import router from '@/router';

  import { useUserStore } from '@/stores/counter';

  const userStore = useUserStore()
  const user = userStore.getAuthToken();
  if (user == null){ //immediately redirect
      router.push("/signin")
  }
  const eventId = userStore.getEventID();
  const eventData = ref(null);

  const checkAccess = () => {
    if(eventId == null){
      console.log("here")
      router.push("/your_events")
    }
  }



  const fetchEventData = async () => {
    eventData.value = await getEventByEventId(eventId);
    const eventDetails = eventData.value;
    console.log("Fetched event data:", eventDetails);

    if(eventDetails){
      selectedLocation.value = locations[eventDetails.location] ? eventDetails.location : "Other";
      place_lat.value = eventDetails.place_lat;
      place_lng.value = eventDetails.place_lng;
      location_short.value = eventDetails.location_short;
      eventName.value = eventDetails.event_name;
      eventVenue.value = eventDetails.venue;
      eventStartDateTime.value = eventDetails.start_date_time;
      eventEndDateTime.value = eventDetails.end_date_time;
      eventDescription.value = eventDetails.description;
      eventOrganisation.value = eventDetails.organisation;
      eventSignUp.value = eventDetails.external_url;
      thumbnailPhoto.value = eventDetails.thumbnail;
      eventPhotos.value = [...eventDetails.photos];

      otherLocation.value = (selectedLocation.value === "Other") ? eventDetails.location : '';
      eventType.value = eventDetails.event_type;

      const thumbnailUrl = await supabase.storage.from('eventPhotos').getPublicUrl(thumbnailPhoto.value);
      console.log("thumbnailUrl", thumbnailUrl.data.publicUrl);

      const imageUrls = [];

      for (const photoPath of eventDetails.photos) {
        if (photoPath != null){
          const { data, error } = supabase.storage.from('eventPhotos').getPublicUrl(photoPath);
            if (error) {
                console.error('Error fetching public URL for', photoPath, error);
            } else {
                imageUrls.push(data.publicUrl); // Push the public URL to the array
                console.log(imageUrls);
            }
        }
      }


      imageUrls.forEach((url, index) => {
            // eventPhotos.value[index] = url;
            eventPhotosPreview.value[index] = url; // Create preview URL
      });

      // thumbnailPhoto.value = thumbnailUrl.data.publicUrl;
      thumbnailPreview.value = thumbnailUrl.data.publicUrl;

    }
  };

  onMounted( async () => {
    checkAccess()
    await fetchEventData();
  });

  console.log("Event data outside:", eventData.value);


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

  const handleThumbnailPhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
      thumbnailPhoto.value = file;
      thumbnailPreview.value = URL.createObjectURL(thumbnailPhoto.value);
    } else {
      thumbnailPhoto.value = null;
      thumbnailPreview.value = '';
    }
  };

  const handlePhotos = (index) => (event) => {
    const file = event.target.files[0];
    if (file) {
      eventPhotos.value[index] = file; // Store the file
      eventPhotosPreview.value[index] = URL.createObjectURL(file); // Create preview URL
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

  const autoCloseAlertErrors = () => {
  setTimeout(() => {
    if (alertVisible_errors.value) {
      closeAlert_errors();
    }
  }, 3000); // Closes the alert after 3 seconds
};
  const openAlert_errors = () => {
  alertVisible_errors.value = true;
  autoCloseAlertErrors(); // Automatically close the error alert after 3 seconds
};
  const closeAlert_errors = () => {
    alertVisible_errors.value = false;
  };

  const openAlert = () =>{
    alertVisible.value = true
    autoCloseAlertErrors();
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
    } else {
      place_lat.value = null;
      place_lng.value = null;
      location_short.value = null;
    }
  });

  watch(otherLocation, (newValue) => {
  if (newValue) {
    console.log(newValue);
    if (!alertVisible.value && !alertVisible_errors.value) {
      initAutocomplete();
    }
  }
});


  function compareAndUpdateImages(arrayA, arrayB, imagesToUpload, imagesToDelete) {
    const maxLength = Math.max(arrayA.length, arrayB.length);

    // Iterate through both arrays to find differences
    for (let i = 0; i < maxLength; i++) {
      const itemA = arrayA[i];
      const itemB = arrayB[i];

      console.log("Original Image: ", itemA);
      console.log("New Image: ", itemB);

      // Case 1: New item added in B (item exists in B but not in A)
      if (itemB !== null && itemA === null) {
          // This means the user has added an image in the input box
          imagesToUpload.push(itemB); // This image should be uploaded
      }
      
      // Case 2: Item removed from B (item exists in A but not in B)
      if (itemA !== null && itemB === null) {
          // This means the user has removed the image
          imagesToDelete.push(itemA); // This image should be deleted from storage
      }

      // Case 3: Item changed in B (item exists in both but is different)
      if (itemB !== null && itemA !== null && itemB !== itemA) {
          // This means the user has replaced an image in the input box
          imagesToDelete.push(itemA); // Delete the old image
          imagesToUpload.push(itemB); // Upload the new image
      }
    }
  };

  // @Karsh i think this part might need to change 
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
    event.preventDefault();
    // await fetchEventData();

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

    if (!thumbnailPhoto.value){
      errorText.value = "Missing Thumbnail Photo"
      openAlert_errors()
      return;
    }
    
    const updateThumbnail = ref(false);

    const existingThumbnailPath = eventData.value.thumbnail; // e.g., 'thumbnails/Last Friday Nite!/soundfoundry_event.jpg'
    console.log("Existing Thumbnail Path: ", existingThumbnailPath);
    const existingThumbnailName = existingThumbnailPath ? existingThumbnailPath.split('/').pop() : null;


    let newThumbnailName;

    // Determine if thumbnailPhoto is a File object or an existing URL
    if (thumbnailPhoto.value instanceof File) {
        newThumbnailName = thumbnailPhoto.value.name; // Use the name property of File
        console.log("Thumbnail has changed. ", newThumbnailName, existingThumbnailName);
        updateThumbnail.value = true;
    } else {
        console.log("No change in thumbnail");
        updateThumbnail.value = false;
    }

    const imagesToDelete = [];
    const imagesToUpload = [];
    const remainingImages = ref([...eventData.value.photos]);
    const thumbnailPath = ref(eventData.value.thumbnail);
    const additionalImagePaths = ref([null, null, null]);

    console.log("Before compare & update images: ", eventData.value.photos, eventPhotos.value, imagesToUpload, imagesToDelete);
    await compareAndUpdateImages(eventData.value.photos, eventPhotos.value, imagesToUpload, imagesToDelete);
    console.log("After compare & update images: ", imagesToUpload, imagesToDelete);

    if(updateThumbnail.value){
      const thumbnailCheck = await uploadImage(thumbnailPhoto.value, 'thumbnail', eventName.value) //here
      if (thumbnailCheck){
        thumbnailPath.value = thumbnailCheck;
      }
      else{
        errorText.value = "Error. Please Use Another Image"
        openAlert_errors()
        return
      }
      await deleteImage(eventData.value.thumbnail);
      
      console.log('New thumbnail uploaded:', thumbnailPath);
    }
    
    if(imagesToDelete.length > 0){
      for (const item of imagesToDelete){
        await deleteImage(item);
        console.log('Deleted image:', item);
        remainingImages.value = eventData.value.photos.filter(photo => !imagesToDelete.includes(photo));
      }
      while (remainingImages.value.length < 3) {
        remainingImages.value.push(null);
      }
    }
    console.log("Remaining Images: ", remainingImages.value);

    if(imagesToUpload.length > 0){
      const uploadedImages = []; 

      for (const [index, item] of imagesToUpload.entries()){
        const uploadedPath = await uploadImage(item, 'additional', eventName.value, index);
        if (uploadedPath){
          uploadedImages.push(uploadedPath);
        }
        else{
          errorText.value = "An Extra Image Has An Error. Please Use Another Image";
          openAlert_errors();
          return;
        }
      }

      console.log("Uploaded images: ", uploadedImages)
      // Now create an array with the non-null values at the front and nulls at the end
      additionalImagePaths.value = [
        ...remainingImages.value.filter(image => image != null),
        ...uploadedImages // Add the newly-uploaded images last
      ];


      console.log("File path checks 1: ", remainingImages, uploadedImages, additionalImagePaths);

      while (additionalImagePaths.value.length < 3) {
        additionalImagePaths.value.push(null);
      }

      additionalImagePaths.value = additionalImagePaths.value.slice(0, 3);
    }
    else{
      additionalImagePaths.value = [...remainingImages.value];
    }

    const newEvent = {
      created_by: user,
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

    console.log('New Event Information: ', newEvent);
    console.log("Original Image Array: ", remainingImages, additionalImagePaths);
    console.log("New Image Array: ", additionalImagePaths);
    console.log("Thumbnail Path: ", thumbnailPath.value);

    const updatedEvent = await updateEvent(newEvent, thumbnailPath.value, additionalImagePaths.value, eventId);
            
      if (updatedEvent) {
          console.log('Event updated successfully:', updatedEvent);
          openAlert()
          setTimeout(() => {
            router.push("/your_events");
          }, 3000);
      }

      else {
          console.error('Error: Failure to update event.');
          alert('Error: Failure to update event.');
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

.same-width {
  flex: 1 1 0;
  flex-grow: 1;
  min-width: 200px;
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
  font-size: 30px; /* Standard close button size */
  color: darkolivegreen; /* Default color for the close button (black) */
  background: transparent; /* Transparent background */
  border: none; /* Remove border */
  cursor: pointer; /* Change the cursor to a pointer on hover */
}
.invalid-input {
  border-color: red;
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

.alertclose {
  margin-left: 10px; /* Adjust this value as needed */
}


</style>

<!-- testing  -->