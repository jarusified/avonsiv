import * as d3 from "d3";
import { interpolateReds } from "d3-scale-chromatic";
import { useEffect } from "react";

function D3Matrix(props) {
	const { containerName, matrixData, style } = props;

	useEffect(() => {
		if (matrixData != undefined) {
			// Clean up existing elements
			const containerID = "#" + containerName;
			d3.select(containerID).selectAll("*").remove();

			const data = [];
			for (let i = 0; i < matrixData.length; i += 1) {
				for (let j = 0; j < matrixData[i].length; j += 1) {
					if (matrixData[i][j] != undefined) {
						data.push({
							source: i,
							target: j,
							value: matrixData[i][j]
						});
					}
				}
			}

			const width = style.width - style.left - style.right;
			const height = style.height - style.top - style.bottom;

			let svg = d3
				.select(containerID)
				.append("svg")
				.attr("width", style.width)
				.attr("height", style.height)
				.append("g")
				.attr(
					"transform",
					"translate(" + 2 * style.left + "," + 2 * style.left + ")"
				);

			const values = [];
			for (let d of data) {
				values.push(d.value);
			}

			const cScale = d3
				.scaleSequential()
				.interpolator(interpolateReds)
				.domain(d3.extent(data, d => d.value));

			let margin = { left: 36, right: 0, top: 36, bottom: 0 };

			let tooltip = d3
				.select(containerID)
				.append("div")
				.attr("class", "tooltip")
				.style("opacity", 0);

			let xScale = d3.scaleLinear().range([0, width]).domain([0, 2]);
			let yScale = d3.scaleLinear().range([height, 0]).domain([0, 8]);

			let hashNode = (x, y) => x + " -> " + y;

			let nodeSet = new Set();
			data.forEach((elem) => {
				nodeSet.add(elem.source);
				nodeSet.add(elem.target);
			});

			let nodes = [];
			nodeSet.forEach((elem) => nodes.push(elem));
			nodes.sort((a, b) => a - b);

			let grids = new Map();
			for (let src of nodes) {
				for (let tgt of nodes) {
					if (src != undefined && tgt != undefined) {
						if (matrixData[src][tgt] != undefined) {
							grids.set(hashNode(src, tgt), {
								x: tgt,
								y: src,
								value: 0
							});
						}
					}
				}
			}

			data.forEach((elem) => {
				const from_hash = hashNode(elem.source, elem.target);
				const to_hash = hashNode(elem.target, elem.source);

				if (grids.has(from_hash)) 
					grids.get(hashNode(elem.source, elem.target)).value = elem.value;
				if (grids.has(to_hash))
					grids.get(hashNode(elem.target, elem.source)).value = elem.value;
			});

			svg.selectAll("g")
				.data(nodes)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("x", margin.left / 2)
				.attr("y", (d) => yScale(d) + 4)
				.text((d) => d);

			svg.selectAll("g")
				.data(nodes)
				.enter()
				.append("text")
				.attr("text-anchor", "middle")
				.attr("x", (d) => xScale(d))
				.attr("y", margin.top / 2)
				.text((d) => d);

			console.log(grids);

			svg.selectAll("rect")
				.data(grids)
				.enter()
				.append("rect")
				.attr("x", (d) => { 
					console.log(xScale(2), d[1], d[1].x, xScale(d[1].x)); 
					return xScale(d[1].x) // - xScale.bandwidth() / 2;
				})
				.attr("y", (d) => yScale(d[1].y) //- xScale.bandwidth() / 2
				)
				.attr("width", 20)
				.attr("height", 20)
				.attr("stroke", "black")
				.attr("stroke-width", 0.5)
				.attr("fill", (d) => cScale(d[1].value))
				.on("mouseover", function (event, d) {
					svg.selectAll("rect").attr("stroke-width", (g) =>
						g[1].x === d[1].x || g[1].y === d[1].y ? 2 : 0.5
					);
					tooltip.transition().duration(200).style("opacity", 0.9);
					tooltip
						.html("link: " + d[0])
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 10 + "px");
				})
				.on("mouseout", function () {
					svg.selectAll("rect").attr("stroke-width", 0.5);
					tooltip.transition().duration(600).style("opacity", 0);
				});
		}
	}, [props]);

	return <div id={containerName}></div>;
}
export default D3Matrix;
