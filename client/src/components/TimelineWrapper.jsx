import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";

import { Grid, Paper, Typography } from "@material-ui/core";
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import { makeStyles } from "@material-ui/core/styles";
import { Timeline } from "vis-timeline";
import { DataSet } from "vis-data";
import "vis-timeline/dist/vis-timeline-graph2d.css";

import { fetchTimeline } from "../actions";

const useStyles = makeStyles((theme) => ({
	timeline: {
		width: window.innerWidth - 20,
	},
}));

function TimelineWrapper() {
	const classes = useStyles();
	const dispatch = useDispatch();

	const [isStacked, setIsStacked] = useState(false);

	const currentTimeline = useSelector((store) => store.currentTimeline);
	const selectedExperiment = useSelector((store) => store.selectedExperiment);
	const timelineEnd = useSelector((store) => store.timelineEnd);
	const timelineStart = useSelector((store) => store.timelineStart);

	useEffect(() => {
		if (selectedExperiment !== "" && timelineStart != 0 && timelineEnd != 0) {
			dispatch(fetchTimeline(timelineStart, timelineStart));
		}
	}, [selectedExperiment, timelineStart, timelineEnd]);


	useEffect(() => {
		d3.select("#timeline-view").selectAll("*").remove();
		let container = document.getElementById("timeline-view");

		const { end_ts, events, groups, start_ts } = currentTimeline
		let _groups = new DataSet(groups);
		let _events = new DataSet(events);

		// Configuration for the Timeline
		const _options = {
			autoResize: false,
			format: {
				minorLabels: function (date, scale, step) {
					const duration = moment.duration(date.diff(timelineStart));
					switch (scale) {
						case 'millisecond':
							return duration.asMilliseconds() + "ms";
						case 'second':
							return Math.floor(duration.asSeconds()) + "s";
						case 'minute':
							return Math.floor(duration.asMinutes()) + "min";
					}
				}
			},
			max: timelineEnd,
			min: timelineStart,
			zoomMin: 1000,
			zoomMax: 100000,
			moment: function (date) {
				return moment(date);
			},
			orientation: 'top',
			stack: isStacked,
			tooltip: {
				followMouse: true,
				template: function (item, element, data) {
					return item.content;
				}
			}
		};

		// Create a Timeline
		let tx = new Timeline(container);
		tx.setOptions(_options);
		tx.setItems(_events);
		tx.setGroups(_groups);

		document.getElementById('timeline-view').onclick = function (event) {
			const props = tx.getEventProperties(event)

			switch (props.what) {
				case 'axis':
					break
				case 'background':
					break
				case 'current-time':
					break
				case 'item':
					break
			}
		}

		// Interactions: Fit the timeline to the screenWidth.
		document.getElementById("fit-button").onclick = function () {
			tx.fit();
		};

		tx.on('click', function (props) {
			console.log(props);
		});

	}, [currentTimeline, isStacked]);
	return (
		<Paper>
			<Typography variant="overline" style={{ fontWeight: "bold" }}>
				Timeline
			</Typography>
			<Grid container>
				<Button id="fit-button" variant="outlined">Fit</Button>
				<ToggleButton value="check" selected={isStacked} onChange={() => { setIsStacked(!isStacked); }}>
					Stack
				</ToggleButton>
				<Grid item>
					<div id="timeline-view" className={classes.timeline}></div>
				</Grid>
			</Grid>
		</Paper>
	);
}

export default TimelineWrapper;
