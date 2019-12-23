var mapModel = {
    data:{
        map:null,
        mapOptions:{
            chart: {
                events: {
                    drilldown: function (e){
                        mapModel.drillDown(e);
                    },
                    drillup: function(e) {

                        mapModel.data.map.setTitle({
                            text: e.seriesOptions.name || '中国'
                        });
                    }
                }
            },
            title: {
                text: '中国地图'
            },
            subtitle: {
                useHTML: true,
                text: '标题哈哈哈'
            },
            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'left'
                }
            },
            tooltip: {
                useHTML: true,
                headerFormat: '<table><tr><td>{point.name}</td></tr>',
                pointFormat: '<tr><td>全称</td><td>{point.properties.fullname}</td></tr>' +
                    '<tr><td>行政编号</td><td>{point.properties.areacode}</td></tr>' +
                    '<tr><td>父级</td><td>{point.properties.parent}</td></tr>' +
                    '<tr><td>经纬度</td><td>{point.properties.longitude},{point.properties.latitude}</td></tr>' +
                    '<tr><td>值</td><td>{point.value}</td></tr>' ,
                footerFormat: '</table>'
            },
            // colors: ['rgba(0,255,101,1)', 'rgba(0,255,101,0.8)', 'rgba(0,255,101,0.2)','rgba(255,255,255,1)', 'rgba(255,0,0,0.2)', 'rgba(255,0,0,0.8)', 'rgba(255,0,0,1)'],
            colorAxis: {
                min: 0,
                max: 100,
                minColor: '#fff',
                maxColor: '#ff0000',
                // dataClassColor: 'category',
                dataClassColor: 'between',
                // dataClasses: [{
                //     to: -100
                // }, {
                //     from: -100,
                //     to: -50
                // }, {
                //     from: -50,
                //     to: 0
                // }, {
                //     from: 0,
                //     to: 0
                // }, {
                //     from: 0,
                //     to: 50
                // }, {
                //     from: 50,
                //     to: 100
                // },
                //     {
                //         from: 100,
                //     }],
                labels:{
                    style:{
                        "color":"red","fontWeight":"bold"
                    }
                }
            },
            series: [{
                data: [],
                mapData: [],
                joinBy: 'name',
                dataLabels: {
                    enabled: true,
                    format: '{point.name}'
                },
                name: '中国地图',
                states: {
                    hover: {
                        color: '#a4edba'
                    }
                }
            },
                {
                    type: 'mappoint',
                    name: '测试标点',
                    color: "black",
                    data: []
                }
            ],
        }
    },
    init:function () {
        this.highChartSetInit();
        this.getProvinceMapData();
    },
    //相关highchart设置初始化
    highChartSetInit:function () {
        Highcharts.setOptions({
            lang: {
                drillUpText: '< 返回 “{series.name}”'
            }
        });
    },
    //获取全国-省份地图
    getProvinceMapData:function () {
        var self = this;
        $.getJSON('./data/china/china.json', function(mapdata) {
            //没有真实数据，故造随机模拟数据
            var data = self.setRandomData(mapdata);
            self.data.mapOptions.series[0].data = data;
            self.data.mapOptions.series[0].mapData = mapdata;
            self.data.mapOptions.series[1].data = [
                {
                    name: '我是一个测试点',
                    lon: '104.15412505859376',
                    lat: '30.645663137983636',
                    color: 'green'
                }
            ];
            self.data.map = new Highcharts.Map('container',self.data.mapOptions);
        })
    },
    //造随机模拟数据
    setRandomData:function (mapdata) {
        var result = [];
        Highcharts.each(mapdata.features, function(md, index) {
            var tmp = {
                name: md.properties.name,
                value: Math.floor((Math.random() * 100)) // 生成 1 ~ 100 随机值
            };
            if(md.properties.drilldown) {
                tmp.drilldown = md.properties.drilldown;
            }
            result.push(tmp);
        });
        return result;
    },
    //地图下钻
    drillDown:function (e) {
        // this.tooltip.hide();
        console.log(e);
        var map = this.data.map;
        // 异步下钻
        if (e.point.drilldown) {
            var pointName = e.point.properties.fullname;
            var _url;
            if(e.point.drilldown.split('/').length > 1) {
                _url = './data/china/'+e.point.drilldown + '.json';
            } else {
                _url = './data/china/'+e.point.drilldown + '/' + e.point.drilldown + '.json';
            }
            map.showLoading('下钻中，请稍后...');

            // 获取二级行政地区数据并更新图表
            $.getJSON(_url, function(data) {
                data = Highcharts.geojson(data);
                Highcharts.each(data, function(d) {
                    if(d.properties.drilldown) {
                        d.drilldown = d.properties.drilldown;
                    }
                    d.value = Math.floor((Math.random() * 100) + 1); // 生成 1 ~ 100 随机值
                });
                map.hideLoading();
                var tempPoint = $.extend(true,{},e.point);

                map.addSeriesAsDrilldown(e.point, {
                        name: e.point.name,
                        data: data,
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}'
                        }
                    }
                );
                map.applyDrilldown();
                /*map.addSeries(
                    {
                        type: 'mappoint',
                        name: '测试标点',
                        color: "black",
                        data: [{
                            name: '我是一个测试点',
                            lon: '104.15412505859376',
                            lat: '30.645663137983636',
                            color: 'green'
                        }]
                    }
                );*/
                map.setTitle({
                    text: pointName
                });
            });
        }
    }
};
$(function () {
    mapModel.init();
});