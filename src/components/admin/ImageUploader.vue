<script setup>
import { ref } from "vue";
import { uploadImage } from "../../services/storage.service";

const emit = defineEmits(["uploaded"]);

const uploading = ref(false);
const previews = ref([]);

async function onSelect(event) {
  const files = [...event.target.files];

  if (!files.length) return;

  uploading.value = true;

  const urls = [];

  for (const file of files) {
    try {
      const url = await uploadImage(file);

      urls.push(url);

      previews.value.push(url);
    } catch (err) {
      console.error(err);
    }
  }

  uploading.value = false;

  emit("uploaded", urls);
}
</script>

<template>

<div class="uploader">

<label class="upload-box">

<input
type="file"
multiple
accept="image/*"
hidden
@change="onSelect"
/>

<div v-if="!uploading">

📷 Click to upload images

</div>

<div v-else>

Uploading...

</div>

</label>

<div
v-if="previews.length"
class="gallery"
>

<img

v-for="image in previews"

:key="image"

:src="image"

/>

</div>

</div>

</template>

<style scoped>

.uploader{

display:flex;

flex-direction:column;

gap:16px;

}

.upload-box{

height:150px;

border:2px dashed #3A4557;

border-radius:16px;

display:flex;

justify-content:center;

align-items:center;

cursor:pointer;

transition:.25s;

}

.upload-box:hover{

border-color:#00C896;

}

.gallery{

display:grid;

grid-template-columns:repeat(auto-fill,90px);

gap:12px;

}

.gallery img{

width:90px;

height:90px;

object-fit:cover;

border-radius:12px;

}

</style>