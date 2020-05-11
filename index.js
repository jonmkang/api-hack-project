'use strict'

//This function formats the paramters into a query format
function formatQueryParams(params) {
    const queryItems = Object.keys(params).map(key => `${key}=${params[key]}`);
    return queryItems.join('&');
}

//This function prepares the ajax request based on search value
function searchByQuery(query, category, maxResults=10){
    const url = `https://tastedive.com/api/similar?`;
    const joinedQuery = query.split(" ").join("+");
    const api_key = '366850-Jonathan-5AL0N426';
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

//This function prepares the list, removing old results
function printResults(data, maxResults, category){
    let searchList = data.Similar.Results;

    $('#result-list').empty();

    if(searchList.length){
        addResults(searchList, maxResults, category);
    }else{
        noResults();
    }
}

//This function takes the response, extracts information from the objects,
//and appends each result object to an unordered list.
//If no results are found, it calls noResults.
async function addResults(searchList, maxResults, category){
    for(let i = 0; i < maxResults; i++){
        let itemToPrint = searchList[i];
        let detailsList = " ";

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

//This function sorts the result object by type to extract different information based on object type
function sortByType(item){
    if(item.Type === "music"){
        return detailedInfo(item);
    } else {
        return movieInfo(item.Name);
    }
}

//This function gets a video sample. 
//It changes the "sample" based off the type, if it's movie/tv show or music.
function getVideo(videoUrl){

    if(videoUrl.yUrl != null){
        let type = videoUrl.Type;
        let typesOfVideo = {
            movie: "Trailer",
            music: "Sample",
            show: "Trailer"
        }

        return `<iframe class="video hidden" src="${videoUrl.yUrl}" allow="fullscreen"></iframe><button type="button" class="view-video">Show ${typesOfVideo[type]}</button><button type="button" class="hide-video hidden">Hide video</button>`;
    } else{
        return `<p></p>`;
    }
    
}

//This function creates a fetch request for movies and tv shows details
async function movieInfo(movieName){
    const url = `https://www.omdbapi.com/?`;
    const joinedQuery = movieName.split(" ").join("+");
    const api_key = '36dccbe4';
    const params = {
        t: joinedQuery,
        apikey: api_key        
        };

    const queryString = formatQueryParams(params);
    const fetchUrl = url + queryString;

   

    let details = await fetch(fetchUrl, )
        .then(response => {return response.json()})
        .catch(err => console.log('Something went wrong'));

    let posterUrl = details.Poster;
    let plot = details.Plot;
    let rating = details.imdbRating;
    let length = details.Runtime;

    if(!plot){
        return `<img src="https://i.pinimg.com/236x/cc/32/69/cc32690c49d90effb38d8eaf96c03ad1.jpg" height="300px" width="200px"><p class="details">This plot wasn't in the database.</p>` 
    }else {
        return `<h5>Rating out of 10: ${rating}<br>Length: ${length}</h5><img src="${posterUrl}" alt="${details.Title} Poster" height="300px" width="200px"><p class="details">${plot}</p>`
    }
}

//This function extracts wikipedia data for music
function detailedInfo(details){
    const shortDetails = details.wTeaser.slice(0,300);

    if(shortDetails){
        return `<p class="details">${shortDetails}<span class="hidden">${details.wTeaser}</span> <button type="button" class="all-details">See more</button><button type="button" class="hide-all hidden">Hide details</button></p>`;
    }else{
        return `<p>No information found in the database.</p>`;
    }
}

//This function toggles music detail length, if user would like to see all of the information or a shortened version
$(function showAllDetails(){
    $('body').on("click", ".all-details", function(event){
        event.preventDefault();
        $(this).prev('p').toggleClass("hidden");
        $(this).prev('span').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).next('button').toggleClass("hidden");
    });
});

//This function toggles the full detail for a music result
$(function hideAllDetails(){
    $('body').on("click", ".hide-all", function(event){
        event.preventDefault();
        $(this).prev('button').prev().prev('p').toggleClass("hidden");
        $(this).prev().prev('span').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).prev('button').toggleClass("hidden");
    });
});

//This function allows the user to click a button show the sample video.
$(function viewVideo(){
    $('body').on("click", ".view-video", function(event){
        event.preventDefault();
        $(this).prev('iframe').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).next('button').toggleClass("hidden");
    });
})

