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
        var scrolly = main.select("#scrolly");
        var figure = scrolly.select("figure");
        var article = scrolly.select("article");
        var step = article.selectAll(".step");

        // initialize the scrollama
        var scroller = scrollama();

        // generic window resize listener event
        function handleResize() {
            // 1. update height of step elements
            var stepH = Math.floor(window.innerHeight * 0.75);
            step.style("height", stepH + "px");

            var figureHeight = window.innerHeight / 2;
            var figureMarginTop = (window.innerHeight - figureHeight) / 2;

            figure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            // 3. tell scrollama to update new element dimensions
            scroller.resize();
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

        // function setupStickyfill() {
        //     d3.selectAll(".sticky").each(function () {
        //         Stickyfill.add(this);
        //     });
        // }

        function init() {
            // setupStickyfill();

            // 1. force a resize on load to ensure proper dimensions are sent to scrollama
            handleResize();

            // 2. setup the scroller passing options
            // 		this will also initialize trigger observations
            // 3. bind scrollama event handlers (this can be chained like below)
            scroller
                .setup(({
                    step: "#scrolly article .step",
                    offset: 0.33,
                    debug: false
                } as any))
                .onStepEnter(handleStepEnter);
        }

        // kick things off
        init();
    }
    __ngAfterViewInit() {
        var scrolly = document.querySelector("#scrolly");
        var article = scrolly.querySelector("article");
        var step = article.querySelectorAll(".step");

        // initialize the scrollama
        var scroller = scrollama();

        // scrollama event handlers
        function handleStepEnter(response) {
            // response = { element, direction, index }
            console.log(response);
            // add to color to current step
            response.element.classList.add("is-active");
        }

        function handleStepExit(response) {
            // response = { element, direction, index }
            console.log(response);
            // remove color from current step
            response.element.classList.remove("is-active");
        }

        function init() {
            // set random padding for different step heights (not required)
            step.forEach(function (step) {
                var v = 100 + Math.floor((Math.random() * window.innerHeight) / 4);
                (step as any).style.padding = v + "px 0px";
            });

            // 1. setup the scroller with the bare-bones options
            // 		this will also initialize trigger observations
            // 2. bind scrollama event handlers (this can be chained like below)
            scroller
                .setup({
                    step: "#scrolly article .step",
                    debug: false,
                    offset: 0.5
                })
                .onStepEnter(handleStepEnter)
                .onStepExit(handleStepExit);

        }

        // kick things off
        init();
    }
}
