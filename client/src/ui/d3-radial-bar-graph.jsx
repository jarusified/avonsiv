import { useTheme } from "@emotion/react";
import * as d3 from "d3";
import { interpolateOranges } from "d3-scale-chromatic";
import { useEffect, useState } from "react";
import { updateAppState } from "../actions";
import { useSelector } from "react-redux";

import { COLORS, formatDuration, setContrast } from "../helpers/utils";

export default function D3RadialBarGraph(props) {
	let {
		style,
		containerName,
		ensembleSummary,
		individualSummary,
		innerRadius,
		outerRadius,
		withInnerCircle,
		withUtilization,
		withTicks,
		withLabels,
		withYAxis,
		withPlayFeature
	} = props;

	const { xData, yData, zData, maxY, classNames, startTs, endTs } =
		individualSummary;
	const [hover, setHover] = useState(false);

	const theme = useTheme();
	const appState = useSelector((store) => store.appState);

	useEffect(() => {
		const containerID = "#" + containerName;
		d3.select(containerID).selectAll("*").remove();

		let svg = d3
			.select(containerID)
			.append("svg")
			.attr("width", style.width)
			.attr("height", style.height)
			.attr(
				"viewBox",
				`${-style.width / 2} ${-style.height / 2} ${style.width} ${
					style.height
				}`
			)
			.style("cursor", "pointer")
			.style("font", "10px sans-serif")
			.on("click", (d) => {
				setHover((hover) => !hover);
			});

		let x = d3
			.scaleBand()
			.range([0, 2 * Math.PI])
			.align(0)
			.domain(xData);

		let y = d3
			.scaleRadial()
			.range([innerRadius, outerRadius])
			.domain([0, maxY]);

		const arc = d3
			.arc()
			.innerRadius((d) => y(d[0]))
			.outerRadius((d) => y(d[1]))
			.startAngle((d) => x(d.data.ts))
			.endAngle((d) => x(d.data.ts) + x.bandwidth())
			.padAngle(0.01)
			.padRadius(innerRadius);

		svg.append("g")
			.selectAll("g")
			.data(d3.stack().keys(zData)(yData))
			.join("g")
			.attr("fill", (d) => {
				const class_name = classNames[d.key];
				return COLORS[class_name];
			})
			.selectAll("path")
			.data((d) => d)
			.join("path")
			.attr("d", arc);

		// Add labels
		let label = svg
			.append("g")
			.selectAll("g")
			.data(xData)
			.enter()
			.append("g")
			.attr("text-anchor", "middle")
			.attr("opacity", () => {
				if (withTicks) {
					return 1;
				} else {
					return 0;
				}
			})
			.attr("transform", (d) => {
				return (
					"rotate(" +
					(((x(d) + x.bandwidth() / 2) * 180) / Math.PI - 90) +
					")translate(" +
					innerRadius +
					",0)"
				);
			});

		label.append("line").attr("x2", -5).attr("stroke", "#000");

		label
			.append("text")
			.attr("class", "hidden-text")
			.attr("opacity", () => {
				if (withLabels) {
					return 1;
				} else {
					return 0;
				}
			})
			.attr("transform", (d) => {
				return (x(d) + x.bandwidth() / 2 + Math.PI / 2) %
					(2 * Math.PI) <
					Math.PI
					? "rotate(90)translate(0,16)"
					: "rotate(-90)translate(0,-9)";
			})
			.text((d) => formatDuration(d, startTs, false));

		// Add secondary encoding.
		const this_duration = endTs - startTs;
		const ensemble_duration =
			ensembleSummary["runtime_range"][1] -
			ensembleSummary["runtime_range"][0];

		// If the difference between the max and min is 0, it means there is
		// only 1 run in the ensemble.
		if (ensemble_duration == 0) {
			withInnerCircle = false;
		}

		if (withInnerCircle) {
			const perc =
				((this_duration - ensembleSummary["runtime_range"][0]) /
					ensemble_duration) *
				100;
			const cScale = d3
				.scaleSequential()
				.interpolator(interpolateOranges)
				.domain([0, 100]);
			const runtime_color = cScale(perc);
			const runtime_color_contrast = setContrast(runtime_color);

			svg.append("circle")
				.attr("cx", "50%")
				.attr("cy", "50%")
				.attr("r", 40)
				.style("fill", cScale(perc))
				.attr("transform", () => {
					return (
						"translate(" +
						-style.width / 2 +
						"," +
						-style.height / 2 +
						")"
					);
				});

			svg.append("text")
				.attr("class", "hidden-text")
				.attr("fill", runtime_color_contrast)
				.attr("font-size", 12)
				.attr("transform", () => {
					return "translate(" + -10 + "," + 0 + ")";
				})
				.text(formatDuration(endTs, startTs, true));
		}

		if (
			individualSummary["gpuUtilization"] == undefined ||
			individualSummary["memUtilization"] == undefined
		) {
			withUtilization = false;
		}

		if (withUtilization) {
			// let xScale = d3
			// 	.scaleLinear()
			// 	.range([0, 2 * Math.PI])
			// 	.domain([0, 100]);

			// let yScale = d3
			// 	.scaleRadial()
			// 	.range([-innerRadius, innerRadius])
			// 	.domain([0, individualSummary["gpuUtilization"].length]);

			const xScale = d3
				.scaleLinear()
				.range([0, innerRadius / 2])
				.domain([0, 100]);
			const yScale = d3
				.scaleLinear()
				.range([-innerRadius, innerRadius])
				.domain([0, individualSummary["gpuUtilization"].length]);

			const curve = d3
				.line()
				.x((d) => xScale(d))
				.y((d, i) => yScale(i));
			// const curve =  d3.arc()
			// 	.innerRadius((d, i) => yScale(i))
			// 	.startAngle((d) => x(d))
			// 	.endAngle((d) => x(d) + x.bandwidth())
			// 	.padAngle(0.01)
			// 	.padRadius(innerRadius)

			svg.append("path")
				.attr("class", "line")
				.datum(individualSummary["gpuUtilization"])
				.attr("d", curve)
				.attr("fill", "#69BF71")
				.attr("transform", () => {
					return "translate(" + -1.5 * outerRadius + "," + 100 + ")";
				});

			const xScale2 = d3
				.scaleLinear()
				.range([0, -innerRadius / 2])
				.domain([0, 100]);
			const yScale2 = d3
				.scaleLinear()
				.range([-innerRadius, innerRadius])
				.domain([0, individualSummary["memUtilization"].length]);

			svg.append("path")
				.attr("class", "line")
				.datum(individualSummary["memUtilization"])
				.attr(
					"d",
					d3
						.line()
						.x((d) => xScale2(d))
						.y((d, i) => yScale2(i))
				)
				.attr("fill", "#F86045")
				.attr("transform", () => {
					return "translate(" + -1.5 * outerRadius + "," + 100 + ")";
				});
		}

		// Add y-axis ticks.
		if (withYAxis) {
			let yAxis = svg.append("g").attr("text-anchor", "middle");

			let yTick = yAxis
				.selectAll("g")
				.data(y.ticks(4).slice(1))
				.enter()
				.append("g");

			yTick
				.append("circle")
				.attr("fill", "none")
				.attr("stroke", "#F6F4F9")
				.attr("stroke-width", 0.5)
				.attr("r", y);

			yTick
				.append("text")
				.attr("y", function (d) {
					return -y(d);
				})
				.attr("dy", "0.35em")
				// .attr("fill", "#000")
				.attr("stroke", "#fff")
				// .attr("stroke-width", 1)
				.text((d) => {
					return Math.floor((d / maxY) * 100);
				});

			yAxis
				.append("text")
				.attr("y", function (d) {
					return -y(0);
				})
				.attr("dy", "10em")
				.text("");
		}

		if (withPlayFeature) {
			const windowArc = d3
				.arc()
				.innerRadius(innerRadius - 25)
				.outerRadius(innerRadius - 20)
				.startAngle(0)
				.endAngle(30)
				.endAngle(Math.PI / 2);

			svg.append("path")
				.style("fill", theme.text.label)
				.attr("d", windowArc);

			svg.append("g")
				.attr("class", "button play-button")
				.attr("fill", theme.text.label)
				.attr("transform", `translate(${-10},${-10})`)
				.append("path")
				.attr("d", () => {
					if (appState == 0) {
						return "M8 5v14l11-7z";
					} else if (appState == 1) {
						return "M6 19h4V5H6v28zm8-28v28h4V5h-4z";
					}
				})
				.on("click", (d) => {
					console.log("here");	
					updateAppState(!appState);
				});
		}
	}, [props]);

	return <div id={containerName}></div>;
}
