var filterText = ko.observable("");
var map, infoWindow;
var apiUrl = "http://api.nytimes.com/svc/search/v2/articlesearch.json?sort=newest&api-key=f7e8a625301e4a5eb74d4f10564eddd3&q=";

var placesData = [{
        position: { lat: 35.6927706, lng: 139.7311532 },
        title: "防衛省",
        search: "5-1 Ichigayahonmurachō, Shinjuku-ku, Tōkyō-to 162-8801日本"
    },
    {
        position: { lat: 35.6961956, lng: 139.7366887 },
        title: "法政大学",
        search: "日本〒162-0843 Tōkyō-to, Shinjuku-ku, Ichigayatamachi, 2 Chome−３３"
    },
    {
        position: { lat: 35.6953001, lng: 139.7315739 },
        title: "日本大学",
        search: "1 Chome-1-1 Ichigayakagachō, Shinjuku-ku, Tōkyō-to 162-8001日本"
    },
    {
        position: { lat: 35.6906062, lng: 139.7292717 },
        title: "大日本印刷",
        search: "日本〒162-0844 Tōkyō-to, Shinjuku-ku, Ichigayahachimanchō, １５"
    },
    {
        position: { lat: 35.6974045, lng: 139.733663 },
        title: "加藤医院",
        search: "7 Fukuromachi, Shinjuku-ku, Tōkyō-to 162-0828日本"
    }
];

var Place = function(data) {
    var self = this;

    this.title = data.title;
    this.position = data.position;

    this.visible = ko.computed(function(){
        var placeName = self.title.toLowerCase();
        var re = filterText().toLowerCase();
        return (placeName.indexOf(re) != -1)
    });

    this.marker = new google.maps.Marker({
        position: self.position,
        title: self.title,
        animation: google.maps.Animation.DROP
    });
        // 打开InfoWindow
    google.maps.event.addListener(self.marker, "click", function(){
        infoWindow.setContent(self.title);
        infoWindow.open(map, self.marker);
    
        // 图标点开时显示跳跃动画
        if (self.marker.getAnimation() != null) {
            self.marker.setAnimation(null);
        }
        else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function(){
                self.marker.setAnimation(null);
            },2000);
        }

        // ajax请求数据
        $.ajax({
            url: apiUrl + self.title,
            dataType: "json",
            timeout: 5000
        }).done(function(data){
            infoWindow.setContent(data.response.docs[0].snippet);
            infoWindow.open(map, self.marker)
        }).fail(function(){
            alert("API加载错误");
        });
    });
}

var ViewModel = function(){
    var self = this;

    this.placesList = [];
    placesData.forEach(function(data){
        self.placesList.push(new Place(data))
    });

    this.filteredList = ko.computed(function(){
        var result = [];
        self.placesList.forEach(function(place){
            if(place.visible()){
                result.push(place);
                place.marker.setMap(map, place.position); 
            }
            else {
                place.marker.set(null);
            }
           
        });
        return result;
    });
    this.ListClick = function(place){
        google.maps.event.trigger(place.marker, "click");
    }
}

function start(){
    map = new google.maps.Map(document.getElementById("map"), {center: placesData[2].position, zoom: 13});
    infoWindow = new google.maps.InfoWindow();
    ko.applyBindings (new ViewModel());
}

function googleEroor() {
    alert("地图加载错误")
}