//This function allows the user to click a button hide the sample video.
$(function hideVideo(){
    $('body').on("click", ".hide-video", function(event){
        event.preventDefault();
        $(this).prev('button').prev('iframe').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).prev('button').toggleClass("hidden");
    });
})

//This function alerts the user when no results are found for the search.
function noResults(){
   $('#result-list').append(`<p class="no-results">There were no results returned from this search.<br>Is it spelled correctly?<br>Is it in the right category?</p>`);
}

//This function makes the correct values for the form are being searched.
function watchForm() {
    const favorites = {};

    $('form').submit(event => {
        event.preventDefault();
        const category = (document.getElementById("category").value);
        const searchItem = (document.getElementById("item-to-search").value);
        searchByQuery(searchItem, category);
    });
}

//This function shows the favorites list.
$(function showFavorites(){
    $('.fav-recs').on('click', '.favorite-recs', function(event){
        event.preventDefault();
        if($('.favorites-content').children().length != 0){
            $(this).toggleClass('hidden');
            $('.return-search').toggleClass('hidden');
            $('#favorites').toggleClass('hidden');
            $('#search-container').toggleClass('hidden');
            $('.share').toggleClass('hidden');
        } else {
            $('.no-favorites').animate({opacity: '100%'});
            $('.no-favorites').css('display', 'inline');
            $('.no-favorites').fadeOut(2000);
        }
    });
})

//This function returns to the search list
$(function returnToSearch(){
    $('.fav-recs').on('click', '.return-search', function(event){
        event.preventDefault();
        $('.favorite-recs').toggleClass('hidden');
        $(this).toggleClass('hidden');
        $('#favorites').toggleClass('hidden');
        $('.share').toggleClass('hidden');
        $('#search-container').toggleClass('hidden');
        $('.copy-message').removeClass('hide').removeClass('visible').addClass('hide');
    });
});




//This function allows favorites to be removed from the favorite list.
$(function removeFavorites(){
    $('#favorites').on('click', '.remove-favorite', function(event){
        event.preventDefault();
        $(this).closest('li').remove();
        if($('#favorites').children().length == 0){
            $('#favorites').toggleClass('hidden');
            $('#search-container').toggleClass('hidden');
            $('.share').toggleClass('hidden');
            $('.favorite-recs').toggleClass('hidden');
            $('.return-search').toggleClass('hidden');
            $('.copy-message').removeClass('hide').removeClass('visible').addClass('hide');
        }
    });
});

//This function allows the user to add favorites to the favorite list.
//Alerts the user if favorited item is already favorited
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
            $('.in-favorites').animate({opacity: '100%'});
            $('.in-favorites').css('display', 'inline');
            $('.in-favorites').fadeOut(2000);
        }
        
    });
});

//This function sets the button to share
$(function shareFavorites(){
    $('nav').on('click', '.share', function(event){
        event.preventDefault();
        let favToShare = listOfFavorites();
        copyToClipboard(favToShare);
        $('.copy-message').toggleClass('visible').toggleClass('hide')
    })
});

//This function is called when the share button is called. 
//It copies the favorited list to the user's clipboard.
function copyToClipboard(text) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(text).select();
    document.execCommand("copy");
    $temp.remove();
}

//This function finds all favorited headers and returns them as one string
function listOfFavorites(){
    let favorites = [];
    $("#favorites li h4").each(function() {favorites.push($(this).text())});
    return favorites.join(", ");
}
//This function checks if an object is already in favorites
function inFavorites(newObj){
    let arrayFavorites = listOfFavorites().split(", ")   
    return arrayFavorites.some(function(name){
        return name === newObj;
    });
};


$(function() {
    watchForm();
});