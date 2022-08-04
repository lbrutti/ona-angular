import { AfterViewInit, Component } from '@angular/core';
import * as scrollama from 'scrollama';
import * as d3 from 'd3';
import { Platform } from '@ionic/angular';
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
    public sliderDirection = 'horizontal';
    constructor(public platform: Platform) {
        this.sliderDirection = this.platform.is('mobile') ? 'vertical' : 'horizontal';
    }

    barrierCount = 0;
    async ngAfterViewInit(): Promise<any> {
        // using d3 for convenience
        var main = d3.select("main");


        //healthy river
        var healthyRivers = main.select("#healthy_rivers");
        var figureOverlay = healthyRivers.select("figure");
        var articleOverlay = healthyRivers.select("article");
        var stepOverlay = articleOverlay.selectAll(".step");

        //connectivity (sticky side)
        var riverConnectivities = main.select("#river_connectivities");
        var figure = riverConnectivities.select("figure");
        var article = riverConnectivities.select("article");
        var step = article.selectAll(".step");

        //load connectivity imgs
        let lateralConnectivityImg = await d3.xml('assets/imgs/svg/connectivity/lateral.svg');
        let longitudinalConnectivityImg = await d3.xml('assets/imgs/svg/connectivity/longitudinal.svg');
        let temporalConnectivityImg = await d3.xml('assets/imgs/svg/connectivity/temporal.svg');
        let verticalConnectivityImg = await d3.xml('assets/imgs/svg/connectivity/vertical.svg');
        (riverConnectivities.select('#lateral_img').node() as any).append(lateralConnectivityImg.documentElement);
        (riverConnectivities.select('#longitudinal_img').node() as any).append(longitudinalConnectivityImg.documentElement);
        (riverConnectivities.select('#temporal_img').node() as any).append(temporalConnectivityImg.documentElement);
        (riverConnectivities.select('#vertical_img').node() as any).append(verticalConnectivityImg.documentElement);


        //antropogenic threats svgs

        var threats = main.select("#anthropogenic_threats");
        var threatsFigure = threats.select("figure");
        var threatsArticle = threats.select("article");
        var threatsStep = threatsArticle.selectAll(".step");

        let dams = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_dams.svg');
        let ramps = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_ramps.svg');
        let weirs = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_weirs.svg');
        let culverts = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_culverts.svg');
        let sluices = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_sluices.svg');
        let others = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_fords_other.svg');
        let hexbins = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_count_wgs84_more_data.svg');
        dams.documentElement.setAttribute('width', 'auto');
        dams.documentElement.setAttribute('height', 'auto');
        ramps.documentElement.setAttribute('width', 'auto');
        ramps.documentElement.setAttribute('height', 'auto');
        weirs.documentElement.setAttribute('width', 'auto');
        weirs.documentElement.setAttribute('height', 'auto');
        culverts.documentElement.setAttribute('width', 'auto');
        culverts.documentElement.setAttribute('height', 'auto');
        sluices.documentElement.setAttribute('width', 'auto');
        sluices.documentElement.setAttribute('height', 'auto');
        others.documentElement.setAttribute('width', 'auto');
        others.documentElement.setAttribute('height', 'auto');
        hexbins.documentElement.setAttribute('width', 'auto');
        hexbins.documentElement.setAttribute('height', 'auto');

        d3.select(dams.documentElement).style('height', '100%');
        d3.select(ramps.documentElement).style('height', '100%');
        d3.select(weirs.documentElement).style('height', '100%');
        d3.select(culverts.documentElement).style('height', '100%');
        d3.select(sluices.documentElement).style('height', '100%');
        d3.select(others.documentElement).style('height', '100%');
        d3.select(hexbins.documentElement).style('height', '100%');

        (threats.select('#anthropogenic_threats_dams').node() as any).append(dams.documentElement);
        (threats.select('#anthropogenic_threats_ramps').node() as any).append(ramps.documentElement);
        (threats.select('#anthropogenic_threats_weirs').node() as any).append(weirs.documentElement);
        (threats.select('#anthropogenic_threats_culverts').node() as any).append(culverts.documentElement);
        (threats.select('#anthropogenic_threats_sluices').node() as any).append(sluices.documentElement);
        (threats.select('#anthropogenic_threats_others').node() as any).append(others.documentElement);
        (threats.select('#anthropogenic_threats_hex_bin').node() as any).append(hexbins.documentElement);
        let hexbinsPaths = threats.selectAll('#anthropogenic_threats_hex_bin #eu_barrier_count .hex');
        //this works only if paths are in foreground
        hexbinsPaths.each(function () {
            d3.select(this).on('mouseenter', function () {
                let points = (this as any).dataset.points;
                // alert(`Contengo ${points} sbarramenti! buonanotte.`);
                d3.select(this).classed('focused', true)
            });

            d3.select(this).on('mouseleave', function () {
                d3.select(this).classed('focused', false)
            });
        });


        // initialize the scrollama
        var healthyRiversScroller = scrollama() as any;
        var threatsScroller = scrollama() as any;
        var riverConnectivityScroller = scrollama() as any;

        // generic window resize listener event
        function handleResize() {
            // 1. update height of step elements
            var stepH = Math.floor(window.innerHeight * 0.75);
            step.style("height", stepH + "px");
            stepOverlay.style("height", stepH + "px");
            threatsStep.style("height", stepH + "px")

            var figureHeight = window.innerHeight; // / 2;
            var figureMarginTop = 0;// (window.innerHeight - figureHeight) / 2;

            figure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            figureOverlay
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            threatsFigure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");
            // 3. tell scrollama to update new element dimensions
            riverConnectivityScroller.resize();
            healthyRiversScroller.resize();
            threatsScroller.resize();
        }

        // scrollama event handlers
        function handleStepEnterConntectivities(response: any) {
            console.log(response);
            // response = { element, direction, index }

            // add color to current step only
            step.classed("is-active", function (d, i) {
                return i === response.index;
            });

            // update graphic based on step
            let connectivityAnimations = figure.selectAll(".river_connectivity_animation");
            let currentStep = response.index + 1;
            connectivityAnimations.each(function () {
                let imgStep = (this as any).dataset.step.split(',');
                let isActive = imgStep['0'] === 'all' || imgStep.includes("" + currentStep);
                (this as any).classList.toggle('active', isActive);
            });
        }

        // scrollama event handlers
        function handleStepEnterHealthyRivers(response: any) {
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
                let imgStep = (this as any).dataset.step.split(',');
                let isActive = imgStep['0'] === 'all' || imgStep.includes("" + currentStep);
                (this as any).classList.toggle('active', isActive);
            });
        }

        function handleStepEnterThreats(response: any) {
            console.log(response);
            threatsStep.classed("is-active", function (d, i) {
                return i === response.index;
            });

            // update graphic based on step
            let maps = threatsFigure.selectAll(".anthropogenic_threats");
            let currentStep = response.index + 1;
            maps.each(function () {
                let activeSteps = (this as any).dataset.step.split(',');
                let transitionStep = (this as any).dataset.transitionStep || -1;
                let isActive = activeSteps['0'] === 'all' || activeSteps.includes("" + currentStep);
                let isTranstioned = currentStep >= +transitionStep;
                let isForeground = (this as any).dataset.foregroundStep == currentStep;
                (this as any).classList.toggle('active', isActive);
                (this as any).classList.toggle('transitioned', isTranstioned);
                if (isForeground && isActive) {
                    threatsFigure.style('z-index', 1000);
                } else {
                    threatsFigure.style('z-index', 0);
                }
            });
        }

        function handleStepExit(response: any) {
            response.element.classList.remove('is-active');
            console.log('exit : ', response);
        }
        function init() {

            // 1. force a resize on load to ensure proper dimensions are sent to scrollama
            handleResize();

            // 2. setup the scroller passing options
            // 		this will also initialize trigger observations
            // 3. bind scrollama event handlers (this can be chained like below)
            riverConnectivityScroller
                .setup({
                    step: "#river_connectivities article .step",
                    offset: 0.75,
                    debug: false
                })
                .onStepEnter(handleStepEnterConntectivities)
                .onStepExit(handleStepExit);

            healthyRiversScroller
                .setup({
                    step: "#healthy_rivers article .step",
                    offset: 0.75,
                    debug: false
                })
                .onStepEnter(handleStepEnterHealthyRivers)
                .onStepExit(handleStepExit);

            threatsScroller
                .setup({
                    step: "#anthropogenic_threats article .step",
                    offset: 0.33,
                    debug: false
                })
                .onStepEnter(handleStepEnterThreats)
                .onStepExit(handleStepExit);

            return Promise.resolve();
        }



        // kick things off
        return init();
    }

}
