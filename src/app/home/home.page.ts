import { AfterViewInit, Component } from '@angular/core';
import * as scrollama from 'scrollama';
import * as d3 from 'd3';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

    constructor() { }

    ngAfterViewInit(): void {
        // using d3 for convenience
        var main = d3.select("main");

        //sticky side
        var scrolly = main.select("#scrolly");
        var figure = scrolly.select("figure");
        var article = scrolly.select("article");
        var step = article.selectAll(".step");

        //overlay
        var healthyRivers = main.select("#healthy_rivers");
        var figureOverlay = healthyRivers.select("figure");
        var articleOverlay = healthyRivers.select("article");
        var stepOverlay = articleOverlay.selectAll(".step");

        // initialize the scrollama
        var scroller = scrollama() as any;
        var healthyRiversScroller = scrollama() as any;

        // generic window resize listener event
        function handleResize() {
            // 1. update height of step elements
            var stepH = Math.floor(window.innerHeight * 0.75);
            step.style("height", stepH + "px");
            stepOverlay.style("height", stepH + "px");

            var figureHeight = window.innerHeight / 2;
            var figureMarginTop = (window.innerHeight - figureHeight) / 2;

            figure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            figureOverlay
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            // 3. tell scrollama to update new element dimensions
            scroller.resize();
            healthyRiversScroller.resize();
        }

        // scrollama event handlers
        function handleStepEnter(response) {
            console.log(response);
            // response = { element, direction, index }

            // add color to current step only
            step.classed("is-active", function (d, i) {
                return i === response.index;
            });

            // update graphic based on step
            figure.select("p").text(response.index + 1);
        }

        // scrollama event handlers
        function handleStepEnterHealthyRivers(response) {
            console.log(response);
            // response = { element, direction, index }

            // add color to current step only
            stepOverlay.classed("is-active", function (d, i) {
                return i === response.index;
            });

            // update graphic based on step
            let maps = figureOverlay.selectAll("img");
            let currentStep = response.index + 1;
            maps.each(function () {
                let imgStep = this.dataset.step.split(',');
                let isActive = imgStep['0'] === 'all' || imgStep.includes(""+currentStep);
                this.classList.toggle('active', isActive);
            });
            console.log(maps);
        }


        function init() {

            // 1. force a resize on load to ensure proper dimensions are sent to scrollama
            handleResize();

            // 2. setup the scroller passing options
            // 		this will also initialize trigger observations
            // 3. bind scrollama event handlers (this can be chained like below)
            scroller
                .setup({
                    step: "#scrolly article .step",
                    offset: 0.33,
                    debug: false
                })
                .onStepEnter(handleStepEnter);

            healthyRiversScroller
                .setup({
                    step: "#healthy_rivers article .step",
                    offset: 0.33,
                    debug: false
                })
                .onStepEnter(handleStepEnterHealthyRivers);
        }

        // kick things off
        init();
    }

}
