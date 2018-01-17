var filterText = ko.observable("");
var map, infoWindow;
var apiUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&api-key=762c55cae5dc4fe2a7404eee42fdddeb&q=";

var placesDS = [{
        placePosition: { lat: 35.6927706, lng: 139.7311532 },
        title: "防衛省",
        search: "5-1 Ichigayahonmurachō, Shinjuku-ku, Tōkyō-to 162-8801日本"
    },
    {
        placePosition: { lat: 35.6961956, lng: 139.7366887 },
        title: "法政大学",
        search: "日本〒162-0843 Tōkyō-to, Shinjuku-ku, Ichigayatamachi, 2 Chome−３３"
    },
    {
        placePosition: { lat: 35.6953001, lng: 139.7315739 },
        title: "日本大学",
        search: "1 Chome-1-1 Ichigayakagachō, Shinjuku-ku, Tōkyō-to 162-8001日本"
    },
    {
        placePosition: { lat: 35.6906062, lng: 139.7292717 },
        title: "大日本印刷",
        search: "日本〒162-0844 Tōkyō-to, Shinjuku-ku, Ichigayahachimanchō, １５"
    },
    {
        placePosition: { lat: 35.6974045, lng: 139.733663 },
        title: "加藤医院",
        search: "7 Fukuromachi, Shinjuku-ku, Tōkyō-to 162-0828日本"
    }
];

var Place = function(data) {
    var tp = this;

    this.title = data.title;
    this.placePosition = data.placePosition;
    
    this.vsrult = ko.computed(function(){
        var thePlace = tp.title.toLowerCase();
        var c = filterText().toLowerCase();
        return (thePlace.indexOf(c) != -1)
    });

    this.marker = new google.maps.Marker({
        position: tp.placePosition,
        title: tp.title,
        animation: google.maps.Animation.DROP
    });
        // 打开InfoWindow
    google.maps.event.addListener(tp.marker, "click", function(){
        infoWindow.setContent(tp.title);
        infoWindow.open(map, tp.marker);
    
        // 图标点开时显示跳跃动画
        if (tp.marker.getAnimation() != null) {
            tp.marker.setAnimation(null);
        }
        else {
            tp.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){
                tp.marker.setAnimation(null);
            },2000);
        }

        // ajax请求数据
        $.ajax({
            url: apiUrl + tp.search,
            dataType: "json",
            timeout: 5000
        }).done(function(data){
            infoWindow.setContent(data.response.docs[0].snippet);
            infoWindow.open(map, tp.marker)
        }).fail(function(){
            alert("API加载错误");
        });
    });
}

var AppViewModel = function(){
    var tp = this;

    this.placesList = [];
    placesDS.forEach(function(data){
        tp.placesList.push(new Place(data))
    });

    this.filteredList = ko.computed(function(){
        var result = [];
        tp.placesList.forEach(function(place){
            if(place.vsrult()){
                result.push(place);
                place.marker.setMap(map, place.placePosition); 
            }
            else {
                place.marker.set(null);
            }
           
        });
        return result;
    });
    this.listClick = function(place){
        google.maps.event.trigger(place.marker, "click");
    }
}

function start(){
    map = new google.maps.Map(document.getElementById("map"), {center: placesDS[2].placePosition, zoom: 15});
    infoWindow = new google.maps.InfoWindow();
    ko.applyBindings (new AppViewModel());
}

function googleEroor() {
    alert("地图加载错误")
}