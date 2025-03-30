import React, { useState, useEffect } from 'react';
import './App.css';

const MultiplierCircuit = () => {
  // Configuration state
  const [bitMode, setBitMode] = useState('2-bit');
  const maxInput = bitMode === '2-bit' ? 3 : 15;
  const productBits = bitMode === '2-bit' ? 4 : 8;

  // Input states
  const [a, setA] = useState(bitMode === '2-bit' ? 1 : 5);
  const [b, setB] = useState(bitMode === '2-bit' ? 2 : 3);
  const [product, setProduct] = useState(a * b);
  const [steps, setSteps] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeBit, setActiveBit] = useState(null);

  const [showCpuExplanation, setShowCpuExplanation] = useState(false);
  const [showPipoExplanation, setShowPipoExplanation] = useState(false);
  const [showCombinedExplanation, setShowCombinedExplanation] = useState(false);


  // Register states
  const [multiplicandReg, setMultiplicandReg] = useState([]);
  const [multiplierReg, setMultiplierReg] = useState([]);
  const [productReg, setProductReg] = useState([]);
  const [accumulator, setAccumulator] = useState([]);

  // Convert decimal to binary array
  const toBinaryArray = (num, bits) => {
    return Array.from({ length: bits }, (_, i) => (num >> (bits - 1 - i)) & 1);
  };

  // Convert binary array to decimal
  const binaryToDecimal = (bits) => {
    return bits.reduce((acc, bit, i) => acc + (bit << (bits.length - 1 - i)), 0);
  };

  // Initialize registers
  const initializeRegisters = () => {
    const multiplicandBits = bitMode === '2-bit' ? 2 : 4;
    const multiplierBits = bitMode === '2-bit' ? 2 : 4;
    
    setMultiplicandReg(toBinaryArray(a, multiplicandBits));
    setMultiplierReg(toBinaryArray(b, multiplierBits));
    setProductReg([...Array(productBits - multiplierBits).fill(0), ...toBinaryArray(b, multiplierBits)]);
    setAccumulator(Array(multiplicandBits).fill(0));
    setProduct(a * b);
  };

  // Perform multiplication
  const multiply = () => {
    const newSteps = [];
    const multiplicandBits = bitMode === '2-bit' ? 2 : 4;
    const multiplierBits = bitMode === '2-bit' ? 2 : 4;
    
    let acc = Array(multiplicandBits).fill(0);
    let prod = [...Array(productBits - multiplierBits).fill(0), ...toBinaryArray(b, multiplierBits)];
    const multiplicand = toBinaryArray(a, multiplicandBits);

    // Initialization step
    newSteps.push({
      description: "Initialize registers",
      multiplicand: [...multiplicand],
      multiplier: [...toBinaryArray(b, multiplierBits)],
      product: [...prod],
      accumulator: [...acc],
      highlight: "initialization",
      activeBit: null
    });

    // Multiplication steps
    for (let i = 0; i < multiplierBits; i++) {
      const currentBitPos = productBits - 1 - i;
      
      if (prod[currentBitPos]) {
        // Add with carry handling
        let carry = 0;
        for (let j = multiplicandBits - 1; j >= 0; j--) {
          const sum = acc[j] + multiplicand[multiplicandBits - 1 - j] + carry;
          acc[j] = sum % 2;
          carry = Math.floor(sum / 2);
        }
        
        newSteps.push({
          description: `Bit ${i+1} is 1: Add multiplicand`,
          multiplicand: [...multiplicand],
          multiplier: [...toBinaryArray(b, multiplierBits)],
          product: [...prod],
          accumulator: [...acc],
          highlight: "add",
          activeBit: currentBitPos
        });
      }

      // Shift right
      const newProd = [acc[acc.length - 1], ...prod.slice(0, -1)];
      acc = [0, ...acc.slice(0, -1)];
      
      newSteps.push({
        description: `Shift right (step ${i+1})`,
        multiplicand: [...multiplicand],
        multiplier: [...toBinaryArray(b, multiplierBits)],
        product: [...newProd],
        accumulator: [...acc],
        highlight: "shift",
        activeBit: null
      });
      
      prod = newProd;
    }

    // Final step
    newSteps.push({
      description: "Multiplication complete!",
      multiplicand: [...multiplicand],
      multiplier: [...toBinaryArray(b, multiplierBits)],
      product: [...prod],
      accumulator: Array(multiplicandBits).fill(0),
      highlight: "complete",
      activeBit: null
    });

    setSteps(newSteps);
    setProduct(binaryToDecimal(prod));
    setProductReg(prod);
    setMultiplicandReg(multiplicand);
    setMultiplierReg(toBinaryArray(b, multiplierBits));
    setAccumulator(Array(multiplicandBits).fill(0));
    setCurrentStep(0);
  };

  // Event handlers
  const handleInputChange = (e, inputType) => {
    const value = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(maxInput, Math.max(0, value));
    
    if (inputType === 'a') {
      setA(clampedValue);
    } else {
      setB(clampedValue);
    }
    
    reset();
  };

  const handleBitModeChange = (mode) => {
    setBitMode(mode);
    setA(mode === '2-bit' ? 1 : 5);
    setB(mode === '2-bit' ? 2 : 3);
    reset();
  };

  const startAnimation = () => {
    if (steps.length === 0) multiply();
    setIsAnimating(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      updateRegisters(steps[currentStep + 1]);
    } else {
      setIsAnimating(false);
    }
  };

  const updateRegisters = (step) => {
    setMultiplicandReg(step.multiplicand);
    setMultiplierReg(step.multiplier);
    setProductReg(step.product);
    setAccumulator(step.accumulator);
    setActiveBit(step.activeBit);
  };

  const reset = () => {
    setIsAnimating(false);
    setSteps([]);
    setCurrentStep(0);
    setProduct(a * b);
    initializeRegisters();
    setActiveBit(null);
  };

  // Initialize
  useEffect(() => {
    initializeRegisters();
  }, [bitMode, a, b]);

  return (
    <div className="multiplier-app">
      <header className="app-header">
        <h1> Binary Multiplier Circuit</h1>
        <p className="subtitle">Visualizing CPU Multiplication with PIPO Shift Registers</p>
      </header>

      <div className="app-container">
        <div className="control-panel">
          <div className="mode-selector">
            <h2>Multiplication Mode</h2>
            <div className="mode-buttons">
              <button
                className={`mode-btn ${bitMode === '2-bit' ? 'active' : ''}`}
                onClick={() => handleBitModeChange('2-bit')}
              >
                2-bit (0-3 × 0-3)
              </button>
              <button
                className={`mode-btn ${bitMode === '4-bit' ? 'active' : ''}`}
                onClick={() => handleBitModeChange('4-bit')}
              >
                4-bit (0-15 × 0-15)
              </button>
            </div>
          </div>

          <div className="input-card">
            <h2>Input Values</h2>
            <div className="input-group">
              <label>
                <span className="input-label">Multiplicand (A): {a}</span>
                <div className="slider-container">
                  <input 
                    type="range"
                    min="0"
                    max={maxInput}
                    value={a}
                    onChange={(e) => handleInputChange(e, 'a')}
                    disabled={isAnimating}
                    className="slider-input"
                  />
                  <div className="slider-labels">
                    <span>0</span>
                    <span>{maxInput}</span>
                  </div>
                </div>
                <div className="binary-value">
                  Binary: {toBinaryArray(a, bitMode === '2-bit' ? 2 : 4).join('')}₂
                </div>
              </label>
            </div>
            
            <div className="input-group">
              <label>
                <span className="input-label">Multiplier (B): {b}</span>
                <div className="slider-container">
                  <input 
                    type="range"
                    min="0"
                    max={maxInput}
                    value={b}
                    onChange={(e) => handleInputChange(e, 'b')}
                    disabled={isAnimating}
                    className="slider-input"
                  />
                  <div className="slider-labels">
                    <span>0</span>
                    <span>{maxInput}</span>
                  </div>
                </div>
                <div className="binary-value">
                  Binary: {toBinaryArray(b, bitMode === '2-bit' ? 2 : 4).join('')}₂
                </div>
              </label>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={multiply} disabled={isAnimating}>
              <i className="icon-calculate"></i> Calculate
            </button>
            <button className="btn btn-animate" onClick={startAnimation} disabled={isAnimating || steps.length > 0}>
              <i className="icon-play"></i> Animate
            </button>
            <button className="btn btn-reset" onClick={reset}>
              <i className="icon-reset"></i> Reset
            </button>
          </div>

          <div className="result-card">
            <h2>Result</h2>
            <div className="result-display">
              <div>{a} × {b} = <span className="product-value">{product}</span></div>
              <div className="binary-result">Binary: {productReg.join('')}₂</div>
            </div>
          </div>
        </div>

        <div className={`circuit-visualization ${steps[currentStep]?.highlight || ''}`}>
          <div className="register-container">
            <div className="register multiplicand-reg">
              <h3>Multiplicand</h3>
              <div className="bits">
                {multiplicandReg.map((bit, i) => (
                  <div key={`mc-${i}`} className={`bit ${bit ? 'bit-high' : 'bit-low'}`}>
                    {bit}
                  </div>
                ))}
              </div>
              <div className="register-label">A</div>
            </div>

            <div className="register-separator"></div>

            <div className="register multiplier-reg">
              <h3>Multiplier</h3>
              <div className="bits">
                {multiplierReg.map((bit, i) => (
                  <div 
                    key={`mr-${i}`} 
                    className={`bit ${bit ? 'bit-high' : 'bit-low'} ${activeBit === (i + (productBits - multiplierReg.length)) ? 'active-bit' : ''}`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
              <div className="register-label">B</div>
            </div>

            <div className="register-separator"></div>

            <div className="register accumulator-reg">
              <h3>Accumulator</h3>
              <div className="bits">
                {accumulator.map((bit, i) => (
                  <div key={`acc-${i}`} className={`bit ${bit ? 'bit-high' : 'bit-low'}`}>
                    {bit}
                  </div>
                ))}
              </div>
              <div className="register-label">ACC</div>
            </div>

            <div className="register-separator"></div>

            <div className="register product-reg">
              <h3>Product</h3>
              <div className="bits">
                {productReg.map((bit, i) => (
                  <div key={`prod-${i}`} className={`bit ${bit ? 'bit-high' : 'bit-low'}`}>
                    {bit}
                  </div>
                ))}
              </div>
              <div className="register-label">P</div>
            </div>
          </div>

          {isAnimating && (
            <div className="animation-controls">
              <button className="btn btn-step" onClick={nextStep}>
                <i className="icon-next"></i> Next Step
              </button>
            </div>
          )}
        </div>

        {steps.length > 0 && (
          <div className="steps-panel">
            <h2>Multiplication Steps</h2>
            <div className="steps-container">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className={`step-card ${index === currentStep ? 'active-step' : ''}`}
                  onClick={() => {
                    setCurrentStep(index);
                    updateRegisters(step);
                  }}
                >
                  <div className="step-number">Step {index + 1}</div>
                  <div className="step-description">{step.description}</div>
                  <div className="step-state">
                    <div>Product: {step.product.join('')}</div>
                    <div>Accumulator: {step.accumulator.join('')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        )}
        {/* Educational Sections */}
      <div className="explanation-sections">
        <div className="explanation-card">
          <div className="explanation-header" onClick={() => setShowCpuExplanation(!showCpuExplanation)}>
            <h2>CPU Multiplication Explained</h2>
            <span className="toggle-icon">{showCpuExplanation ? '−' : '+'}</span>
          </div>
          {showCpuExplanation && (
            <div className="explanation-content">
              <div className="example-box">
                <h4>Shift-and-Add Algorithm</h4>
                <ol>
                  <li>Initialize:
                    <ul>
                      <li>Multiplicand in Register A</li>
                      <li>Multiplier in Register B</li>
                      <li>Product register with multiplier in LSBs</li>
                    </ul>
                  </li>
                  <li>For each bit (starting from LSB):
                    <ul>
                      <li>If bit is 1, add multiplicand to accumulator</li>
                      <li>Shift product register right (arithmetic shift)</li>
                    </ul>
                  </li>
                  <li>After n bits, product register contains result</li>
                </ol>
              </div>
              
              <div className="example-box highlighted">
                <h4>Example: 2 (10) × 3 (11)</h4>
                <div className="example-steps">
                  <div className="example-step">
                    <div className="step-title">Initialization</div>
                    <div className="register-states">
                      <span>A: 10</span>
                      <span>B: 11</span>
                      <span>P: 0011</span>
                      <span>ACC: 00</span>
                    </div>
                  </div>
                  <div className="example-step">
                    <div className="step-title">Step 1 (LSB=1)</div>
                    <div className="register-states">
                      <span>Add A to ACC → 10</span>
                      <span>Shift right → 1001</span>
                    </div>
                  </div>
                  <div className="example-step">
                    <div className="step-title">Step 2 (Next bit=1)</div>
                    <div className="register-states">
                      <span>Add A to ACC → 100</span>
                      <span>Shift right → 0110</span>
                    </div>
                  </div>
                  <div className="example-step result">
                    <div className="step-title">Result</div>
                    <div className="register-states">
                      <span>0110 (6)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="explanation-card">
          <div className="explanation-header" onClick={() => setShowPipoExplanation(!showPipoExplanation)}>
            <h2>PIPO Shift Register Explained</h2>
            <span className="toggle-icon">{showPipoExplanation ? '−' : '+'}</span>
          </div>
          {showPipoExplanation && (
            <div className="explanation-content">
              <div className="diagram-box">
                <h4>4-bit PIPO Shift Register</h4>
                <div className="pipo-diagram">
                  <div className="pipo-inputs">
                    {[3,2,1,0].map(i => <span key={`in-${i}`}>D{i}</span>)}
                  </div>
                  <div className="pipo-register">
                    {[3,2,1,0].map(i => (
                      <div key={`ff-${i}`} className="flip-flop">
                        <div className="ff-label">FF{i}</div>
                        <div className="ff-content">Q{i}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pipo-outputs">
                    {[3,2,1,0].map(i => <span key={`out-${i}`}>Q{i}</span>)}
                  </div>
                </div>
                <div className="pipo-legend">
                  <div><span className="legend-input"></span> Parallel Input</div>
                  <div><span className="legend-output"></span> Parallel Output</div>
                  <div><span className="legend-clock"></span> Clock</div>
                </div>
              </div>
              
              <div className="feature-box">
                <h4>Key Features</h4>
                <ul>
                  <li><strong>Parallel Load:</strong> All bits loaded simultaneously</li>
                  <li><strong>Parallel Output:</strong> All bits available at once</li>
                  <li><strong>Shift Capability:</strong> Can shift data left or right</li>
                  <li><strong>Applications:</strong> Used in arithmetic operations, serial-to-parallel conversion</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="explanation-card">
          <div className="explanation-header" onClick={() => setShowCombinedExplanation(!showCombinedExplanation)}>
            <h2>How They Work Together</h2>
            <span className="toggle-icon">{showCombinedExplanation ? '−' : '+'}</span>
          </div>
          {showCombinedExplanation && (
            <div className="explanation-content">
              <div className="system-diagram">
                <h4>Multiplier System Architecture</h4>
                <div className="system-components">
                  <div className="component register-component">
                    <div className="comp-label">Multiplicand Reg</div>
                    <div className="comp-bits">A1 A0</div>
                  </div>
                  <div className="component register-component">
                    <div className="comp-label">Multiplier Reg</div>
                    <div className="comp-bits">B1 B0</div>
                  </div>
                  <div className="component alu-component">
                    <div className="comp-label">ALU</div>
                    <div className="comp-detail">Adder</div>
                  </div>
                  <div className="component register-component wide">
                    <div className="comp-label">Product Reg</div>
                    <div className="comp-bits">P3 P2 P1 P0</div>
                  </div>
                  <div className="component accumulator">
                    <div className="comp-label">Accumulator</div>
                    <div className="comp-bits">ACC1 ACC0</div>
                  </div>
                </div>
                <div className="data-path"></div>
              </div>
              
              <div className="process-flow">
                <h4>Multiplication Process Flow</h4>
                <div className="flow-steps">
                  <div className="flow-step">
                    <div className="step-number">1</div>
                    <div className="step-content">Load multiplicand into register A</div>
                  </div>
                  <div className="flow-step">
                    <div className="step-number">2</div>
                    <div className="step-content">Load multiplier into product register LSBs</div>
                  </div>
                  <div className="flow-step">
                    <div className="step-number">3</div>
                    <div className="step-content">For each multiplier bit (LSB first):</div>
                    <div className="sub-steps">
                      <div className="sub-step">- If bit is 1, add multiplicand to accumulator</div>
                      <div className="sub-step">- Shift product register right (arithmetic)</div>
                    </div>
                  </div>
                  <div className="flow-step">
                    <div className="step-number">4</div>
                    <div className="step-content">After n bits, product register contains result</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default MultiplierCircuit;