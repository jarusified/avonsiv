import os
from typing import List

from server.logger import get_logger
from server.timeline import Timeline

LOGGER = get_logger(__name__)


class Datasets:
    def __init__(self, data_dir: str, profile_format: str):
        """
        Dataset class for collecting the profiles from the input `data_dir`.
        """
        self.data_dir = data_dir
        self.experiments = os.listdir(data_dir)

        self.file_paths = {
            exp: os.path.join(os.path.abspath(data_dir), exp)
            for exp in self.experiments
        }
        self.profiles = {
            exp: Timeline(self.file_paths[exp], profile_format)
            for exp in self.experiments
        }

        LOGGER.info(f"{len(self.experiments)} JIT profiles loaded! ")
        LOGGER.info(f"=====================================")
        for name, profile in self.profiles.items():
            LOGGER.info(f"{name} contains {profile.get_event_count()} events. ")
        LOGGER.info(f"=====================================")

    def get_profile(self, experiment: str) -> Timeline:
        """
        Returns the Timeline object for a given experiment.

        :params: experiment: Name of the experiment (aka JSON file name) with prefix (i.e., .json)
        :returns: Timeline object corresponding to the experiment.
        """
        if experiment not in self.profiles:
            LOGGER.error(
                f"Invalid {experiment}! Check if the experiment exists in {self.data_dir}"
            )
        return self.profiles[experiment]

    ################### Exposed APIs ###################
    def sort_by_event_count(self) -> List[str]:
        """
        Sorts the self.profiles based on number of events in the timeline.

        :params: None
        :returns: List of experiments
        """
        event_counts_dict = {
            exp: self.profiles[exp].get_event_count() for exp in self.experiments
        }
        sorted_experiments = sorted(
            event_counts_dict.items(), key=lambda item: item[1], reverse=True
        )
        return list(dict(sorted_experiments).keys())

    def sort_by_date(self) -> List[str]:
        """
         Sorts the self.profiles by date of execution (i.e., timestamp).

        :params: None
         :returns: List of experiments
        """
        event_counts_dict = {
            exp: self.profiles[exp].get_start_timestamp() for exp in self.experiments
        }
        sorted_experiments = sorted(
            event_counts_dict.items(), key=lambda item: item[1], reverse=True
        )
        return list(dict(sorted_experiments).keys())
