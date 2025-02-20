"use client";
import React, { useState } from "react";
import Plot from "react-plotly.js";

const generateSystematic = (n = 300) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 300) => {
  const result = [];
  let lastThree = ["A", "B", "A"];

  for (let i = 0; i < n; i++) {
    if (lastThree.every((x) => x === "A")) {
      result.push("B");
    } else if (lastThree.every((x) => x === "B")) {
      result.push("A");
    } else {
      result.push(Math.random() < 0.5 ? "A" : "B");
    }
    lastThree = [...lastThree.slice(1), result[i]];
  }
  return result;
};

const generateRandom = (n = 300) => {
  return Array.from({ length: n }, () => (Math.random() < 0.5 ? "A" : "B"));
};

const getLongestRun = (sequence) => {
  let maxRun = 0;
  let currentRun = 1;

  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1]) {
      currentRun++;
    } else {
      maxRun = Math.max(maxRun, currentRun);
      currentRun = 1;
    }
  }
  return Math.max(maxRun, currentRun);
};

const makeCountPlot = (sequence) => {
  const counts = sequence.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  return {
    data: [
      {
        x: Object.keys(counts),
        y: Object.values(counts),
        type: "bar",
        marker: { color: ["blue", "red"] },
      },
    ],
    layout: {
      showlegend: false,
      yaxis: { title: "Count" },
      xaxis: { title: "Group" },
      margin: { t: 20 },
    },
  };
};

export default function Page() {
  const [sequences, setSequences] = useState({
    systematic: generateSystematic(),
    manual: generateManual(),
    random: generateRandom(),
  });

  const regenerateSequences = () => {
    setSequences({
      systematic: generateSystematic(),
      manual: generateManual(),
      random: generateRandom(),
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Allocation sequences at scale</h1>
      <p>What happens when these allocation sequences are used for larger studies?</p>
      <button onClick={regenerateSequences}>Generate new sequences (N=300)</button>
      <div style={{ display: "flex", marginTop: "20px" }}>
        {["systematic", "manual", "random"].map((key, idx) => (
          <div key={key} style={{ flex: 1, margin: "0 10px" }}>
            <h3>
              {key === "systematic"
                ? "Alternating allocation"
                : key === "manual"
                ? "Manual allocation"
                : "Randomized allocation"}
            </h3>
            <div style={{ wordWrap: "break-word", marginBottom: "10px" }}>
              {sequences[key].join(" ")}
            </div>
            <Plot {...makeCountPlot(sequences[key])} style={{ height: "200px" }} />
            <p>Longest run: {getLongestRun(sequences[key])}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
