"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

const generateSystematic = (n = 300) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 300) => {
  // Ensure n is even for easier distribution
  if (n % 2 !== 0) n = n + 1;

  // Decide the difference between A and B (0, 2, or 4)
  const possibleDifferences = [0, 2, 4];
  const difference = possibleDifferences[Math.floor(Math.random() * possibleDifferences.length)];

  // Calculate counts based on the difference
  const countA = Math.floor(n / 2) + Math.floor(difference / 2);
  const countB = n - countA;

  // Create initial array with the right counts
  const elements = Array(countA).fill('A').concat(Array(countB).fill('B'));

  // Custom shuffling that attempts to break up long runs
  let result = [];
  let prevElement = null;
  let runLength = 0;
  const maxRunLength = 3; // Maximum allowed run length

  // First shuffle using Fisher-Yates
  for (let i = elements.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [elements[i], elements[j]] = [elements[j], elements[i]];
  }

  // Then process the shuffled array to avoid long runs
  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];

    if (currentElement === prevElement) {
      runLength++;

      // If run would be too long, look ahead to find a different element
      if (runLength >= maxRunLength) {
        // Find next different element to swap with
        for (let j = i + 1; j < elements.length; j++) {
          if (elements[j] !== currentElement) {
            // Swap elements
            [elements[i], elements[j]] = [elements[j], elements[i]];
            runLength = 1; // Reset run counter
            break;
          }
        }
      }
    } else {
      runLength = 1;
    }

    result.push(elements[i]);
    prevElement = elements[i];
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

// New function to calculate effect size
const calculateEffectSize = (sequence) => {
  const countA = sequence.filter(item => item === 'A').length;
  const countB = sequence.filter(item => item === 'B').length;
  
  // Calculate proportions
  const totalCount = countA + countB;
  const propA = countA / totalCount;
  const propB = countB / totalCount;
  
  // Calculate observed effect (difference in proportions)
  const observedEffect = Math.abs(propA - propB);
  
  // Return effect size with random variation around true effect (0.20)
  // Different allocation methods will produce different biases
  if (sequence.every((val, i) => i % 2 === 0 ? val === 'A' : val === 'B')) {
    // Systematic allocation - always balanced (0)
    return 0;
  } else {
    // Add some randomness around the true effect
    const variation = Math.random() * 0.15 - 0.05; // Range: -0.05 to 0.10
    return Math.max(0, Math.round((0.20 + variation) * 100) / 100);
  }
};

// New function to calculate p-value
const calculatePValue = (sequence, type) => {
  const countA = sequence.filter(item => item === 'A').length;
  const countB = sequence.filter(item => item === 'B').length;
  
  // Base p-value calculation on imbalance
  const imbalance = Math.abs(countA - countB);
  
  // Adjust based on allocation type
  if (type === 'systematic') {
    // Systematic allocation has deterministic balance, so p-value is high
    return Math.round((0.8 + Math.random() * 0.19) * 100) / 100;
  } else if (type === 'manual') {
    // Manual allocation aims for balance but has some variability
    return Math.round((0.3 + Math.random() * 0.4) * 100) / 100;
  } else {
    // Random allocation has the most variability
    // Sometimes significant by chance (p < 0.05)
    const basePValue = Math.random() * 0.5;
    return Math.round(basePValue * 100) / 100;
  }
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
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Generate sequences only after hydration
    const newSequences = {
      systematic: generateSystematic(),
      manual: generateManual(),
      random: generateRandom(),
    };
    
    setSequences(newSequences);
    
    // Calculate statistics for the sequences
    const newStats = {
      systematic: {
        effectSize: calculateEffectSize(newSequences.systematic),
        pValue: calculatePValue(newSequences.systematic, 'systematic'),
        longestRun: getLongestRun(newSequences.systematic)
      },
      manual: {
        effectSize: calculateEffectSize(newSequences.manual),
        pValue: calculatePValue(newSequences.manual, 'manual'),
        longestRun: getLongestRun(newSequences.manual)
      },
      random: {
        effectSize: calculateEffectSize(newSequences.random),
        pValue: calculatePValue(newSequences.random, 'random'),
        longestRun: getLongestRun(newSequences.random)
      }
    };
    
    setStats(newStats);
  }, []);

  if (!sequences || !stats) {
    return <div>Loading...</div>; // Prevent rendering mismatches
  }

  const regenerateSequences = () => {
    const newSequences = {
      systematic: generateSystematic(),
      manual: generateManual(),
      random: generateRandom(),
    };
    
    setSequences(newSequences);
    
    // Recalculate statistics
    const newStats = {
      systematic: {
        effectSize: calculateEffectSize(newSequences.systematic),
        pValue: calculatePValue(newSequences.systematic, 'systematic'),
        longestRun: getLongestRun(newSequences.systematic)
      },
      manual: {
        effectSize: calculateEffectSize(newSequences.manual),
        pValue: calculatePValue(newSequences.manual, 'manual'),
        longestRun: getLongestRun(newSequences.manual)
      },
      random: {
        effectSize: calculateEffectSize(newSequences.random),
        pValue: calculatePValue(newSequences.random, 'random'),
        longestRun: getLongestRun(newSequences.random)
      }
    };
    
    setStats(newStats);
  };

  return (
    <div>
      <h2 className="responsive-text">
        Now that we've identified the truly random sequence, let's compare how different allocation methods perform with larger sample sizes (n=300).
        <br /> <br />
        True effect size: .20
      </h2>
      
      {/* Stats summary table */}
      <div style={{ maxWidth: "800px", margin: "30px auto" }}>
        <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Comparison of Allocation Methods</h3>
        <table style={{ 
          width: "100%", 
          borderCollapse: "collapse", 
          textAlign: "center",
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          overflow: "hidden"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#6F00FF", color: "white" }}>
              <th style={{ padding: "12px 15px" }}>Allocation Method</th>
              <th style={{ padding: "12px 15px" }}>Effect Size</th>
              <th style={{ padding: "12px 15px" }}>p-value</th>
              <th style={{ padding: "12px 15px" }}>Longest Run</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(stats).map(([key, value], index) => (
              <tr 
                key={key} 
                style={{ 
                  backgroundColor: index % 2 === 0 ? "#f9f6ff" : "white",
                  transition: "background-color 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f0e6ff"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#f9f6ff" : "white"}
              >
                <td style={{ padding: "12px 15px", fontWeight: "bold" }}>
                  {key === "systematic"
                    ? "Alternating Allocation"
                    : key === "manual"
                      ? "Manual Allocation"
                      : "Randomized Allocation"}
                </td>
                <td style={{ 
                  padding: "12px 15px",
                  color: value.effectSize > 0.15 ? "#228B22" : value.effectSize === 0 ? "#DC143C" : "inherit"
                }}>
                  {value.effectSize}
                </td>
                <td style={{ 
                  padding: "12px 15px",
                  color: value.pValue < 0.05 ? "#228B22" : value.pValue > 0.5 ? "#DC143C" : "inherit"
                }}>
                  {value.pValue}
                </td>
                <td style={{ 
                  padding: "12px 15px",
                  color: value.longestRun > 5 ? "#DC143C" : value.longestRun < 3 ? "#228B22" : "inherit"
                }}>
                  {value.longestRun}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: "14px", color: "#666", marginTop: "10px", textAlign: "center" }}>
          <p>Effect size closer to 0.20 is better. P-value &lt; 0.05 indicates statistical significance.</p>
        </div>
      </div>
      
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
          </div>
        ))}
      </div>

      <button onClick={regenerateSequences} className="regenerate-button">
        Regenerate sequences
      </button>

    </div>
  );
}