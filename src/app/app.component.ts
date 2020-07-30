import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import * as d3 from 'd3';
// import { data2 } from './sampleData';
import * as data1 from './NLI_Dec_12_Pontus_HP.json';
import * as data2 from './NLI_Prediction_Dec_12_Pontus.json';
import * as dataLP from './NLI_Dec_12_Pontus_LP.json';
import 'rxjs/add/observable/interval';

interface dataConfig {
  date: Date;
  projected: boolean;
  mean: number;
  upper: number;
  lower: number;
}

interface NLIConfig {
  NLI_time: string;
  NLI: number;
}

interface NLIConfig2 {
  TimeStamp: string;
  UpperBound1: number;
  LowerBound1: number;
  UpperBound2: number;
  LowerBound2: number;
  LR_Prediction: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('container') container: ElementRef;
  dataJSON = JSON.parse(JSON.stringify(data1));
  dataJSON2 = JSON.parse(JSON.stringify(data2));
  dataLPJSON = JSON.parse(JSON.stringify(dataLP));
  data = this.dataJSON;
  dataPrediction = this.dataJSON2;
  XLPData = this.dataLPJSON;
  public isLP: boolean = false;
  public isHP: boolean = true;
  sub:any
  index = 1
  LPData = []
  constructor() {
    console.log(this.LPData)
  }



  ngOnInit() {
    this.sub = Observable.interval(600)
    .subscribe((val) => {
      for(let i = 0; i < this.index; i++){
        this.LPData.push(this.XLPData[i])
      }
      console.log('function is counting', this.LPData)
      console.log(this.XLPData)
      const containerDiv = this.container.nativeElement;
      if (containerDiv.childNodes[0]) {
        console.log('child removed')
      containerDiv.removeChild(containerDiv.childNodes[0]);
      }
      if (containerDiv.childNodes[1]) {
        containerDiv.removeChild(containerDiv.childNodes[1]);
        }
      console.log(containerDiv)
      containerDiv.appendChild(this.createChart());
      
      });

  


    
  }

  

  // createHP() {
  //   this.isHP = true;
  //   this.isLP = false;

  //   const containerDiv = this.container.nativeElement;
  //   if (containerDiv.childNodes[0]) {
  //     containerDiv.removeChild(containerDiv.childNodes[0]);
  //   }
  //   containerDiv.appendChild(this.createChart());
  //   console.log('clicked');
  // }

  // createLP() {
  //   this.isHP = false;
  //   this.isLP = true;
  //   const containerDiv = this.container.nativeElement;
  //   if (containerDiv.childNodes[0]) {
  //     containerDiv.removeChild(containerDiv.childNodes[0]);
  //   }
  //   console.log('clicked');
  //   containerDiv.appendChild(this.createChart2());
  //   console.log(containerDiv);
  // }

