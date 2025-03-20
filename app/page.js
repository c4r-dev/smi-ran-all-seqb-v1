"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const generateSystematic = (n = 300) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 300) => {
  // Ensure n is even for equal distribution
  if (n % 2 !== 0) n = n + 1;
  
  // Create an array with exactly n/2 As and n/2 Bs
  const elements = Array(n/2).fill('A').concat(Array(n/2).fill('B'));
  
  // Shuffle the array using Fisher-Yates algorithm
  for (let i = elements.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [elements[i], elements[j]] = [elements[j], elements[i]];
  }
  
  return elements;
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
        marker: { color: ["#39E1F8", "#FFA800"] },
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
  const [sequences, setSequences] = useState(null);

  useEffect(() => {
    // Generate sequences only after hydration
    setSequences({
      systematic: generateSystematic(),
      manual: generateManual(),
      random: generateRandom(),
    });
  }, []);

  if (!sequences) {
    return <div>Loading...</div>; // Prevent rendering mismatches
  }

  const regenerateSequences = () => {
    setSequences({
      systematic: generateSystematic(),
      manual: generateManual(),
      random: generateRandom(),
    });
  };

  return (
    <div>
      <h2 className="responsive-text">
        What happens when these allocation sequences are used for larger studies (n=300)?
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {["systematic", "manual", "random"].map((key) => (
          <div
            key={key}
            style={{
              flex: "1 1 300px",  /* Allows it to shrink but maintains width */
              maxWidth: "400px",  /* Prevents it from stretching too much */
              minWidth: "280px",  /* Ensures readability */
              margin: "10px auto",
            }}
          >

            <h3>
              {key === "systematic"
                ? "Alternating Allocation"
                : key === "manual"
                  ? "Manual Allocation"
                  : "Randomized Allocation"}
            </h3>
            <div style={{ wordWrap: "break-word", marginBottom: "10px" }}>
              {sequences[key].join(" ")}
            </div>
            <Plot {...makeCountPlot(sequences[key])} style={{ height: "200px" }} />
            <p style={{ textAlign: "center", width: "100%" }}>
              Longest run: {getLongestRun(sequences[key])}
            </p>
          </div>
        ))}
      </div>

      <button onClick={regenerateSequences} className="regenerate-button">
        Regenerate sequences
      </button>

    </div>
  );
}
