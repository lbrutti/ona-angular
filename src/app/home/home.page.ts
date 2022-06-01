import { AfterViewInit, Component } from '@angular/core';
import * as scrollama from 'scrollama';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

    constructor() { }

    ngAfterViewInit() {
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