  createChart() {
    console.log('chart created')
    const nliDiv = document.createElement('div');
    const nliGraph = d3.select(nliDiv).classed('nli-chart-wrapper', true);
    let margin = { top: 20, right: 30, bottom: 30, left: 40 };
    let height = 600;
    let width = 800;

    let x = d3
      .scaleUtc()
      .domain(d3.extent(this.XLPData, (d: any) => new Date(d.NLI_time.toString()).setHours(new Date(d.NLI_time.toString()).getHours() + 6)))
      .rangeRound([margin.left, width - margin.right]);

    let y = d3
      .scaleLinear()
      .domain([0.1, d3.max(this.LPData, (d: any) => 1.3)])
      .rangeRound([height - margin.bottom, margin.top])
      .clamp(true);

      let y2 = d3
      .scaleLinear()
      .domain([0.1, d3.max(this.XLPData, (d: any) => 1.3)])
      .rangeRound([height - margin.bottom, margin.top])
      .clamp(true);
    // d3
    //   .scaleLog()
    //   .domain([0.1, d3.max(this.data, (d: any) => parseFloat(d.NLI))])
    //   .rangeRound([height - margin.bottom, margin.top])
    //   .clamp(true);

    let xAxis = g =>
      g
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).ticks(width / 80))
        .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .append('text')
            .text('Time')
            .attr('font-size', 35)
            .attr('text-anchor', 'end')
            .attr('x', 425)
            .attr('fill', 'white')
            .attr('stroke', 'white')
            .attr('y', 52),
        );

    let yAxis = g =>
      g
        .attr('transform', `translate(${margin.left},0)`)
        .call(
          d3
            .axisLeft(y)
            .ticks(null, ',d')
            .tickFormat(d3.format('.2f')),
        )
        .call(g => g.select('.domain').remove())
        .call(g =>
          g
            .append('text')
            .attr('x', -margin.left)
            .attr('y', 10)
            .attr('fill', 'white')
            .attr('color', 'white')
            .attr('stroke', 'white')
            .attr('font-size', 35)
            .attr('text-anchor', 'start')
            .text('NLI'),
        );

    let grid = g =>
      g
        .attr('stroke', 'white')
        .attr('stroke-opacity', 0.1)
        .call(g =>
          g
            .append('g')
            .selectAll('line')
            .data(x.ticks(30))
            .join('line')
            .attr('x1', d => 0.5 + x(d))
            .attr('x2', d => 0.5 + x(d))
            .attr('y1', margin.top)
            .attr('y2', height - margin.bottom)
            .selectAll('text')
            .attr('font-size', 35)
            ,
        )
        .call(g =>
          g
            .append('g')
            .selectAll('line')
            .data(y.ticks(30))
            .join('line')
            .attr('y1', d => 0.5 + y(d))
            .attr('y2', d => 0.5 + y(d))
            .attr('x1', margin.left)
            .attr('x2', width - margin.right),
        );

    let line = d3
      .line<NLIConfig>()
      .x((d: any) => x(new Date(d.NLI_time.toString()).setHours(new Date(d.NLI_time.toString()).getHours() + 6)))
      .y((d: any) => y(d.NLI));

    let NLIlimit = d3
      .line<NLIConfig>()
      .x((d: any) => x(new Date(d.NLI_time.toString()).setHours(new Date(d.NLI_time.toString()).getHours() + 6)))
      .y((d: any) => y(1));

    const svg = nliGraph
      .append('svg')
      .attr('viewBox', '-90, -70, 1000, 700')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 50)
      .attr('stroke', 'grey')
      .attr('stroke-miterlimit', 1);

    svg.append('g').call(xAxis);

    svg.append('g').call(yAxis);

    svg.append('g').call(grid);

    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', 'steelblue')
      .attr('stroke-width', 4)
      .attr('d', line(this.XLPData.slice(0, this.LPData.length)));
          console.log(this.LPData)
    svg
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', '#98E3CA')
      .attr('stroke-width', 2)
      .attr('d', NLIlimit(this.XLPData.slice(0, this.XLPData.length)));

    return nliDiv;
  }

  // createChart2() {
  //   const nliDiv = document.createElement('div');
  //   const nliGraph = d3.select(nliDiv).classed('nli-chart-wrapper', true);
  //   let margin = { top: 20, right: 30, bottom: 30, left: 40 };
  //   let height = 600;
  //   let width = 800;

  //   let x = d3
  //     .scaleUtc()
  //     .domain(d3.extent(this.LPData, (d: any) => new Date(d.NLI_time)))
  //     .rangeRound([margin.left, width - margin.right]);

  //   let y = d3
  //     .scaleLinear()
  //     .domain([0.1, d3.max(this.data, (d: any) => parseFloat(d.NLI))])
  //     .rangeRound([height - margin.bottom, margin.top])
  //     .clamp(true);

  //   // d3
  //   //   .scaleLog()
  //   //   .domain([0.1, d3.max(this.data, (d: any) => parseFloat(d.NLI))])
  //   //   .rangeRound([height - margin.bottom, margin.top])
  //   //   .clamp(true);

  //   let xAxis = g =>
  //     g
  //       .attr('transform', `translate(0,${height - margin.bottom})`)
  //       .call(d3.axisBottom(x).ticks(width / 80))
  //       .call(g => g.select('.domain').remove())
  //       .call(g =>
  //         g
  //           .append('text')
  //           .text('Time')
  //           .attr('text-anchor', 'end')
  //           .attr('font-size', 50)
  //           .attr('x', 460)
  //           .attr('fill', 'white')
  //           .attr('stroke', 'white')
  //           .attr('y', 52),
  //       );

  //   let yAxis = g =>
  //     g
  //       .attr('transform', `translate(${margin.left},0)`)
  //       .call(
  //         d3
  //           .axisLeft(y)
  //           .ticks(null, ',d')
  //           .tickFormat(d3.format('.2f')),
  //       )
  //       .call(g => g.select('.domain').remove())
  //       .call(g =>
  //         g
  //           .append('text')
  //           .attr('x', -margin.left)
  //           .attr('y', 10)
  //           .attr('fill', 'white')
  //           .attr('color', 'white')
  //           .attr('font-size', 50)
  //           .attr('stroke', 'white')
  //           .attr('text-anchor', 'start')
  //           .text('NLI'),
  //       );

  //   let grid = g =>
  //     g
  //       .attr('stroke', 'currentColor')
  //       .attr('stroke-opacity', 0.1)
  //       .attr('font-size', 50)
  //       .call(g =>
  //         g
  //           .append('g')
  //           .selectAll('line')
  //           .data(x.ticks(30))
  //           .join('line')
  //           .attr('x1', d => 0.5 + x(d.attr('font-size', 50)))
  //           .attr('x2', d => 0.5 + x(d.attr('font-size', 50)))
  //           .attr('y1', margin.top)
  //           .attr('y2', height - margin.bottom)
  //           .attr('stroke', 'white'),
  //       )
  //       .call(g =>
  //         g
  //           .append('g')
  //           .selectAll('line')
  //           .data(y.ticks(30))
  //           .join('line')
  //           .attr('y1', d => 0.5 + y(d))
  //           .attr('y2', d => 0.5 + y(d))
  //           .attr('x1', margin.left)
  //           .attr('x2', width - margin.right)
  //           .attr('stroke', 'white'),
  //       );

  //   let line = d3
  //     .line<NLIConfig>()
  //     .x((d: any) => x(new Date(d.NLI_time)))
  //     .y((d: any) => y(d.NLI));

  //   let NLIlimit = d3
  //     .line<NLIConfig>()
  //     .x((d: any) => x(new Date(d.NLI_time)))
  //     .y((d: any) => y(1));

  //   const svg = nliGraph
  //     .append('svg')
  //     .attr('viewBox', '-70, -70, 1000, 700')
  //     .attr('font-family', 'sans-serif')
  //     .attr('font-size', 200)
  //     .attr('stroke', 'grey')
  //     .attr('stroke-miterlimit', 1);

  //   svg.append('g').call(xAxis);

  //   svg.append('g').call(yAxis);

  //   svg.append('g').call(grid);

  //   svg
  //     .append('path')
  //     .attr('fill', 'none')
  //     .attr('stroke', 'steelblue')
  //     .attr('stroke-width', 4)
  //     .attr('d', line(this.LPData.slice(0, this.LPData.length)));

  //   svg
  //     .append('path')
  //     .attr('fill', 'none')
  //     .attr('stroke', '#98E3CA')
  //     .attr('stroke-width', 2)
  //     .attr('d', NLIlimit(this.LPData.slice(0, this.LPData.length)));

  //   return nliDiv;
  // }
}
