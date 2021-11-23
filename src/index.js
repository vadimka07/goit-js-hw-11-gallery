import './css/styles.css';
import axios from "axios";
import Notiflix from "notiflix";
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';

let inputValue = null;
let page = 1;
let per_page = 40;
const API_KEY = '22770048-68f29ae7be79c027fc88359a9';
const BASE_URL = `https://pixabay.com/api/?key=${API_KEY}`;
const PARAMS = '&image_type=photo&orientation=horizontal&safesearch=true&per_page=' + per_page;
const galleryContainer = document.querySelector('.gallery');
const form = document.getElementById('search-form');
const loadMoreButton = document.querySelector('.load-more');
loadMoreButton.style.display = 'none';

form.addEventListener('submit', getImage)

function getImage(e) {
  e.preventDefault();
  galleryContainer.innerHTML = '';
  page = 1;
  loadMoreButton.style.display = 'none';
  inputValue = form.elements.searchQuery.value;
  if (!inputValue.trim()) {
    return Notiflix.Notify.failure('File not found 404');
  }
  getData(page, inputValue);
}

function getData(page, value) {
  return axios.get(`${BASE_URL}&q=${value}${PARAMS}&page=${page}`).then((response) => {
    return response.data;
  }).then(data => {
    if (!data.hits.length) {
      return  Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again');
    }
    return data;
  }).then(({hits: dataArr, totalHits}) => {
    const listItems = dataArr.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) => {
      return `<li class="photo-card">
        <div class="image-thumb">
          <a href="${largeImageURL}" class="link">
              <img src="${webformatURL}" alt="${tags}" data-image="${largeImageURL}" loading="lazy" width="300"/>
          </a>
        </div>
        <div class="info">
          <p class="info-item">
            <b>Likes</b>
            ${likes}
          </p>
          <p class="info-item">
            <b>Views</b>
            ${views}
          </p>
          <p class="info-item">
          <b>Comments</b>
          ${comments}
          </p>
          <p class="info-item">
            <b>Downloads</b>
            ${downloads}
          </p>
        </div>
    </li>`
    }).join('');
    const accessibility = Math.ceil(totalHits / per_page);
    if (accessibility === page) {
      loadMoreButton.style.display = 'none';
      return Notiflix.Notify.warning('We\'re sorry, but you\'ve reached the end of search results.')
    }
    galleryContainer.insertAdjacentHTML('beforeend', listItems);
    const {height: cardHeight} = document.querySelector('.gallery').firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
    function loadMore(entries) {
      entries.forEach((entry) => {
        if(entry.isIntersecting) {
          page++;
          getData(page, inputValue);
        }
      })
    }
    let lastElementFromGallery = galleryContainer.lastElementChild;
    const options = {
      rootMargin: '100px 0px -50% 0px'
    };
    let observer = new IntersectionObserver(loadMore, options);
    observer.observe(lastElementFromGallery);
    // loadMoreButton.style.display = 'block';
      Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
    new SimpleLightbox('.gallery a').refresh();
  }).catch((error) => {
    console.log(error);
  })

}

//on click button load More
// function loadMore() {
//         page++;
//         getData(page, inputValue);
//   console.log('loadMore page', page);
//
// }
// loadMoreButton.addEventListener('click', loadMore)



