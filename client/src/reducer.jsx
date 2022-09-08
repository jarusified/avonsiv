import {
    FETCH_BACKGROUND_SUMMARY,
    FETCH_EVENT_SUMMARY,
    FETCH_EXPERIMENTS,
    FETCH_METADATA,
    FETCH_SUMMARY,
    FETCH_TIMELINE,
    UPDATE_EVENT_SUMMARY
} from './helpers/types';

const initialState = {
    backgroundSummary: [],
    currentTimeline: {
        end_ts: 0,
        events: [],
        groups: [],
        start_ts: 0
    },
    experiments: [],
    events: [],
    eventSummary: [],
    currentEventSummary: [],
    groups: [],
    profileMetadata: [],
    selectedExperiment: '',
    summary: {
        data: [],
        groups: 0,
        samples: [],
        ts_width: 0,
        window: 0
    },
    timelineEnd: 0,
    timelineStart: 0
};

export default function Reducer(state = initialState, action) {
    switch (action.type) {
        case FETCH_EXPERIMENTS:
            return {
                ...state,
                experiments: action.payload.experiments,
                selectedExperiment: action.payload.experiments[0],
            }
        case FETCH_METADATA:
            return {
                ...state,
                selectedExperiment: action.payload.general.selectedExperiment,
                timelineStart: action.payload.general.timelineStart,
                timelineEnd: action.payload.general.timelineEnd,
                profileMetadata: action.payload.profile
            }
        case FETCH_TIMELINE:
            return {
                ...state,
                currentTimeline: action.payload,
            }
        case FETCH_SUMMARY:
            return {
                ...state,
                summary: action.payload
            }
        case FETCH_EVENT_SUMMARY:
            return {
                ...state,
                eventSummary: action.payload,
                currentEventSummary: action.payload
            }
        case FETCH_BACKGROUND_SUMMARY:
            return {
                ...state,
                backgroundSummary: action.payload
            }
        case UPDATE_EVENT_SUMMARY:
            return {
                ...state,
                currentEventSummary: action.payload
            }
        default:
            return state;
    }
}