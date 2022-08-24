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
    @ViewChild('popover') popover: ElementRef;
    @ViewChild('freshwater_index_chart_container') freshwater_index_chart_container: ElementRef;
    @ViewChild('possible_futures_viz_chart_small_dams') possible_futures_viz_chart_small_dams_container: ElementRef;
    @ViewChild('possible_futures_viz_chart_protected_dams') possible_futures_viz_chart_protected_dams_container: ElementRef;
    @ViewChild('possible_futures_viz_chart_balkans_dams') possible_futures_viz_chart_balkans_dams_container: ElementRef;
    @ViewChild('barrier_removal_projects_chart_container') barrier_removal_projects_chart_container: ElementRef;


    public sliderDirection = 'horizontal';
    public maxBreadcrumbItems: number = 1;
    balkansDamsChart: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    smallDamsChart: d3.Selection<SVGGElement, unknown, null, undefined>;
    protectedDamsChart: d3.Selection<SVGGElement, unknown, null, undefined>;
    futureDamsdata: any;
    isMobile: boolean = false;
    constructor(public platform: Platform) {
        this.sliderDirection = this.platform.is('mobile') ? 'vertical' : 'horizontal';
        this.maxBreadcrumbItems = this.platform.is('mobile') ? 1 : 10;
        this.isMobile = this.platform.is('mobile');
    }

    futureDamsMargin = { top: 10, right: 30, bottom: 10, left: 60 };
    futureDamsWidth = 460 - this.futureDamsMargin.left - this.futureDamsMargin.right;
    futureDamsHeight = 200 - this.futureDamsMargin.top - this.futureDamsMargin.bottom;

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


        //Freshwater decline
        let ecosystemImpacts = main.select("#ecosystem_impacts_viz");
        let ecosystemImpactsFigure = ecosystemImpacts.select("figure");
        let ecosystemImpactsArticle = ecosystemImpacts.select("article");
        let ecosystemImpactsStep = ecosystemImpactsArticle.selectAll(".step");

        //possible futures
        let possibleFutures = main.select("#possible_futures_viz");
        let possibleFuturesFigure = possibleFutures.select("figure");
        let possibleFuturesArticle = possibleFutures.select("article");
        let possibleFuturesStep = possibleFuturesArticle.selectAll(".step");

        await this.loadThreatsCharts(threats);
        await this.loadEcosystemImpactsCharts(ecosystemImpacts);

        // initialize the scrollama
        let healthyRiversScroller = scrollama() as any;
        let riverConnectivityScroller = scrollama() as any;
        let threatsScroller = scrollama() as any;
        let ecosystemImpactsScroller = scrollama() as any;
        let possibleFuturesScroller = scrollama() as any;

        // generic window resize listener event
        let handleResize = () => {
            // 1. update height of step elements
            let stepH = Math.floor(window.innerHeight * 0.5);
            riverConnectivitiesStep.style("height", stepH + "px");
            healthyRiversStep.style("height", stepH + "px");
            threatsStep.style("height", stepH + "px");

            possibleFuturesStep.style("height", stepH + "px");

            let figureHeight = window.innerHeight / (this.isMobile ? 2 : 1);
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

            possibleFuturesFigure
                .style("height", figureHeight + "px")
                .style("top", figureMarginTop + "px");

            // 3. tell scrollama to update new element dimensions
            riverConnectivityScroller.resize();
            healthyRiversScroller.resize();
            threatsScroller.resize();
            ecosystemImpactsScroller.resize();
            possibleFuturesScroller.resize();
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

            let waffles = ecosystemImpactsFigure.selectAll(".ecosystem_impacts_viz");
            let currentStep = response.index + 1;
            waffles.each(function () {
                let waffle = (this as any);
                let activeSteps = waffle.dataset.step.split(',');
                let isActive = activeSteps['0'] === 'all' || activeSteps.includes("" + currentStep);
                waffle.classList.toggle('active', isActive);


                // let transitionStep = waffle.dataset.transitionStep || Infinity;
                // let isTranstioned = (currentStep !== 16) && (currentStep >= +transitionStep);
                // let isForeground = waffle.dataset.foregroundStep == currentStep;
                // waffle.classList.toggle('transitioned', isTranstioned);
                // if (isForeground && isActive) {
                //     ecosystemImpactsFigure.style('z-index', 1000);
                // } else {
                //     ecosystemImpactsFigure.style('z-index', 0);
                // }
                let selectedWaffle = d3.select(waffle);
                //show groups one step at the time
                if (selectedWaffle.select('svg').attr('id') === 'freshwater_only') {
                    selectedWaffle.select('#extinct').classed('active', isActive && currentStep > 1);
                    selectedWaffle.select('#endangered').classed('active', isActive && currentStep > 2);
                    selectedWaffle.select('#low_risk').classed('active', isActive && currentStep > 3);
                    selectedWaffle.select('#no_data').classed('active', isActive && currentStep > 4);
                }
                if (selectedWaffle.select('svg').attr('id') === 'all_species') {
                    selectedWaffle.select('#freshwater_aggregated').classed('active', isActive && currentStep > 5);
                    selectedWaffle.select('#fishes').classed('active', isActive && currentStep > 6);
                    selectedWaffle.select('#invertebrates').classed('active', isActive && currentStep > 8);
                    selectedWaffle.select('#mammals').classed('active', isActive && currentStep > 8);
                    selectedWaffle.select('#reptiles').classed('active', isActive && currentStep > 8);
                    selectedWaffle.select('#amphibian').classed('active', isActive && currentStep > 8);
                    selectedWaffle.select('#birds').classed('active', isActive && currentStep > 8);
                }
                //
            });

        }

        function handleStepEnterPossibleFutures(response: any) {
            possibleFuturesStep.classed("is-active", function (d, i) {
                return i === response.index;
            });
            let page: HomePage = this;
            let damsCharts = possibleFuturesFigure.selectAll(".possible_futures_viz");
            let currentStep = response.index + 1;
            try {
                damsCharts.each(function () {
                    let damChart = (this as any);
                    let activeSteps = damChart.dataset.step.split(',');
                    let isActive = activeSteps['0'] === 'all' || activeSteps.includes("" + currentStep);
                    damChart.classList.toggle('active', isActive);


                    // smallDamsChart
                    // protectedDamsChart
                    // balkansDamsChart
                    switch (currentStep) {
                        case 1:
                            page.updateFutureDamsChart((page.smallDamsChart as any).node().querySelector('#smallDamsChart'), 'existing');
                            break;
                        case 2:
                            page.updateFutureDamsChart((page.smallDamsChart as any).node().querySelector('#smallDamsChart'), 'planned');
                            break;

                        case 3:
                            page.updateFutureDamsChart((page.protectedDamsChart as any).node().querySelector('#protectedDamsChart'), 'existing');
                            break;
                        case 4:
                            page.updateFutureDamsChart((page.protectedDamsChart as any).node().querySelector('#protectedDamsChart'), 'planned');
                            break;
                        case 5:
                            page.updateFutureDamsChart((page.balkansDamsChart as any).node().querySelector('#balkansDamsChart'), 'existing');
                            break;
                        case 6:
                            page.updateFutureDamsChart((page.balkansDamsChart as any).node().querySelector('#balkansDamsChart'), 'planned');
                            break;
                        case 7:
                            page.addFutureDamsBar((page.balkansDamsChart as any).node().querySelector('#balkansDamsChart'));
                            break;
                        default:
                            break;
                    }
                    //
                });
            } catch (error) {

            }


        }
        function handleStepExit(response: any) {
            response.element.classList.remove('is-active');
            console.log('exit : ', response);
        }
        let init = () => {

            // 1. force a resize on load to ensure proper dimensions are sent to scrollama
            handleResize();

            healthyRiversScroller
                .setup({
                    step: "#healthy_rivers article .step",
                    offset: 0.5,
                    debug: false
                })
                .onStepEnter(handleStepEnterHealthyRivers)
                .onStepExit(handleStepExit)
                .onStepProgress((a, b, c) => console.log(a, b, c));

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

            possibleFuturesScroller
                .setup({
                    step: "#possible_futures_viz article .step",
                    offset: 0.5,
                    debug: false
                })
                .onStepEnter(handleStepEnterPossibleFutures.bind(this))
                .onStepExit(handleStepExit);
            return Promise.resolve();
        }
        this.renderFreshWaterIndexChart();
        this.renderDamRemovalProjectsChart();
        this.renderPossibleFuturesChart();


        // kick things off
        return init();
    }
    private async loadEcosystemImpactsCharts(ecosystemImpacts: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
        let freshwater = await d3.xml('assets/imgs/svg/eu_fishes_danger/01_eu_fishes_danger_freshwater.svg');

        d3.select(freshwater.documentElement).style('height', '100%');

        (ecosystemImpacts.select('#ecosystem_impacts_viz_figure_chart').node() as any).append(freshwater.documentElement)

        let freshwater_detail = await d3.xml('assets/imgs/svg/eu_fishes_danger/02_eu_fishes_danger_all.svg');
        freshwater_detail.documentElement.setAttribute('width', 'auto');
        freshwater_detail.documentElement.setAttribute('height', 'auto');
        d3.select(freshwater_detail.documentElement).style('height', '100%');
        (ecosystemImpacts.select('#ecosystem_impacts_viz_figure_chart_all').node() as any).append(freshwater_detail.documentElement)

        return Promise.resolve();
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
        this.popover.nativeElement.event = e;
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

    private renderDamRemovalProjectsChart() {
        let margin = { top: 30, right: 120, bottom: 30, left: 60 },
            width = 700 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        let svg = d3.select(this.barrier_removal_projects_chart_container.nativeElement)
            .append("svg")
            .attr("width", "auto")
            .attr("height", "auto")
            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("assets/data/dam_removal_projects.csv")
            .then(csv => createMap(csv));

        function createMap(data: any) {


            // Add X axis --> it is a date format
            let x = d3.scaleLinear()
                .domain([1940, 2020])
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
                .domain([429, 4984])
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
                    .y0(function (d: any) { return y(d.cumulative) })
                    .y1(function (d: any) { return 429; })
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
                    .y(function (d: any) { return y(d.cumulative) })
                );
            const pathLength = lineChart.node().getTotalLength();
            const CILength = CI.node().getTotalLength();

            //append upper axis

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
                        .attr("cy", y(selectedData.cumulative));

                    focusText
                        .attr("text-anchor", "left")
                        .html(() => {
                            let year = selectedData.year;
                            let value = d3.format(".2f")(selectedData.cumulative);
                            return `${year}:${value}%`;
                        })
                        .attr("x", x(selectedData.year) + 15)
                        .attr("y", y(selectedData.cumulative))
                }

            }
            function mouseout() {
                focus.style("opacity", 0)
                focusText.style("opacity", 0)
            }
        }
    }

    private renderPossibleFuturesChart() {



        // append the svg object to the body of the page
        this.smallDamsChart = d3.select(this.possible_futures_viz_chart_small_dams_container.nativeElement)
            .append("svg")
            .attr("width", "auto")
            .attr("height", "auto")
            .attr("viewBox", `0 0 ${this.futureDamsWidth + this.futureDamsMargin.left + this.futureDamsMargin.right} ${this.futureDamsHeight + this.futureDamsMargin.top + this.futureDamsMargin.bottom}`);


        this.protectedDamsChart = d3.select(this.possible_futures_viz_chart_protected_dams_container.nativeElement)
            .append("svg")
            .attr("width", "auto")
            .attr("height", "auto")
            .attr("viewBox", `0 0 ${this.futureDamsWidth + this.futureDamsMargin.left + this.futureDamsMargin.right} ${this.futureDamsHeight + this.futureDamsMargin.top + this.futureDamsMargin.bottom}`);


        this.balkansDamsChart = d3.select(this.possible_futures_viz_chart_balkans_dams_container.nativeElement)
            .append("svg")
            .attr("width", "auto")
            .attr("height", "auto")
            .attr("viewBox", `0 0 ${this.futureDamsWidth + this.futureDamsMargin.left + this.futureDamsMargin.right} ${this.futureDamsHeight + this.futureDamsMargin.top + this.futureDamsMargin.bottom}`);


        d3.json("assets/data/future_dams.json")
            .then((data: any) => {
                this.futureDamsdata = data;
                this.createFutureDamsChart(data.small, this.possible_futures_viz_chart_small_dams_container.nativeElement.querySelector('svg'), 'smallDamsChart', false);
                this.createFutureDamsChart(data.protected, this.possible_futures_viz_chart_protected_dams_container.nativeElement.querySelector('svg'), 'protectedDamsChart', false);
                this.createFutureDamsChart(data.balkans, this.possible_futures_viz_chart_balkans_dams_container.nativeElement.querySelector('svg'), 'balkansDamsChart', true);
            });
    }

    private createFutureDamsChart(data: any, svgSelector: HTMLElement, groupId: string, addBar: boolean = false) {

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.futureDamsWidth]);

        // Add Y axis
        var y = d3.scaleBand()
            .range([0, this.futureDamsHeight])
            .domain(data.map((d) => d.type))
            .padding(1);

        let g = d3.select(svgSelector)
            .append("g")
            .attr("id", groupId)
            .attr("transform",
                "translate(" + this.futureDamsMargin.left + "," + this.futureDamsMargin.top + ")");

        // Add the lines
        g
            .selectAll('.lollipop_line')
            .data(data)
            .enter()
            .append("line")
            .attr('class', 'lollipop_line')
            .attr('data-type', (d: any) => d.type)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr("y1", (d: any) => y(d.type))
            .attr("y2", (d: any) => y(d.type))
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 7);

        // Circles -> start at X=0
        g.selectAll(".lollipop_circle")
            .data(data)
            .enter()
            .append("circle")
            .attr('class', 'lollipop_circle')
            .attr('data-type', (d: any) => d.type)
            .attr("cx", x(0))
            .attr("cy", (d: any) => y(d.type))
            .attr("r", "7")
            .style("fill", "steelblue")
            .attr("stroke", "steelblue");

        //append labels

        g.selectAll(".lollipop_type_label")
            .data(data)
            .enter()
            .append("text")
            .text((d: any) => d.type)
            .attr('x', 5)
            .attr('y', (d: any) => y(d.type) - 10)


        g.selectAll(".lollipop_value_label")
            .data(data)
            .enter()
            .append("text")
            .attr('data-type', (d: any) => d.type)
            .text(d => `0%`)
            .attr('x', () => x(100) - 10)
            .attr('y', (d: any) => y(d.type) + 3.5)
            .attr('class', 'lollipop_value_label');

        if (addBar) {
            let small_of_planned = data[1].small_of_planned;

            //small_of_planned bar
            g.selectAll('.lollipop_line_small_of_planned')
                .data([small_of_planned])
                .enter()
                .append("line")
                .attr('class', 'lollipop_line_small_of_planned')
                .attr('data-type', d => d.type)
                .attr('x1', 0)
                .attr('x2', () => 0)
                .attr("y1", () => y("planned"))
                .attr("y2", () => y("planned"))
                .attr("fill", "none")
                .attr("stroke", "darkred")
                .attr("stroke-width", 7);
        }

    }

    private updateFutureDamsChart(chartContainer: HTMLElement, type: string) {
        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.futureDamsWidth]);

        let g = d3.select(chartContainer);
        // Change the X coordinates of line and circle
        g.selectAll(".lollipop_line")
            .each(function (d) {
                if ((this as HTMLElement).dataset.type == type) {
                    d3.select(this)
                        .transition()
                        .duration(2000)
                        .attr("x2", (d: any) => x(d.value));
                }
            });

        g.selectAll(".lollipop_circle")
            .each(function (d) {
                if ((this as HTMLElement).dataset.type == type) {
                    d3.select(this)
                        .transition()
                        .duration(2000)
                        .attr("cx", (d: any) => x(d.value))
                }
            });


        g.selectAll(".lollipop_value_label")
            .each(function (d) {
                if ((this as HTMLElement).dataset.type == type) {
                    d3.select(this)
                        .transition()
                        .duration(2000)
                        .textTween(function (d: any) {
                            if (!(this as any)._current) {
                                (this as any)._current = 0;
                            }
                            const i = d3.interpolate((this as any)._current, d.value);
                            return function (t) {
                                let value: any = d3.format(".2")((this as any)._current = i(t));
                                return `${Math.floor(value)}%`;
                            };
                        })

                }
            });

        return Promise.resolve()
    }

    private addFutureDamsBar(chartContainer: HTMLElement) {
        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain([0, 100])
            .range([0, this.futureDamsWidth]);

        let g = d3.select(chartContainer);
        g.selectAll(".lollipop_line_small_of_planned")
            .transition()
            .duration(2000)
            .attr("x2", (d: any) => x(d.value));
    }

}
