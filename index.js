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
    
    console.log(params);

    const queryString = formatQueryParams(params);
    const fetchUrl = url + queryString;

    console.log(fetchUrl);
    
    $.ajax({
        url: fetchUrl,
        dataType: 'jsonp',
        success: (data) => {
          printResults(data, maxResults);
        }
    })
}

function printResults(data, maxResults){
    let searchList = data.Similar.Results;
    $('#result-list').empty();
    $('#results').removeClass('hidden');

    if(searchList.length){
        addResults(searchList, maxResults);
    }else{
        noResults();
    }
}

function addResults(searchList, maxResults){
    for(let i = 0; i < maxResults; i++){
        let itemToPrint = searchList[i];
        console.log(itemToPrint);
        let info = detailedInfo(itemToPrint);
        let sampleVideo = getVideo(itemToPrint.yUrl);
        
        $('#result-list').append(`<li><h4>${itemToPrint.Name}</h4>
            ${sampleVideo}
            ${info}
            <button type="button" class="favorite">Favorite this!</button>
            </li>`);
    }
}

function getVideo(videoUrl){
    if(videoUrl != null){
        return `<iframe width="220px" height="220
    0px" src="${videoUrl}" allow="fullscreen"></iframe>`
    } else{
        return `<p></p>`
    }
    
}

function detailedInfo(details){
    const shortDetails = details.wTeaser.slice(0,200);
    return `<p class="details hidden">${shortDetails}
    <span class="hidden">${details.wTeaser}</span> 
    <button type="button" class="all-details">See more</button>
    <button type="button" class="hide-all hidden">Hide details</button></p>
    <button type="button" class="show-details">Show details</button>
    <button type="button" class="hide-details hidden">Hide details</button>`
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

$(function showDetails(){
    $('body').on("click", ".show-details", function(event){
        event.preventDefault();
        $(this).prev('p').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).next('button').toggleClass("hidden");
    });
})

$(function hideDetails(){
    $('body').on("click", ".hide-details", function(event){
        event.preventDefault();
        $(this).prev('button').prev('p').toggleClass("hidden");
        $(this).toggleClass("hidden");
        $(this).prev('button').toggleClass("hidden");
    });
})

function noResults(){
   window.alert(`Returned zero results\nIs your search spelled correctly?\nAre you searching in the correct category?`)
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
        console.log(favToShare);
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