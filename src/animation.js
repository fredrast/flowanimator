import React, { useState, useEffect } from "react";
import { AnimationData } from "./animation-data.js";

function Animation(props) {
  const [columns, setColumns] = useState();
  const [stories, setStories] = useState();
  const [projectTimespan, setProjectTimespan] = useState();
  const [animationDuration, setAnimationDuration] = useState(0);
  const [loadProgress, setLoadProgress] = useState(0);

  const projectData = props.projectData;
  const handleAnimationBuildStarted = props.handleAnimationBuildStarted;

  useEffect(() => {
    console.log("useEffect");
    console.log(projectData);
    if (projectData) {
      console.log("run getAnimationData");
      const {
        columns,
        stories,
        transitions,
        projectTimespan_initial,
        animationDuration_initial
      } = AnimationData.getAnimationData(projectData);

      setColumns(columns);
      console.log("setStories");
      console.log(stories);
      setStories(stories);
      setProjectTimespan(projectTimespan_initial);
      setAnimationDuration(animationDuration_initial);

      const progressCallback = loadProgress => {
        console.log("progressCallback");
        setLoadProgress(loadProgress);
        handleAnimationBuildStarted();
      };

      const completionCallback = ({
        projectTimespan_final,
        animationDuration_final
      }) => {
        console.log("completionCallback");
        setProjectTimespan(projectTimespan_final);
        setAnimationDuration(animationDuration_final);
      };

      AnimationData.buildAnimation(
        transitions,
        stories,
        progressCallback,
        completionCallback
      );
    }
  }, [projectData, handleAnimationBuildStarted]);

  if (stories) {
    // TODO more elegant way to determine whether the data for these components is ready to be rendered
    console.log("Render");
    console.log(props.projectData);
    return (
      <div id="animation-board">
        <Timeline timespan={projectTimespan} />
        <Slider
          timespan={projectTimespan}
          animationDuration={animationDuration}
          loadProgress={loadProgress}
        />
        <ColumnLabels columns={columns} />
        <StoryTokens stories={stories} />
      </div>
    );
  } else {
    return <div id="animation-board" />;
  }
}

function Timeline(props) {
  return <div />;
}

function Slider(props) {
  return <div />;
}

function ColumnLabels(props) {
  return <div />;
}

function StoryTokens(props) {
  console.log("StoryTokens");
  console.log(props);
  return props.stories.asArray().map(story => <StoryToken story={story} />);
}

function StoryToken(props) {
  // const { x, y, visible } = props.story.getPosition(props.animationTime);

  const styles = {
    border: "solid",
    borderWidth: "2px",
    borderColor: "#00f",
    color: "#fff",
    width: "20px",
    height: "10px",
    borderRadius: "5px",

    visibility: "visible",
    left: 100,
    top: 100
  };
  return <div styles={styles} key={props.story.id} />;
}

export default Animation;
