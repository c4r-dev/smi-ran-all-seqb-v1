"use client";
import React, { useState, useEffect } from "react";
import CustomButton from "./components/CustomButton";


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
const calculateEffectSize = (set) => {
  const trueEffectSize = 0.2;
  if (set === "s1") {
    return (trueEffectSize + Math.random() * 0.5 + 0.3).toFixed(2); // Very inflated
  } else if (set === "s2") {
    return (trueEffectSize + Math.random() * 0.2 + 0.1).toFixed(2); // Moderately inflated
  } else {
    return (trueEffectSize + (Math.random() * 0.2 - 0.1)).toFixed(2); // Closer to true effect
  }
};

// Calculate p-value
const calculatePValue = (set) => {
  if (set === "s1") {
    return (Math.random() * 0.03).toFixed(3); // Always "significant"
  } else if (set === "s2") {
    return (Math.random() * 0.08).toFixed(3); // Often "significant"
  } else {
    return (Math.random() * 0.25 + 0.05).toFixed(3); // More variable
  }
};

// Bar Chart Sequence Visualizer
const BarChartVisualizer = ({ sequence, title, stats }) => {
  // Calculate counts for A and B
  const countA = sequence.filter(item => item === 'A').length;
  const countB = sequence.filter(item => item === 'B').length;

  // Calculate percentages
  const total = sequence.length;
  const percentA = (countA / total * 100).toFixed(1);
  const percentB = (countB / total * 100).toFixed(1);

  // Bar styling
  const barWidth = 60; // Reduced from 80 (25% reduction)
  const maxBarHeight = 200; // Reduced from 360 for shorter bars
  const barHeightA = Math.max((percentA / 100) * maxBarHeight, 30); // Min height 30px
  const barHeightB = Math.max((percentB / 100) * maxBarHeight, 30); // Min height 30px

  // Create a visual representation of the first 49 items
  const sequencePreview = sequence.slice(0, 49);

  return (
    <div style={{
      backgroundColor: '#f9f9f9',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h4>

      {/* Sequence preview - first 49 items */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: '5px', /* Reduced from 15px to 5px */
        padding: '8px',
        backgroundColor: 'white',
        borderRadius: '4px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {sequencePreview.map((item, index) => (
          <div key={index} style={{
            width: '32px',
            height: '32px',
            margin: '2px',
            backgroundColor: item === 'A' ? '#39E1F8' : '#FFA800',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            textShadow: '1px 1px 1px rgba(0,0,0,0.3)'
          }} title={`Item ${index + 1}: ${item}`}>
            {item}
          </div>
        ))}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexGrow: 1,
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '10px',
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '40px'
      }}>
        {/* Bar Chart - Now takes full width */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            height: `${Math.max(barHeightA, barHeightB) + 10}px`, // Dynamic height based on tallest bar
            justifyContent: 'center',
            width: '100%',
            marginTop: '5px' /* Add small margin at top */
          }}>
            {/* Group A Bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginRight: '30px', // Reduced from 40px
            }}>
              <div style={{
                width: `${barWidth + 15}px`, // Reduced from barWidth + 20
                height: `${barHeightA}px`,
                backgroundColor: '#39E1F8',
                borderRadius: '6px 6px 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'height 0.5s ease'
              }}>
                <span style={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '14px'
                }}>{countA}</span>
              </div>
            </div>
            {/* Group B Bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                width: `${barWidth + 20}px`,
                height: `${barHeightB}px`,
                backgroundColor: '#FFA800',
                borderRadius: '6px 6px 0 0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'height 0.5s ease'
              }}>
                <span style={{
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                  fontSize: '14px'
                }}>{countB}</span>
              </div>
            </div>
          </div>
          {/* X-axis labels */}
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            marginTop: '5px'
          }}>
            <div style={{
              fontWeight: 'bold',
              fontSize: '16px',
              width: `${barWidth + 20}px`,
              textAlign: 'center',
              marginRight: '40px'
            }}>A</div>
            <div style={{
              fontWeight: 'bold',
              fontSize: '16px',
              width: `${barWidth + 20}px`,
              textAlign: 'center'
            }}>B</div>
          </div>
          {/* Percentages */}
          <div style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            marginTop: '5px'
          }}>
            <div style={{
              fontSize: '14px',
              width: `${barWidth + 20}px`,
              textAlign: 'center',
              marginRight: '40px'
            }}>{percentA}%</div>
            <div style={{
              fontSize: '14px',
              width: `${barWidth + 20}px`,
              textAlign: 'center'
            }}>{percentB}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Page() {
  const [sequences, setSequences] = useState(null);
  const [stats, setStats] = useState(null);
  const [allGenerations, setAllGenerations] = useState([]);
  // Add state for controlling table height
  const [tableHeight, setTableHeight] = useState(350);
  // Add state to track if there's more content to scroll
  const [hasMoreContent, setHasMoreContent] = useState(false);

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
        effectSize: calculateEffectSize('s1'),
        pValue: calculatePValue('s1'),
        longestRun: getLongestRun(newSequences.systematic),
        countA: newSequences.systematic.filter(item => item === 'A').length,
        countB: newSequences.systematic.filter(item => item === 'B').length
      },
      manual: {
        effectSize: calculateEffectSize('s2'),
        pValue: calculatePValue('s2'),
        longestRun: getLongestRun(newSequences.manual),
        countA: newSequences.manual.filter(item => item === 'A').length,
        countB: newSequences.manual.filter(item => item === 'B').length
      },
      random: {
        effectSize: calculateEffectSize('s3'),
        pValue: calculatePValue('s3'),
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

  // Effect to check if there's more content to scroll
  useEffect(() => {
    const checkScrollable = () => {
      const tableWrapper = document.getElementById('table-scroll-wrapper');
      if (tableWrapper) {
        setHasMoreContent(tableWrapper.scrollHeight > tableWrapper.clientHeight);
      }
    };
    
    // Check after initial render and whenever generations change
    setTimeout(checkScrollable, 100);
    
    // Add window resize listener
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [allGenerations]);

  // Function to expand/collapse table
  const toggleTableHeight = () => {
    setTableHeight(tableHeight === 350 ? 600 : 350);
  };

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
        effectSize: calculateEffectSize('s1'),
        pValue: calculatePValue('s1'),
        longestRun: getLongestRun(newSequences.systematic),
        countA: newSequences.systematic.filter(item => item === 'A').length,
        countB: newSequences.systematic.filter(item => item === 'B').length
      },
      manual: {
        effectSize: calculateEffectSize('s2'),
        pValue: calculatePValue('s2'),
        longestRun: getLongestRun(newSequences.manual),
        countA: newSequences.manual.filter(item => item === 'A').length,
        countB: newSequences.manual.filter(item => item === 'B').length
      },
      random: {
        effectSize: calculateEffectSize('s3'),
        pValue: calculatePValue('s3'),
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
      }).slice(0, 30); // Increased from 15 to 30 (10 generations x 3 methods)
    });
  };

  return (
    <div>
      <h2 className="responsive-text">
        Now that we've identified the truly random sequence, let's compare how different allocation methods perform with larger sample sizes (n=200).
        <br /> <br />
        True effect size: .20
      </h2>

      {/* All three bar charts displayed horizontally */}
      <div style={{
        maxWidth: "1200px",
        margin: "30px auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px"
      }}>
        {/* Box for Alternating Allocation */}
        <div style={{
          width: "320px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}>
          <BarChartVisualizer
            sequence={sequences.systematic}
            title="Alternating Allocation"
            stats={stats.systematic}
          />
        </div>

        {/* Box for Manual Allocation */}
        <div style={{
          width: "320px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}>
          <BarChartVisualizer
            sequence={sequences.manual}
            title="Manual Allocation"
            stats={stats.manual}
          />
        </div>

        {/* Box for Randomized Allocation */}
        <div style={{
          width: "320px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.05)",
          overflow: "hidden"
        }}>
          <BarChartVisualizer
            sequence={sequences.random}
            title="Randomized Allocation"
            stats={stats.random}
          />
        </div>
      </div>

      {/* Regenerate button placed between charts and table */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        margin: "30px auto 20px auto",
        maxWidth: "1200px"
      }}>
        <CustomButton
          variant="primary"
          onClick={regenerateSequences}
        >
          Generate<br />New sequences
        </CustomButton> 
      </div>

      {/* Stats summary table - MODIFIED for better scrolling */}
      <div style={{
        maxWidth: "1200px",
        margin: "30px auto",
        boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        backgroundColor: "white"
      }}>
        <h3 style={{
          textAlign: "center",
          marginBottom: "15px",
          padding: "15px 15px 0 15px"
        }}>Comparison of Allocation Methods</h3>

        {/* Dedicated scrollable wrapper for the table with ID for reference */}
        <div 
          id="table-scroll-wrapper"
          style={{
            overflowY: "auto",
            maxHeight: `${tableHeight}px`, // Dynamic height based on state
            width: "100%",
            padding: "0 0 15px 0",
            position: "relative", // For absolute positioning of indicators
            transition: "max-height 0.3s ease" // Smooth transition for height changes
          }}
        >
          <table style={{
            minWidth: "900px",
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center"
          }}>
            <thead style={{
              position: "sticky",
              top: "0",
              zIndex: "2", // Increased z-index for header
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)" // Shadow for sticky header
            }}>
              <tr style={{ backgroundColor: "#00C802", color: "black" }}>
                <th style={{ padding: "12px 15px" }}>Gen</th>
                <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Alternating Allocation</th>
                <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Manual Allocation</th>
                <th colSpan="4" style={{ padding: "12px 15px", borderLeft: "2px solid white" }}>Randomized Allocation</th>
              </tr>
              <tr style={{ backgroundColor: "rgba(0, 200, 2, 0.6)", color: "black" }}>
                <th style={{ padding: "8px 10px" }}></th>
                <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>Group A/B</th>
                <th style={{ padding: "8px 10px" }}>Effect</th>
                <th style={{ padding: "8px 10px" }}>p-value</th>
                <th style={{ padding: "8px 10px" }}>Run</th>
                <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>Group A/B</th>
                <th style={{ padding: "8px 10px" }}>Effect</th>
                <th style={{ padding: "8px 10px" }}>p-value</th>
                <th style={{ padding: "8px 10px" }}>Run</th>
                <th style={{ padding: "8px 10px", borderLeft: "2px solid white" }}>Group A/B</th>
                <th style={{ padding: "8px 10px" }}>Effect</th>
                <th style={{ padding: "8px 10px" }}>p-value</th>
                <th style={{ padding: "8px 10px" }}>Run</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set(allGenerations.map(gen => gen.id))]
                .sort((a, b) => b - a)
                .map(genId => {
                  const genEntries = allGenerations.filter(gen => gen.id === genId);
                  const methodMap = {};
                  genEntries.forEach(entry => {
                    methodMap[entry.method] = entry;
                  });
                  const isCurrentGen = genId === Math.max(...allGenerations.map(g => g.id));
                  return (
                    <tr
                      key={`generation-${genId}`}
                      style={{
                        backgroundColor: isCurrentGen ? "#f9f6ff" : "white",
                        transition: "background-color 0.2s ease"
                      }}>
                      <td style={{
                        padding: "12px",
                        fontWeight: "bold",
                        backgroundColor: "#f0f0f0",
                        position: "sticky", // Sticky first column
                        left: 0,
                        zIndex: "1"
                      }}>{genId}</td>
                      {methodMap.systematic && (
                        <>
                          <td style={{
                            padding: "10px",
                            borderLeft: "2px solid #eee"
                          }}>{methodMap.systematic.stats.countA}/{methodMap.systematic.stats.countB}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.systematic.stats.effectSize > 0.15 ? "#228B22" : methodMap.systematic.stats.effectSize === 0 ? "#DC143C" : "inherit"
                          }}>{methodMap.systematic.stats.effectSize}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.systematic.stats.pValue < 0.05 ? "#228B22" : methodMap.systematic.stats.pValue > 0.5 ? "#DC143C" : "inherit"
                          }}>{methodMap.systematic.stats.pValue}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.systematic.stats.longestRun > 5 ? "#DC143C" : methodMap.systematic.stats.longestRun < 3 ? "#228B22" : "inherit"
                          }}>{methodMap.systematic.stats.longestRun}</td>
                        </>
                      )}
                      {methodMap.manual && (
                        <>
                          <td style={{
                            padding: "10px",
                            borderLeft: "2px solid #eee"
                          }}>{methodMap.manual.stats.countA}/{methodMap.manual.stats.countB}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.manual.stats.effectSize > 0.15 ? "#228B22" : methodMap.manual.stats.effectSize === 0 ? "#DC143C" : "inherit"
                          }}>{methodMap.manual.stats.effectSize}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.manual.stats.pValue < 0.05 ? "#228B22" : methodMap.manual.stats.pValue > 0.5 ? "#DC143C" : "inherit"
                          }}>{methodMap.manual.stats.pValue}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.manual.stats.longestRun > 5 ? "#DC143C" : methodMap.manual.stats.longestRun < 3 ? "#228B22" : "inherit"
                          }}>{methodMap.manual.stats.longestRun}</td>
                        </>
                      )}
                      {methodMap.random && (
                        <>
                          <td style={{
                            padding: "10px",
                            borderLeft: "2px solid #eee"
                          }}>{methodMap.random.stats.countA}/{methodMap.random.stats.countB}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.random.stats.effectSize > 0.15 ? "#228B22" : methodMap.random.stats.effectSize === 0 ? "#DC143C" : "inherit"
                          }}>{methodMap.random.stats.effectSize}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.random.stats.pValue < 0.05 ? "#228B22" : methodMap.random.stats.pValue > 0.5 ? "#DC143C" : "inherit"
                          }}>{methodMap.random.stats.pValue}</td>
                          <td style={{
                            padding: "10px",
                            color: methodMap.random.stats.longestRun > 5 ? "#DC143C" : methodMap.random.stats.longestRun < 3 ? "#228B22" : "inherit"
                          }}>{methodMap.random.stats.longestRun}</td>
                        </>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
          
          {/* Scroll indicator - only shown when there's more content */}
          {hasMoreContent && tableHeight === 350 && (
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "30px",
              background: "linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.8))",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              padding: "5px",
              cursor: "pointer"
            }} onClick={toggleTableHeight}>
              <div style={{ fontSize: "22px", color: "#555" }}>⌄</div>
            </div>
          )}
        </div>
        
        {/* Button to expand/collapse table */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          padding: "10px",
          borderTop: "1px solid #eee",
          backgroundColor: "#f9f9f9",
          cursor: "pointer"
        }} onClick={toggleTableHeight}>
          <div style={{
            display: "flex",
            alignItems: "center",
            color: "#555",
            fontWeight: "medium",
            fontSize: "14px"
          }}>
            {tableHeight === 350 ? (
              <>
                <span>Show more results</span>
                <span style={{ marginLeft: "5px", fontSize: "16px" }}>⌄</span>
              </>
            ) : (
              <>
                <span>Show fewer results</span>
                <span style={{ marginLeft: "5px", fontSize: "16px" }}>⌃</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}