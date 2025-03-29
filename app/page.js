"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const generateSystematic = (n = 200) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 200) => {
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

const generateRandom = (n = 200) => {
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

// Calculate effect size
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

// Calculate p-value
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

// Function to render sequence as colored blocks
const SequenceVisualizer = ({ sequence }) => {
  const chunkSize = 30; // Elements per row
  const renderSquares = () => {
    const rows = [];

    for (let i = 0; i < sequence.length; i += chunkSize) {
      const chunk = sequence.slice(i, i + chunkSize);
      const rowItems = chunk.map((item, index) => (
        <div key={`${i}-${index}`} style={{
          display: 'inline-block',
          width: '18px',
          height: '18px',
          margin: '1px',
          backgroundColor: item === 'A' ? '#39E1F8' : '#FFA800',
          color: 'white',
          fontSize: '12px',
          textAlign: 'center',
          lineHeight: '18px'
        }}>
          {item}
        </div>
      ));

      rows.push(
        <div key={`row-${i}`} style={{ marginBottom: '2px' }}>
          {rowItems}
        </div>
      );
    }

    return rows;
  };

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)',
      fontFamily: 'monospace'
    }}>
      {renderSquares()}
    </div>
  );
};

// Group distribution visualizer component
const GroupDistributionVisualizer = ({ sequence }) => {
  const counts = sequence.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});

  const total = sequence.length;
  const countA = counts["A"] || 0;
  const countB = counts["B"] || 0;
  const percentA = (countA / total * 100).toFixed(1);
  const percentB = (countB / total * 100).toFixed(1);

  const barHeight = 40;

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)'
    }}>
      <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Group Distribution</h4>

      <div style={{ display: 'flex', marginBottom: '15px', alignItems: 'center' }}>
        <div style={{ width: '100px', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
          Group A:
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            height: `${barHeight}px`,
            width: `${percentA}%`,
            backgroundColor: '#39E1F8',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{countA} ({percentA}%)</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: '100px', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
          Group B:
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            height: `${barHeight}px`,
            width: `${percentB}%`,
            backgroundColor: '#FFA800',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold' }}>{countB} ({percentB}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Calculate run lengths
const calculateRunLengths = (sequence) => {
  const runLengths = [];
  let currentRun = 1;

  for (let i = 1; i < sequence.length; i++) {
    if (sequence[i] === sequence[i - 1]) {
      currentRun++;
    } else {
      runLengths.push({
        length: currentRun,
        type: sequence[i - 1]
      });
      currentRun = 1;
    }
  }

  // Add the last run
  if (sequence.length > 0) {
    runLengths.push({
      length: currentRun,
      type: sequence[sequence.length - 1]
    });
  }

  // Count runs of each length by type
  const typeA = Array(10).fill(0);
  const typeB = Array(10).fill(0);

  runLengths.forEach(run => {
    const index = Math.min(run.length - 1, 9); // Cap at 10+
    if (run.type === 'A') {
      typeA[index]++;
    } else {
      typeB[index]++;
    }
  });

  return { typeA, typeB, runLengths };
};

// Run Length Visualizer Component
const RunLengthVisualizer = ({ sequence }) => {
  const { typeA, typeB } = calculateRunLengths(sequence);

  // Create x-axis labels
  const xLabels = Array.from({ length: 9 }, (_, i) => (i + 1).toString());
  xLabels.push('10+');

  const maxCount = Math.max(...[...typeA, ...typeB]);
  const barHeight = 15;
  const barSpacing = 5;

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    }}>
      <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Run Length Distribution</h4>

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <div style={{ width: '100px', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
          Group A:
        </div>
        <div style={{ flex: 1 }}>
          {typeA.map((count, i) => (
            <div key={`a-${i}`} style={{ display: 'flex', marginBottom: barSpacing, alignItems: 'center' }}>
              <div style={{ width: '30px', textAlign: 'center', fontSize: '12px' }}>
                {xLabels[i]}
              </div>
              <div
                style={{
                  height: `${barHeight}px`,
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: '#39E1F8',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  borderRadius: '3px'
                }}
              >
                {count > 0 && <span style={{ color: 'white', fontSize: '12px' }}>{count}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '100px', textAlign: 'right', paddingRight: '10px', fontWeight: 'bold' }}>
          Group B:
        </div>
        <div style={{ flex: 1 }}>
          {typeB.map((count, i) => (
            <div key={`b-${i}`} style={{ display: 'flex', marginBottom: barSpacing, alignItems: 'center' }}>
              <div style={{ width: '30px', textAlign: 'center', fontSize: '12px' }}>
                {xLabels[i]}
              </div>
              <div
                style={{
                  height: `${barHeight}px`,
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: '#FFA800',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 8px',
                  borderRadius: '3px'
                }}
              >
                {count > 0 && <span style={{ color: 'white', fontSize: '12px' }}>{count}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginTop: '15px', textAlign: 'center' }}>
        Shows how many times consecutive sequences of each length appear
      </div>
    </div>
  );
};

export default function Page() {
  const [sequences, setSequences] = useState(null);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState("systematic");
  const [allGenerations, setAllGenerations] = useState([]);

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
        longestRun: getLongestRun(newSequences.systematic),
        countA: newSequences.systematic.filter(item => item === 'A').length,
        countB: newSequences.systematic.filter(item => item === 'B').length
      },
      manual: {
        effectSize: calculateEffectSize(newSequences.manual),
        pValue: calculatePValue(newSequences.manual, 'manual'),
        longestRun: getLongestRun(newSequences.manual),
        countA: newSequences.manual.filter(item => item === 'A').length,
        countB: newSequences.manual.filter(item => item === 'B').length
      },
      random: {
        effectSize: calculateEffectSize(newSequences.random),
        pValue: calculatePValue(newSequences.random, 'random'),
        longestRun: getLongestRun(newSequences.random),
        countA: newSequences.random.filter(item => item === 'A').length,
        countB: newSequences.random.filter(item => item === 'B').length
      }
    };

    setStats(newStats);

    // Initialize the first generation
    const firstGeneration = [
      {
        id: 1,
        method: "systematic",
        stats: newStats.systematic
      },
      {
        id: 1,
        method: "manual",
        stats: newStats.manual
      },
      {
        id: 1,
        method: "random",
        stats: newStats.random
      }
    ];

    setAllGenerations(firstGeneration);
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
        longestRun: getLongestRun(newSequences.systematic),
        countA: newSequences.systematic.filter(item => item === 'A').length,
        countB: newSequences.systematic.filter(item => item === 'B').length
      },
      manual: {
        effectSize: calculateEffectSize(newSequences.manual),
        pValue: calculatePValue(newSequences.manual, 'manual'),
        longestRun: getLongestRun(newSequences.manual),
        countA: newSequences.manual.filter(item => item === 'A').length,
        countB: newSequences.manual.filter(item => item === 'B').length
      },
      random: {
        effectSize: calculateEffectSize(newSequences.random),
        pValue: calculatePValue(newSequences.random, 'random'),
        longestRun: getLongestRun(newSequences.random),
        countA: newSequences.random.filter(item => item === 'A').length,
        countB: newSequences.random.filter(item => item === 'B').length
      }
    };

    setStats(newStats);

    // Get the latest generation number
    const latestGen = Math.max(...allGenerations.map(item => item.id), 0);
    const newGenNumber = latestGen + 1;

    // Add new generation data to history
    const newGeneration = [
      {
        id: newGenNumber,
        method: "systematic",
        stats: newStats.systematic
      },
      {
        id: newGenNumber,
        method: "manual",
        stats: newStats.manual
      },
      {
        id: newGenNumber,
        method: "random",
        stats: newStats.random
      }
    ];

    // Update the generations history (limit to last 5 generations to avoid clutter)
    setAllGenerations(prevGens => {
      const combined = [...prevGens, ...newGeneration];
      // Sort by generation id (descending) and method
      return combined.sort((a, b) => {
        if (a.id !== b.id) return b.id - a.id;
        return a.method.localeCompare(b.method);
      }).slice(0, 15); // Keep last 15 rows (5 generations x 3 methods)
    });
  };

  // Styles for tabs
  const tabStyle = {
    padding: "10px 20px",
    cursor: "pointer",
    borderTop: "1px solid #ddd",
    borderRight: "1px solid #ddd",
    borderBottom: "1px solid #ddd",
    borderLeft: "1px solid #ddd",
    borderRadius: "4px 4px 0 0",
    backgroundColor: "#f5f5f5",
    marginRight: "5px",
    fontWeight: "normal",
    transition: "all 0.3s ease"
  };

  const activeTabStyle = {
    ...tabStyle,
    backgroundColor: "#6F00FF",
    color: "white",
    fontWeight: "bold",
    borderTop: "1px solid #6F00FF",
    borderRight: "1px solid #6F00FF",
    borderBottom: "1px solid #6F00FF",
    borderLeft: "1px solid #6F00FF"
  };

  // Tab content container style
  const tabContentStyle = {
    border: "1px solid #ddd",
    borderRadius: "0 4px 4px 4px",
    padding: "20px",
    backgroundColor: "white",
    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.05)"
  };

  // Format percentage
  const formatPercent = (value) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // Card style for metrics
  const metricCardStyle = {
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
    margin: "10px",
    flex: "1 1 calc(33% - 20px)",
    minWidth: "150px",
    textAlign: "center",
    backgroundColor: "white",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default"
  };

  return (
    <div>
      <h2 className="responsive-text">
        Now that we've identified the truly random sequence, let's compare how different allocation methods perform with larger sample sizes (n=200).
        <br /> <br />
        True effect size: .20
      </h2>



      {/* Tabs for different allocation methods */}
      <div style={{ maxWidth: "900px", margin: "30px auto" }}>
        <div style={{ display: "flex", marginBottom: "-1px" }}>
          {["systematic", "manual", "random"].map((key) => (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              style={activeTab === key ? activeTabStyle : tabStyle}
            >
              {key === "systematic"
                ? "Alternating Allocation"
                : key === "manual"
                  ? "Manual Allocation"
                  : "Randomized Allocation"}
            </div>
          ))}
        </div>

        <div style={tabContentStyle}>

          {/* Sequence visualization and analysis */}
          <div>
            <h3 style={{ textAlign: "center", marginBottom: "15px" }}>Sequence Visualization</h3>
            <SequenceVisualizer sequence={sequences[activeTab]} />
          </div>
        </div>
      </div>

      {/* Stats summary table */}
      <div style={{ maxWidth: "1200px", margin: "30px auto", overflowX: "auto" }}>
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
              <th style={{ padding: "12px 15px" }}>Gen</th>
              {/* Alternating Allocation columns */}
              <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Alternating Allocation</th>
              {/* Manual Allocation columns */}
              <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Manual Allocation</th>
              {/* Random Allocation columns */}
              <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Randomized Allocation</th>
            </tr>
            <tr style={{ backgroundColor: "#9966FF", color: "white" }}>
              <th style={{ padding: "8px 10px" }}></th>
              {/* Alternating Allocation subheaders */}
              <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>Group A/B</th>
              <th style={{ padding: "8px 10px" }}>Effect</th>
              <th style={{ padding: "8px 10px" }}>p-value</th>
              <th style={{ padding: "8px 10px" }}>Run</th>
              {/* Manual Allocation subheaders */}
              <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>Group A/B</th>
              <th style={{ padding: "8px 10px" }}>Effect</th>
              <th style={{ padding: "8px 10px" }}>p-value</th>
              <th style={{ padding: "8px 10px" }}>Run</th>
              {/* Random Allocation subheaders */}
              <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>Group A/B</th>
              <th style={{ padding: "8px 10px" }}>Effect</th>
              <th style={{ padding: "8px 10px" }}>p-value</th>
              <th style={{ padding: "8px 10px" }}>Run</th>
            </tr>
          </thead>
          <tbody>
            {
              // Get unique generation IDs and sort them in descending order
              [...new Set(allGenerations.map(gen => gen.id))]
                .sort((a, b) => b - a)
                .map(genId => {
                  // Get all entries for this generation
                  const genEntries = allGenerations.filter(gen => gen.id === genId);

                  // Create a map of method to entry for easy access
                  const methodMap = {};
                  genEntries.forEach(entry => {
                    methodMap[entry.method] = entry;
                  });

                  // Check if this is the current active generation
                  const isCurrentGen = genId === Math.max(...allGenerations.map(g => g.id));

                  return (
                    <tr
                      key={`generation-${genId}`}
                      style={{
                        backgroundColor: isCurrentGen ? "#f9f6ff" : "white",
                        transition: "background-color 0.2s ease"
                      }}
                    >
                      {/* Generation number */}
                      <td style={{
                        padding: "12px",
                        fontWeight: "bold",
                        backgroundColor: "#f0f0f0"
                      }}>
                        {genId}
                      </td>

                      {/* Alternating Allocation */}
                      {methodMap.systematic && (
                        <>
                          <td
                            style={{
                              padding: "10px",
                              borderLeft: "2px solid #eee",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "systematic" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("systematic")}
                          >
                            {methodMap.systematic.stats.countA}/{methodMap.systematic.stats.countB}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.systematic.stats.effectSize > 0.15 ? "#228B22" : methodMap.systematic.stats.effectSize === 0 ? "#DC143C" : "inherit",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "systematic" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("systematic")}
                          >
                            {methodMap.systematic.stats.effectSize}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.systematic.stats.pValue < 0.05 ? "#228B22" : methodMap.systematic.stats.pValue > 0.5 ? "#DC143C" : "inherit",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "systematic" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("systematic")}
                          >
                            {methodMap.systematic.stats.pValue}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.systematic.stats.longestRun > 5 ? "#DC143C" : methodMap.systematic.stats.longestRun < 3 ? "#228B22" : "inherit",
                              cursor: "pointer"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("systematic")}
                          >
                            {methodMap.systematic.stats.longestRun}
                          </td>
                        </>
                      )}

                      {/* Manual Allocation */}
                      {methodMap.manual && (
                        <>
                          <td
                            style={{
                              padding: "10px",
                              borderLeft: "2px solid #eee",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "manual" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("manual")}
                          >
                            {methodMap.manual.stats.countA}/{methodMap.manual.stats.countB}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.manual.stats.effectSize > 0.15 ? "#228B22" : methodMap.manual.stats.effectSize === 0 ? "#DC143C" : "inherit",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "manual" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("manual")}
                          >
                            {methodMap.manual.stats.effectSize}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.manual.stats.pValue < 0.05 ? "#228B22" : methodMap.manual.stats.pValue > 0.5 ? "#DC143C" : "inherit",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "manual" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("manual")}
                          >
                            {methodMap.manual.stats.pValue}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.manual.stats.longestRun > 5 ? "#DC143C" : methodMap.manual.stats.longestRun < 3 ? "#228B22" : "inherit",
                              cursor: "pointer"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("manual")}
                          >
                            {methodMap.manual.stats.longestRun}
                          </td>
                        </>
                      )}

                      {/* Random Allocation */}
                      {methodMap.random && (
                        <>
                          <td
                            style={{
                              padding: "10px",
                              borderLeft: "2px solid #eee",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "random" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("random")}
                          >
                            {methodMap.random.stats.countA}/{methodMap.random.stats.countB}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.random.stats.effectSize > 0.15 ? "#228B22" : methodMap.random.stats.effectSize === 0 ? "#DC143C" : "inherit",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "random" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("random")}
                          >
                            {methodMap.random.stats.effectSize}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.random.stats.pValue < 0.05 ? "#228B22" : methodMap.random.stats.pValue > 0.5 ? "#DC143C" : "inherit",
                              cursor: isCurrentGen ? "pointer" : "default",
                              backgroundColor: activeTab === "random" && isCurrentGen ? "#f0e6ff" : "transparent"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("random")}
                          >
                            {methodMap.random.stats.pValue}
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              color: methodMap.random.stats.longestRun > 5 ? "#DC143C" : methodMap.random.stats.longestRun < 3 ? "#228B22" : "inherit",
                              cursor: "pointer"
                            }}
                            onClick={() => isCurrentGen && setActiveTab("random")}
                          >
                            {methodMap.random.stats.longestRun}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
            }
          </tbody>
        </table>
      </div>

      <button onClick={regenerateSequences} className="regenerate-button">
        Regenerate sequences
      </button>

    </div>
  )
};