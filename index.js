'use strict'

function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${key}=${params[key]}`)
    return queryItems.join('&');
}

function searchByQuery(query, category, maxResults=10){
    const url = `https://tastedive.com/api/similar?`;
    const joinedQuery = query.split(" ").join("+");
    const api_key = '366850-Jonathan-5AL0N426'
    const params = {
        k: api_key,
        q: joinedQuery,
        type: category,
        verbose: 1};

    const queryString = formatQueryParams(params);
    const fetchUrl = url + queryString;
    
    $.ajax({
        url: fetchUrl,
        dataType: 'jsonp',
        success: (data) => {
          printResults(data, maxResults, category);
        }
    })
}

function printResults(data, maxResults, category){
    let searchList = data.Similar.Results;
    $('#result-list').empty();
    $('#results').removeClass('hidden');

    if(searchList.length){
        addResults(searchList, maxResults, category);
    }else{
        noResults();
    }
}

async function addResults(searchList, maxResults, category){
    for(let i = 0; i < maxResults; i++){
        let itemToPrint = searchList[i];
        let detailsList = " "

        if(itemToPrint.Type === category){

        
            detailsList = detailsList.concat(await sortByType(itemToPrint));
            detailsList = detailsList.concat(getVideo(itemToPrint));
            $('#result-list').append(`<li><h4>${itemToPrint.Name}</h4>
            ${detailsList}
            <button type="button" class="favorite">Favorite this!</button>
            </li>`);
        }
    }
    if($('#result-list').children().length === 0){
        noResults();
    }
}

function sortByType(item){
    if(item.Type === "music"){
        return detailedInfo(item);
    } else {
        return movieInfo(item.Name);
    }
}

function getVideo(videoUrl){
    console.log(videoUrl);
    if(videoUrl.yUrl != null){
        let type = videoUrl.Type;
        let typesOfVideo = {
            movie: "Trailer",
            music: "Sample",
            show: "Trailer"
        }
        console.log(typesOfVideo[type])
        return `<iframe class="video hidden" width="220px" height="220
    0px" src="${videoUrl.yUrl}" allow="fullscreen"></iframe>
    <button type="button" class="view-video">Show ${typesOfVideo[type]}</button>
    <button type="button" class="hide-video hidden">Hide video</button>`
    } else{
        return `<p></p>`
    }
    
}

async function movieInfo(movieName){
    const url = `https://www.omdbapi.com/?`;
    const joinedQuery = movieName.split(" ").join("+");
    const api_key = '36dccbe4'
    const params = {
        t: joinedQuery,
        apikey: api_key        
        };

    const queryString = formatQueryParams(params);
    const fetchUrl = url + queryString;

   

    let details = await fetch(fetchUrl, )
        .then(response => {return response.json()})
        .catch(err => console.log('Something went wrong'))

    // console.log(details);
    let posterUrl = details.Poster;
    let plot = details.Plot;
    let rating = details.imdbRating;
    let length = details.Runtime;

    if(!plot){
        return `<img src="https://i.pinimg.com/236x/cc/32/69/cc32690c49d90effb38d8eaf96c03ad1.jpg" height="300px" width="200px"
        ><p class="details">This plot wasn't in the database.</p>` 
    }else {
        return `<h5>Rating out of 10: ${rating}<br>Length: ${length}</h5><img src="${posterUrl}" alt="${details.Title} Poster" height="300px" width="200px"
        ><p class="details">${plot}</p>`
    }
}

function detailedInfo(details){
    
    const shortDetails = details.wTeaser.slice(0,300);
    if(shortDetails){
        return `<p class="details">${shortDetails}
        <span class="hidden">${details.wTeaser}</span> 
        <button type="button" class="all-details">See more</button>
        <button type="button" class="hide-all hidden">Hide details</button></p>`
    }else{
        return `<p>No information found in the database.</p>`
    }
    
    // <button type="button" class="show-details">Show details</button>
    // <button type="button" class="hide-details hidden">Hide details</button>`
}

$(function showAllDetails(){
    $('body').on("click", ".all-details", function(event){
        event.preventDefault();
        $(this).prev('p').toggleClass("hidden");
        $(this).prev('span').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).next('button').toggleClass("hidden");
    });
});

$(function hideAllDetails(){
    $('body').on("click", ".hide-all", function(event){
        event.preventDefault();
        $(this).prev('button').prev().prev('p').toggleClass("hidden");
        $(this).prev().prev('span').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).prev('button').toggleClass("hidden");
    });
});

$(function viewVideo(){
    $('body').on("click", ".view-video", function(event){
        event.preventDefault();
        $(this).prev('iframe').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).next('button').toggleClass("hidden");
    });
})

$(function hideVideo(){
    $('body').on("click", ".hide-video", function(event){
        event.preventDefault();
        $(this).prev('button').prev('iframe').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).prev('button').toggleClass("hidden");
    });
})

function noResults(){
   $('#result-list').append(`<p class="no-results">There were no results returned from this search.<br>
   Is it spelled correctly?<br>
   Is it in the right category?</p>`)
}

function displayResults(responseJson, maxResults){
    // console.log(responseJson.data);
    let data = responseJson.data;
    $('#results').removeClass('hidden');
};

function watchForm() {
    const favorites = {};

    $('form').submit(event => {
        event.preventDefault();
        const category = (document.getElementById("category").value);
        const searchItem = (document.getElementById("item-to-search").value);
        searchByQuery(searchItem, category);
    });
}

$(function showFavorites(){
    $('.fav-recs').on('click', '.favorite-recs', function(event){
        event.preventDefault();
        if($('.favorites-content').children().length != 0){
            $(this).next().toggleClass('hidden');
            $('#search-container').toggleClass('hidden');
            $(this).next().next().toggleClass('hidden');
        } else {
            window.alert("There are no favorited items!");
        }
    })
});



$(function removeFavorites(){
    $('#favorites').on('click', '.remove-favorite', function(event){
        event.preventDefault();
        $(this).closest('li').remove();
        if($('#favorites').children().length == 0){
            $('#favorites').toggleClass('hidden');
            $('#search-container').toggleClass('hidden');
            $('.share').toggleClass('hidden');
        }
    });
})

$(function addToFavorites(){
    $('#result-list').on("click", ".favorite", function(event){
        event.preventDefault();
        let favoriteToAdd = $(this).closest('li');
        let checkFavorite = $(this).closest('li').children('h4').text();

        if(!inFavorites(checkFavorite)){
            $(favoriteToAdd).clone().appendTo("#favorites");
            $('#favorites iframe').addClass('hidden');
            $('#favorites .favorite').remove();
            $("#favorites li").last().append(`<button type="button" class="remove-favorite">Remove Favorite</button>`);
        } else{
            alert('You have favorited this already');
        }
        
    });
});

$(function shareFavorites(){
    $('.fav-recs').on('click', '.share', function(event){
        event.preventDefault();
        let favToShare = listOfFavorites();
        copyToClipboard(favToShare);
        alert('Copied favorites to clipboard!');
    })
});

function copyToClipboard(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}

function listOfFavorites(){
    let favorites = [];
    $("#favorites li h4").each(function() {favorites.push($(this).text())});
    return favorites.join(", ")
}

function inFavorites(newObj){
    let arrayFavorites = listOfFavorites().split(", ")   
    return arrayFavorites.some(function(name){
        return name === newObj;
    });
};

$(function() {
    console.log('App loaded! Waiting for submit!');
    watchForm();
});