import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as scrollama from 'scrollama';
import * as d3 from 'd3';
import { Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { TranslocoService } from '@ngneat/transloco';
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
  @ViewChild('barrierCounter') barrierCounter: ElementRef;
  @ViewChild('breadcrumb') breadcrumb: ElementRef;
  @ViewChild('breadcrumbMobile') breadcrumbMobile: ElementRef;

  @ViewChild('ecosystem_impacts_title') ecosystem_impacts_title: ElementRef;
  @ViewChild('ecosystem_impacts_viz') ecosystem_impacts_viz: ElementRef;
  @ViewChild('healthy_rivers_figure') healthy_rivers_figure: ElementRef;
  @ViewChild('anthropogenic_threats_figure') anthropogenic_threats_figure: ElementRef;
  @ViewChild('ecosystem_impacts_viz_figure') ecosystem_impacts_viz_figure: ElementRef;

  public currentLang = 'it';

  public breadcrumbItems: any[] = [{
    href: '#healthy_rivers_title',
    text: 'healthyRivers.section_title',
    active: false
  },
  {
    href: '#anthropogenic_threats-title',
    text: 'anthropogenicThreats.breadcrumb_title',
    active: false
  }, {
    href: '#ecosystem_impacts_title',
    text: 'ecosystemImpacts.ecosystem_impacts_text.breadcrumb_title',
    active: false
  }, {
    href: '#possible_futures_title',
    text: 'possibleFutures.possible_futures_text.breadcrumb_title',
    active: false
  }, {
    href: '#about_title',
    text: 'about.breadcrumb_title',
    active: false
  }];
  public hovercardData: any = {
    title: 0,
    imgSrc: '',
    imgAlt: '',
    definition: ''
  };

  public sliderDirection = 'horizontal';
  public maxBreadcrumbItems = 1;
  balkansDamsChart: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
  smallDamsChart: d3.Selection<SVGGElement, unknown, null, undefined>;
  protectedDamsChart: d3.Selection<SVGGElement, unknown, null, undefined>;
  futureDamsdata: any;
  isMobile = false;
  futureDamsMargin = { top: 10, right: 30, bottom: 10, left: 60 };
  public ecosystem_viz_drill_offset = 1;
  public isFullscreen = false;
  healthyRiversScroller: any;
  riverConnectivityScroller: any;
  threatsScroller: any;
  ecosystemImpactsScroller: any;
  possibleFuturesScroller: any;
  otherLang: string;
  futureDamsWidth = 460 - this.futureDamsMargin.left - this.futureDamsMargin.right;
  futureDamsHeight = 200 - this.futureDamsMargin.top - this.futureDamsMargin.bottom;

  isOpen = false;
  collapsedBreadcrumbs: HTMLIonBreadcrumbElement[] = [];
  barrierCount = 0;
  public isIPhone = false;
  constructor(public platform: Platform, public translocoService: TranslocoService) {

    let hasTouchScreen = false;
    if ('maxTouchPoints' in navigator) {
      hasTouchScreen = navigator.maxTouchPoints > 0;
    } else if ('msMaxTouchPoints' in navigator) {
      hasTouchScreen = (navigator as any).msMaxTouchPoints > 0;
    }
    const goodDevice = this.platform.is('desktop') || this.platform.is('tablet') || !hasTouchScreen;
    this.isMobile = !goodDevice;

    this.sliderDirection = this.isMobile ? 'vertical' : 'horizontal';
    this.maxBreadcrumbItems = this.isMobile ? 3 : 5;
    this.isMobile = this.isMobile;
    this.isIPhone = this.isMobile && this.platform.is('iphone');

    if (this.isMobile) {
      this.futureDamsMargin.left = 10;
      this.futureDamsMargin.right = 15;
    }

    const availableLangs: string[] = (this.translocoService.getAvailableLangs() as any[]).map((l: any) => (l as any).id || (l as string));
    const currentLangIdx = availableLangs.indexOf(this.translocoService.getActiveLang());
    let nextLangIdx = (currentLangIdx % availableLangs.length);
    this.otherLang = availableLangs[++nextLangIdx % availableLangs.length];


  }


  async ngAfterViewInit(): Promise<any> {
    // using d3 for convenience
    const main = d3.select('main');
    this.maxBreadcrumbItems = this.platform.is('mobile') ? 1 : 4;
    // this.ecosystem_viz_drill_offset = 0.5;//window.innerHeight - (window.innerHeight * 0.4);

    //healthy river
    const healthyRivers = main.select('#healthy_rivers');
    const healthyRiversFigure = healthyRivers.select('figure');
    const healthyRiversArticle = healthyRivers.select('article');
    const healthyRiversStep = healthyRiversArticle.selectAll('.step');

    //connectivity (sticky side)
    const riverConnectivities = main.select('#river_connectivities');
    const riverConnectivitiesFigure = riverConnectivities.select('figure');
    const riverConnectivitiesArticle = riverConnectivities.select('article');
    const riverConnectivitiesStep = riverConnectivitiesArticle.selectAll('.step');

    //load connectivity imgs
    const connectivity = await d3.xml('assets/imgs/svg/connectivity/connectivity.svg');

    d3.select(connectivity.documentElement).style('height', '100%');
    d3.select(connectivity.documentElement).style('width', '100%');

    (riverConnectivities.select('#connectivity_image').node() as any).append(connectivity.documentElement);

    //antropogenic threats svgs

    const threats = main.select('#anthropogenic_threats');
    const threatsFigure = threats.select('figure');
    const threatsArticle = threats.select('article');
    const threatsStep = threatsArticle.selectAll('.step');


    //Freshwater decline
    const ecosystemImpacts = main.select('#ecosystem_impacts_viz');
    const ecosystemImpactsFigure = ecosystemImpacts.select('figure');
    const ecosystemImpactsArticle = ecosystemImpacts.select('article');
    const ecosystemImpactsStep = ecosystemImpactsArticle.selectAll('.step');

    //possible futures
    const possibleFutures = main.select('#possible_futures_viz');
    const possibleFuturesFigure = possibleFutures.select('figure');
    const possibleFuturesArticle = possibleFutures.select('article');
    const possibleFuturesStep = possibleFuturesArticle.selectAll('.step');

    await this.loadThreatsCharts(threats);
    await this.loadEcosystemImpactsCharts(ecosystemImpacts);

    // initialize the scrollama
    const healthyRiversScroller = scrollama() as any;
    const riverConnectivityScroller = scrollama() as any;
    const threatsScroller = scrollama() as any;
    const ecosystemImpactsScroller = scrollama() as any;
    const possibleFuturesScroller = scrollama() as any;

    this.healthyRiversScroller = healthyRiversScroller;
    this.riverConnectivityScroller = riverConnectivityScroller;
    this.threatsScroller = threatsScroller;
    this.ecosystemImpactsScroller = ecosystemImpactsScroller;
    this.possibleFuturesScroller = possibleFuturesScroller;

    // generic window resize listener event
    const handleResize = () => {
      // 1. update height of step elements
      const stepH = Math.floor(window.innerHeight * 0.5);
      const riverConnectivitiesH = Math.floor(window.innerHeight / 3);
      const riverConnectivitiesFigureH = Math.floor(window.innerHeight / 2);
      healthyRiversStep.style('height', stepH + 'px');

      // riverConnectivitiesStep.style('height', (this.isMobile ? stepH : riverConnectivitiesH) + 'px');
      riverConnectivitiesStep.style('height', stepH + 'px');

      threatsStep.style('height', stepH + 'px');

      ecosystemImpactsStep.style('height', stepH + 'px');

      possibleFuturesStep.style('height', stepH + 'px');

      const figureHeight = window.innerHeight / (this.isMobile ? 2 : 1);
      const figureMarginTop = 36;// (window.innerHeight - figureHeight) / 2;

      riverConnectivitiesFigure
        .style('height', (this.isMobile ? figureHeight : riverConnectivitiesFigureH) + 'px')
        .style('top', figureMarginTop + 'px');

      // riverConnectivities.select('.step:last-child')
      //   .style('height', 2 * stepH + 'px');

      healthyRiversFigure
        .style('height', figureHeight + 'px')
        .style('top', figureMarginTop + 'px');
      healthyRivers.select('.step:last-child')
        .style('height', 2 * stepH + 'px');

      threatsFigure
        .style('height', figureHeight + 'px')
        .style('top', figureMarginTop + 'px');
      threats.select('.step:last-child')
        .style('height', 2 * stepH + 'px');

      ecosystemImpactsFigure
        .style('height', figureHeight + 'px')
        .style('top', figureMarginTop + 'px');

      // let titleHeigth = (this.ecosystem_impacts_title as any).nativeElement.getBoundingClientRect().height;
      // (this.ecosystem_impacts_viz as any).nativeElement.style('top', `${titleHeigth}px`);

      ecosystemImpacts.select('.step:last-child')
        .style('height', 2 * stepH + 'px');

      possibleFuturesFigure
        .style('height', figureHeight + 'px')
        .style('top', figureMarginTop + 'px');
      possibleFutures.select('.step:last-child')
        .style('height', 2 * stepH + 'px');

      // 3. tell scrollama to update new element dimensions
      riverConnectivityScroller.resize();
      healthyRiversScroller.resize();
      threatsScroller.resize();
      ecosystemImpactsScroller.resize();
      possibleFuturesScroller.resize();
    };

    // scrollama event handlers
    function handleStepEnterConntectivities(response: any) {
      // response = { element, direction, index }

      // add color to current step only
      riverConnectivitiesStep.classed('is-active', (d, i) => i === response.index);

      // update graphic based on step
      const connectivityAnimations = riverConnectivitiesFigure.selectAll('.river_connectivity_animation');
      const svg = d3.select('#connectivity_image svg');
      const currentStep = response.index + 1;
      //step 1: solo base image visibile
      svg.select('#base').classed('active', () => currentStep == 1);
      //step 2: solo Longitudinal image visibile
      svg.select('#longitudinal1').classed('active', () => currentStep == 2);
      svg.select('#longitudinal2').classed('active', () => currentStep == 2);
      //step 3: solo Lateral image visibile
      svg.select('#lateral1').classed('active', () => currentStep == 3);
      svg.select('#lateral2').classed('active', () => currentStep == 3);
      //step 4: solo Vertical image visibile
      svg.select('#vertical1').classed('active', () => currentStep == 4);
      svg.select('#vertical2').classed('active', () => currentStep == 4);
      //step 5: solo Temporal image visibile
      svg.select('#temporal1').classed('active', () => currentStep == 5);
      svg.select('#temporal2').classed('active', () => currentStep == 5);
      connectivityAnimations.each(function () {
        const imgStep = (this as any).dataset.step.split(',');
        const isActive = imgStep['0'] === 'all' || imgStep.includes('' + currentStep);
        (this as any).classList.toggle('active', isActive);
      });
    }

    // scrollama event handlers
    const handleStepEnterHealthyRivers = (response: any) => {
      if (this.isFullscreen) { return; }
      // response = { element, direction, index }
      // console.log('handleStepEnterHealthyRivers : ', response);
      // add color to current step only
      healthyRiversStep.classed('is-active', (_d, i) => i === response.index);

      // update graphic based on step
      const maps = healthyRiversFigure.selectAll('img');
      const currentStep = response.index + 1;
      maps.each(function () {
        const imgStep = (this as any).dataset.step.split(',');
        const isActive = imgStep['0'] === 'all' || imgStep.includes('' + currentStep);
        (this as any).classList.toggle('active', isActive);
      });
    };

    const handleStepEnterThreats = (response: any) => {
      threatsStep.classed('is-active', (_d, i) => i === response.index);
      const increments = [62293, 199744, 197752, 112898, 8528, 59577];

      // update graphic based on step
      const maps = threatsFigure.selectAll('.anthropogenic_threats');
      const currentStep = response.index + 1;
      maps.each(function () {
        const activeSteps = (this as any).dataset.step.split(',');
        const transitionStep = (this as any).dataset.transitionStep || Infinity;
        const isActive = activeSteps['0'] === 'all' || activeSteps.includes('' + currentStep);
        //al 16° step la mappa torna tutta rossa
        const isTranstioned = (currentStep !== 16) && (currentStep >= +transitionStep);
        const isForeground = (this as any).dataset.foregroundStep == currentStep;
        (this as any).classList.toggle('active', isActive);
        (this as any).classList.toggle('transitioned', isTranstioned);
        if (isForeground && isActive) {
          threatsFigure.style('z-index', 1000);
          d3.select('#anthropogenic_threats ion-grid').style('z-index', 1200);
        } else {
          threatsFigure.style('z-index', 0);
          d3.select('#anthropogenic_threats ion-grid').style('z-index', 1)

        }

        if (currentStep != 16) {
          d3.select('#hovercard')
            .classed('active', false);
        }

      });

      if (currentStep == 4) {
        this.barrierCount = increments[0];
      }
      if (currentStep == 6) {
        this.barrierCount = increments[1] + increments[0];
      }
      if (currentStep == 8) {
        this.barrierCount = increments[2] + increments[1] + increments[0];
      }
      if (currentStep == 10) {
        this.barrierCount = increments[3] + increments[2] + increments[1] + increments[0];
      }
      if (currentStep == 12) {
        this.barrierCount = increments[4] + increments[3] + increments[2] + increments[1] + increments[0];
      }
      if (currentStep == 14) {
        this.barrierCount = increments[5] + increments[4] + increments[3] + increments[2] + increments[1] + increments[0];
      }


    }


    function handleStepEnterEcosystemImpacts(response: any) {
      ecosystemImpactsStep.classed('is-active', function (d, i) {
        return i === response.index;
      });

      const waffles = ecosystemImpactsFigure.selectAll('.ecosystem_impacts_viz');
      const currentStep = response.index + 1;
      waffles.each(function () {
        const waffle = (this as any);
        const activeSteps = waffle.dataset.step.split(',');
        const isActive = activeSteps['0'] === 'all' || activeSteps.includes('' + currentStep);
        waffle.classList.toggle('active', isActive);


        const selectedWaffle = d3.select(waffle);
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
      possibleFuturesStep.classed('is-active', function (d, i) {
        return i === response.index;
      });
      const page: HomePage = this;
      const damsCharts = possibleFuturesFigure.selectAll('.possible_futures_viz');
      const currentStep = response.index + 1;
      try {
        damsCharts.each(function () {
          const damChart = (this as any);
          const activeSteps = damChart.dataset.step.split(',');
          const isActive = activeSteps['0'] === 'all' || activeSteps.includes('' + currentStep);
          damChart.classList.toggle('active', isActive);


          // smallDamsChart
          // protectedDamsChart
          // balkansDamsChart
          switch (currentStep) {
            case 1:
              page.updateFutureDamsLollipopCharts((page.smallDamsChart as any).node().querySelector('#smallDamsChart'), 'existing');
              break;
            case 2:
              page.updateFutureDamsLollipopCharts((page.smallDamsChart as any).node().querySelector('#smallDamsChart'), 'planned');
              break;

            case 3:
              page.updateFutureDamsLollipopCharts((page.protectedDamsChart as any).node().querySelector('#protectedDamsChart'), 'existing');
              break;
            case 4:
              page.updateFutureDamsLollipopCharts((page.protectedDamsChart as any).node().querySelector('#protectedDamsChart'), 'planned');
              break;
            case 5:
              page.updateFutureDamsLollipopCharts((page.balkansDamsChart as any).node().querySelector('#balkansDamsChart'), 'existing');
              break;
            case 6:
              page.updateFutureDamsLollipopCharts((page.balkansDamsChart as any).node().querySelector('#balkansDamsChart'), 'planned');
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
      //response.element.classList.remove('is-active');
    }

    const handleStepExitThreats = (response: any) => {
      handleStepExit(response);
      const currentStep = response.index + 1;

      if (currentStep == 17) {
        d3.select('#hovercard')
          .classed('active', false);
      }

    };

    const handleStepExitImpacts = (response: any) => {
      const currentStep = response.index + 1;
      if (currentStep > 1) {
        // handleStepExit(response);
      }
    };


    const init = () => {

      // 1. force a resize on load to ensure proper dimensions are sent to scrollama
      handleResize();

      healthyRiversScroller
        .setup({
          step: '#healthy_rivers article .step',
          offset: 0.75
        })
        .onStepEnter(handleStepEnterHealthyRivers)
        .onStepExit(handleStepExit);

      // 2. setup the scroller passing options
      // 		this will also initialize trigger observations
      // 3. bind scrollama event handlers (this can be chained like below)
      riverConnectivityScroller
        .setup({
          step: '#river_connectivities article .step',
          offset: 0.75
        })
        .onStepEnter(handleStepEnterConntectivities)
        .onStepExit(handleStepExit);


      threatsScroller
        .setup({
          step: '#anthropogenic_threats article .step',
          offset: 0.75
        })
        .onStepEnter(handleStepEnterThreats)
        .onStepExit(handleStepExitThreats);

      ecosystemImpactsScroller
        .setup({
          step: '#ecosystem_impacts_viz article .step',
          offset: 0.75,
        })
        .onStepEnter(handleStepEnterEcosystemImpacts)
        .onStepExit(handleStepExitImpacts);

      possibleFuturesScroller
        .setup({
          step: '#possible_futures_viz article .step',
          offset: 0.75
        })
        .onStepEnter(handleStepEnterPossibleFutures.bind(this))
        .onStepExit(handleStepExit);
      return Promise.resolve();
    };
    this.renderFreshWaterIndexChart();
    this.renderDamRemovalProjectsChart();
    this.renderPossibleFuturesLollipopsChart();


    // kick things off
    return init();
  }

  public onBreadCrumbClick(e: Event, item: any) {
    e.preventDefault();
    this.breadcrumbItems.map(i => i.active = i.href === item.href);
    const breadcrumbH = (this.breadcrumb as any).el.getBoundingClientRect().height;
    this.scrollSectionIntoView(item.href, breadcrumbH);
  }
  public onBreadCrumbPopoverClick(e: Event) {
    e.preventDefault();
    const section = (e.target as any).parentElement.dataset.href;
    this.isOpen = false;
    const breadcrumbH = (this.breadcrumbMobile as any).el.getBoundingClientRect().height;

    this.scrollSectionIntoView(section, breadcrumbH);
  }


  private async loadEcosystemImpactsCharts(ecosystemImpacts: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    const freshwater = await d3.xml('assets/imgs/svg/eu_fishes_danger/01_eu_fishes_danger_freshwater.svg');

    d3.select(freshwater.documentElement).style('height', '100%');

    (ecosystemImpacts.select('#ecosystem_impacts_viz_figure_chart').node() as any).append(freshwater.documentElement)

    const freshwater_detail = await d3.xml('assets/imgs/svg/eu_fishes_danger/02_eu_fishes_danger_all.svg');
    // freshwater_detail.documentElement.setAttribute('width', 'auto');
    // freshwater_detail.documentElement.setAttribute('height', 'auto');
    d3.select(freshwater_detail.documentElement).style('height', '100%');
    (ecosystemImpacts.select('#ecosystem_impacts_viz_figure_chart_all').node() as any).append(freshwater_detail.documentElement)

    document.addEventListener('fullscreenchange', (e) => {
      this.isFullscreen = document.fullscreenElement !== null;
      if (this.isFullscreen) {
        this.healthyRiversScroller.disable();
        this.riverConnectivityScroller.disable();
        this.threatsScroller.disable();
        this.ecosystemImpactsScroller.disable();
        this.possibleFuturesScroller.disable();
      } else {
        this.healthyRiversScroller.enable();
        this.riverConnectivityScroller.enable();
        this.threatsScroller.enable();
        this.ecosystemImpactsScroller.enable();
        this.possibleFuturesScroller.enable();

      }
    });
    return Promise.resolve();
  }


  private async loadThreatsCharts(threats: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    const dams = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_dams.svg');
    const ramps = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_ramps.svg');
    const weirs = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_weirs.svg');
    const culverts = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_culverts.svg');
    const sluices = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_sluices.svg');
    const others = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_fords_other.svg');
    const hexbins = await d3.xml('assets/imgs/svg/map_eu/2.map_eu_count_wgs84_more_data.svg');
    const page = this;

    // dams.documentElement.setAttribute('width', 'auto');
    // dams.documentElement.setAttribute('height', 'auto');
    // ramps.documentElement.setAttribute('width', 'auto');
    // ramps.documentElement.setAttribute('height', 'auto');
    // weirs.documentElement.setAttribute('width', 'auto');
    // weirs.documentElement.setAttribute('height', 'auto');
    // culverts.documentElement.setAttribute('width', 'auto');
    // culverts.documentElement.setAttribute('height', 'auto');
    // sluices.documentElement.setAttribute('width', 'auto');
    // sluices.documentElement.setAttribute('height', 'auto');
    // others.documentElement.setAttribute('width', 'auto');
    // others.documentElement.setAttribute('height', 'auto');
    // hexbins.documentElement.setAttribute('width', 'auto');
    // hexbins.documentElement.setAttribute('height', 'auto');

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
    const hexbinsPaths = threats.selectAll('#anthropogenic_threats_hex_bin #eu_barrier_count .hex');
    //this works only if paths are in foreground
    if (!this.isMobile) {
      hexbinsPaths.each(function () {
        d3.select(this).on('click', function (e) {
          const points = (this as any).dataset.points;
          const x = (this as any).getBoundingClientRect().x;
          const y = (this as any).getBoundingClientRect().y;
          page.hovercardData.title = points;
          page.hovercardData.definition = 'hovercard.barriers';
          d3.select('#hovercard')
            .style('left', x + 'px')
            .style('top', y + 'px')
            .classed('active', true);
        });

      });
    }
  }
  async presentPopover(e: Event) {
    this.collapsedBreadcrumbs = (e as CustomEvent).detail.collapsedBreadcrumbs;
    (this.popover as any).el.event = e;
    this.isOpen = true;
  }

  private scrollSectionIntoView(sectionSelector: string, offset: number = 0) {
    const destination = document.querySelector(sectionSelector);
    if (!_.isNil(destination)) {
      destination.scrollIntoView({ behavior: 'smooth' });
      destination.scrollBy({ top: -(2 * offset) });
    }
  }

  private renderFreshWaterIndexChart() {
    const margin = { top: 30, right: 120, bottom: 30, left: 60 },
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select(this.freshwater_index_chart_container.nativeElement)
      .append('svg')
      // .attr("width", "auto")
      // .attr("height", "auto")
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');

    d3.csv('assets/data/linechart_fish_simple.csv')
      .then(csv => createMap(csv));

    function createMap(data: any) {


      // Add X axis --> it is a date format
      const x = d3.scaleLinear()
        .domain([1970, 2017])
        .range([0, width]);

      const xAxis = (d3 as any)
        .axisBottom()
        .scale(x)
        .ticks(10)
        .tickFormat(function (d) { return Math.floor(d) })
        .tickSizeInner(0)
        .tickSizeOuter(0);

      svg.append('g')
        .attr('transform', 'translate(0,' + (height + 10) + ')')
        .call(xAxis)
        .attr('fill', 'var(--ion-color-text-color-standard)');



      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

      const yAxis = (d3 as any).axisLeft().scale(y).ticks(3).tickFormat(function (d) { return Math.floor(d) + '%' }).tickSizeInner(0)
        .tickSizeOuter(0);
      svg.append('g')
        .call(yAxis)
        .select('.domain')
        .attr('opacity', 0);



      // This allows to find the closest X index of the mouse:
      const bisect = d3.bisector(function (d: any) { return d.year; }).left;

      // Show confidence interval
      const CI = svg.append('path')
        .datum(data)
        .transition()
        .duration(2500)
        .attr('fill', 'rgba(117, 147, 206, 0.3)')
        .attr('stroke', 'rgba(117, 147, 206, 0.37')
        .attr('d', d3.area()
          .curve(d3.curveBasis)
          .x(function (d: any) { return x(d.year) })
          .y0(function (d: any) { return y(d.Freshwater_upper) })
          .y1(function (d: any) { return y(d.Freshwater_lower) })
        );

      // Add the line
      const lineChart = svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#7593ce')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
          .curve(d3.curveBasis)

          .x(function (d: any) { return x(d.year) })
          .y(function (d: any) { return y(d.Freshwater_index) })
        );

      //append upper axis
      const upperUpperAxisG = svg.append('g');
      upperUpperAxisG.append('line')
        .attr('class', 'upper_axis')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => y(100))
        .attr('y2', d => y(100))
        .attr('stroke-dasharray', 4)
        .attr('stroke', 'var(--ion-color-text-color-standard)');
      upperUpperAxisG
        .append('text')
        .attr('fill', 'var(--ion-color-text-color-standard)')
        .attr('class', 'upper_axis_text_left')
        .text('1970')
        .attr('x', x(2016))
        .attr('y', d => y(100))
      // Create the circle that travels along the curve of chart
      const focus = svg
        .append('g')
        .append('circle')
        .style('fill', '#7593ce')
        .attr('r', 4)
        .style('opacity', 0)

      // Create the text that travels along the curve of chart
      const focusText = svg
        .append('g')
        .append('text')
        .attr('class', 'focus_text')
        .style('opacity', 0)
        .attr('fill', '#7593ce')
        .attr('alignment-baseline', 'middle')
      // Create a rect on top of the svg area: this rectangle recovers mouse position
      svg
        .append('rect')
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style('opacity', 1)
        focusText.style('opacity', 1)
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
            .attr('cx', x(selectedData.year))
            .attr('cy', y(selectedData.Freshwater_index));

          focusText
            .attr('text-anchor', 'left')
            .html(() => {
              let year = selectedData.year;
              let value = d3.format('.2f')(selectedData.Freshwater_index);
              return `${year}:${value}%`;
            })
            .attr('x', x(selectedData.year) + 15)
            .attr('y', y(selectedData.Freshwater_index))
        }

      }
      function mouseout() {
        focus.style('opacity', 0)
        focusText.style('opacity', 0)
      }
    }
  }

  private renderDamRemovalProjectsChart() {
    let margin = { top: 30, right: 120, bottom: 30, left: 60 },
      width = 700 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    let svg = d3.select(this.barrier_removal_projects_chart_container.nativeElement)
      .append('svg')
      // .attr("width", "auto")
      // .attr("height", "auto")
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')');

    d3.csv('assets/data/dam_removal_projects.csv')
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

      svg.append('g')
        .attr('transform', 'translate(0,' + (height) + ')')
        .call(xAxis);



      // Add Y axis
      let y = d3.scaleLinear()
        .domain([429, 4984])
        .range([height, 0]);

      let yAxis = (d3 as any).axisLeft().scale(y).ticks(5).tickFormat(function (d) { return Math.floor(d) }).tickSizeInner(0)
        .tickSizeOuter(0);
      svg.append('g')
        .call(yAxis)
        .select('.domain')
        .attr('opacity', 0);



      // This allows to find the closest X index of the mouse:
      let bisect = d3.bisector(function (d: any) { return d.year; }).left;

      // Show confidence interval
      let CI = svg.append('path')
        .datum(data)
        .transition()
        .duration(2500)
        .attr('fill', 'var( --ion-color-secondary-shade-transarency)')
        .attr('stroke', 'none')
        .attr('d', d3.area()
          .curve(d3.curveLinear)
          .x(function (d: any) { return x(d.year) })
          .y0(function (d: any) { return y(d.cumulative) })
          .y1(function (d: any) { return y(429); })
        );

      // Add the line
      let lineChart = svg
        .append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'var(--ion-color-secondary-shade)')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
          .curve(d3.curveLinear)
          .x(function (d: any) { return x(d.year) })
          .y(function (d: any) { return y(d.cumulative) })
        );

      // Add the line
      // let dots = svg
      //     .append('g')
      //     .selectAll('.dot')
      //     .data(data)
      //     .enter()
      //     .append("circle")
      //     .attr('class', 'dot')
      //     .style("fill", "var(--ion-color-secondary-shade)")
      //     .attr('r', 4)
      //     .attr("cx", (d: any) => x(d.year))
      //     .attr("cy", (d: any) => y(d.cumulative));

      //append upper axis

      // Create the circle that travels along the curve of chart
      let focus = svg
        .append('g')
        .append('circle')
        .style('fill', 'var(--ion-color-secondary-shade)')
        .attr('r', 4)
        .style('opacity', 0)

      // Create the text that travels along the curve of chart
      let focusText = svg
        .append('g')
        .append('text')
        .attr('class', 'focus_text')
        .style('opacity', 0)
        .attr('fill', 'var(--ion-color-secondary-shade)')
        .attr('alignment-baseline', 'middle')
      // Create a rect on top of the svg area: this rectangle recovers mouse position
      svg
        .append('rect')
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);

      // What happens when the mouse move -> show the annotations at the right positions.
      function mouseover() {
        focus.style('opacity', 1)
        focusText.style('opacity', 1)
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
            .attr('cx', x(selectedData.year))
            .attr('cy', y(selectedData.cumulative));

          focusText
            .attr('text-anchor', 'left')
            .html(() => {
              let year = selectedData.year;
              let value = d3.format('.0f')(selectedData.abs);
              return `${year}:${value}`;
            })
            .attr('x', x(selectedData.year) + 15)
            .attr('y', y(selectedData.cumulative))
        }

      }
      function mouseout() {
        focus.style('opacity', 0)
        focusText.style('opacity', 0)
      }
    }
  }

  private renderPossibleFuturesLollipopsChart() {



    // append the svg object to the body of the page
    this.smallDamsChart = d3.select(this.possible_futures_viz_chart_small_dams_container.nativeElement)
      .append('svg')
      // .attr("width", "auto")
      // .attr("height", "auto")
      .attr('viewBox', `0 0 ${this.futureDamsWidth + this.futureDamsMargin.left + this.futureDamsMargin.right} ${this.futureDamsHeight + this.futureDamsMargin.top + this.futureDamsMargin.bottom}`);


    this.protectedDamsChart = d3.select(this.possible_futures_viz_chart_protected_dams_container.nativeElement)
      .append('svg')
      // .attr("width", "auto")
      // .attr("height", "auto")
      .attr('viewBox', `0 0 ${this.futureDamsWidth + this.futureDamsMargin.left + this.futureDamsMargin.right} ${this.futureDamsHeight + this.futureDamsMargin.top + this.futureDamsMargin.bottom}`);


    this.balkansDamsChart = d3.select(this.possible_futures_viz_chart_balkans_dams_container.nativeElement)
      .append('svg')
      // .attr("width", "auto")
      // .attr("height", "auto")
      .attr('viewBox', `0 0 ${this.futureDamsWidth + this.futureDamsMargin.left + this.futureDamsMargin.right} ${this.futureDamsHeight + this.futureDamsMargin.top + this.futureDamsMargin.bottom}`);


    d3.json('assets/data/future_dams.json')
      .then((data: any) => {
        this.futureDamsdata = data;
        this.createFutureDamsLillipop(data.small, this.possible_futures_viz_chart_small_dams_container.nativeElement.querySelector('svg'), 'smallDamsChart', false);
        this.createFutureDamsLillipop(data.protected, this.possible_futures_viz_chart_protected_dams_container.nativeElement.querySelector('svg'), 'protectedDamsChart', false);
        this.createFutureDamsLillipop(data.balkans, this.possible_futures_viz_chart_balkans_dams_container.nativeElement.querySelector('svg'), 'balkansDamsChart', true);
      });
  }

  private createFutureDamsLillipop(data: any, svgSelector: HTMLElement, groupId: string, addBar: boolean = false) {
    let colors = { 'existing': 'var(--ion-color-warning)', 'planned': 'var(--ion-color-danger)' }
    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.futureDamsWidth - 5]);

    // Add Y axis
    var y = d3.scaleBand()
      .range([0, this.futureDamsHeight])
      .domain(data.map((d) => d.type))
      .padding(1);

    let g = d3.select(svgSelector)
      .append('g')
      .attr('id', groupId);
    g.attr('transform',
      'translate(' + this.futureDamsMargin.left + ',' + this.futureDamsMargin.top + ')');

    // Add the lines
    g
      .selectAll('.lollipop_line')
      .data(data)
      .enter()
      .append('line')
      .attr('class', 'lollipop_line')
      .attr('data-type', (d: any) => d.type)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', (d: any) => y(d.type))
      .attr('y2', (d: any) => y(d.type))
      .attr('fill', (d: any) => colors[d.type])
      .attr('stroke', (d: any) => colors[d.type])
      .attr('stroke-width', 7);

    // Circles -> start at X=0
    g.selectAll('.lollipop_circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'lollipop_circle')
      .attr('data-type', (d: any) => d.type)
      .attr('cx', x(0))
      .attr('cy', (d: any) => y(d.type))
      .attr('r', '7')
      .style('fill', (d: any) => colors[d.type])
      .attr('stroke', (d: any) => colors[d.type]);

    //append labels

    g.selectAll('.lollipop_type_label')
      .data(data)
      .enter()
      .append('text')
      .text((d: any) => this.translocoService.translate(d.type))
      .style('fill', (d: any) => colors[d.type])
      .attr('x', 5)
      .attr('y', (d: any) => y(d.type) - 10)
      .attr('class', 'lollipop_type_label font-bold');


    g.selectAll('.lollipop_value_label')
      .data(data)
      .enter()
      .append('text')
      .attr('data-type', (d: any) => d.type)
      .style('fill', (d: any) => colors[d.type])
      .text(`0%`)
      .attr('x', () => x(100) - 15)
      .attr('y', (d: any) => y(d.type) + 3.5)
      .attr('class', 'lollipop_value_label');

    if (addBar) {
      let small_of_planned = data[1].small_of_planned;

      //small_of_planned bar
      g.selectAll('.lollipop_line_small_of_planned')
        .data([small_of_planned])
        .enter()
        .append('line')
        .attr('class', 'lollipop_line_small_of_planned')
        .attr('data-type', d => d.type)
        .attr('x1', 0)
        .attr('x2', () => 0)
        .attr('y1', () => y('planned'))
        .attr('y2', () => y('planned'))
        .attr('fill', 'none')
        .attr('stroke', 'darkred')
        .attr('stroke-width', 7);

      g.selectAll('.lollipop_value_label_small_of_planned')
        .data([small_of_planned])
        .enter()
        .append('text')
        .attr('data-type', (d: any) => d.type)
        .style('fill', 'darkred')
        .text(d => `${this.translocoService.translate('small_of_planned')}: 90%`)
        .attr('x', 0)
        .attr('y', (d: any) => y('planned') + 25)
        .attr('class', 'lollipop_value_label_small_of_planned');

    }

  }

  private updateFutureDamsLollipopCharts(chartContainer: HTMLElement, type: string) {
    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.futureDamsWidth - 5]);

    let g = d3.select(chartContainer);
    // Change the X coordinates of line and circle
    g.selectAll('.lollipop_line')
      .each(function (d) {
        if ((this as HTMLElement).dataset.type == type) {
          d3.select(this)
            .transition()
            .duration(2000)
            .attr('x2', (d: any) => x(d.value));
        }
      });

    g.selectAll('.lollipop_circle')
      .each(function () {
        if ((this as HTMLElement).dataset.type == type) {
          d3.select(this)
            .transition()
            .duration(2000)
            .attr('cx', (d: any) => x(d.value))
        }
      });


    g.selectAll('.lollipop_value_label')
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
                let value: any = d3.format('.2')((this as any)._current = i(t));
                return `${Math.floor(value)}%`;
              };
            })

        }
      });

    return Promise.resolve()
  }

  private addFutureDamsBar(chartContainer: HTMLElement) {
    // Add X axis --> it is a date format
    d3.select('.lollipop_value_label_small_of_planned').classed('active', false);
    var x = d3.scaleLinear()
      .domain([0, 100])
      .range([0, this.futureDamsWidth - 5]);

    let g = d3.select(chartContainer);
    g.selectAll('.lollipop_line_small_of_planned')
      .transition()
      .on('end', () => {
        d3.select('.lollipop_value_label_small_of_planned').classed('active', true);
      })
      .duration(2000)
      .attr('x2', (d: any) => x(d.value));
  }

  public setToFullscreen(sectionId: string) {
    this[sectionId].nativeElement.requestFullscreen ? this[sectionId].nativeElement.requestFullscreen() : this[sectionId].nativeElement.webkitRequestFullScreen();
  }
  public disposeHovercard() {
    d3.select('#hovercard')
      .classed('active', false);
  }
  public exitFullScreen() {
    if (document.fullscreenElement !== null) {

      document.exitFullscreen();
    }
    if ((document as any).webkitCancelFullScreen !== null) {
      (document as any).webkitCancelFullScreen();
    }
  }

  public async switchLang() {
    let currentLang = this.translocoService.getActiveLang();
    let availableLangs: string[] = (this.translocoService.getAvailableLangs() as any[]).map((l: any) => (l as any).id || (l as string));
    let currentLangIdx = availableLangs.indexOf(currentLang);
    let nextLangIdx = (++currentLangIdx % availableLangs.length);
    this.translocoService.setActiveLang(availableLangs[nextLangIdx]);
    this.otherLang = availableLangs[++nextLangIdx % availableLangs.length];
  }
}
