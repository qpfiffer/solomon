
angular.module('askApp')
    .directive('rangeSlider', function() {

    return {
        template: '<div class="range-slider"></div>',
        restrict: 'EA',
        replace: true,
        transclude: true,
        scope: {
            start: "=start",
            end: "=end"
        },
        link: function (scope, element, attrs) {
            // initialize slider
            scope.initializeSlider = _.once(function () {
                element.editRangeSlider({
                    formatter:function(val){
                        var date = new Date(val);
                        var days = date.getDate(),
                            month = date.getMonth() + 1,
                            year = date.getFullYear();
                        return days + "/" + month + "/" + year;
                    },
                    bounds:{
                        min: scope.start.valueOf(),
                        max: scope.end.valueOf()
                    },
                    set: 86400/*{
                        days: 1
                    }*/
                });
            });

            // listen from updates for the controller
            if (attrs.start) {
                scope.$watch('start', function (newStart) {
                    if (newStart) {
                        scope.initializeSlider();
                        element.editRangeSlider("min", newStart.valueOf());
                    }
                });
            }
            if (attrs.end) {
                scope.$watch('end', function (newEnd) {
                    if (newEnd) {
                        scope.initializeSlider();
                        element.editRangeSlider("max", newEnd.valueOf());
                    }
                });
            }

            // bind change event
            element.bind("userValuesChanged", function(e, data){
                scope.$apply(function(s) {
                    if (attrs.start) {
                        s.start = data.values.min;//.clearTime();
                    }
                    if (attrs.end) {
                        s.end = data.values.max;//.clearTime();
                    }
                });
            });
        }
    }
});
