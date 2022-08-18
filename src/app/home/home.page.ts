import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as scrollama from 'scrollama';
import * as d3 from 'd3';
import { Platform } from '@ionic/angular';
import * as _ from 'lodash';
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {
    @ViewChild('popover') popover;
    @ViewChild('freshwater_index_chart_container') freshwater_index_chart_container: ElementRef;

    public sliderDirection = 'horizontal';
    public maxBreadcrumbItems: number = 1;
    constructor(public platform: Platform) {
        this.sliderDirection = this.platform.is('mobile') ? 'vertical' : 'horizontal';
        this.maxBreadcrumbItems = this.platform.is('mobile') ? 1 : 10;
    }
    isOpen = false;
    collapsedBreadcrumbs: HTMLIonBreadcrumbElement[] = [];
    barrierCount = 0;
    async ngAfterViewInit(): Promise<any> {
        // using d3 for convenience
        let main = d3.select("main");


        //healthy river
        let healthyRivers = main.select("#healthy_rivers");
        let healthyRiversFigure = healthyRivers.select("figure");
        let healthyRiversArticle = healthyRivers.select("article");
        let healthyRiversStep = healthyRiversArticle.selectAll(".step");

        //connectivity (sticky side)
        let riverConnectivities = main.select("#river_connectivities");
        let riverConnectivitiesFigure = riverConnectivities.select("figure");
        let riverConnectivitiesArticle = riverConnectivities.select("article");
        let riverConnectivitiesStep = riverConnectivitiesArticle.selectAll(".step");

        //load connectivity imgs
        let connectivity = await d3.xml('assets/imgs/svg/connectivity/connectivity.svg');
        connectivity.documentElement.setAttribute('width', 'auto');
        connectivity.documentElement.setAttribute('height', 'auto');

        d3.select(connectivity.documentElement).style('height', '100%');

        (riverConnectivities.select('#connectivity_image').node() as any).append(connectivity.documentElement);

        //antropogenic threats svgs

        let threats = main.select("#anthropogenic_threats");
        let threatsFigure = threats.select("figure");
        let threatsArticle = threats.select("article");
        let threatsStep = threatsArticle.selectAll(".step");

        await this.loadThreatsCharts(threats);


        //Freshwater decline
        let ecosystemImpacts = main.select("#ecosystem_impacts_viz");
        let ecosystemImpactsFigure = ecosystemImpacts.select("figure");
        let ecosystemImpactsArticle = ecosystemImpacts.select("article");
        let ecosystemImpactsStep = ecosystemImpactsArticle.selectAll(".step");
        // initialize the scrollama
        let healthyRiversScroller = scrollama() as any;
        let riverConnectivityScroller = scrollama() as any;
        let threatsScroller = scrollama() as any;
        let ecosystemImpactsScroller = scrollama() as any;

        // generic window resize listener event
        function handleResize() {
            // 1. update height of step elements
            let stepH = Math.floor(window.innerHeight * 0.5);
            riverConnectivitiesStep.style("height", stepH + "px");
            healthyRiversStep.style("height", stepH + "px");
            threatsStep.style("height", stepH + "px")

            let figureHeight = window.innerHeight; // / 2;
            let figureMarginTop = 0;// (window.innerHeight - figureHeight) / 2;

            riverConnectivitiesFigure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            healthyRiversFigure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            threatsFigure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            ecosystemImpactsFigure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            // 3. tell scrollama to update new element dimensions
            riverConnectivityScroller.resize();
            healthyRiversScroller.resize();
            threatsScroller.resize();
            ecosystemImpactsScroller.resize();
        }

        // scrollama event handlers
        function handleStepEnterConntectivities(response: any) {
            // response = { element, direction, index }

            // add color to current step only
            riverConnectivitiesStep.classed("is-active", function (d, i) {
                return i === response.index;
            });

            // update graphic based on step
            let connectivityAnimations = riverConnectivitiesFigure.selectAll(".river_connectivity_animation");
            let svg = d3.select('#connectivity_image svg');
            let currentStep = response.index + 1;
            //step 1: solo base image visibile
            svg.select('#base').classed("active", () => currentStep == 1);
            //step 2: solo Longitudinal image visibile
            svg.select('#longitudinal1').classed("active", () => currentStep == 2);
            svg.select('#longitudinal2').classed("active", () => currentStep == 2);
            //step 3: solo Lateral image visibile
            svg.select('#lateral1').classed("active", () => currentStep == 3);
            svg.select('#lateral2').classed("active", () => currentStep == 3);
            //step 4: solo Vertical image visibile
            svg.select('#vertical1').classed("active", () => currentStep == 4);
            svg.select('#vertical2').classed("active", () => currentStep == 4);
            //step 5: solo Temporal image visibile
            svg.select('#temporal1').classed("active", () => currentStep == 5);
            svg.select('#temporal2').classed("active", () => currentStep == 5);
            connectivityAnimations.each(function () {
                let imgStep = (this as any).dataset.step.split(',');
                let isActive = imgStep['0'] === 'all' || imgStep.includes("" + currentStep);
                (this as any).classList.toggle('active', isActive);
            });
        }

        // scrollama event handlers
        function handleStepEnterHealthyRivers(response: any) {
            // response = { element, direction, index }

            // add color to current step only
            healthyRiversStep.classed("is-active", function (d, i) {
                return i === response.index;
            });

            // update graphic based on step
            let maps = healthyRiversFigure.selectAll("img");
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
                let transitionStep = (this as any).dataset.transitionStep || Infinity;
                let isActive = activeSteps['0'] === 'all' || activeSteps.includes("" + currentStep);
                //al 16° step la mappa torna tutta rossa
                let isTranstioned = (currentStep !== 16) && (currentStep >= +transitionStep);
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


        function handleStepEnterEcosystemImpacts(response: any) {
            ecosystemImpactsStep.classed("is-active", function (d, i) {
                return i === response.index;
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
                    offset: 0.5,
                    debug: false
                })
                .onStepEnter(handleStepEnterConntectivities)
                .onStepExit(handleStepExit);

            healthyRiversScroller
                .setup({
                    step: "#healthy_rivers article .step",
                    offset: 0.5,
                    debug: false
                })
                .onStepEnter(handleStepEnterHealthyRivers)
                .onStepExit(handleStepExit);

            threatsScroller
                .setup({
                    step: "#anthropogenic_threats article .step",
                    offset: 0.5,
                    debug: false
                })
                .onStepEnter(handleStepEnterThreats)
                .onStepExit(handleStepExit);

            ecosystemImpactsScroller
                .setup({
                    step: "#ecosystem_impacts_viz article .step",
                    offset: 0.5,
                    debug: false
                })
                .onStepEnter(handleStepEnterEcosystemImpacts)
                .onStepExit(handleStepExit);
            return Promise.resolve();
        }

        // kick things off
        this.renderFreshWaterIndexChart();
        return init();
    }


    private async loadThreatsCharts(threats: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
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
                d3.select(this).classed('focused', true);
            });

            d3.select(this).on('mouseleave', function () {
                d3.select(this).classed('focused', false);
            });
        });
    }
    async presentPopover(e: Event) {
        this.collapsedBreadcrumbs = (e as CustomEvent).detail.collapsedBreadcrumbs;
        this.popover.event = e;
        this.isOpen = true;
    }

    public onBreadCrumbClick(e: Event) {
        e.preventDefault();
        let section = (e.target as any).parentElement.getAttribute('href');
        this.scrollSectionIntoView(section);
    }
    public onBreadCrumbPopoverClick(e: Event) {
        e.preventDefault();
        let section = (e.target as any).parentElement.dataset.href;
        this.isOpen = false;
        this.scrollSectionIntoView(section);
    }

    private scrollSectionIntoView(sectionSelector: string) {
        let destination = document.querySelector(sectionSelector);
        if (!_.isNil(destination)) {
            destination.scrollIntoView({ behavior: 'smooth' });
        }
    }

    private renderFreshWaterIndexChart() {
        let margin = { top: 30, right: 120, bottom: 30, left: 60 },
            width = 700 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select(this.freshwater_index_chart_container.nativeElement)
            .append("svg")
            .attr("width", "auto")
            .attr("height", "auto")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("assets/data/linechart_fish_simple.csv")
            .then(csv => createMap(csv));

        function createMap(data: any) {


            // Add X axis --> it is a date format
            let x = d3.scaleLinear()
                .domain([1970, 2017])
                .range([0, width]);

            let xAxis = (d3 as any)
                .axisBottom()
                .scale(x)
                .ticks(10)
                .tickFormat(function (d) { return Math.floor(d) })
                .tickSizeInner(0)
                .tickSizeOuter(0);

            svg.append("g")
                .attr("transform", "translate(0," + (height + 10) + ")")
                .call(xAxis);



            // Add Y axis
            let y = d3.scaleLinear()
                .domain([0, 100])
                .range([height, 0]);

            let yAxis = (d3 as any).axisLeft().scale(y).ticks(3).tickFormat(function (d) { return Math.floor(d) + "%" }).tickSizeInner(0)
                .tickSizeOuter(0);
            svg.append("g")
                .call(yAxis)
                .select('.domain')
                .attr("opacity", 0);



            // This allows to find the closest X index of the mouse:
            let bisect = d3.bisector(function (d: any) { return d.year; }).left;

            // Show confidence interval
            let CI = svg.append("path")
                .datum(data)
                .transition()
                .duration(2500)
                .attr("fill", "#cce5df")
                .attr("stroke", "none")
                .attr("d", d3.area()
                    .curve(d3.curveBasis)
                    .x(function (d: any) { return x(d.year) })
                    .y0(function (d: any) { return y(d.Freshwater_upper) })
                    .y1(function (d: any) { return y(d.Freshwater_lower) })
                );

            // Add the line
            let lineChart = svg
                .append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                    .curve(d3.curveBasis)

                    .x(function (d: any) { return x(d.year) })
                    .y(function (d: any) { return y(d.Freshwater_index) })
                );
            const pathLength = lineChart.node().getTotalLength();
            const CILength = CI.node().getTotalLength();

            //append upper axis
            let upperUpperAxisG = svg.append("g");
            upperUpperAxisG.append("line")
                .attr("class", "upper_axis")
                .attr('x1', 0)
                .attr('x2', width)
                .attr("y1", d => y(100))
                .attr("y2", d => y(100))
                .attr("stroke-dasharray", 4)
                .attr("stroke", 'red');
            upperUpperAxisG
                .append("text")
                .attr("class", "upper_axis_text_left")
                .text("1970")
                .attr('x', x(2016))
                .attr('y', d => y(100))
            // Create the circle that travels along the curve of chart
            let focus = svg
                .append('g')
                .append('circle')
                .style("fill", "steelblue")
                .attr('r', 4)
                .style("opacity", 0)

            // Create the text that travels along the curve of chart
            let focusText = svg
                .append('g')
                .append('text')
                .attr("class", "focus_text")
                .style("opacity", 0)
                .attr("fill", "steelblue")
                .attr("alignment-baseline", "middle")
            // Create a rect on top of the svg area: this rectangle recovers mouse position
            svg
                .append('rect')
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr('width', width)
                .attr('height', height)
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);

            // What happens when the mouse move -> show the annotations at the right positions.
            function mouseover() {
                focus.style("opacity", 1)
                focusText.style("opacity", 1)
            }
            function mousemove(e) {
                // recover coordinate we need
                let x0 = x.invert(d3.pointer(e)[0]);
                if (isNaN(x0)) {
                    return;
                }
                let i = bisect(data, x0, 1);
                let selectedData = data[i]
                if (selectedData) {

                    focus
                        .attr("cx", x(selectedData.year))
                        .attr("cy", y(selectedData.Freshwater_index));

                    focusText
                        .attr("text-anchor", "left")
                        .html(() => {
                            let year = selectedData.year;
                            let value = d3.format(".2f")(selectedData.Freshwater_index);
                            return `${year}:${value}%`;
                        })
                        .attr("x", x(selectedData.year) + 15)
                        .attr("y", y(selectedData.Freshwater_index))
                }

            }
            function mouseout() {
                focus.style("opacity", 0)
                focusText.style("opacity", 0)
            }
        }
    }
}
